<template>
  <div class="container">
    <div class="review-header mb-16">
      <h2>⏳ Spaced Repetition 間隔複習 (選擇題模式)</h2>
      <p class="text-muted">自動筛选到期的複習卡片，以選擇題方式快速複習</p>
    </div>

    <!-- Empty State -->
    <div v-if="dueCards.length === 0" class="card text-center empty-card">
      <span class="confetti">🎉</span>
      <h3>太棒了！</h3>
      <p class="text-muted mt-8">目前沒有任何到期的複習字卡，請明天再來！</p>
      <router-link to="/" class="btn btn-primary mt-16">返回首頁</router-link>
    </div>

    <!-- Review Player -->
    <div v-else-if="currentCard" class="player-container">
      <div class="review-meta text-muted text-center mb-12">
        剩餘待複習: {{ dueCards.length }} 題 | 當前卡箱: 箱 {{ currentCard.box }}
      </div>

      <div class="flashcard card">
        <!-- Prompt Type Title -->
        <span class="prompt-type-badge">
          {{ getPromptTypeLabel(currentCard.promptType) }}
        </span>

        <!-- Front Prompt Display -->
        <div class="card-prompt mt-16">
          <!-- Type 1: Number to Keyword -->
          <div v-if="currentCard.promptType === 'number-to-keyword'" class="center-num">
            {{ item?.number }}
          </div>

          <!-- Type 2: Keyword to Number -->
          <div v-else-if="currentCard.promptType === 'keyword-to-number'" class="center-kw">
            {{ item?.canonicalKeyword }}
          </div>

          <!-- Type 3: Pair Next Item -->
          <div v-else-if="currentCard.promptType === 'pair-next-item' && pairScene" class="pair-prompt">
            <div class="item-display from">
              <span class="num">{{ pairScene.fromItemId.split('-')[1] }}</span>
              <span class="kw">{{ pairScene.displayFromKeyword }}</span>
            </div>
            <span class="arrow">➔</span>
            <div class="item-display to masked">
              <span class="num">??</span>
              <span class="kw">? ?</span>
            </div>
          </div>

          <!-- Type 4: Story Cloze -->
          <div v-else-if="currentCard.promptType === 'story-cloze' && storyScene" class="story-cloze-prompt text-center">
            <p class="cloze-title text-muted mb-8" style="font-size: 0.85rem; font-weight: 700;">請回想空缺的記憶詞：</p>
            <p class="cloze-text" style="font-size: 1.1rem; line-height: 1.6; font-weight: 600;">{{ maskedStoryText }}</p>
          </div>
        </div>
      </div>

      <!-- Multiple Choice Options -->
      <div class="options-grid mt-16" v-if="currentOptions.length > 0">
        <button 
          v-for="(opt, idx) in currentOptions" 
          :key="idx" 
          class="option-btn btn"
          :class="getOptionClass(opt)"
          :disabled="selectedOption !== null"
          @click="selectOption(opt)"
        >
          <span class="opt-label">{{ String.fromCharCode(65 + idx) }}.</span>
          <span class="opt-text">{{ opt.display }}</span>
        </button>
      </div>

      <!-- Answer Feedback details -->
      <div class="feedback-card card mt-16" v-if="selectedOption !== null">
        <div class="feedback-header" :class="isCorrect ? 'text-success' : 'text-danger'">
          <span class="fb-icon">{{ isCorrect ? '✅' : '❌' }}</span>
          <span class="fb-title">{{ isCorrect ? '答對了！' : '答錯了！' }}</span>
        </div>
        
        <div class="feedback-body mt-8">
          <p class="ans-explain">
            正確答案是: <span class="font-bold text-primary">{{ currentAnswer?.display }}</span>
          </p>
          
          <div class="hint-block mt-8" v-if="pairScene">
            <span class="hint-label">💡 聯想畫面提示：</span>
            <p class="hint-text">{{ pairScene.sceneText }}</p>
          </div>

          <div class="hint-block mt-8" v-if="currentCard.promptType === 'story-cloze' && storyScene">
            <span class="hint-label">💡 完整故事上下文：</span>
            <p class="hint-text">{{ storyScene.originalText }}</p>
          </div>
        </div>

        <button class="btn btn-primary w-full mt-12 py-12" @click="nextCard">
          下一題 ➡️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { ReviewCardState } from '../repositories/ProgressRepository';
import { MnemonicItem, PairScene, NarrativeScene } from '../domain/types';

interface ReviewOption {
  value: string;
  display: string;
}

const appStore = useAppStore();

const dueCards = ref<ReviewCardState[]>([]);
const currentCardIndex = ref(0);
const isRevealed = ref(false);

const selectedOption = ref<ReviewOption | null>(null);
const isCorrect = ref(false);
const currentOptions = ref<ReviewOption[]>([]);
const currentAnswer = ref<ReviewOption | null>(null);

const currentCard = computed((): ReviewCardState | null => {
  if (dueCards.value.length === 0) return null;
  return dueCards.value[currentCardIndex.value];
});

const item = computed((): MnemonicItem | undefined => {
  if (!currentCard.value) return undefined;
  return contentRepo.getItem(currentCard.value.itemId);
});

// Load the pair scene if prompt involves relationship association
const pairScene = computed((): PairScene | undefined => {
  if (!currentCard.value) return undefined;
  
  // Find pair scene starting from this item
  const allPairScenes = contentRepo.getPairScenes();
  return allPairScenes.find(s => s.fromItemId === currentCard.value?.itemId);
});

// Load the narrative scene if prompt involves story cloze
const storyScene = computed((): NarrativeScene | undefined => {
  if (!currentCard.value || currentCard.value.promptType !== 'story-cloze') return undefined;
  const allScenes = contentRepo.getNarrativeScenes();
  return allScenes.find(s => s.itemIds.includes(currentCard.value!.itemId));
});

const maskedStoryText = computed((): string => {
  const scene = storyScene.value;
  const targetItem = item.value;
  if (!scene || !targetItem) return '';
  
  const targetNum = targetItem.number;
  // Mask original text: e.g. "(61) 老人" -> "(61) [ ❓ ]"
  const regex = new RegExp(`\\(${parseInt(targetNum)}\\)\\s*[^，。！、；：()]+`);
  return scene.originalText.replace(regex, `(${targetNum}) [  ❓  ]`);
});

onMounted(async () => {
  await loadDueCards();
});

const loadDueCards = async () => {
  const cards = await progressRepo.getDueCards();
  // Shuffle cards slightly so types are mixed up
  dueCards.value = cards.sort(() => Math.random() - 0.5);
  currentCardIndex.value = 0;
  isRevealed.value = false;
  selectedOption.value = null;
  isCorrect.value = false;
  
  loadCurrentOptions();
};

const loadCurrentOptions = () => {
  const card = currentCard.value;
  const targetItem = item.value;
  if (!card || !targetItem) {
    currentOptions.value = [];
    currentAnswer.value = null;
    return;
  }

  const allItems = contentRepo.getItems();
  const distractors = generateDistractors(targetItem.number, allItems);
  let ansOpt: ReviewOption;
  let distOpts: ReviewOption[] = [];

  if (card.promptType === 'number-to-keyword') {
    ansOpt = { value: targetItem.number, display: targetItem.canonicalKeyword };
    distOpts = distractors.map(d => ({ value: d.number, display: d.canonicalKeyword }));
  } else if (card.promptType === 'keyword-to-number') {
    ansOpt = { value: targetItem.number, display: targetItem.number };
    distOpts = distractors.map(d => ({ value: d.number, display: d.number }));
  } else if (card.promptType === 'pair-next-item' && pairScene.value) {
    const toItemId = pairScene.value.toItemId;
    const toNum = toItemId.split('-')[1];
    const toItem = allItems.find(i => i.id === toItemId);
    const toKeyword = toItem ? toItem.canonicalKeyword : '';
    
    ansOpt = { value: toNum, display: `${toNum} ${toKeyword}` };
    distOpts = distractors.map(d => ({ value: d.number, display: `${d.number} ${d.canonicalKeyword}` }));
  } else if (card.promptType === 'story-cloze') {
    ansOpt = { value: targetItem.number, display: targetItem.canonicalKeyword };
    distOpts = distractors.map(d => ({ value: d.number, display: d.canonicalKeyword }));
  } else {
    ansOpt = { value: targetItem.number, display: targetItem.canonicalKeyword };
    distOpts = distractors.map(d => ({ value: d.number, display: d.canonicalKeyword }));
  }

  currentAnswer.value = ansOpt;
  currentOptions.value = [ansOpt, ...distOpts].sort(() => Math.random() - 0.5);
};

// Leitner distractor rules
const generateDistractors = (targetNumStr: string, allItems: MnemonicItem[]): MnemonicItem[] => {
  const targetVal = parseInt(targetNumStr);
  const targetTens = Math.floor(targetVal / 10);
  const targetUnits = targetVal % 10;
  
  const pool = allItems.filter(item => item.number !== targetNumStr);
  const results: MnemonicItem[] = [];

  // 1. Same tens digit
  const sameTens = pool.filter(i => Math.floor(i.numericValue / 10) === targetTens);
  if (sameTens.length > 0) {
    results.push(...sameTens.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  // 2. Same units digit
  const sameUnits = pool.filter(i => i.numericValue % 10 === targetUnits && !results.includes(i));
  if (sameUnits.length > 0) {
    results.push(...sameUnits.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  // 3. Fallback
  while (results.length < 3) {
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    if (!results.includes(randomItem)) {
      results.push(randomItem);
    }
  }

  return results.slice(0, 3);
};

const getPromptTypeLabel = (type: string): string => {
  switch (type) {
    case 'number-to-keyword': return '數字 ➔ 聯想詞';
    case 'keyword-to-number': return '聯想詞 ➔ 數字';
    case 'pair-next-item': return '配對聯想 ➔ 下個數字';
    case 'story-cloze': return '故事填空 ➔ 聯想詞';
    default: return '字卡回想';
  }
};

const getOptionClass = (opt: ReviewOption) => {
  if (selectedOption.value === null) return 'btn-secondary';
  
  const isCurrentOpt = selectedOption.value.value === opt.value;
  const isCorrectOpt = currentAnswer.value?.value === opt.value;
  
  if (isCorrectOpt) {
    return 'btn-success-opt';
  }
  if (isCurrentOpt && !isCorrect.value) {
    return 'btn-danger-opt';
  }
  return 'btn-muted-opt';
};

const selectOption = async (opt: ReviewOption) => {
  if (!currentCard.value) return;
  
  selectedOption.value = opt;
  const correct = currentAnswer.value?.value === opt.value;
  isCorrect.value = correct;

  // Spaced repetition schedule update: correct -> Good box up, incorrect -> Forgot box down
  const rating = correct ? 'good' : 'forgot';
  await progressRepo.submitReviewResult(currentCard.value.cardId, rating);
  await appStore.refreshReviewCounts();
};

const nextCard = () => {
  isRevealed.value = false;
  selectedOption.value = null;
  isCorrect.value = false;
  
  // Remove this card from dueCards list immediately
  dueCards.value.splice(currentCardIndex.value, 1);
  
  if (dueCards.value.length === 0) {
    loadDueCards();
  } else {
    loadCurrentOptions();
  }
};
</script>

<style scoped>
.review-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
}

.empty-card {
  padding: 40px 24px;
  border-radius: var(--border-radius-lg);
}

.confetti {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.empty-card h3 {
  font-size: 1.25rem;
  font-weight: 800;
}

.review-meta {
  font-size: 0.8rem;
}

.flashcard {
  min-height: 180px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.prompt-type-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: var(--primary-glow);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid var(--primary);
}

.card-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 100px;
}

.center-num {
  font-size: 3.8rem;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: -2px;
}

.center-kw {
  font-size: 2.2rem;
  font-weight: 800;
}

.pair-prompt {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  width: 90px;
}

.item-display.from {
  border-left: 4px solid var(--primary);
}

.item-display.masked {
  background-color: var(--border-color);
  opacity: 0.4;
}

.item-display .num {
  font-size: 1.65rem;
  font-weight: 900;
  color: var(--text-primary);
}

.item-display .kw {
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 4px;
}

.pair-prompt .arrow {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-muted);
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px 16px;
  text-align: left;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  font-size: 0.9rem;
}

.opt-label {
  font-weight: 800;
  font-size: 0.95rem;
  margin-right: 12px;
  color: var(--text-secondary);
}

.opt-text {
  font-size: 0.95rem;
  font-weight: 600;
}

.option-btn.btn-secondary:hover {
  border-color: var(--primary);
  background-color: var(--bg-secondary);
}

.btn-success-opt {
  background-color: var(--success) !important;
  color: white !important;
  border-color: var(--success) !important;
}

.btn-danger-opt {
  background-color: var(--danger) !important;
  color: white !important;
  border-color: var(--danger) !important;
}

.btn-muted-opt {
  opacity: 0.55;
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-muted) !important;
}

.feedback-card {
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fb-icon {
  font-size: 1.25rem;
}

.fb-title {
  font-size: 1.05rem;
  font-weight: 800;
}

.ans-explain {
  font-size: 0.9rem;
}

.hint-block {
  background-color: var(--bg-secondary);
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

.hint-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.hint-text {
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-top: 2px;
  line-height: 1.5;
}

.font-bold {
  font-weight: 700;
}

.w-full {
  width: 100%;
}

.py-12 {
  padding-top: 12px;
  padding-bottom: 12px;
}
</style>
