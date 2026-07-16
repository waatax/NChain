<template>
  <div class="container">
    <div class="catalog-header mb-16">
      <h2>00–100 記憶關鍵字圖鑑</h2>
      <p class="text-muted">點擊卡片查看在故事或場景中的出現位置</p>
    </div>

    <!-- Controls Row -->
    <div class="controls-row mb-16">
      <!-- Search Input -->
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜尋數字、關鍵字或別名 (例如: 05, 鎖鏈)..." 
          class="search-input"
        />
      </div>

      <!-- Column Selector -->
      <div class="col-selector-container">
        <div class="segmented-control">
          <button 
            v-for="col in [1, 2, 3, 4]" 
            :key="col" 
            :class="['segment-btn', { active: gridCols === col }]"
            @click="gridCols = col"
          >
            {{ col }} 列
          </button>
        </div>
      </div>
    </div>

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
          />
          <div v-else class="item-graphic-placeholder">
            <span class="item-placeholder-char">{{ item.canonicalKeyword ? item.canonicalKeyword[0] : '？' }}</span>
          </div>
        </div>

        <!-- Card Text -->
        <div class="item-info">
          <div class="item-meta">
            <span class="item-number">{{ item.number }}</span>
            <span class="item-keyword">{{ item.canonicalKeyword }}</span>
          </div>
          <span v-if="item.aliases.length > 0 && gridCols !== 4" class="item-aliases">
            {{ item.aliases.join(', ') }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="filteredItems.length === 0" class="empty-state card text-center mt-16">
      <p>找不到符合的數字或關鍵字 😢</p>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedItem" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-content card">
        <div class="modal-header">
          <h3>數字 【{{ selectedItem.number }}】 記憶詳情</h3>
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
            <span class="detail-label">主關鍵字：</span>
            <span class="detail-val highlight">{{ selectedItem.canonicalKeyword }}</span>
          </div>
          
          <div class="detail-row" v-if="selectedItem.aliases.length > 0">
            <span class="detail-label">故事別名：</span>
            <span class="detail-val">{{ selectedItem.aliases.join(', ') }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">課程歸屬：</span>
            <span class="detail-val">{{ getLessonTitleForItem(selectedItem.id) }}</span>
          </div>

          <div class="scenes-mentions mt-16" v-if="mentions.length > 0">
            <h4>出現在以下場景故事中：</h4>
            <div class="mention-items mt-8">
              <div v-for="mention in mentions" :key="mention.id" class="mention-card">
                <span class="mention-tag">{{ mention.sheet }}</span>
                <p class="mention-text">{{ mention.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { contentRepo } from '../repositories';
import { MnemonicItem } from '../domain/types';

const searchQuery = ref('');
const gridCols = ref(3); // Default to 3 columns per row
const failedIcons = ref<Set<string>>(new Set());
const selectedItem = ref<MnemonicItem | null>(null);

const items = contentRepo.getItems().sort((a, b) => a.numericValue - b.numericValue);

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return items;
  
  return items.filter(item => {
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
  return `${import.meta.env.BASE_URL || '/'}assets/icons/icon_${num}.png`;
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
  selectedItem.value = item;
};

const closeDetail = () => {
  selectedItem.value = null;
};
</script>

<style scoped>
.catalog-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 8px 12px;
  box-shadow: var(--shadow-sm);
  flex: 1;
  min-width: 200px;
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
  font-size: 0.9rem;
  color: var(--text-primary);
  font-family: var(--font-family);
}

.col-selector-container {
  display: flex;
  align-items: center;
}

.segmented-control {
  display: flex;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 2px;
}

.segment-btn {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn.active {
  background-color: var(--primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.items-grid {
  display: grid;
  gap: 12px;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.item-graphic {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-graphic-img {
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
}

.item-graphic-placeholder {
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-placeholder-char {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.item-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.item-number {
  font-size: 0.75rem;
  font-weight: 900;
  color: var(--primary);
  background: rgba(139, 92, 246, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
}

.item-keyword {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.item-aliases {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0 4px;
  text-align: center;
}

/* cols-1 */
.cols-1 .item-card {
  flex-direction: row !important;
  justify-content: flex-start !important;
  gap: 16px;
  padding: 12px 20px;
  text-align: left;
}

.cols-1 .item-graphic {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.cols-1 .item-graphic-img {
  width: 64px;
  height: 64px;
}

.cols-1 .item-graphic-placeholder {
  width: 60px;
  height: 60px;
}

.cols-1 .item-info {
  align-items: flex-start;
}

.cols-1 .item-meta {
  justify-content: flex-start;
  gap: 8px;
}

.cols-1 .item-number {
  font-size: 1.1rem;
  padding: 2px 6px;
}

.cols-1 .item-keyword {
  font-size: 1.1rem;
}

.cols-1 .item-aliases {
  text-align: left;
  padding: 0;
  margin-top: 2px;
}

/* cols-2 */
.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.cols-2 .item-card {
  padding: 16px 8px;
}

.cols-2 .item-graphic {
  height: 100px;
  width: 100%;
}

.cols-2 .item-graphic-img {
  width: 90px;
  height: 90px;
}

.cols-2 .item-graphic-placeholder {
  width: 80px;
  height: 80px;
}

/* cols-3 */
.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.cols-3 .item-card {
  padding: 12px 4px;
}

.cols-3 .item-graphic {
  height: 80px;
  width: 100%;
}

.cols-3 .item-graphic-img {
  width: 72px;
  height: 72px;
}

.cols-3 .item-graphic-placeholder {
  width: 64px;
  height: 64px;
}

/* cols-4 */
.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.cols-4 .item-card {
  padding: 8px 2px;
}

.cols-4 .item-graphic {
  height: 60px;
  width: 100%;
}

.cols-4 .item-graphic-img {
  width: 52px;
  height: 52px;
}

.cols-4 .item-graphic-placeholder {
  width: 48px;
  height: 48px;
}

.cols-4 .item-keyword {
  font-size: 0.75rem;
}

.cols-4 .item-number {
  font-size: 0.7rem;
  padding: 0px 3px;
}

/* Modal details */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlide {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.modal-header h3 {
  font-size: 1.05rem;
  font-weight: 800;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.modal-graphic-img {
  width: 256px;
  height: 256px;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2));
}

.modal-placeholder {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-placeholder-char {
  font-size: 5rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 700;
  color: var(--text-secondary);
  width: 100px;
  flex-shrink: 0;
}

.detail-val {
  color: var(--text-primary);
}

.detail-val.highlight {
  color: var(--primary);
  font-weight: 800;
}

.scenes-mentions h4 {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  border-left: 3.5px solid var(--primary);
  padding-left: 8px;
}

.mention-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mention-card {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  padding: 10px 12px;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
}

.mention-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--primary);
  background-color: var(--primary-glow);
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.mention-text {
  color: var(--text-primary);
  line-height: 1.5;
}
</style>
