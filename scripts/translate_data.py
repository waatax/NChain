import os
import sys
import json
import time
import urllib.request
import urllib.parse
from typing import Dict, Any, List

# Reconfigure standard output streams to use UTF-8 to prevent encoding errors on Windows
if sys.version_info >= (3, 7):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

DATA_DIR = "apps/web/public/data"
OUTPUT_TS = "apps/web/src/data/translations_vi.ts"
CACHE_FILE = "scripts/translation_cache.json"

# Load translation cache
cache: Dict[str, str] = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Loaded {len(cache)} cached translations.")
    except Exception as e:
        print("Failed to load cache:", e)

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Failed to save cache:", e)

def translate(text: str) -> str:
    if not text:
        return text
    
    # Strip whitespace for matching
    cleaned = text.strip()
    if not cleaned:
        return text
        
    if cleaned in cache:
        # Return translated string, preserving original leading/trailing spaces
        translated = cache[cleaned]
        prefix = text[:len(text) - len(text.lstrip())]
        suffix = text[len(text.rstrip()):]
        return prefix + translated + suffix

    print(f"Translating: '{cleaned}'...")
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=vi&dt=t&q=" + urllib.parse.quote(cleaned)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    # Retries for robustness
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read().decode('utf-8')
                result = json.loads(data)
                translated_text = ""
                # Google Translate single API returns parts
                for sentence in result[0]:
                    if sentence[0]:
                        translated_text += sentence[0]
                
                if translated_text:
                    cache[cleaned] = translated_text
                    save_cache()
                    # Sleep to be polite to the API
                    time.sleep(0.15)
                    prefix = text[:len(text) - len(text.lstrip())]
                    suffix = text[len(text.rstrip()):]
                    return prefix + translated_text + suffix
        except Exception as e:
            print(f"Error translating '{cleaned}' (attempt {attempt + 1}/3): {e}")
            time.sleep(1)
            
    # Fallback to original text if translation failed
    return text

def main():
    # 1. Load the original JSON files
    with open(os.path.join(DATA_DIR, "items.json"), "r", encoding="utf-8") as f:
        items = json.load(f)
    with open(os.path.join(DATA_DIR, "lessons.json"), "r", encoding="utf-8") as f:
        lessons = json.load(f)
    with open(os.path.join(DATA_DIR, "modules.json"), "r", encoding="utf-8") as f:
        modules = json.load(f)
    with open(os.path.join(DATA_DIR, "pair-scenes.json"), "r", encoding="utf-8") as f:
        pair_scenes = json.load(f)
    with open(os.path.join(DATA_DIR, "stories.json"), "r", encoding="utf-8") as f:
        stories = json.load(f)
    with open(os.path.join(DATA_DIR, "narrative-scenes.json"), "r", encoding="utf-8") as f:
        narrative_scenes = json.load(f)

    # 2. Translate and structure
    print("Translating Items...")
    vi_items = []
    for item in items:
        vi_item = dict(item)
        vi_item["canonicalKeyword"] = translate(item["canonicalKeyword"])
        vi_item["aliases"] = [translate(a) for a in item.get("aliases", [])]
        vi_items.append(vi_item)

    print("Translating Lessons...")
    vi_lessons = []
    for lesson in lessons:
        vi_lesson = dict(lesson)
        vi_lesson["title"] = translate(lesson["title"])
        if lesson.get("summary"):
            vi_lesson["summary"] = translate(lesson["summary"])
        vi_lessons.append(vi_lesson)

    print("Translating Modules...")
    vi_modules = []
    for module in modules:
        vi_module = dict(module)
        vi_module["title"] = translate(module["title"])
        vi_modules.append(vi_module)

    print("Translating Pair Scenes...")
    vi_pair_scenes = []
    for scene in pair_scenes:
        vi_scene = dict(scene)
        vi_scene["displayFromKeyword"] = translate(scene["displayFromKeyword"])
        vi_scene["displayToKeyword"] = translate(scene["displayToKeyword"])
        vi_scene["sceneText"] = translate(scene["sceneText"])
        vi_pair_scenes.append(vi_scene)

    print("Translating Stories...")
    vi_stories = []
    for story in stories:
        vi_story = dict(story)
        vi_story["title"] = translate(story["title"])
        if story.get("recapText"):
            vi_story["recapText"] = translate(story["recapText"])
        if story.get("memoryTip"):
            vi_story["memoryTip"] = translate(story["memoryTip"])
        vi_stories.append(vi_story)

    print("Translating Narrative Scenes...")
    vi_narrative_scenes = []
    for scene in narrative_scenes:
        vi_scene = dict(scene)
        vi_scene["originalText"] = translate(scene["originalText"])
        vi_scene["tokens"] = []
        for token in scene["tokens"]:
            vi_token = dict(token)
            vi_token["text"] = translate(token["text"])
            vi_scene["tokens"].append(vi_token)
        vi_narrative_scenes.append(vi_scene)

    # 3. Generate TypeScript output file
    print(f"Generating TS output: {OUTPUT_TS}")
    os.makedirs(os.path.dirname(OUTPUT_TS), exist_ok=True)
    with open(OUTPUT_TS, "w", encoding="utf-8") as f:
        f.write("// Generated Vietnamese translations for NChain\n")
        f.write("import { MnemonicItem, Lesson, Module, PairScene, NarrativeStory, NarrativeScene } from '../domain/types';\n\n")
        
        f.write("export const viItems: MnemonicItem[] = ")
        f.write(json.dumps(vi_items, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        
        f.write("export const viLessons: Lesson[] = ")
        f.write(json.dumps(vi_lessons, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        
        f.write("export const viModules: Module[] = ")
        f.write(json.dumps(vi_modules, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        
        f.write("export const viPairScenes: PairScene[] = ")
        f.write(json.dumps(vi_pair_scenes, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        
        f.write("export const viStories: NarrativeStory[] = ")
        f.write(json.dumps(vi_stories, ensure_ascii=False, indent=2))
        f.write(";\n\n")
        
        f.write("export const viNarrativeScenes: NarrativeScene[] = ")
        f.write(json.dumps(vi_narrative_scenes, ensure_ascii=False, indent=2))
        f.write(";\n")
        
    print("Successfully translated data and generated TS module!")

if __name__ == "__main__":
    main()
