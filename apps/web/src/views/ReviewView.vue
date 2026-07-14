<template>
  <div class="container">
    <div class="review-header mb-16">
      <h2>⏳ Spaced Repetition 間隔複習</h2>
      <p class="text-muted">基於 Leitner 系統，每天自動篩選到期的複習字卡</p>
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

        <!-- Answer Reveal Detail -->
        <div class="card-answer-revealed mt-16" v-if="isRevealed">
          <p class="answer-header">✅ 正確答案：</p>
          <div class="answer-box">
            <span class="ans-num font-bold">{{ item?.number }}</span>
            <span class="ans-kw font-bold">{{ item?.canonicalKeyword }}</span>
          </div>

          <div class="association-block mt-12" v-if="pairScene">
            <p class="label">💡 聯想畫面提示：</p>
            <p class="text">{{ pairScene.sceneText }}</p>
          </div>

          <div class="association-block mt-12" v-if="currentCard.promptType === 'story-cloze' && storyScene">
            <p class="label">💡 完整故事上下文：</p>
            <p class="text">{{ storyScene.originalText }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="player-actions mt-16">
        <button 
          v-if="!isRevealed" 
          class="btn btn-primary w-full py-14" 
          @click="isRevealed = true"
        >
          👁️ 顯示答案
        </button>

        <div v-else class="rating-buttons">
          <p class="rating-prompt text-center mb-8">您剛才的回想正確嗎？</p>
          <div class="buttons-grid">
            <button class="btn btn-danger rate-btn" @click="submitRating('forgot')">
              <span>忘記</span>
              <span class="rate-sub">重來</span>
            </button>
            <button class="btn btn-warning rate-btn" @click="submitRating('hard')">
              <span>模糊</span>
              <span class="rate-sub">減半</span>
            </button>
            <button class="btn btn-primary rate-btn" @click="submitRating('good')">
              <span>記得</span>
              <span class="rate-sub">升箱</span>
            </button>
            <button class="btn rate-btn btn-easy" @click="submitRating('easy')">
              <span>輕鬆</span>
              <span class="rate-sub">+2箱</span>
            </button>
          </div>
        </div>
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

const appStore = useAppStore();

const dueCards = ref<ReviewCardState[]>([]);
const currentCardIndex = ref(0);
const isRevealed = ref(false);

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

const submitRating = async (rating: 'forgot' | 'hard' | 'good' | 'easy') => {
  if (!currentCard.value) return;
  
  // Submit review result
  await progressRepo.submitReviewResult(currentCard.value.cardId, rating);
  await appStore.refreshReviewCounts();

  // Load next card
  isRevealed.value = false;
  
  // Remove this card from dueCards list immediately for UX smoothness
  dueCards.value.splice(currentCardIndex.value, 1);
  
  // If queue is empty, refresh database to see if new cards got scheduled
  if (dueCards.value.length === 0) {
    await loadDueCards();
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
  min-height: 240px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
  padding: 24px;
}

.prompt-type-badge {
  position: absolute;
  top: 16px;
  left: 16px;
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
  min-height: 120px;
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

.card-answer-revealed {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.answer-header {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 700;
}

.answer-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.ans-num {
  font-size: 1.65rem;
  color: var(--primary);
}

.ans-kw {
  font-size: 1.45rem;
}

.association-block {
  background-color: var(--bg-secondary);
  padding: 10px 12px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

.association-block .label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.association-block .text {
  font-size: 0.85rem;
  color: var(--text-primary);
  margin-top: 2px;
  line-height: 1.5;
}

.rating-prompt {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.buttons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.rate-btn {
  display: flex;
  flex-direction: column;
  padding: 8px 4px;
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  height: 54px;
}

.rate-sub {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 2px;
}

.btn-easy {
  background-color: var(--success);
  color: white;
}
.btn-easy:hover {
  background-color: hsl(145, 75%, 35%);
}

.font-bold {
  font-weight: 700;
}

.w-full {
  width: 100%;
}

.py-14 {
  padding-top: 14px;
  padding-bottom: 14px;
}
</style>
