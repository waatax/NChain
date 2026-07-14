import { z } from 'zod';
import {
  MnemonicItem, MnemonicItemSchema,
  PairScene, PairSceneSchema,
  NarrativeScene, NarrativeSceneSchema,
  NarrativeStory, NarrativeStorySchema,
  Lesson, LessonSchema,
  Module, ModuleSchema,
  ContentManifest, ContentManifestSchema
} from '../domain/types';

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
    
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      
      // 1. Fetch manifest
      const manifestRes = await fetch(`${baseUrl}data/manifest.json`);
      const manifestData = await manifestRes.json();
      this.manifest = ContentManifestSchema.parse(manifestData);
      
      // 2. Fetch items
      const itemsRes = await fetch(`${baseUrl}data/items.json`);
      const itemsData = await itemsRes.json();
      const parsedItems = z.array(MnemonicItemSchema).parse(itemsData);
      parsedItems.forEach(item => this.items.set(item.id, item));
      
      // 3. Fetch lessons
      const lessonsRes = await fetch(`${baseUrl}data/lessons.json`);
      const lessonsData = await lessonsRes.json();
      const parsedLessons = z.array(LessonSchema).parse(lessonsData);
      parsedLessons.forEach(l => this.lessons.set(l.id, l));
      
      // 4. Fetch modules
      const modulesRes = await fetch(`${baseUrl}data/modules.json`);
      const modulesData = await modulesRes.json();
      const parsedModules = z.array(ModuleSchema).parse(modulesData);
      parsedModules.forEach(m => this.modules.set(m.id, m));
      
      // 5. Fetch pair-scenes
      const pairRes = await fetch(`${baseUrl}data/pair-scenes.json`);
      const pairData = await pairRes.json();
      const parsedPairs = z.array(PairSceneSchema).parse(pairData);
      parsedPairs.forEach(s => this.pairScenes.set(s.id, s));
      
      // 6. Fetch stories
      const storiesRes = await fetch(`${baseUrl}data/stories.json`);
      const storiesData = await storiesRes.json();
      const parsedStories = z.array(NarrativeStorySchema).parse(storiesData);
      parsedStories.forEach(s => this.stories.set(s.id, s));
      
      // 7. Fetch narrative-scenes
      const narrativeRes = await fetch(`${baseUrl}data/narrative-scenes.json`);
      const narrativeData = await narrativeRes.json();
      const parsedNarratives = z.array(NarrativeSceneSchema).parse(narrativeData);
      parsedNarratives.forEach(s => this.narrativeScenes.set(s.id, s));
      
      this.isLoaded = true;
      console.log('ContentRepository initialized successfully with', this.items.size, 'items');
    } catch (e) {
      console.error('Failed to initialize ContentRepository:', e);
      throw new Error('CONTENT_LOAD_FAILURE');
    }
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
