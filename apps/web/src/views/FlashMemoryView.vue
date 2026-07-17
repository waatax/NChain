<template>
  <div class="container py-24">
    <!-- Back Header -->
    <div class="header-nav mb-24">
      <button class="btn btn-secondary back-btn" @click="goBack">
        ◀ 返回主頁
      </button>
      <h2 class="page-title mt-12">⚡ 閃卡記憶訓練 (Flash Memory)</h2>
    </div>

    <!-- CONFIG STATE -->
    <div v-if="state === 'config'" class="config-container card max-w-lg mx-auto p-32">
      <div class="config-header text-center mb-24">
        <span class="lightning-icon">⚡</span>
        <h3>右腦圖像快速活化訓練</h3>
        <p class="text-muted mt-8">以每秒 1 張的速度快速播放圖像與數字，活化大腦的圖像直覺與超速記憶能力。</p>
      </div>

      <div class="config-settings">
        <!-- Range Selector -->
        <div class="setting-group mb-20">
          <label class="setting-label">1. 選擇卡牌範圍</label>
          <div class="options-row mt-8">
            <button 
              v-for="r in ranges" 
              :key="r.id"
              class="option-btn"
              :class="{ active: selectedRange === r.id }"
              @click="selectedRange = r.id"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <!-- Count Selector -->
        <div class="setting-group mb-20">
          <label class="setting-label">2. 閃卡播放數量</label>
          <div class="options-row mt-8">
            <button 
              v-for="c in [20, 40, 60]" 
              :key="c"
              class="option-btn"
              :class="{ active: playCount === c }"
              @click="playCount = c"
            >
              {{ c }} 張
            </button>
          </div>
        </div>

        <!-- Repeat Selector -->
        <div class="setting-group mb-24">
          <label class="setting-label">3. 重重複播放次數</label>
          <div class="options-row mt-8">
            <button 
              v-for="r in [1, 3, 5]" 
              :key="r"
              class="option-btn"
              :class="{ active: repeatCycles === r }"
              @click="repeatCycles = r"
            >
              {{ r }} 次
            </button>
          </div>
        </div>

        <button class="btn btn-primary start-training-btn w-full py-16 mt-12" @click="startTraining">
          🚀 開始閃放記憶訓練
        </button>
      </div>
    </div>

    <!-- PLAYING STATE -->
    <div v-else-if="state === 'playing' && currentItem" class="playing-container max-w-xl mx-auto">
      <!-- Player Header Info -->
      <div class="player-info-card card p-16 mb-16 flex justify-between items-center">
        <div class="info-left">
          <span class="badge badge-cycle">循環: {{ currentCycle }} / {{ repeatCycles }}</span>
          <span class="badge badge-count">卡牌: {{ currentIndex + 1 }} / {{ activeItems.length }}</span>
        </div>
        <div class="info-right flex gap-8">
          <button class="btn btn-secondary btn-sm" @click="togglePause">
            {{ isPaused ? '▶ 繼續' : '⏸ 暫停' }}
          </button>
          <button class="btn btn-danger btn-sm" @click="stopTraining">
            🛑 停止
          </button>
        </div>
      </div>

      <!-- Flash Frame (Timer progress line at top of frame) -->
      <div class="flash-frame card text-center">
        <!-- Timer progress indicator line -->
        <div class="timer-progress-line" :style="{ width: `${timerProgress}%` }"></div>

        <!-- IMAGE (Occupies Main Area) -->
        <div class="flash-image-wrapper">
          <img 
            v-if="hasIcon(currentItem.id)" 
            :src="getIconUrl(currentItem.id)" 
            @error="handleIconError(currentItem.id)"
            class="flash-graphic-img" 
            alt="mnemonic icon" 
          />
          <div v-else class="flash-graphic-placeholder">
            <span class="flash-placeholder-char">{{ currentItem.canonicalKeyword ? currentItem.canonicalKeyword[0] : '？' }}</span>
          </div>
        </div>

        <!-- METADATA (Number / Text) -->
        <div class="flash-meta mt-16">
          <span class="flash-number">{{ currentItem.number }}</span>
          <span class="flash-keyword">{{ currentItem.canonicalKeyword }}</span>
        </div>
      </div>
    </div>

    <!-- FINISH STATE -->
    <div v-else-if="state === 'finished'" class="finish-container card max-w-lg mx-auto p-32 text-center">
      <span class="finish-icon">🏆</span>
      <h3>訓練完成！</h3>
      <p class="text-muted mt-8 mb-24">右腦快速圖像連結已完成一輪活化！規律訓練能顯著提高數字直覺反射速度。</p>

      <div class="recap-stats p-16 mb-24">
        <div class="recap-stat-row">
          <span>總播放卡牌：</span>
          <strong class="text-primary">{{ activeItems.length * repeatCycles }} 張次</strong>
        </div>
        <div class="recap-stat-row mt-8">
          <span>累計循環：</span>
          <strong>{{ repeatCycles }} 輪</strong>
        </div>
      </div>

      <div class="actions flex gap-16">
        <button class="btn btn-secondary flex-1 py-12" @click="state = 'config'">
          🔄 再練一次
        </button>
        <button class="btn btn-primary flex-1 py-12" @click="goBack">
          返回主頁
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo } from '../repositories';
import { MnemonicItem } from '../domain/types';

const router = useRouter();
const appStore = useAppStore();

type State = 'config' | 'playing' | 'finished';
const state = ref<State>('config');

const ranges = [
  { id: 'watercolor', label: '00-09 水彩提示版', desc: '0–9 的單個水彩主題' },
  { id: 'double', label: '00-99 雙位數編碼', desc: '00–99 的雙位數編碼' },
  { id: 'all', label: '00-100 全套卡牌', desc: '全部 101 張記憶卡牌' }
];

const selectedRange = ref('all');
const playCount = ref(20);
const repeatCycles = ref(3);

const activeItems = ref<MnemonicItem[]>([]);
const currentIndex = ref(0);
const currentCycle = ref(1);

const isPaused = ref(false);
const timerProgress = ref(100);

let flashInterval: any = null;
let animationFrameId: any = null;
let lastTickTime = 0;

const currentItem = computed((): MnemonicItem | null => {
  if (activeItems.value.length === 0) return null;
  return activeItems.value[currentIndex.value];
});

const goBack = () => {
  stopIntervals();
  router.push('/');
};

// Start Flash Memory training
const startTraining = () => {
  const allItems = contentRepo.getItems();
  let pool: MnemonicItem[] = [];

  if (selectedRange.value === 'watercolor') {
    // 0 to 9 items
    pool = allItems.filter(item => item.number.length === 1 || (item.numericValue >= 0 && item.numericValue <= 9));
  } else if (selectedRange.value === 'double') {
    // 00 to 99 items
    pool = allItems.filter(item => item.number.length === 2);
  } else {
    // all
    pool = [...allItems];
  }

  // Shuffle pool and slice to requested count
  const shuffled = pool.sort(() => Math.random() - 0.5);
  activeItems.value = shuffled.slice(0, playCount.value);

  currentIndex.value = 0;
  currentCycle.value = 1;
  isPaused.value = false;
  state.value = 'playing';

  startTimer();
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  if (!isPaused.value) {
    lastTickTime = Date.now();
    tick();
  } else {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
};

const stopTraining = () => {
  stopIntervals();
  state.value = 'config';
};

const startTimer = () => {
  stopIntervals();
  lastTickTime = Date.now();
  timerProgress.value = 100;
  tick();
};

const tick = () => {
  if (isPaused.value || state.value !== 'playing') return;

  const now = Date.now();
  const elapsed = now - lastTickTime;

  if (elapsed >= 1000) {
    // Advance frame
    advanceFrame();
    lastTickTime = now;
    timerProgress.value = 100;
  } else {
    timerProgress.value = Math.max(0, 100 - (elapsed / 1000) * 100);
  }

  animationFrameId = requestAnimationFrame(tick);
};

const advanceFrame = () => {
  if (currentIndex.value < activeItems.value.length - 1) {
    currentIndex.value++;
  } else {
    // Completed a cycle
    if (currentCycle.value < repeatCycles.value) {
      currentCycle.value++;
      currentIndex.value = 0;
    } else {
      // Completed all cycles
      stopIntervals();
      state.value = 'finished';
    }
  }
};

const stopIntervals = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

onUnmounted(() => {
  stopIntervals();
});

// Image Loading Helpers
const failedIcons = ref<Set<string>>(new Set());

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
</script>

<style scoped>
.lightning-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 12px;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px var(--primary-glow)); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 12px var(--primary-glow)); }
}

.setting-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
}

.options-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.option-btn {
  flex: 1;
  min-width: 100px;
  padding: 10px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-speed);
}

.option-btn:hover {
  background-color: var(--border-color);
  color: var(--text-primary);
}

.option-btn.active {
  background-color: var(--primary-glow);
  color: var(--primary);
  border-color: var(--primary);
}

.badge {
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  margin-right: 8px;
}

.badge-cycle {
  background-color: var(--primary-glow);
  color: var(--primary);
}

.badge-count {
  background-color: var(--success-glow);
  color: var(--success);
}

/* Flash player frame */
.flash-frame {
  position: relative;
  padding: 32px 24px;
  overflow: hidden;
  border: 2px solid var(--border-color);
  background-color: var(--bg-card);
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-lg);
}

.timer-progress-line {
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--success));
  transition: width 0.033s linear;
}

.flash-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 380px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
}

.flash-graphic-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.15));
}

.flash-graphic-placeholder {
  width: 240px;
  height: 240px;
  background-color: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flash-placeholder-char {
  font-size: 6rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.flash-meta {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 16px;
}

.flash-number {
  font-size: 3.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), var(--success));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.flash-keyword {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

/* Finish recap */
.finish-icon {
  font-size: 4rem;
  display: block;
}

.recap-stats {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.recap-stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

/* Widescreen tweaks */
.layout-landscape {
  .flash-image-wrapper {
    height: 480px;
  }
}
</style>
