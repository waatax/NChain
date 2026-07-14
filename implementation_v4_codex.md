# 數字鎖鏈記憶學習 Web App — Codex 可執行實作規格

> **版本**：v4.0  
> **狀態**：Implementation-Ready  
> **主要資料源**：`數字鎖鏈.xlsx`  
> **前版基礎**：`implementation.md` v3.0  
> **文件目的**：作為 Codex 與後續工程師的單一實作依據（Single Source of Truth）。除非本文件明確允許，實作者不得自行猜測資料規則、產品行為或驗收標準。

---

## 0. Codex 執行契約（先讀）

### 0.1 核心任務

建立一個 **Mobile-First、可安裝、可離線、支援主動回想與間隔複習** 的數字鎖鏈記憶 Web App，完整呈現 Excel 中的 00–100 關鍵字、配對式故事與連續劇本。

### 0.2 執行原則

Codex 必須：

1. 先完成資料稽核與 ETL，確認資料正確後再開發 UI。
2. 採用本文件指定的技術棧，不保留「A 或 B」等未決選項。
3. 每個 Phase 都先寫測試，再完成功能，最後執行該 Phase 的驗收命令。
4. 不得將 API Key、Token 或圖像生成憑證放入前端。
5. 不得把 Excel 原始內容手動複製成硬編碼陣列；正式資料必須由 ETL 產生。
6. 遇到資料不一致時，必須輸出 validation issue，不能靜默覆蓋。
7. 不得在未完成前宣稱完成；所有 Definition of Done 項目必須可由命令或測試證明。
8. 每完成一個 Task，更新 `docs/IMPLEMENTATION_STATUS.md`：完成內容、測試結果、未解風險、下一步。

### 0.3 禁止事項

- 不使用 CDN 方式載入 Vue、Tailwind 或第三方 runtime。
- 不在 V1 使用即時雲端圖像生成。
- 不把圖片全部預快取進首次安裝包。
- 不以隨機四選一作為唯一測驗策略。
- 不將「滑過卡片」直接視為「已熟悉」。
- 不把 `61-80` 當作單一故事；它實際包含 61–70 與 71–80 兩篇故事。
- 不把 `80-100` 當作從 80 開始的資料；該工作表實際內容是 81–100，80 已在前一篇故事結尾出現。

### 0.4 每輪工作輸出格式

Codex 每輪回報須包含：

```text
Completed:
- TASK-ID: 實作摘要

Files changed:
- path/to/file

Validation:
- command: result

Open issues:
- 無 / issue 描述

Next:
- 下一個 TASK-ID
```

---

## 1. 真實資料稽核與重要修正

### 1.1 工作表分類

| 工作表 | 真實用途 | V1 處理 |
|---|---|---|
| `1-100` | 00–100 canonical 關鍵字主表 | 採用，唯一主字典 |
| `00-20` | 00–10、11–20 兩段配對故事 | 採用 |
| `21-40` | 21–30、31–40 兩段配對故事 | 採用 |
| `41-60` | 41–50、51–60 兩段配對故事 | 採用 |
| `61-80` | 61–70、71–80 兩篇獨立連續故事 | 採用 |
| `80-100` | 81–90、91–100 兩篇獨立連續故事 | 採用；產品名稱不得誤導為含 80 起點 |
| `1-100PIC` | 稀疏的舊圖片／草稿資料 | 不作正式來源，可輸出稽核報告 |
| `1-50`、`51-100` | 舊版重複表 | 不採用 |
| `工作表2` | 空白 | 忽略 |
| `工作表4` | 備用聯想詞，但有大量 `?` 損壞字元 | V1 排除；另輸出 damaged-data report |

### 1.2 前版規格的關鍵問題與本版決策

#### 問題 A：五大 group 的計數與內容不精確

前版以 `00-20`、`21-40` 等作為學習 group，但 Excel 實際是每 10 個左右一段故事。若直接按五大 group 實作，會產生：

- `00-10` 有 11 個數字、10 條 link。
- `11-20` 有 10 個數字、9 條 link。
- 十位分段之間（10→11、20→21、40→41、60→61、80→81）沒有原始故事銜接。
- `61-80` 與 `81-100` 都各含兩篇獨立故事。

**決策**：資料層改為 `Module → Lesson → Scene` 三層。首頁可顯示五個 module，但實際學習、測驗與進度以十個 lesson 為單位。

#### 問題 B：故事句子與相鄰數字 link 不是同一概念

連續劇本的每一句通常包含前後兩個數字，但第一句、轉場、文字內容都屬於故事本身。若只儲存為 `from/to` link，會失去原始句子及故事結構。

**決策**：

- canonical 記憶物件為 `MnemonicItem`。
- 配對內容為 `PairScene`。
- 劇本內容為 `NarrativeStory` + `NarrativeScene`。
- 測驗需要 pair 時，可由 scene 中的 `itemIds` 衍生，不反向污染 canonical 資料。

#### 問題 C：關鍵字有正式詞與故事別名

例如主表可能使用「耳玲」，故事中含「耳玲（耳鈴/耳環）」。

**決策**：主字典保留 `canonicalKeyword`，故事中的寫法保留在 `displayKeyword` / `aliases`，不得直接覆寫主字典。

---

## 2. 產品範圍

### 2.1 V1 必須完成

1. 00–100 關鍵字圖鑑。
2. 十個 lesson：
   - L01：00–10
   - L02：11–20
   - L03：21–30
   - L04：31–40
   - L05：41–50
   - L06：51–60
   - L07：61–70
   - L08：71–80
   - L09：81–90
   - L10：91–100
3. 00–60 配對式學習模式。
4. 61–100 故事式學習模式。
5. 數字→關鍵字、關鍵字→數字、故事填空測驗。
6. 本機進度、錯題與到期複習。
7. PWA 安裝與核心資料離線。
8. 可選擇下載個別 lesson 的離線圖片包。
9. 深色／淺色模式、盲背模式、降低動態效果。
10. ETL、schema validation、unit、component、E2E 測試。

### 2.2 V1 明確不做

- 帳號、雲端同步、多人排行榜。
- 即時 AI 生圖。
- TTS／錄音辨識。
- `工作表4` 備用詞正式上線。
- 管理後台。
- 原生 iOS／Android App。

### 2.3 V1 成功指標

- 101 個 canonical items（00–100）全數可查閱。
- 十個 lesson 全數可學習與測驗。
- 所有來源數字及關鍵字均通過 ETL validation；允許的 alias 差異必須列入 allowlist。
- 使用者重開 App 後，學習位置、複習排程與設定均保留。
- 已下載的 lesson 在飛航模式可完整開啟。
- 手機 360×800 viewport 無水平溢出。

---

## 3. 固定技術決策

### 3.1 技術棧

| 層級 | 固定選型 | 說明 |
|---|---|---|
| Runtime | Node.js 22 LTS | 統一 CI 與本機環境 |
| Package manager | pnpm | 使用 `pnpm-lock.yaml` 鎖版 |
| Frontend | Vue 3 + TypeScript | `<script setup lang="ts">` |
| Build | Vite | 不採 CDN |
| Router | Vue Router | `createWebHistory`；部署需 fallback；若目標主機無 fallback，改由部署設定處理，不改 hash router |
| State | Pinia | 僅管理 session / UI state；持久資料由 repository 封裝 |
| Validation | Zod | ETL 輸出與前端載入共用 schema |
| Persistence | IndexedDB via Dexie | 儲存學習紀錄、複習排程、圖片離線狀態；設定可留 localStorage |
| PWA | `vite-plugin-pwa` + Workbox | 版本化 precache 與 runtime cache |
| Unit test | Vitest | ETL helper、domain logic、stores |
| Component test | Vue Test Utils | 核心互動與 accessibility |
| E2E | Playwright | Chromium + WebKit，手機 viewport |
| Lint/format | ESLint + Prettier | CI 必跑 |
| Excel ETL | Python 3.12 + openpyxl | 僅離線 build script 使用 |
| Python test | pytest | parser 與 validation |

### 3.2 刪除不必要依賴

V1 不預設使用 Swiper 或 GSAP。優先以 CSS scroll snap、Pointer Events、Vue transition 實作。只有在 E2E 證明原生方案無法達成需求時，才可新增第三方依賴，並建立 ADR 說明原因、bundle 成本與替代方案。

### 3.3 瀏覽器最低支援

- iOS Safari 16.4+
- Android Chrome 最近兩個主要版本
- Desktop Chrome / Edge / Safari 最近兩個主要版本

---

## 4. Repository 結構

```text
number-chain-app/
├─ apps/
│  └─ web/
│     ├─ public/
│     │  ├─ data/                 # ETL 產物，只讀
│     │  └─ images/               # 已核准圖像
│     ├─ src/
│     │  ├─ app/
│     │  ├─ components/
│     │  ├─ features/
│     │  │  ├─ catalog/
│     │  │  ├─ learn/
│     │  │  ├─ quiz/
│     │  │  ├─ review/
│     │  │  ├─ offline/
│     │  │  └─ settings/
│     │  ├─ domain/
│     │  ├─ repositories/
│     │  ├─ router/
│     │  ├─ styles/
│     │  └─ main.ts
│     ├─ tests/
│     └─ vite.config.ts
├─ packages/
│  └─ schemas/
│     ├─ src/content.ts
│     ├─ src/progress.ts
│     └─ src/index.ts
├─ scripts/
│  ├─ etl/
│  │  ├─ extract_workbook.py
│  │  ├─ parsers.py
│  │  ├─ validators.py
│  │  └─ models.py
│  ├─ generate_image_prompts.py
│  └─ optimize_images.py
├─ data-source/
│  └─ 數字鎖鏈.xlsx
├─ reports/
│  ├─ etl-report.json
│  ├─ etl-report.md
│  └─ image-qa.csv
├─ docs/
│  ├─ adr/
│  ├─ IMPLEMENTATION_STATUS.md
│  └─ CONTENT_EDITING.md
├─ pyproject.toml
├─ package.json
├─ pnpm-workspace.yaml
└─ implementation.md
```

---

## 5. Canonical 資料模型

### 5.1 ID 規則

- Item：`item-00` … `item-99`、`item-100`
- Module：`module-00-20` …
- Lesson：`lesson-00-10` … `lesson-91-100`
- Pair scene：`pair-00-01`
- Story：`story-61-70`
- Narrative scene：`story-61-70-scene-01`

ID 一旦發布不得因文字修正而改變。

### 5.2 TypeScript / Zod 概念模型

```ts
export type ItemId = `item-${string}`;
export type LessonId = `lesson-${string}`;

export interface MnemonicItem {
  id: ItemId;
  number: string;               // "00"–"99" or "100"
  numericValue: number;         // 0–100
  canonicalKeyword: string;
  aliases: string[];
  source: {
    sheet: "1-100";
    cell: string;
  };
}

export interface PairScene {
  id: string;
  kind: "pair";
  lessonId: LessonId;
  order: number;
  fromItemId: ItemId;
  toItemId: ItemId;
  displayFromKeyword: string;
  displayToKeyword: string;
  sceneText: string;
  image?: ImageAssetRef;
  source: SourceRef;
}

export interface NarrativeScene {
  id: string;
  kind: "narrative-scene";
  storyId: string;
  lessonId: LessonId;
  order: number;
  originalText: string;
  itemIds: ItemId[];             // 依句中順序
  tokens: StoryToken[];          // 保留高亮位置，不在 UI 用 regex 重算
  image?: ImageAssetRef;
  source: SourceRef;
}

export interface NarrativeStory {
  id: string;
  lessonId: LessonId;
  title: string;
  sceneIds: string[];
  recapText?: string;
  memoryTip?: string;
}

export interface Lesson {
  id: LessonId;
  moduleId: string;
  title: string;
  rangeStart: string;
  rangeEnd: string;
  mode: "pair" | "narrative";
  itemIds: ItemId[];
  sceneIds: string[];
  summary?: string;
  order: number;
}

export interface ImageAssetRef {
  status: "missing" | "draft" | "approved" | "rejected";
  src?: string;
  width?: number;
  height?: number;
  bytes?: number;
  alt: string;
  promptVersion?: string;
}

export interface SourceRef {
  sheet: string;
  rowStart: number;
  rowEnd: number;
  rawText: string;
}
```

### 5.3 ETL 輸出檔

```text
apps/web/public/data/
├─ manifest.json       # schemaVersion、contentVersion、hash、generatedAt
├─ items.json
├─ modules.json
├─ lessons.json
├─ pair-scenes.json
├─ stories.json
├─ narrative-scenes.json
└─ content-index.json  # id → file / lesson 快速查找
```

### 5.4 Content manifest

```json
{
  "schemaVersion": 1,
  "contentVersion": "2026.07.14.1",
  "generatedAt": "ISO-8601",
  "sourceFileSha256": "...",
  "counts": {
    "items": 101,
    "lessons": 10,
    "pairScenes": 55,
    "stories": 4,
    "narrativeScenes": 36
  }
}
```

> 上述 scene 數量為依目前結構預期值：配對式 00–10 為 10 條、其餘五個 10-number lessons 各 9 條，合計 55；實際 ETL 必須以解析結果產生並由測試鎖定，不得僅依此文字硬編碼。若實際結果不同，先輸出報告並修正本文件或資料，不得強行符合數字。

**重要修正**：Codex 首次執行時應以 parser 結果確認 precise counts；`manifest.counts` 永遠由資料產生，不手填。

---

## 6. ETL 規格

### 6.1 ETL CLI

```bash
python -m scripts.etl.extract_workbook \
  --input data-source/數字鎖鏈.xlsx \
  --output apps/web/public/data \
  --report reports/etl-report.json \
  --strict
```

Exit codes：

- `0`：成功，無 error。
- `1`：validation error，禁止 build。
- `2`：輸入／IO 錯誤。

### 6.2 數字正規化

```py
def normalize_number(raw: object) -> str:
    # 接受 "00"、0、0.0、"100"
    # 拒絕 bool、負數、>100、非整數 float、空值
    value = Decimal(str(raw).strip())
    if value != value.to_integral_value(): raise ValidationError
    n = int(value)
    if not 0 <= n <= 100: raise ValidationError
    return "100" if n == 100 else f"{n:02d}"
```

### 6.3 `1-100` parser

需求：

1. 不假設固定兩欄；掃描 used range 中「可正規化數字」且右側儲存格為非空文字的配對。
2. 每個 0–100 必須恰好出現一次 canonical mapping。
3. 發現 duplicate 時輸出所有 cell references，視為 error。
4. 右側關鍵字 trim 空白，但不自動正體化、改字或修錯字。
5. 故事 alias 不得回寫 canonical mapping。

### 6.4 Pairwise parser（00–60）

標題容錯 regex：

```regex
【\s*(?<from>\d{1,3})\s+(?<fromKeyword>[^】]+?)\s*】\s*[➔→➡]\s*【\s*(?<to>\d{1,3})\s+(?<toKeyword>[^】]+?)\s*】
```

場景列：

```regex
^\s*畫面\s*[：:]\s*(?<scene>.+?)\s*$
```

規則：

- 標題後第一個非空、符合場景 regex 的 cell 為 sceneText。
- 若下一個 pair 標題前沒有場景列，error。
- `from/to` 必須落在同一 lesson 的預期範圍。
- `to.numericValue - from.numericValue` 必須為 1。
- 允許 display keyword 與 canonical keyword 不同，但必須產生 `KEYWORD_VARIANT` warning；差異需進 `config/keyword-alias-allowlist.json` 才能在 strict mode 通過。
- 摘要由「複習與記憶小技巧」後的完整段落擷取，不以固定 row offset 判斷。

### 6.5 Narrative parser（61–100）

不能只用整張工作表的第一個標題。必須：

1. 掃描所有符合 `數字鎖鏈記憶故事：《...》` 的標題。
2. 每一標題開啟新 story，直到下一標題或 sheet 結尾。
3. `↓` 只作視覺分隔，不輸出 scene。
4. 忽略複習表格列、說明段落；但擷取 recap 與 memory tip。
5. 故事句 token regex：

```regex
\((?<number>\d{1,3})\)\s*(?<keyword>[^，。！、；：()]+?)\s*(?=[，。！、；：()]|$)
```

6. 每個 narrative scene 至少包含 1 個 item；正常故事句預期 1–2 個。
7. 相鄰 scene 的 item 連續性可作 warning，不作 error，因第一句通常含兩個 item，後續句會重複前一 item。
8. 61–70、71–80、81–90、91–100 必須解析為四個 story / lesson。

### 6.6 Validation issue schema

```json
{
  "severity": "error | warning | info",
  "code": "DUPLICATE_ITEM | MISSING_ITEM | KEYWORD_VARIANT | DAMAGED_CHAR | PARSE_FAILURE | RANGE_MISMATCH",
  "message": "...",
  "source": { "sheet": "00-20", "cell": "B67" },
  "context": { "expected": "耳玲", "actual": "耳玲（耳鈴/耳環）" }
}
```

### 6.7 必要 ETL 測試

- `normalize_number`：00、0、0.0、99、100、非法小數、空值、bool。
- 主字典得到完整 0–100，無缺號。
- 每一 pair scene 的 to = from + 1。
- 四個 narrative story 標題均被抓到。
- 損壞字元 `?` 在工作表4被報告但不進正式資料。
- snapshot test：所有 lesson ID、item ID 與 story title。
- deterministic test：同一 Excel 重跑輸出 hash 相同（忽略 generatedAt）。

---

## 7. 圖片工作流

### 7.1 原則

- 圖片是漸進增強，不阻塞文字版功能。
- 生圖只在離線 script 執行。
- 前端永遠只讀核准的靜態資產。
- 不使用品牌／特定工作室風格名稱。統一描述為：
  `vivid cinematic 3D animated illustration, family-friendly, expressive characters, exaggerated motion, high contrast, vertical composition`。

### 7.2 Prompt record

每張圖都要保存：

```json
{
  "sceneId": "pair-00-01",
  "promptVersion": "v1",
  "prompt": "...",
  "negativePrompt": "text, watermark, logo, cropped subject, duplicate object",
  "provider": "manual-or-configured-provider",
  "generationId": "optional",
  "status": "draft",
  "reviewNotes": []
}
```

### 7.3 圖像規格

- 原始比例 9:16。
- 發布格式 AVIF + WebP fallback。
- 最大長邊 1600 px。
- 單張發布目標 ≤ 220 KB；超過 350 KB 視為 error。
- 使用 `<picture>` 與明確 width / height，避免 layout shift。
- `alt` 描述由人工可讀中文 scene text 派生，不直接使用英文 prompt。

### 7.4 人工 QA

每張圖必須在 `reports/image-qa.csv` 有審核狀態：

- 兩個核心物件均可辨識。
- 無錯誤文字、浮水印或品牌標誌。
- 無恐怖、血腥或不適合兒童內容。
- 關鍵動作符合故事。
- 構圖在手機裁切後仍完整。

---

## 8. 頁面與路由

```text
/                         Dashboard
/catalog                  00–100 圖鑑
/modules/:moduleId        模組總覽
/learn/:lessonId          學習頁
/quiz/:lessonId           課程測驗
/review                   到期複習
/offline                  離線包管理
/settings                 設定
/about                    資料版本與隱私說明
```

未知 ID：顯示 404，不自動 fallback 至首頁。

### 8.1 Dashboard

- 整體熟練度、今日到期題數、最近 lesson。
- 五個 module，每個 module 內顯示兩個 lesson。
- 「繼續學習」依最近有效 `lastSceneId` 決定。
- 進度定義：
  - `viewed`：看過。
  - `practiced`：至少完成一次 recall。
  - `mastered`：複習狀態達 mastery 門檻。
- UI 不可把 viewed 顯示為 mastered。

### 8.2 Catalog

- 101 張 item 卡。
- 搜尋數字、canonical keyword、alias。
- 點擊顯示出現在哪些 lesson、故事句與圖片。
- 支援從 item 直接開始單題練習。

### 8.3 Pair learning

每個 pair scene 顯示：

1. from number / keyword。
2. 圖片或 placeholder。
3. 隱藏的 scene text，點「顯示答案」後揭露。
4. to number / keyword。
5. 自我評分：`忘記`、`模糊`、`記得`。

操作：

- 左右 swipe 或上一題／下一題按鈕。
- 不用長按作為唯一盲背入口；盲背有明確 toggle。
- 揭露答案前不可提交「記得」。
- 到 lesson 結尾顯示 recap，而不是把 recap 當普通 scene。

### 8.4 Narrative learning

- 故事標題與 scene progress。
- 以段落卡呈現，不強制整頁無限捲動。
- 每 scene 可先隱藏 item 關鍵字，讓使用者回想後揭露。
- 使用 `tokens` 高亮數字與詞，不在 render 時 regex replace HTML。
- 支援「故事模式」與「逐句模式」。
- 當 `prefers-reduced-motion` 時取消縮放、parallax、強烈 transition。

### 8.5 Empty / loading / error states

每頁都必須有：

- skeleton/loading。
- content validation failure。
- image unavailable fallback。
- offline but lesson not downloaded。
- IndexedDB unavailable fallback 說明。

---

## 9. 測驗設計

### 9.1 題型

1. `number-to-keyword`：數字 → 四個關鍵字。
2. `keyword-to-number`：關鍵字 → 四個數字。
3. `pair-next-item`：顯示 from + scene 提示，選下一數字／關鍵字。
4. `story-cloze`：隱藏 narrative token。
5. `ordered-recall`：將 lesson 的 item 排列回正確順序；只在使用者完成 lesson 後解鎖。

V1 不以圖片選擇題作必備，避免圖片尚未完成時阻塞核心測驗；圖片題在有 approved image 時自動啟用。

### 9.2 Distractor 規則

禁止完全隨機。依序選：

1. 同十位或相鄰 lesson 的數字。
2. 相似尾數（如 21 / 31 / 41）。
3. 關鍵字語義或字形相近者。
4. 不足時再從全域抽樣。

約束：

- 四個選項唯一。
- 正解位置均衡，測試 1000 次分布差異不得 >10%。
- 不得讓 alias 與 canonical 同時成為不同選項。
- 每題保存 seed，便於重現 bug。

### 9.3 回饋

- 作答後立即顯示正解與故事關聯。
- 不以紅／綠顏色作唯一提示，搭配 icon 與文字。
- 錯題提供「重新看這一幕」。

---

## 10. 間隔複習與進度模型

### 10.1 採用簡化 Leitner 排程

三桶制若沒有 due date，無法可靠形成間隔複習。本版採 deterministic Leitner：

| Box | 答對後間隔 | 答錯後 |
|---|---:|---|
| 0 | 10 分鐘 | 留在 0，5 分鐘後重試 |
| 1 | 1 天 | 回到 0 |
| 2 | 3 天 | 回到 0 |
| 3 | 7 天 | 回到 1 |
| 4 | 21 天 | 回到 2 |
| 5 | 60 天 | 回到 2 |

自我評分：

- `forgot`：視為錯誤。
- `hard`：box 不變，interval × 0.5。
- `good`：box +1。
- `easy`：box +2，最高 5。

### 10.2 Review record

```ts
interface ReviewCardState {
  cardId: string;
  itemId: ItemId;
  lessonId: LessonId;
  promptType: QuizType;
  box: 0 | 1 | 2 | 3 | 4 | 5;
  dueAt: string;
  lastReviewedAt?: string;
  streak: number;
  lapses: number;
  suspended: boolean;
}
```

### 10.3 時間規則

- 全部以 UTC ISO string 儲存。
- UI 依裝置時區顯示。
- 測試須使用 fake timers。
- 裝置時間倒退時，不可產生負 interval；記錄 telemetry-free local warning。

### 10.4 Mastery 定義

item 滿足以下條件才為 mastered：

- 至少完成兩種不同 prompt type。
- box ≥ 3。
- 最近 3 次無錯誤。

---

## 11. Persistence 與 migration

### 11.1 IndexedDB tables

```text
progress
reviewCards
reviewEvents
offlineLessons
contentMetadata
```

設定存於：`localStorage["number-chain.settings.v1"]`。

### 11.2 Schema version

- Dexie DB 名稱：`number-chain-db`。
- 每次 schema 變更必須新增 migration test。
- content version 更新時，以 stable IDs 保留進度。
- 若 item 被刪除，將 review card 標記 orphaned，不直接刪除歷史。

### 11.3 匯出／重置

Settings 提供：

- 匯出本機學習資料 JSON。
- 匯入前 Zod validation + preview。
- 重置需二次確認並說明不可復原。

---

## 12. PWA 與離線策略

### 12.1 Precache

只 precache：

- App shell。
- 字型／icons。
- content manifest 與文字 JSON。
- 小型 placeholder。

### 12.2 Runtime cache

- Approved images：Cache First，版本化 URL。
- Navigation：Network First，離線 fallback app shell。
- JSON：Stale While Revalidate，但 content manifest hash 改變後須更新。

### 12.3 離線 lesson pack

使用者在 `/offline` 主動下載 lesson：

1. 先計算 asset count 與預估 bytes。
2. 檢查 `navigator.storage.estimate()`。
3. 顯示確認。
4. 逐張下載並顯示進度。
5. 任何失敗要可 retry，不把 partial pack 標示為 complete。
6. 可單獨刪除 lesson pack。

### 12.4 更新 UX

Service Worker 有新版本時：

- 顯示「有新版本」banner。
- 使用者點更新後才 `skipWaiting` + reload。
- 學習中的未提交 self-rating 先保存再 reload。

---

## 13. Accessibility

最低標準：WCAG 2.2 AA。

- 所有手勢都有可見按鈕替代。
- touch target 至少 44×44 CSS px。
- focus 可見且順序合理。
- modal 有 focus trap、Escape close、恢復焦點。
- 圖片 alt 不重複朗讀鄰近完整文字；裝飾圖片用空 alt。
- 模糊文字不能只靠 CSS blur 隱藏：未揭露內容不應存在於 accessibility tree；揭露後以 `aria-live="polite"` 通知。
- `prefers-reduced-motion` 全面支援。
- 深／淺模式文字對比至少 4.5:1。
- 不以色彩作唯一正誤提示。
- Playwright + axe 對主要頁面執行自動檢查；仍需手動鍵盤流程驗收。

---

## 14. 效能與品質預算

### 14.1 Web Vitals 目標（中階手機、Fast 4G）

- LCP ≤ 2.5 s。
- INP ≤ 200 ms。
- CLS ≤ 0.1。
- 首次 JS gzip ≤ 180 KB。
- 初始路由總傳輸（不含圖片）≤ 350 KB。

### 14.2 Runtime

- 不一次 mount 101 張完整圖卡。
- Catalog 使用虛擬化或分批 render。
- Narrative images lazy load；目前、前一、下一 scene 優先。
- 所有 event listener 在 unmount 時清除。

### 14.3 Lighthouse CI

Production build：

- Performance ≥ 90。
- Accessibility ≥ 95。
- Best Practices ≥ 95。
- PWA installability 通過。

---

## 15. Security 與隱私

- V1 無帳號、無 analytics、無廣告追蹤。
- CSP 至少：`default-src 'self'`; 視部署調整 image source。
- 不允許任意 HTML 注入；故事 token 以 Vue text node render。
- import JSON 大小上限 5 MB。
- 圖片生成／LLM script 只讀環境變數，`.env` 不進 git。
- `npm audit` / dependency review 在 CI 執行；不能以自動 major upgrade 解決。
- About 頁清楚說明資料只存在裝置本機。

---

## 16. 測試矩陣

### 16.1 Python / ETL

```bash
pytest -q
python -m scripts.etl.extract_workbook --strict ...
```

### 16.2 TypeScript

```bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:component
```

### 16.3 E2E

```bash
pnpm test:e2e
```

必要流程：

1. 新使用者從 Dashboard 進入 L01，完成一幕 recall，重開後位置保留。
2. L07 顯示正確故事標題與 61–70 scenes。
3. L08 顯示另一篇故事，不沿用 L07 title。
4. 80 只屬於 L08；81 是 L09 起點，不出現不存在的 80→81 故事。
5. 測驗錯題進 review，fake time 前進後於到期頁出現。
6. 下載 L01 offline pack，模擬 offline 後可完整使用。
7. 未下載 L10 圖片時，offline 顯示明確 fallback，不白屏。
8. reduced motion 模式無大幅動畫。
9. 鍵盤可完成學習與測驗。
10. content JSON 故意損壞時顯示 error boundary。

### 16.4 手動裝置驗收

- iPhone Safari。
- Android Chrome。
- 360×800、390×844、768×1024。
- portrait；landscape 可用但不作最佳化主目標。

---

## 17. Error handling 與 logging

### 17.1 使用者可見錯誤

錯誤文案要告知：發生什麼、資料是否安全、下一步。

例：

```text
這一課的離線圖片尚未下載。文字內容仍可使用；連線後可在「離線管理」下載圖片。
```

### 17.2 開發 logging

- production 不輸出使用者學習答案到 console。
- ETL report 可含來源 row/cell，但不含 API secrets。
- Error boundary 產生本機可複製的 error code，不上傳。

---

## 18. 分階段 Implementation Plan

### Phase 0 — Repository 與品質閘門

- [ ] **P0-T01** 建立 pnpm workspace、Vue/Vite/TS app。
- [ ] **P0-T02** 設定 ESLint、Prettier、Vitest、Playwright。
- [ ] **P0-T03** 建立 Python package、pytest、ETL CLI skeleton。
- [ ] **P0-T04** 建立 CI：lint → typecheck → Python test → TS test → build → E2E。
- [ ] **P0-T05** 建立 `IMPLEMENTATION_STATUS.md` 與 ADR template。

**DoD**：乾淨 checkout 執行 `pnpm install && pnpm verify` 全綠。

### Phase 1 — ETL 與內容 schema

- [ ] **P1-T01** 實作 Zod content schemas。
- [ ] **P1-T02** 實作 number normalization 與主字典 parser。
- [ ] **P1-T03** 實作 pair parser、summary parser。
- [ ] **P1-T04** 實作 multi-story narrative parser。
- [ ] **P1-T05** 實作 validation issue / strict mode / allowlist。
- [ ] **P1-T06** 產出 JSON、manifest、Markdown report。
- [ ] **P1-T07** 加入 deterministic snapshots 與 source hash。

**DoD**：

- 101 items。
- 10 lessons。
- 4 narrative stories。
- 無未處理 error。
- 所有 warning 有明確 allowlist 或人工待辦。
- 前端能以 Zod 成功載入全部輸出。

### Phase 2 — App shell、資料 repository、persistence

- [ ] **P2-T01** App shell、router、404、global error boundary。
- [ ] **P2-T02** ContentRepository：fetch + Zod parse + version check。
- [ ] **P2-T03** Dexie schema、repository、migration tests。
- [ ] **P2-T04** Settings、theme、reduced motion。
- [ ] **P2-T05** Dashboard 與 module / lesson progress selectors。

**DoD**：Dashboard 正確列出五 modules、十 lessons，重開後設定與最近位置保留。

### Phase 3 — 學習體驗

- [ ] **P3-T01** Mnemonic item card / image fallback。
- [ ] **P3-T02** Pair lesson player + reveal + self-rating。
- [ ] **P3-T03** Narrative story / sentence players + token render。
- [ ] **P3-T04** Recap view、lesson completion flow。
- [ ] **P3-T05** Catalog 搜尋與 item detail。
- [ ] **P3-T06** Keyboard、touch、screen reader interaction tests。

**DoD**：L01–L10 全可完成；不存在的跨 lesson link 不會被虛構顯示。

### Phase 4 — Quiz 與 review

- [ ] **P4-T01** seeded distractor generator。
- [ ] **P4-T02** 五種 quiz types 與統一答題結果模型。
- [ ] **P4-T03** Leitner scheduler + fake-time tests。
- [ ] **P4-T04** Review queue / due filters / mastery selector。
- [ ] **P4-T05** 錯題返回來源 scene。
- [ ] **P4-T06** 匯出、匯入、重置。

**DoD**：E2E 證明錯題可排程、到期、重做、升降 box，mastery 不受單純瀏覽影響。

### Phase 5 — PWA 與圖片

- [ ] **P5-T01** PWA manifest、icons、service worker。
- [ ] **P5-T02** App shell precache + JSON runtime cache。
- [ ] **P5-T03** offline lesson pack manager。
- [ ] **P5-T04** update banner / safe reload。
- [ ] **P5-T05** image prompt / optimization / QA scripts。
- [ ] **P5-T06** approved image integration；無圖時保持完整功能。

**DoD**：已下載 lesson 可在飛航模式完整運作，partial download 不會被標為完成。

### Phase 6 — Hardening 與 release

- [ ] **P6-T01** Lighthouse CI 與 bundle budget。
- [ ] **P6-T02** axe automation + keyboard manual checklist。
- [ ] **P6-T03** iOS / Android smoke test。
- [ ] **P6-T04** CSP、dependency audit、import size limits。
- [ ] **P6-T05** README、CONTENT_EDITING、deployment docs。
- [ ] **P6-T06** Release candidate + rollback instructions。

**DoD**：所有 §19 release gates 通過。

---

## 19. Release Gates

以下任一項未通過，不得發布：

- [ ] ETL strict mode exit 0。
- [ ] 101 canonical items，無缺號／重號。
- [ ] 10 lessons 與 4 narrative stories 正確。
- [ ] 所有 tests 綠燈。
- [ ] Chromium + WebKit E2E 綠燈。
- [ ] Lighthouse 預算達標。
- [ ] 無 P0/P1 accessibility issue。
- [ ] 無 client-side secret。
- [ ] PWA offline smoke test 通過。
- [ ] 資料 migration / export / import 測試通過。
- [ ] `IMPLEMENTATION_STATUS.md` 無未揭露 blocker。

---

## 20. Codex 啟動 Prompt（可直接貼上）

```text
你正在實作「數字鎖鏈記憶學習 Web App」。

唯一規格文件：implementation.md v4.0。
原始資料：data-source/數字鎖鏈.xlsx。

請嚴格遵守文件第 0 章執行契約，從尚未完成的最小 Task ID 開始；不可跳過 Phase 0/1 直接製作 UI，也不可自行虛構 Excel 中不存在的跨課程故事銜接。

本輪請：
1. 讀取 implementation.md 與目前 repository。
2. 檢查 docs/IMPLEMENTATION_STATUS.md，判斷下一個 Task。
3. 先建立或更新該 Task 的測試。
4. 實作最小可驗證變更。
5. 執行相關 lint、typecheck、test、build。
6. 更新 IMPLEMENTATION_STATUS.md。
7. 依第 0.4 節格式回報。

約束：
- 不使用 CDN。
- 不將 Excel 內容手動硬編碼進前端。
- 不把 API key 放進 client。
- 資料 mismatch 必須報告，不可靜默修改。
- 未通過驗證不得宣稱完成。
```

---

## 21. 審核結論

v3.0 已具備良好的產品方向與初步資料稽核，但仍存在會讓自動 coding agent 自行猜測的區域：分組邊界、故事數量、節點計數、技術選型、持久化 migration、離線圖片策略、測驗誘答、複習排程、測試與 release gates。

v4.0 的核心改進是：

1. 以真實 Excel 結構改為 **Module → Lesson → Scene**。
2. 明確區分 canonical item、pair scene、narrative story / scene。
3. 固定技術棧與 CLI，不再留下模糊選項。
4. 將進度與間隔複習從 LocalStorage 升級為有 migration 的 IndexedDB。
5. 將離線能力改為核心文字 precache + 使用者主動下載 lesson 圖片包。
6. 加入可重現的 distractor、Leitner 排程與 mastery 定義。
7. 用 Task ID、DoD、測試矩陣與 release gates 讓 Codex 能逐步完成且不虛報。

本文件取代 v3.0 作為後續開發主規格；任何產品或資料規則變更均應先修改本文件及對應測試，再修改程式。
