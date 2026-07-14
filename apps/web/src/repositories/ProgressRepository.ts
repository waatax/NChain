import Dexie, { type Table } from 'dexie';

export interface ProgressState {
  lessonId: string;
  lastSceneId: string;
  completedSceneIds: string[];
  isCompleted: boolean;
  updatedAt: string;
}

export type zQuizType = 'number-to-keyword' | 'keyword-to-number' | 'pair-next-item' | 'story-cloze';

export interface ReviewCardState {
  cardId: string; // itemId + "_" + promptType
  itemId: string;
  lessonId: string;
  promptType: zQuizType;
  box: number; // 0 - 5
  dueAt: string; // ISO string
  lastReviewedAt?: string;
  streak: number;
  lapses: number;
  suspended: boolean;
}

export interface ReviewEvent {
  id?: number;
  cardId: string;
  itemId: string;
  reviewedAt: string;
  rating: 'forgot' | 'hard' | 'good' | 'easy';
  oldBox: number;
  newBox: number;
  timeSpentMs: number;
}

export interface OfflineLessonState {
  lessonId: string;
  downloadedAt: string;
  bytes: number;
  status: 'downloading' | 'completed' | 'failed';
}

class NChainDatabase extends Dexie {
  progress!: Table<ProgressState, string>;
  reviewCards!: Table<ReviewCardState, string>;
  reviewEvents!: Table<ReviewEvent, number>;
  offlineLessons!: Table<OfflineLessonState, string>;

  constructor() {
    super('number-chain-db');
    this.version(1).stores({
      progress: 'lessonId',
      reviewCards: 'cardId, itemId, lessonId, box, dueAt',
      reviewEvents: '++id, cardId, itemId, reviewedAt',
      offlineLessons: 'lessonId',
    });
  }
}

export class ProgressRepository {
  private static instance: ProgressRepository;
  private db: NChainDatabase;

  private constructor() {
    this.db = new NChainDatabase();
  }

  public static getInstance(): ProgressRepository {
    if (!ProgressRepository.instance) {
      ProgressRepository.instance = new ProgressRepository();
    }
    return ProgressRepository.instance;
  }

  // --- Lesson Progress ---
  public async getLessonProgress(lessonId: string): Promise<ProgressState | undefined> {
    return this.db.progress.get(lessonId);
  }

  public async getAllProgress(): Promise<ProgressState[]> {
    return this.db.progress.toArray();
  }

  public async saveLessonProgress(progress: ProgressState): Promise<void> {
    const cleanProgress = JSON.parse(JSON.stringify(progress));
    await this.db.progress.put(cleanProgress);
  }

  // --- Spaced Repetition (Leitner Cards) ---
  public async getReviewCard(cardId: string): Promise<ReviewCardState | undefined> {
    return this.db.reviewCards.get(cardId);
  }

  public async getDueCards(): Promise<ReviewCardState[]> {
    const now = new Date().toISOString();
    return this.db.reviewCards
      .where('dueAt')
      .belowOrEqual(now)
      .and(card => !card.suspended)
      .toArray();
  }

  public async getCardsByLesson(lessonId: string): Promise<ReviewCardState[]> {
    return this.db.reviewCards.where('lessonId').equals(lessonId).toArray();
  }

  public async getCardCountSummary(): Promise<{ due: number; total: number }> {
    const now = new Date().toISOString();
    const total = await this.db.reviewCards.count();
    const due = await this.db.reviewCards
      .where('dueAt')
      .belowOrEqual(now)
      .and(card => !card.suspended)
      .count();
    return { due, total };
  }

  public async initializeCardsForLesson(lessonId: string, itemIds: string[], modes: zQuizType[]): Promise<void> {
    const now = new Date().toISOString();
    for (const itemId of itemIds) {
      for (const mode of modes) {
        const cardId = `${itemId}_${mode}`;
        const exists = await this.db.reviewCards.get(cardId);
        if (!exists) {
          await this.db.reviewCards.put({
            cardId,
            itemId,
            lessonId,
            promptType: mode,
            box: 0,
            dueAt: now,
            streak: 0,
            lapses: 0,
            suspended: false
          });
        }
      }
    }
  }

  public async submitReviewResult(
    cardId: string,
    rating: 'forgot' | 'hard' | 'good' | 'easy',
    timeSpentMs: number = 0
  ): Promise<ReviewCardState> {
    const card = await this.db.reviewCards.get(cardId);
    if (!card) {
      throw new Error(`Review card with ID ${cardId} not found`);
    }

    const oldBox = card.box;
    let newBox = oldBox;
    let intervalMinutes = 10; // default for box 0

    if (rating === 'forgot') {
      card.streak = 0;
      card.lapses += 1;
      
      // Leitner error penalty drops
      if (oldBox === 1 || oldBox === 2) {
        newBox = 0;
        intervalMinutes = 10; // Box 0: 10 mins
      } else if (oldBox === 3) {
        newBox = 1;
        intervalMinutes = 24 * 60; // Box 1: 1 day
      } else if (oldBox === 4 || oldBox === 5) {
        newBox = 2;
        intervalMinutes = 3 * 24 * 60; // Box 2: 3 days
      } else {
        // Stays in box 0, retry in 5 minutes
        newBox = 0;
        intervalMinutes = 5;
      }
    } else if (rating === 'hard') {
      // Box remains unchanged, interval is halved
      card.streak = Math.max(0, card.streak - 1);
      const standardInterval = this.getStandardIntervalMinutes(oldBox);
      intervalMinutes = Math.max(5, Math.round(standardInterval * 0.5));
    } else if (rating === 'good') {
      card.streak += 1;
      newBox = Math.min(5, oldBox + 1);
      intervalMinutes = this.getStandardIntervalMinutes(newBox);
    } else if (rating === 'easy') {
      card.streak += 2;
      newBox = Math.min(5, oldBox + 2);
      intervalMinutes = this.getStandardIntervalMinutes(newBox);
    }

    const now = new Date();
    const dueTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
    
    card.box = newBox;
    card.dueAt = dueTime.toISOString();
    card.lastReviewedAt = now.toISOString();

    await this.db.reviewCards.put(card);
    
    // Log review event
    await this.db.reviewEvents.add({
      cardId,
      itemId: card.itemId,
      reviewedAt: card.lastReviewedAt,
      rating,
      oldBox,
      newBox,
      timeSpentMs
    });

    return card;
  }

  private getStandardIntervalMinutes(box: number): number {
    switch (box) {
      case 0: return 10;
      case 1: return 24 * 60;          // 1 day
      case 2: return 3 * 24 * 60;      // 3 days
      case 3: return 7 * 24 * 60;      // 7 days
      case 4: return 21 * 24 * 60;     // 21 days
      case 5: return 60 * 24 * 60;     // 60 days
      default: return 10;
    }
  }

  // --- Offline Packages Support ---
  public async getOfflineLessons(): Promise<OfflineLessonState[]> {
    return this.db.offlineLessons.toArray();
  }

  public async setOfflineLessonState(state: OfflineLessonState): Promise<void> {
    const cleanState = JSON.parse(JSON.stringify(state));
    await this.db.offlineLessons.put(cleanState);
  }

  public async deleteOfflineLesson(lessonId: string): Promise<void> {
    await this.db.offlineLessons.delete(lessonId);
  }

  // --- Data Reset ---
  public async resetAllData(): Promise<void> {
    await Dexie.delete('number-chain-db');
    this.db = new NChainDatabase();
  }
}
