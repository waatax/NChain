<template>
  <div class="container catalog-container">
    <div class="catalog-header mb-16">
      <div class="header-badge-row mb-6">
        <span class="hanko-seal">圖鑑</span>
        <span class="catalog-subtitle text-muted">00–100 記憶關鍵字全集</span>
      </div>
      <h2>{{ t('00–100 記憶關鍵字圖鑑') }}</h2>
      <p class="text-muted mt-4">{{ t('點擊卡片查看在故事或場景中的出現位置') }}</p>
    </div>

    <!-- Layout Wrapper -->
    <div class="catalog-layout-wrapper">
      
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
          
          <div class="detail-row">
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

const searchQuery = ref('');
const gridCols = ref(3); // Default to 3 columns per row
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

  // 1. Filter by Range Chip
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

  // 2. Filter by Search Query
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
  
  // Search pair scenes
  contentRepo.getPairScenes().forEach(scene => {
    if (scene.fromItemId === itemId || scene.toItemId === itemId) {
      list.push({
        id: scene.id,
        sheet: `配對課程: ${getLessonTitleForItem(itemId)}`,
        text: `【${scene.displayFromKeyword}】 ➔ 【${scene.displayToKeyword}】：${scene.sceneText}`
      });
    }
  });
  
  // Search narrative scenes
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
