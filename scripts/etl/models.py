from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class ImageAssetRef(BaseModel):
    status: Literal["missing", "draft", "approved", "rejected"] = "missing"
    src: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    bytes: Optional[int] = None
    alt: str
    promptVersion: Optional[str] = None

class SourceRef(BaseModel):
    sheet: str
    rowStart: int
    rowEnd: int
    rawText: str

class MnemonicItemSource(BaseModel):
    sheet: str
    cell: str

class MnemonicItem(BaseModel):
    id: str  # item-00 to item-100
    number: str  # "00" to "100"
    numericValue: int  # 0 to 100
    canonicalKeyword: str
    aliases: List[str] = []
    source: MnemonicItemSource

class PairScene(BaseModel):
    id: str  # e.g., pair-00-01
    kind: Literal["pair"] = "pair"
    lessonId: str
    order: int
    fromItemId: str
    toItemId: str
    displayFromKeyword: str
    displayToKeyword: str
    sceneText: str
    image: Optional[ImageAssetRef] = None
    source: SourceRef

class StoryToken(BaseModel):
    text: str
    itemId: Optional[str] = None  # item-XX if it maps to an item

class NarrativeScene(BaseModel):
    id: str  # story-61-70-scene-01
    kind: Literal["narrative-scene"] = "narrative-scene"
    storyId: str
    lessonId: str
    order: int
    originalText: str
    itemIds: List[str]
    tokens: List[StoryToken]
    image: Optional[ImageAssetRef] = None
    source: SourceRef

class NarrativeStory(BaseModel):
    id: str  # story-61-70
    lessonId: str
    title: str
    sceneIds: List[str]
    recapText: Optional[str] = None
    memoryTip: Optional[str] = None

class Lesson(BaseModel):
    id: str  # lesson-00-10
    moduleId: str
    title: str
    rangeStart: str
    rangeEnd: str
    mode: Literal["pair", "narrative"]
    itemIds: List[str]
    sceneIds: List[str]
    summary: Optional[str] = None
    order: int

class ManifestCounts(BaseModel):
    items: int
    lessons: int
    pairScenes: int
    stories: int
    narrativeScenes: int

class ContentManifest(BaseModel):
    schemaVersion: int = 1
    contentVersion: str
    generatedAt: str
    sourceFileSha256: str
    counts: ManifestCounts
