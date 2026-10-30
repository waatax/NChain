import { soundFx } from '../utils/sound';
import { sakuraConfetti } from '../utils/confetti';

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  badge: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: '記憶小萌芽', minXP: 0, maxXP: 99, badge: '🌱' },
  { level: 2, title: '數字小神童', minXP: 100, maxXP: 299, badge: '⭐' },
  { level: 3, title: '雙碼鎖鏈手', minXP: 300, maxXP: 599, badge: '🔗' },
  { level: 4, title: '圖像轉化師', minXP: 600, maxXP: 999, badge: '🎨' },
  { level: 5, title: '空間造景者', minXP: 1000, maxXP: 1499, badge: '🏛️' },
  { level: 6, title: '宮殿探險家', minXP: 1500, maxXP: 2199, badge: '🏰' },
  { level: 7, title: '記憶大師', minXP: 2200, maxXP: 2999, badge: '👑' },
  { level: 8, title: '心智宗師', minXP: 3000, maxXP: 3999, badge: '🔮' },
  { level: 9, title: '殿堂傳奇', minXP: 4000, maxXP: 5499, badge: '🏆' },
  { level: 10, title: '宇宙心智硬碟', minXP: 5500, maxXP: 999999, badge: '🌌' },
];

export interface GamificationState {
  hearts: number;
  maxHearts: number;
  xp: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayXP: number;
  dailyGoalXP: number;
  unlockedAchievements: string[];
}

const STORAGE_KEY = 'nchain.gamification.v2';

const DEFAULT_STATE: GamificationState = {
  hearts: 5,
  maxHearts: 5,
  xp: 0,
  currentStreak: 1,
  bestStreak: 1,
  lastActiveDate: '',
  todayXP: 0,
  dailyGoalXP: 50,
  unlockedAchievements: [],
};

export class GamificationRepository {
  private static instance: GamificationRepository;
  private state: GamificationState;

  private constructor() {
    this.state = this.loadState();
    this.checkInToday();
  }

  public static getInstance(): GamificationRepository {
    if (!GamificationRepository.instance) {
      GamificationRepository.instance = new GamificationRepository();
    }
    return GamificationRepository.instance;
  }

  private loadState(): GamificationState {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_STATE, ...JSON.parse(stored) };
        }
      }
    } catch (e) {
      console.error('Failed to load gamification state:', e);
    }
    return { ...DEFAULT_STATE };
  }

  private saveState(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error('Failed to save gamification state:', e);
    }
  }

  public getState(): GamificationState {
    return { ...this.state };
  }

  public getLevelInfo(): { current: LevelInfo; next: LevelInfo | null; progressPercent: number } {
    const xp = this.state.xp;
    let current = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        current = LEVELS[i];
        break;
      }
    }

    const nextIndex = LEVELS.findIndex(l => l.level === current.level + 1);
    const next = nextIndex !== -1 ? LEVELS[nextIndex] : null;

    let progressPercent = 100;
    if (next) {
      const levelSpan = next.minXP - current.minXP;
      const earnedInLevel = xp - current.minXP;
      progressPercent = Math.min(100, Math.max(0, Math.round((earnedInLevel / levelSpan) * 100)));
    }

    return { current, next, progressPercent };
  }

  /**
   * Lose one heart on wrong answer
   */
  public loseHeart(): { remaining: number; isOutOfHearts: boolean } {
    if (this.state.hearts > 0) {
      this.state.hearts--;
      this.saveState();
      soundFx.playHeartLost();
    }
    return {
      remaining: this.state.hearts,
      isOutOfHearts: this.state.hearts <= 0
    };
  }

  /**
   * Refill all hearts instantly (Duolingo practice recovery)
   */
  public refillHearts(): number {
    this.state.hearts = this.state.maxHearts;
    this.saveState();
    soundFx.playHeartRefill();
    return this.state.hearts;
  }

  /**
   * Add XP points, detect level up, and trigger celebrations
   */
  public addXP(amount: number, reason?: string): {
    newXP: number;
    leveledUp: boolean;
    level: LevelInfo;
  } {
    const oldLevel = this.getLevelInfo().current.level;
    this.state.xp += amount;
    this.state.todayXP += amount;
    this.checkInToday();
    this.saveState();

    const newLevelInfo = this.getLevelInfo();
    const leveledUp = newLevelInfo.current.level > oldLevel;

    if (leveledUp) {
      soundFx.playLevelUp();
      sakuraConfetti.trigger(80);
    } else {
      soundFx.playXpGain();
    }

    return {
      newXP: this.state.xp,
      leveledUp,
      level: newLevelInfo.current
    };
  }

  /**
   * Check in today and update continuous streak
   */
  public checkInToday(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.state.lastActiveDate === todayStr) {
      return;
    }

    if (!this.state.lastActiveDate) {
      this.state.currentStreak = 1;
      this.state.bestStreak = 1;
      this.state.todayXP = 0;
    } else {
      const lastDate = new Date(this.state.lastActiveDate);
      const today = new Date(todayStr);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day!
        this.state.currentStreak++;
        if (this.state.currentStreak > this.state.bestStreak) {
          this.state.bestStreak = this.state.currentStreak;
        }
        this.state.todayXP = 0;
      } else if (diffDays > 1) {
        // Streak broken
        this.state.currentStreak = 1;
        this.state.todayXP = 0;
      }
    }

    this.state.lastActiveDate = todayStr;
    this.saveState();
  }

  /**
   * Unlock achievement badge
   */
  public unlockAchievement(id: string): boolean {
    if (!this.state.unlockedAchievements.includes(id)) {
      this.state.unlockedAchievements.push(id);
      this.saveState();
      soundFx.playComplete();
      return true;
    }
    return false;
  }
}

export const gamificationRepo = GamificationRepository.getInstance();
