import {
  MnemonicItem,
  PairScene,
  NarrativeScene,
  NarrativeStory,
  Lesson,
  Module,
  ContentManifest
} from '../domain/types';
import {
  staticItems,
  staticLessons,
  staticModules,
  staticPairScenes,
  staticStories,
  staticNarrativeScenes
} from '../data/staticContent';

export class ContentRepository {
  private static instance: ContentRepository;
  
  private manifest: ContentManifest | null = null;
  private items: Map<string, MnemonicItem> = new Map();
  private lessons: Map<string, Lesson> = new Map();
  private modules: Map<string, Module> = new Map();
  private pairScenes: Map<string, PairScene> = new Map();
  private stories: Map<string, NarrativeStory> = new Map();
  private narrativeScenes: Map<string, NarrativeScene> = new Map();
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): ContentRepository {
    if (!ContentRepository.instance) {
      ContentRepository.instance = new ContentRepository();
    }
    return ContentRepository.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isLoaded) return;
    
    staticItems.forEach(item => this.items.set(item.id, item));
    staticLessons.forEach(l => this.lessons.set(l.id, l));
    staticModules.forEach(m => this.modules.set(m.id, m));
    staticPairScenes.forEach(s => this.pairScenes.set(s.id, s));
    staticStories.forEach(s => this.stories.set(s.id, s));
    staticNarrativeScenes.forEach(s => this.narrativeScenes.set(s.id, s));
    
    // Set a mock manifest for content version tagging
    this.manifest = {
      schemaVersion: 1,
      contentVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      sourceFileSha256: "static-bundle",
      counts: {
        items: this.items.size,
        lessons: this.lessons.size,
        pairScenes: this.pairScenes.size,
        stories: this.stories.size,
        narrativeScenes: this.narrativeScenes.size
      }
    };
    
    this.isLoaded = true;
    console.log('ContentRepository initialized successfully from static files with', this.items.size, 'items');
  }

  public getManifest(): ContentManifest | null {
    return this.manifest;
  }

  public getItems(): MnemonicItem[] {
    return Array.from(this.items.values());
  }

  public getItem(id: string): MnemonicItem | undefined {
    return this.items.get(id);
  }

  public getLessons(): Lesson[] {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }

  public getLesson(id: string): Lesson | undefined {
    return this.lessons.get(id);
  }

  public getModules(): Module[] {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  public getModule(id: string): Module | undefined {
    return this.modules.get(id);
  }

  public getPairScenes(): PairScene[] {
    return Array.from(this.pairScenes.values());
  }

  public getPairScene(id: string): PairScene | undefined {
    return this.pairScenes.get(id);
  }

  public getStories(): NarrativeStory[] {
    return Array.from(this.stories.values());
  }

  public getStory(id: string): NarrativeStory | undefined {
    return this.stories.get(id);
  }

  public getNarrativeScenes(): NarrativeScene[] {
    return Array.from(this.narrativeScenes.values());
  }

  public getNarrativeScene(id: string): NarrativeScene | undefined {
    return this.narrativeScenes.get(id);
  }
}
