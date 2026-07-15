<template>
  <div class="container py-24">
    <!-- Back Header -->
    <div class="header-nav mb-24">
      <button class="btn btn-secondary back-btn" @click="goBack">
        ◀ 返回主頁
      </button>
      <h2 class="page-title mt-12">🃏 卡牌記憶複習 (Flash Cards)</h2>
    </div>

    <!-- CONFIG STATE -->
    <div v-if="state === 'config'" class="config-card card text-center p-32 max-w-lg mx-auto">
      <div class="config-icon">🃏</div>
      <h3>選擇記憶卡牌範圍</h3>
      <p class="text-muted mt-8 mb-24">透過雙面閃卡，快速測試您對每個數字對應聯想詞的直覺反應。</p>

      <div class="range-grid">
        <button 
          v-for="r in ranges" 
          :key="r.label" 
          class="btn btn-secondary range-btn"
          @click="selectRange(r)"
        >
          <span class="range-title">{{ r.label }}</span>
          <span class="range-subtitle text-muted">{{ r.desc }}</span>
        </button>
      </div>

      <div class="shuffle-option mt-24 flex justify-center items-center gap-8">
        <input type="checkbox" id="shuffle" v-model="shuffleOnStart" class="checkbox-input" />
        <label for="shuffle" class="checkbox-label cursor-pointer">🍀 開始時自動打亂卡牌順序</label>
      </div>
    </div>

    <!-- PLAYING STATE -->
    <div v-else-if="state === 'playing'" class="playing-container max-w-md mx-auto">
      <!-- Progress and Mode controls -->
      <div class="progress-bar-container mb-16 flex justify-between items-center">
        <span class="progress-text font-bold">
          卡牌：{{ currentIndex + 1 }} / {{ items.length }}
        </span>
        <div class="mode-badges flex gap-8">
          <span class="badge range-badge">{{ selectedRangeLabel }}</span>
          <span v-if="isShuffled" class="badge shuffle-badge">已打亂 🔀</span>
        </div>
      </div>

      <!-- 3D Flipping Flash Card -->
      <div class="flash-card-container mb-24" @click="toggleFlip">
        <div class="flash-card" :class="{ flipped: isFlipped }">
          <!-- FRONT SIDE (Question) -->
          <div class="card-face front">
            <span class="card-hint">想一想，聯想詞是？</span>
            <div class="card-number-wrapper">
              <span class="card-number">{{ currentItem.number }}</span>
            </div>
            <div class="card-tap-cue">
              <span class="cue-icon">🔄</span>
              <span>點擊或按下空白鍵翻面</span>
            </div>
          </div>

          <!-- BACK SIDE (Answer) -->
          <div class="card-face back" @click.stop="toggleFlip">
            <!-- Icon Graphic or Placeholder (Now Main Visual Focus) -->
            <div class="card-icon-container">
              <img 
                v-if="hasIcon(currentItem.id)" 
                :src="getIconUrl(currentItem.id)" 
                class="card-icon-img" 
                alt="icon" 
              />
              <div v-else class="card-icon-placeholder">
                <span class="card-placeholder-char">{{ currentItem.canonicalKeyword[0] }}</span>
              </div>
            </div>

            <!-- Meta info Row (Number + Keyword) -->
            <div class="back-meta-row mt-12">
              <span class="back-number">{{ currentItem.number }}</span>
              <h2 class="back-keyword">{{ currentItem.canonicalKeyword }}</h2>
            </div>
            
            <!-- Memory Hint Association -->
            <div class="back-association mt-12" v-if="associationText">
              <span class="assoc-label">💡 聯想故事：</span>
              <p class="assoc-text">{{ associationText }}</p>
            </div>

            <div class="card-tap-cue mt-auto">
              <span class="cue-icon">🔄</span>
              <span>點擊翻回正面</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Actions / Controls -->
      <div class="controls-card card p-16">
        <div class="controls-buttons flex gap-12">
          <button 
            class="btn btn-secondary flex-1 py-12" 
            :disabled="currentIndex === 0" 
            @click="prevCard"
          >
            ◀ 上一張
          </button>
          <button class="btn btn-primary flex-1 py-12" @click="toggleFlip">
            🔄 翻轉 (Space)
          </button>
          <button 
            class="btn btn-secondary flex-1 py-12" 
            :disabled="currentIndex === items.length - 1" 
            @click="nextCard"
          >
            下一張 ▶
          </button>
        </div>

        <div class="controls-meta mt-16 pt-12 border-t flex justify-between items-center">
          <button class="btn btn-secondary btn-sm" @click="toggleShuffle">
            {{ isShuffled ? '🔁 還原順序' : '🔀 打亂卡牌' }}
          </button>
          <button class="btn btn-danger btn-sm" @click="resetConfig">
            ⚙️ 重新設定
          </button>
        </div>
      </div>

      <!-- Keyboard Shortcuts Help -->
      <div class="keyboard-help mt-16 text-center text-muted">
        <span>鍵盤快捷鍵：← 上一張 | → 下一張 | 空白鍵 翻轉</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { contentRepo } from '../repositories';
import { MnemonicItem } from '../domain/types';

const router = useRouter();

// State
const state = ref<'config' | 'playing'>('config');
const items = ref<MnemonicItem[]>([]);
const originalItems = ref<MnemonicItem[]>([]);
const currentIndex = ref(0);
const isFlipped = ref(false);
const isShuffled = ref(false);
const shuffleOnStart = ref(true);
const selectedRangeLabel = ref('');

const ranges = [
  { label: '00 - 20', desc: '從操場到耳玲', filter: (num: number) => num >= 0 && num <= 20 },
  { label: '21 - 40', desc: '從鱷魚到司令', filter: (num: number) => num >= 21 && num <= 40 },
  { label: '41 - 60', desc: '從死魚到榴槤', filter: (num: number) => num >= 41 && num <= 60 },
  { label: '61 - 80', desc: '從老人到巴黎', filter: (num: number) => num >= 61 && num <= 80 },
  { label: '81 - 100', desc: '從白蟻到百元', filter: (num: number) => num >= 81 && num <= 100 },
  { label: '00 - 100 全域', desc: '所有 101 個記憶點', filter: () => true }
];

// Helper to determine active transparent watercolor icons (00-16)
const presentIcons = Array.from({ length: 17 }, (_, i) => String(i).padStart(2, '0'));

const hasIcon = (itemId: string): boolean => {
  const num = itemId.split('-')[1];
  return presentIcons.includes(num);
};

const getIconUrl = (itemId: string): string => {
  const num = itemId.split('-')[1];
  return `${import.meta.env.BASE_URL || '/'}assets/icons/icon_${num}.png`;
};

const currentItem = computed<MnemonicItem>(() => {
  return items.value[currentIndex.value] || { id: '', number: '00', canonicalKeyword: '', numericValue: 0 };
});

// Dynamic Mnemonic Association hint for the current item
const associationText = computed(() => {
  if (!currentItem.value.id) return '';
  const num = currentItem.value.number;
  const scenes = contentRepo.getPairScenes();
  
  // Find a story scene where this number is involved
  const found = scenes.find(s => 
    s.fromItemId.split('-')[1] === num || 
    s.toItemId.split('-')[1] === num
  );
  
  return found ? found.sceneText : '';
});

// Actions
const selectRange = (range: typeof ranges[0]) => {
  const all = contentRepo.getItems();
  // Filter items in selected range
  const filtered = all.filter(item => range.filter(item.numericValue));
  
  originalItems.value = [...filtered];
  selectedRangeLabel.value = range.label;
  
  if (shuffleOnStart.value) {
    items.value = [...filtered].sort(() => Math.random() - 0.5);
    isShuffled.value = true;
  } else {
    items.value = [...filtered];
    isShuffled.value = false;
  }
  
  currentIndex.value = 0;
  isFlipped.value = false;
  state.value = 'playing';
};

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const prevCard = () => {
  if (currentIndex.value > 0) {
    isFlipped.value = false;
    // Wait a brief moment for transition to reset before changing content
    setTimeout(() => {
      currentIndex.value--;
    }, 150);
  }
};

const nextCard = () => {
  if (currentIndex.value < items.value.length - 1) {
    isFlipped.value = false;
    setTimeout(() => {
      currentIndex.value++;
    }, 150);
  }
};

const toggleShuffle = () => {
  if (isShuffled.value) {
    // Restore order
    items.value = [...originalItems.value];
    isShuffled.value = false;
  } else {
    // Shuffle
    items.value = [...items.value].sort(() => Math.random() - 0.5);
    isShuffled.value = true;
  }
  currentIndex.value = 0;
  isFlipped.value = false;
};

const resetConfig = () => {
  state.value = 'config';
  items.value = [];
  originalItems.value = [];
  currentIndex.value = 0;
  isFlipped.value = false;
  isShuffled.value = false;
};

const goBack = () => {
  router.push('/');
};

// Keyboard Listeners
const handleKeyDown = (e: KeyboardEvent) => {
  if (state.value !== 'playing') return;
  
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    toggleFlip();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    prevCard();
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nextCard();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.range-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 480px) {
  .range-grid {
    grid-template-columns: 1fr;
  }
}

.range-btn {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  transition: all var(--transition-speed);
}

.range-btn:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  background: rgba(139, 92, 246, 0.05);
}

.range-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
}

.range-subtitle {
  font-size: 0.75rem;
  margin-top: 4px;
}

/* 3D Flash Card */
.flash-card-container {
  perspective: 1000px;
  width: 100%;
  height: 380px;
  position: relative;
}

.flash-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.flash-card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

.card-face.front {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
}

.card-face.back {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
  transform: rotateY(180deg);
}

/* Card Front Elements */
.card-hint {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.card-number-wrapper {
  margin: auto 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-number {
  font-size: 6.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #a78bfa 0%, #3b82f6 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.15));
}

.card-tap-cue {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Card Back Elements */
.card-icon-container {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.card-icon-img {
  width: 170px;
  height: 170px;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

.card-icon-placeholder {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--border-color) 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1.5px solid var(--border-color);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-placeholder-char {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.back-meta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.back-number {
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--primary);
  background: rgba(139, 92, 246, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

.back-keyword {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  margin: 0;
}

.back-association {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 8px 12px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.assoc-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
}

.assoc-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 4px;
  text-align: left;
}

/* General Layout helpers */
.border-t {
  border-top: 1px solid var(--border-color);
}

.max-w-lg {
  max-w: 520px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

.checkbox-label {
  font-size: 0.9rem;
  user-select: none;
}
</style>
