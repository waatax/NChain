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
import {
  viItems,
  viLessons,
  viModules,
  viPairScenes,
  viStories,
  viNarrativeScenes
} from '../data/translations_vi';

const getLang = (): 'zh-TW' | 'vi' => {
  try {
    const stored = localStorage.getItem('number-chain.settings.v1');
    if (stored) {
      return JSON.parse(stored).lang || 'zh-TW';
    }
  } catch (e) {
    // ignore
  }
  return 'zh-TW';
};

export class ContentRepository {
  private static instance: ContentRepository;
  
  private manifest: ContentManifest | null = null;
  private items: Map<string, MnemonicItem> = new Map();
  private lessons: Map<string, Lesson> = new Map();
  private modules: Map<string, Module> = new Map();
  private pairScenes: Map<string, PairScene> = new Map();
  private stories: Map<string, NarrativeStory> = new Map();
  private narrativeScenes: Map<string, NarrativeScene> = new Map();

  private viItems: Map<string, MnemonicItem> = new Map();
  private viLessons: Map<string, Lesson> = new Map();
  private viModules: Map<string, Module> = new Map();
  private viPairScenes: Map<string, PairScene> = new Map();
  private viStories: Map<string, NarrativeStory> = new Map();
  private viNarrativeScenes: Map<string, NarrativeScene> = new Map();

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

    viItems.forEach(item => this.viItems.set(item.id, item));
    viLessons.forEach(l => this.viLessons.set(l.id, l));
    viModules.forEach(m => this.viModules.set(m.id, m));
    viPairScenes.forEach(s => this.viPairScenes.set(s.id, s));
    viStories.forEach(s => this.viStories.set(s.id, s));
    viNarrativeScenes.forEach(s => this.viNarrativeScenes.set(s.id, s));
    
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

  private getSourceMaps() {
    const isVi = getLang() === 'vi';
    return {
      items: isVi ? this.viItems : this.items,
      lessons: isVi ? this.viLessons : this.lessons,
      modules: isVi ? this.viModules : this.modules,
      pairScenes: isVi ? this.viPairScenes : this.pairScenes,
      stories: isVi ? this.viStories : this.stories,
      narrativeScenes: isVi ? this.viNarrativeScenes : this.narrativeScenes
    };
  }

  public getItems(): MnemonicItem[] {
    return Array.from(this.getSourceMaps().items.values());
  }

  public getItem(id: string): MnemonicItem | undefined {
    return this.getSourceMaps().items.get(id);
  }

  public getLessons(): Lesson[] {
    return Array.from(this.getSourceMaps().lessons.values()).sort((a, b) => a.order - b.order);
  }

  public getLesson(id: string): Lesson | undefined {
    return this.getSourceMaps().lessons.get(id);
  }

  public getModules(): Module[] {
    return Array.from(this.getSourceMaps().modules.values()).sort((a, b) => a.order - b.order);
  }

  public getModule(id: string): Module | undefined {
    return this.getSourceMaps().modules.get(id);
  }

  public getPairScenes(): PairScene[] {
    return Array.from(this.getSourceMaps().pairScenes.values());
  }

  public getPairScene(id: string): PairScene | undefined {
    return this.getSourceMaps().pairScenes.get(id);
  }

  public getStories(): NarrativeStory[] {
    return Array.from(this.getSourceMaps().stories.values());
  }

  public getStory(id: string): NarrativeStory | undefined {
    return this.getSourceMaps().stories.get(id);
  }

  public getNarrativeScenes(): NarrativeScene[] {
    return Array.from(this.getSourceMaps().narrativeScenes.values());
  }

  public getNarrativeScene(id: string): NarrativeScene | undefined {
    return this.getSourceMaps().narrativeScenes.get(id);
  }
}
