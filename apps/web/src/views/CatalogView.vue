<template>
  <div class="container catalog-container">
    <div class="catalog-header mb-16">
      <div class="header-badge-row mb-6">
        <span class="hanko-seal">圖鑑</span>
        <span class="catalog-subtitle text-muted">00–100 與多重記憶樁大百科</span>
      </div>
      <h2>{{ t('記憶定樁與關鍵字百科') }}</h2>
      <p class="text-muted mt-4">
        {{ t('精熟 00–100 數字鎖鏈、人體定位樁與形象樁，建立隨取隨用的超強心像索引庫') }}
      </p>
    </div>

    <!-- Peg System Selector Tabs -->
    <div class="system-tabs-bar mb-16">
      <button 
        class="system-tab-btn" 
        :class="{ active: currentSystem === 'canonical' }"
        @click="switchSystem('canonical')"
      >
        🔢 00–100 數字鎖鏈主表 (101 樁)
      </button>
      <button 
        class="system-tab-btn" 
        :class="{ active: currentSystem === 'body' }"
        @click="switchSystem('body')"
      >
        🧍 1–10 人體定位樁 (10 樁)
      </button>
      <button 
        class="system-tab-btn" 
        :class="{ active: currentSystem === 'shape' }"
        @click="switchSystem('shape')"
      >
        🎨 0–9 數字形象樁 (10 樁)
      </button>
      <button 
        class="system-tab-btn" 
        :class="{ active: currentSystem === 'mastery' }"
        @click="switchSystem('mastery')"
      >
        📜 大師心像聯想四大法則
      </button>
    </div>

    <!-- 1. BODY PEG SYSTEM VIEW -->
    <div v-if="currentSystem === 'body'" class="peg-system-panel card mb-20 p-20">
      <div class="panel-header mb-16">
        <h3 class="text-primary font-bold">🧍 1–10 人體定位樁 (Body Pegs)</h3>
        <p class="text-muted text-sm mt-4">
          從頭到腳天然自帶的 10 個永久空間樁位！隨時可用於記憶 10 項以內的事項、購物清單或演講要點。
        </p>
      </div>

      <div class="body-pegs-grid">
        <div 
          v-for="b in bodyPegs" 
          :key="b.index" 
          class="body-peg-card"
        >
          <div class="body-index-seal">{{ b.index }}</div>
          <div class="body-peg-info">
            <span class="body-part-name">{{ b.part }}</span>
            <span class="body-peg-sub">{{ b.action }}</span>
            <p class="body-peg-tip mt-6">💡 <strong>應用範例：</strong>{{ b.example }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. SHAPE PEG SYSTEM VIEW -->
    <div v-if="currentSystem === 'shape'" class="peg-system-panel card mb-20 p-20">
      <div class="panel-header mb-16">
        <h3 class="text-primary font-bold">🎨 0–9 數字形狀樁 (Shape Pegs)</h3>
        <p class="text-muted text-sm mt-4">
          利用數字本身的外觀幾何形體進行直覺聯想，不需經由語言諧音轉換，視覺提取速度極快！
        </p>
      </div>

      <div class="shape-pegs-grid">
        <div 
          v-for="s in shapePegs" 
          :key="s.digit" 
          class="shape-peg-card text-center"
        >
          <span class="shape-digit">{{ s.digit }}</span>
          <span class="shape-keyword font-bold mt-4">{{ s.keyword }}</span>
          <span class="shape-desc text-xs text-muted mt-4">{{ s.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 3. MASTERY RULES VIEW -->
    <div v-if="currentSystem === 'mastery'" class="peg-system-panel card mb-20 p-20">
      <div class="panel-header mb-16">
        <h3 class="text-primary font-bold">📜 大師級心像連鎖四大黃金法則</h3>
        <p class="text-muted text-sm mt-4">
          世界記憶大師（GMM）共同遵循的腦神經編碼秘訣，確保圖像記憶直擊海馬迴與杏仁核！
        </p>
      </div>

      <div class="rules-grid">
        <div v-for="r in masteryRules" :key="r.num" class="rule-card">
          <div class="rule-num-badge">Rule {{ r.num }}</div>
          <h4 class="rule-title mt-8">{{ r.title }}</h4>
          <p class="rule-desc mt-6">{{ r.desc }}</p>
          <div class="rule-example mt-8">
            <span class="example-label">正反例對比：</span>
            <p class="example-bad text-danger">❌ 平淡：{{ r.badExample }}</p>
            <p class="example-good text-success">✔️ 大師：{{ r.goodExample }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. CANONICAL 00-100 CATALOG -->
    <div v-if="currentSystem === 'canonical'" class="catalog-layout-wrapper">
      <!-- Top Control Bar (Search + Range Chips + Column switch) -->
      <aside class="catalog-controls card mb-16">
        <!-- Search Input -->
        <div class="search-container mb-12">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="t('搜尋數字、關鍵字或別名...')" 
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
        </div>

        <!-- Range Filter Chips -->
        <div class="range-chips-row mb-12">
          <button 
            v-for="chip in rangeChips" 
            :key="chip.id"
            class="range-chip-btn"
            :class="{ active: selectedRangeChip === chip.id }"
            @click="setRangeChip(chip.id)"
          >
            {{ chip.label }}
          </button>
        </div>

        <!-- Column Selector -->
        <div class="col-selector-container flex justify-between items-center">
          <span class="control-label text-xs text-muted">{{ t('排列列數：') }}</span>
          <div class="segmented-control">
            <button 
              v-for="col in [2, 3, 4]" 
              :key="col" 
              :class="['segment-btn', { active: gridCols === col }]"
              @click="setGridCols(col)"
            >
              {{ col }} {{ t('列') }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Right main area -->
      <div class="catalog-main-content">
        <!-- Grid Layout -->
        <div :class="['items-grid', 'cols-' + gridCols]">
          <div 
            v-for="item in filteredItems" 
            :key="item.id" 
            class="item-card card" 
            @click="showDetail(item)"
          >
            <!-- Card Graphic -->
            <div class="item-graphic mb-8">
              <img 
                v-if="hasIcon(item.id)" 
                :src="getIconUrl(item.id)" 
                @error="handleIconError(item.id)"
                class="item-graphic-img" 
                alt="icon" 
                loading="lazy"
              />
              <div v-else class="item-graphic-placeholder">
                <span class="item-placeholder-char">{{ item.canonicalKeyword ? item.canonicalKeyword[0] : '？' }}</span>
              </div>
            </div>

            <!-- Card Text -->
            <div class="item-info">
              <div class="item-meta">
                <span class="item-number hanko-seal">{{ item.number }}</span>
                <span class="item-keyword">{{ item.canonicalKeyword }}</span>
              </div>
              <span v-if="item.aliases.length > 0 && gridCols <= 3" class="item-aliases">
                {{ item.aliases.join(', ') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredItems.length === 0" class="empty-state card text-center mt-16 p-32">
          <span style="font-size: 2rem; display: block; margin-bottom: 8px;">📭</span>
          <p>{{ t('找不到符合的數字或關鍵字 😢') }}</p>
          <button class="btn btn-secondary btn-sm mt-12" @click="resetFilters">重設篩選條件</button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedItem" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content card">
        <div class="modal-header">
          <div class="modal-title-group">
            <span class="hanko-seal" style="font-size: 1.1rem; padding: 2px 8px;">{{ selectedItem.number }}</span>
            <h3>【{{ selectedItem.canonicalKeyword }}】 {{ t('記憶詳情') }}</h3>
          </div>
          <button class="close-btn" @click="closeDetail">✕</button>
        </div>
        
        <div class="modal-body mt-16">
          <!-- Large Modal Image -->
          <div class="modal-image-wrapper mb-16">
            <img 
              v-if="hasIcon(selectedItem.id)" 
              :src="getIconUrl(selectedItem.id)" 
              class="modal-graphic-img" 
              alt="icon" 
            />
            <div v-else class="modal-placeholder">
              <span class="modal-placeholder-char">{{ selectedItem.canonicalKeyword ? selectedItem.canonicalKeyword[0] : '？' }}</span>
            </div>
          </div>

          <div class="detail-row">
            <span class="detail-label">{{ t('主關鍵字：') }}</span>
            <span class="detail-val highlight font-bold text-primary">{{ selectedItem.canonicalKeyword }}</span>
          </div>
          
          <div class="detail-row" v-if="selectedItem.aliases.length > 0">
            <span class="detail-label">{{ t('故事別名：') }}</span>
            <span class="detail-val">{{ selectedItem.aliases.join(', ') }}</span>
          </div>

          <!-- Mnemonic Logic -->
          <div class="mnemonic-tip-box mt-12 p-12 bg-secondary rounded-md">
            <span class="font-bold text-primary text-xs">💡 諧音與心像塑造指南：</span>
            <p class="text-xs text-secondary mt-4 leading-relaxed">
              {{ getMnemonicHint(selectedItem.number, selectedItem.canonicalKeyword) }}
            </p>
          </div>
          
          <div class="detail-row mt-8">
            <span class="detail-label">{{ t('課程歸屬：') }}</span>
            <span class="detail-val">{{ getLessonTitleForItem(selectedItem.id) }}</span>
          </div>

          <div class="scenes-mentions mt-16" v-if="mentions.length > 0">
            <h4 class="mb-8" style="font-size: 0.95rem;">{{ t('出現在以下場景故事中：') }}</h4>
            <div class="mention-items">
              <div v-for="mention in mentions" :key="mention.id" class="mention-card mb-8">
                <span class="mention-tag tag-pill mb-4">{{ mention.sheet }}</span>
                <p class="mention-text">{{ mention.text }}</p>
              </div>
            </div>
          </div>

          <div class="modal-actions mt-20 flex gap-12">
            <button class="btn btn-primary flex-1" @click="closeDetail">
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../utils/i18n';
const { t } = useI18n();
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { contentRepo } from '../repositories';
import { MnemonicItem } from '../domain/types';
import { soundFx } from '../utils/sound';

const currentSystem = ref<'canonical' | 'body' | 'shape' | 'mastery'>('canonical');

const switchSystem = (sys: 'canonical' | 'body' | 'shape' | 'mastery') => {
  soundFx.playTap();
  currentSystem.value = sys;
};

// 1. Body Pegs Data
const bodyPegs = [
  { index: 1, part: '頭頂 (Crown)', action: '放置物體、旋轉或發光', example: '記住「買牛奶」：想像頭頂頂著一桶搖搖晃晃的牛奶。' },
  { index: 2, part: '額頭 (Forehead)', action: '貼上標籤、發熱或發射雷射', example: '記住「打電話給客戶」：想像額頭貼著一張閃閃發光的電話符號。' },
  { index: 3, part: '眼睛 (Eyes)', action: '戴上特殊眼鏡、望向遠方', example: '記住「核對報表」：想像雙眼戴著黃金放大鏡射出強光。' },
  { index: 4, part: '鼻子 (Nose)', action: '強烈氣味、噴水或紅鼻子', example: '記住「買香蕉」：想像鼻子插著一根彎彎發甜的香蕉。' },
  { index: 5, part: '嘴巴 (Mouth)', action: '咬住物品、吞下或大聲咬碎', example: '記住「繳電費」：想像嘴裡咬著滋滋作響的發光電纜線。' },
  { index: 6, part: '脖子 (Neck)', action: '圍上圍巾、掛上鈴鐺或項鍊', example: '記住「開會提綱」：想像脖子掛著巨大沉重的會議麥克風。' },
  { index: 7, part: '肩膀 (Shoulders)', action: '扛著巨木、站著寵物', example: '記住「買洗衣精」：想像左肩扛著一整台正在旋轉的滾筒洗衣機。' },
  { index: 8, part: '胸口 (Chest)', action: '心臟跳動、盾牌或胸章', example: '記住「簽署合約」：想像胸口嵌著一把神聖的黃金鋼筆。' },
  { index: 9, part: '腹部 (Belly)', action: '敲擊大鼓、肚子圓滾滾', example: '記住「寄包裹」：想像肚子像袋鼠一樣裝著巨大包裹。' },
  { index: 10, part: '雙腳 (Feet)', action: '踩著滾輪、踏入泥漿或穿溜冰鞋', example: '記住「出門運動」：想像雙腳穿著噴射火箭鞋急速狂奔。' }
];

// 2. Shape Pegs Data
const shapePegs = [
  { digit: '0', keyword: '雞蛋 / 圓環', desc: '圓滾滾的雞蛋、呼拉圈或甜甜圈' },
  { digit: '1', keyword: '鉛筆 / 蠟燭', desc: '直立的筆桿、點亮的紅蠟燭' },
  { digit: '2', keyword: '鴨子 / 天鵝', desc: '彎曲脖頸在水面優雅滑行的水鳥' },
  { digit: '3', keyword: '叉子 / 耳朵', desc: '三齒金屬叉、人的左耳側廓' },
  { digit: '4', keyword: '帆船 / 紅旗', desc: '迎風鼓滿風帆的三角小木船' },
  { digit: '5', keyword: '魚鉤 / 秤鉤', desc: '彎曲鋒利的釣魚鉤或老式秤鉤' },
  { digit: '6', keyword: '蝸牛 / 哨子', desc: '螺旋外殼的蝸牛或裁判口哨' },
  { digit: '7', keyword: '拐杖 / 鋤頭', desc: '老人手持的彎頭拐杖、農夫鋤頭' },
  { digit: '8', keyword: '葫蘆 / 雪人', desc: '上下雙圓疊起的八字葫蘆或戴帽雪人' },
  { digit: '9', keyword: '酒瓶 / 氣球', desc: '圓頭帶柄的紅酒瓶或升空的繫繩氣球' }
];

// 3. Mastery Rules Data
const masteryRules = [
  {
    num: 1,
    title: '誇張巨大化 (Exaggeration)',
    desc: '平庸的物體無法刺激大腦。將所有聯想目標放大 100 倍或縮小至微觀，讓大腦產生視覺震撼。',
    badExample: '一隻小鴨子游過去。',
    goodExample: '一隻如摩天大樓般巨大的金色巨鴨，一腳踩扁了整座城市！'
  },
  {
    num: 2,
    title: '動態與碰撞 (Dynamic Action)',
    desc: '靜止的畫面容易被遺忘。必須讓兩個物體發生強烈的物理互動、撞擊、爆炸或變形。',
    badExample: '鉛筆放在桌上，旁邊有一隻鴨子。',
    goodExample: '巨型鉛筆像標槍一樣狠狠刺穿鴨子的翅膀，火花四濺！'
  },
  {
    num: 3,
    title: '五感通感刺激 (Multi-Sensory Synesthesia)',
    desc: '同時調動聽覺、嗅覺、觸覺、溫度與痛覺，刺激大腦多感官皮層協同編碼。',
    badExample: '看到一顆榴槤。',
    goodExample: '聞到極度刺鼻濃郁的榴槤臭味，踩上去尖刺扎入腳掌的劇烈痛感！'
  },
  {
    num: 4,
    title: '荒謬幽默與情緒 (Absurdity & Humor)',
    desc: '大腦對「合乎常理」的事物視而不見，對「荒唐離奇」的情節終身難忘。激活杏仁核情緒標記。',
    badExample: '一位醫生在醫院看病。',
    goodExample: '威嚴的醫生穿著粉紅芭蕾舞裙，拿著巨大聽診器在給一隻鯊魚量心跳！'
  }
];

const getMnemonicHint = (number: string, keyword: string): string => {
  return `【${number} ➔ ${keyword}】：利用讀音諧音（例如 ${number} 發音聯想至「${keyword}」）或形體幾何特徵。想像時請務必賦予具體顏色（如鮮紅、耀金）、動態行為（如旋轉、爆炸、飛翔），使神經突觸 LTP 最大化！`;
};

const searchQuery = ref('');
const gridCols = ref(3);
const selectedRangeChip = ref('all');
const failedIcons = ref<Set<string>>(new Set());
const selectedItem = ref<MnemonicItem | null>(null);

const route = useRoute();

const rangeChips = [
  { id: 'all', label: '全部' },
  { id: '00-09', label: '00–09' },
  { id: '10-19', label: '10–19' },
  { id: '20-29', label: '20–29' },
  { id: '30-39', label: '30–39' },
  { id: '40-49', label: '40–49' },
  { id: '50-59', label: '50–59' },
  { id: '60-69', label: '60–69' },
  { id: '70-79', label: '70–79' },
  { id: '80-89', label: '80–89' },
  { id: '90-99', label: '90–99' },
  { id: '100', label: '100' },
  { id: 'single', label: '形碼 0–9' }
];

onMounted(() => {
  const numQuery = route.query.number;
  if (numQuery) {
    const matched = items.find(item => item.number === numQuery);
    if (matched) {
      showDetail(matched);
    }
  }
});

const items = contentRepo.getItems().sort((a, b) => {
  if (a.numericValue !== b.numericValue) {
    return a.numericValue - b.numericValue;
  }
  return a.number.length - b.number.length;
});

const setRangeChip = (id: string) => {
  soundFx.playTap();
  selectedRangeChip.value = id;
};

const setGridCols = (cols: number) => {
  soundFx.playTap();
  gridCols.value = cols;
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedRangeChip.value = 'all';
};

const filteredItems = computed(() => {
  let list = items;

  if (selectedRangeChip.value !== 'all') {
    if (selectedRangeChip.value === 'single') {
      list = list.filter(item => item.number.length === 1 && !isNaN(Number(item.number)));
    } else if (selectedRangeChip.value === '100') {
      list = list.filter(item => item.number === '100');
    } else {
      const [startStr, endStr] = selectedRangeChip.value.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      list = list.filter(item => {
        if (item.number.length === 1) return false;
        const val = item.numericValue;
        return val >= start && val <= end;
      });
    }
  }

  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return list;
  
  return list.filter(item => {
    return (
      item.number.includes(query) ||
      item.canonicalKeyword.toLowerCase().includes(query) ||
      item.aliases.some(alias => alias.toLowerCase().includes(query))
    );
  });
});

const getLessonTitleForItem = (itemId: string): string => {
  const allLessons = contentRepo.getLessons();
  const lesson = allLessons.find(l => l.itemIds.includes(itemId as any));
  return lesson ? lesson.title : '未知課程';
};

const handleIconError = (itemId: string) => {
  if (!itemId) return;
  const num = itemId.split('-')[1];
  failedIcons.value.add(num);
};

const hasIcon = (itemId: string): boolean => {
  if (!itemId) return false;
  const num = itemId.split('-')[1];
  return !failedIcons.value.has(num);
};

const getIconUrl = (itemId: string): string => {
  const num = itemId.split('-')[1];
  return `${import.meta.env.BASE_URL || '/'}assets/icons/icon_${num}.png?v=3`;
};

const mentions = computed(() => {
  if (!selectedItem.value) return [];
  const itemId = selectedItem.value.id;
  const list: { id: string; sheet: string; text: string }[] = [];
  
  contentRepo.getPairScenes().forEach(scene => {
    if (scene.fromItemId === itemId || scene.toItemId === itemId) {
      list.push({
        id: scene.id,
        sheet: `配對課程: ${getLessonTitleForItem(itemId)}`,
        text: `【${scene.displayFromKeyword}】 ➔ 【${scene.displayToKeyword}】：${scene.sceneText}`
      });
    }
  });
  
  contentRepo.getNarrativeScenes().forEach(scene => {
    if (scene.itemIds.includes(itemId as any)) {
      list.push({
        id: scene.id,
        sheet: `故事課程: ${getLessonTitleForItem(itemId)}`,
        text: scene.originalText
      });
    }
  });
  
  return list;
});

const showDetail = (item: MnemonicItem) => {
  soundFx.playFlip();
  selectedItem.value = item;
};

const closeDetail = () => {
  soundFx.playTap();
  selectedItem.value = null;
};
</script>

<style scoped>
.catalog-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.catalog-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
}

.system-tabs-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.system-tab-btn {
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 8px);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.system-tab-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.system-tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

/* Body Pegs styles */
.body-pegs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .body-pegs-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.body-peg-card {
  display: flex;
  gap: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 8px);
  padding: 12px;
}

.body-index-seal {
  width: 36px;
  height: 36px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1rem;
  font-family: var(--font-family-serif);
}

.body-part-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  display: block;
}

.body-peg-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.body-peg-tip {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

/* Shape Pegs styles */
.shape-pegs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 480px) {
  .shape-pegs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .shape-pegs-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.shape-peg-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 8px);
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shape-digit {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--primary);
  font-family: var(--font-family-serif);
  line-height: 1;
}

.shape-keyword {
  font-size: 0.95rem;
  color: var(--text-primary);
}

/* Mastery Rules styles */
.rules-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .rules-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.rule-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 8px);
  padding: 16px;
}

.rule-num-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 800;
  background: var(--accent-gold, #f59e0b);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}

.rule-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.rule-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.rule-example {
  background: var(--bg-card);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-size: 0.82rem;
  line-height: 1.4;
}

.example-label {
  font-weight: 700;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 8px 14px;
  box-shadow: var(--shadow-xs);
  position: relative;
}

.search-icon {
  margin-right: 8px;
  font-size: 1rem;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.92rem;
  color: var(--text-primary);
  font-family: var(--font-family-base);
}

.clear-search-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  font-size: 0.85rem;
}

.range-chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.range-chip-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 4px 10px;
  font-size: 0.76rem;
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.range-chip-btn:hover {
  background-color: var(--primary-light);
  color: var(--primary);
}

.range-chip-btn.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 8px var(--primary-glow);
}

/* Item Grid */
.items-grid {
  display: grid;
  gap: 12px;
}

.items-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.items-grid.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.items-grid.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 14px 10px;
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
}

.item-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-border);
  box-shadow: var(--shadow-md);
}

.item-graphic {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  padding: 4px;
}

.item-graphic-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
}

.item-placeholder-char {
  font-size: 1.5rem;
  font-family: var(--font-family-serif);
  font-weight: 800;
  color: var(--primary);
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
}

.item-keyword {
  font-weight: 800;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.item-aliases {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  animation: modalIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: var(--bg-secondary);
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.modal-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 180px;
  background: radial-gradient(circle, var(--bg-secondary) 0%, var(--bg-card) 70%);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  padding: 12px;
}

.modal-graphic-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.12));
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-color);
  font-size: 0.92rem;
}

.mention-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  padding: 10px 14px;
  border-left: 3px solid var(--primary);
  font-size: 0.88rem;
}
</style>
