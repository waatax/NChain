<template>
  <div class="container">
    <div class="catalog-header mb-16">
      <h2>00–100 記憶關鍵字圖鑑</h2>
      <p class="text-muted">點擊卡片查看在故事或場景中的出現位置</p>
    </div>

    <!-- Search Input -->
    <div class="search-container mb-16">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜尋數字、關鍵字或別名 (例如: 05, 鎖鏈, 鱷魚)..." 
        class="search-input"
      />
    </div>

    <!-- Grid Layout -->
    <div class="items-grid">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="item-card card" 
        @click="showDetail(item)"
      >
        <span class="item-number">{{ item.number }}</span>
        <span class="item-keyword">{{ item.canonicalKeyword }}</span>
        <span v-if="item.aliases.length > 0" class="item-aliases">
          別名: {{ item.aliases.join(', ') }}
        </span>
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

.search-container {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 8px 12px;
  box-shadow: var(--shadow-sm);
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 400px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  cursor: pointer;
  text-align: center;
}

.item-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.item-number {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: -0.5px;
}

.item-keyword {
  font-size: 0.95rem;
  font-weight: 700;
  margin-top: 4px;
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
