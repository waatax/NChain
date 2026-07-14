import { z } from 'zod';

export const ImageAssetRefSchema = z.object({
  status: z.enum(["missing", "draft", "approved", "rejected"]),
  src: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number().optional(),
  alt: z.string(),
  promptVersion: z.string().optional(),
});
export type ImageAssetRef = z.infer<typeof ImageAssetRefSchema>;

export const SourceRefSchema = z.object({
  sheet: z.string(),
  rowStart: z.number(),
  rowEnd: z.number(),
  rawText: z.string(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const MnemonicItemSchema = z.object({
  id: z.string(), // item-00
  number: z.string(),
  numericValue: z.number(),
  canonicalKeyword: z.string(),
  aliases: z.array(z.string()),
  source: z.object({
    sheet: z.string(),
    cell: z.string(),
  }),
});
export type MnemonicItem = z.infer<typeof MnemonicItemSchema>;

export const PairSceneSchema = z.object({
  id: z.string(), // pair-00-01
  kind: z.literal("pair"),
  lessonId: z.string(),
  order: z.number(),
  fromItemId: z.string(),
  toItemId: z.string(),
  displayFromKeyword: z.string(),
  displayToKeyword: z.string(),
  sceneText: z.string(),
  image: ImageAssetRefSchema.optional(),
  source: SourceRefSchema,
});
export type PairScene = z.infer<typeof PairSceneSchema>;

export const StoryTokenSchema = z.object({
  text: z.string(),
  itemId: z.string().optional(),
});
export type StoryToken = z.infer<typeof StoryTokenSchema>;

export const NarrativeSceneSchema = z.object({
  id: z.string(), // story-61-70-scene-01
  kind: z.literal("narrative-scene"),
  storyId: z.string(),
  lessonId: z.string(),
  order: z.number(),
  originalText: z.string(),
  itemIds: z.array(z.string()),
  tokens: z.array(StoryTokenSchema),
  image: ImageAssetRefSchema.optional(),
  source: SourceRefSchema,
});
export type NarrativeScene = z.infer<typeof NarrativeSceneSchema>;

export const NarrativeStorySchema = z.object({
  id: z.string(), // story-61-70
  lessonId: z.string(),
  title: z.string(),
  sceneIds: z.array(z.string()),
  recapText: z.string().optional(),
  memoryTip: z.string().optional(),
});
export type NarrativeStory = z.infer<typeof NarrativeStorySchema>;

export const LessonSchema = z.object({
  id: z.string(), // lesson-00-10
  moduleId: z.string(),
  title: z.string(),
  rangeStart: z.string(),
  rangeEnd: z.string(),
  mode: z.enum(["pair", "narrative"]),
  itemIds: z.array(z.string()),
  sceneIds: z.array(z.string()),
  summary: z.string().optional(),
  order: z.number(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const ModuleSchema = z.object({
  id: z.string(), // module-00-20
  title: z.string(),
  lessonIds: z.array(z.string()),
  order: z.number(),
});
export type Module = z.infer<typeof ModuleSchema>;

export const ContentManifestSchema = z.object({
  schemaVersion: z.number(),
  contentVersion: z.string(),
  generatedAt: z.string(),
  sourceFileSha256: z.string(),
  counts: z.object({
    items: z.number(),
    lessons: z.number(),
    pairScenes: z.number(),
    stories: z.number(),
    narrativeScenes: z.number(),
  }),
});
export type ContentManifest = z.infer<typeof ContentManifestSchema>;
