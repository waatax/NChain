<template>
  <div class="container">
    <!-- Header with progress -->
    <div class="learn-header mb-16" v-if="lesson">
      <div class="header-top">
        <button class="back-btn" @click="goBack">◀ 返回</button>
        <span class="lesson-title">{{ lesson.title }}</span>
      </div>
      <div class="progress-bar-container mt-8">
        <div class="progress-bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-text mt-4 text-muted text-center">
        進度: {{ currentSceneIndex + 1 }} / {{ totalScenes }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!lesson" class="card text-center">
      <p>正在加載課程...</p>
    </div>

    <!-- PAIR MODE PLAYER (Flashcards) -->
    <div v-else-if="lesson.mode === 'pair' && currentPairScene" class="player-container">
      <div class="flashcard card">
        <div class="card-sides">
          <!-- FRONT SIDE (Prompt) -->
          <div class="side front">
            <div class="item-display from">
              <span class="num">{{ currentPairScene.fromItemId.split('-')[1] }}</span>
              <span class="kw">{{ currentPairScene.displayFromKeyword }}</span>
            </div>
            
            <div class="transition-arrow">➔</div>
            
            <div class="item-display to masked" v-if="!isRevealed">
              <span class="num">??</span>
              <span class="kw">? ?</span>
            </div>
            <div class="item-display to" v-else>
              <span class="num">{{ currentPairScene.toItemId.split('-')[1] }}</span>
              <span class="kw">{{ currentPairScene.displayToKeyword }}</span>
            </div>
          </div>

          <!-- Scene Image Placeholder -->
          <div class="image-placeholder mt-16">
            <span class="image-icon">🖼️</span>
            <span class="image-label">連鎖想像畫面</span>
          </div>

          <!-- BACK SIDE (Scene description - Revealed) -->
          <div class="side-back mt-16" v-if="isRevealed">
            <p class="scene-desc-title">💡 聯想畫面：</p>
            <p class="scene-desc-text">{{ currentPairScene.sceneText }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="player-actions mt-16">
        <button 
          v-if="!isRevealed" 
          class="btn btn-primary w-full py-14" 
          @click="revealAnswer"
        >
          👁️ 顯示聯想與答案
        </button>
        
        <div v-else class="rating-buttons">
          <p class="rating-prompt text-center mb-8">您還記得這個聯想畫面嗎？</p>
          <div class="buttons-grid">
            <button class="btn btn-danger rate-btn" @click="submitRating('forgot')">
              <span>忘记</span>
              <span class="rate-sub">重来</span>
            </button>
            <button class="btn btn-warning rate-btn" @click="submitRating('hard')">
              <span>模糊</span>
              <span class="rate-sub">减半</span>
            </button>
            <button class="btn btn-primary rate-btn" @click="submitRating('good')">
              <span>记得</span>
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

    <!-- NARRATIVE MODE PLAYER (Story highlights) -->
    <div v-else-if="lesson.mode === 'narrative' && currentNarrativeScene" class="player-container">
      <div class="blind-toggle-container mb-16">
        <label class="switch-label">
          <input type="checkbox" v-model="appStore.settings.blindRecall" />
          <span class="switch-text">👁️ 啟用盲背模式 (點擊遮罩揭露關鍵字)</span>
        </label>
      </div>

      <div class="story-card card">
        <div class="story-scene-content">
          <div class="tokens-flow">
            <template v-for="(token, tIdx) in currentNarrativeScene.tokens" :key="tIdx">
              <!-- Item Token -->
              <span 
                v-if="token.itemId" 
                class="token-item" 
                :class="{ 
                  masked: appStore.settings.blindRecall && !unmaskedTokens.has(tIdx),
                  unmasked: unmaskedTokens.has(tIdx)
                }"
                @click="revealToken(tIdx)"
              >
                {{ appStore.settings.blindRecall && !unmaskedTokens.has(tIdx) ? '[ ❓ 點擊揭露 ]' : token.text }}
              </span>
              <!-- Plain Text Token -->
              <span v-else class="token-text">{{ token.text }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Image Placeholder -->
      <div class="image-placeholder mt-16">
        <span class="image-icon">🎭</span>
        <span class="image-label">劇本插圖</span>
      </div>

      <div class="player-actions mt-16">
        <button class="btn btn-primary w-full py-14" @click="nextNarrativeScene">
          {{ currentSceneIndex < totalScenes - 1 ? '➡️ 下一幕' : '🏁 查看故事總結' }}
        </button>
      </div>
    </div>

    <!-- LESSON END RECAP -->
    <div v-if="isLessonCompleted && lesson" class="recap-container mt-16">
      <div class="card recap-card">
        <div class="text-center">
          <span class="trophy-icon">🏆</span>
          <h3>恭喜完成課程！</h3>
          <p class="text-muted mt-4">您已學習了 {{ lesson.title }} 的所有記憶點</p>
        </div>

        <div class="recap-content mt-16" v-if="storyRecap">
          <h4 v-if="storyRecap.title">{{ storyRecap.title }} 總結</h4>
          
          <div class="recap-section mt-12" v-if="storyRecap.recapText">
            <h5>🔍 記憶聯想關鍵點（複習專用）：</h5>
            <p class="recap-text whitespace-pre">{{ storyRecap.recapText }}</p>
          </div>

          <div class="recap-section mt-12" v-if="storyRecap.memoryTip">
            <h5>💡 記憶小秘訣：</h5>
            <p class="recap-text whitespace-pre">{{ storyRecap.memoryTip }}</p>
          </div>
        </div>

        <div class="recap-actions mt-16 flex gap-16">
          <button class="btn btn-secondary flex-1" @click="goBack">返回主頁</button>
          <button class="btn btn-primary flex-1" @click="startQuizDirect">✍️ 開始測驗</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { Lesson, PairScene, NarrativeScene, NarrativeStory } from '../domain/types';
import { ProgressState, zQuizType } from '../repositories/ProgressRepository';

const props = defineProps<{
  lessonId: string;
}>();

const router = useRouter();
const appStore = useAppStore();

const lesson = ref<Lesson | null>(null);
const pairScenes = ref<PairScene[]>([]);
const narrativeScenes = ref<NarrativeScene[]>([]);
const storyRecap = ref<NarrativeStory | null>(null);

const currentSceneIndex = ref(0);
const isRevealed = ref(false);
const isLessonCompleted = ref(false);

const unmaskedTokens = ref<Set<number>>(new Set());

// Progress state tracking
const completedScenes = ref<string[]>([]);

onMounted(async () => {
  const loadedLesson = contentRepo.getLesson(props.lessonId);
  if (!loadedLesson) {
    router.replace('/');
    return;
  }
  lesson.value = loadedLesson;

  // Initialize Leitner review cards for this lesson
  const promptTypes: zQuizType[] = ['number-to-keyword', 'keyword-to-number', 'pair-next-item'];
  if (loadedLesson.mode === 'narrative') {
    promptTypes.push('story-cloze');
  }
  await progressRepo.initializeCardsForLesson(props.lessonId, loadedLesson.itemIds, promptTypes);

  // Load progress
  const progress = await progressRepo.getLessonProgress(props.lessonId);
  if (progress) {
    completedScenes.value = progress.completedSceneIds;
  }

  if (loadedLesson.mode === 'pair') {
    pairScenes.value = contentRepo.getPairScenes().filter(s => s.lessonId === props.lessonId);
  } else {
    narrativeScenes.value = contentRepo.getNarrativeScenes().filter(s => s.lessonId === props.lessonId);
    // Load narrative story recap details
    const story = contentRepo.getStories().find(s => s.lessonId === props.lessonId);
    if (story) {
      storyRecap.value = story;
    }
  }
});

const totalScenes = computed(() => {
  if (!lesson.value) return 0;
  return lesson.value.mode === 'pair' ? pairScenes.value.length : narrativeScenes.value.length;
});

const progressPercent = computed(() => {
  if (totalScenes.value === 0) return 0;
  return Math.round(((currentSceneIndex.value) / totalScenes.value) * 100);
});

const currentPairScene = computed((): PairScene | null => {
  if (!lesson.value || lesson.value.mode !== 'pair' || pairScenes.value.length === 0) return null;
  return pairScenes.value[currentSceneIndex.value];
});

const currentNarrativeScene = computed((): NarrativeScene | null => {
  if (!lesson.value || lesson.value.mode !== 'narrative' || narrativeScenes.value.length === 0) return null;
  return narrativeScenes.value[currentSceneIndex.value];
});

const revealAnswer = () => {
  isRevealed.value = true;
};

const revealToken = (tokenIndex: number) => {
  unmaskedTokens.value.add(tokenIndex);
};

const recordProgress = async (sceneId: string) => {
  if (!completedScenes.value.includes(sceneId)) {
    completedScenes.value.push(sceneId);
  }
  
  const isCompleted = completedScenes.value.length >= totalScenes.value;
  
  const state: ProgressState = {
    lessonId: props.lessonId,
    lastSceneId: sceneId,
    completedSceneIds: [...completedScenes.value],
    isCompleted,
    updatedAt: new Date().toISOString()
  };
  
  await progressRepo.saveLessonProgress(state);
};

const submitRating = async (rating: 'forgot' | 'hard' | 'good' | 'easy') => {
  const scene = currentPairScene.value;
  if (!scene) return;
  
  // Submit rating for cards (fromItem_pair-next-item, etc.)
  const cardId = `${scene.fromItemId}_pair-next-item`;
  await progressRepo.submitReviewResult(cardId, rating);
  await appStore.refreshReviewCounts();

  // Save progress
  await recordProgress(scene.id);

  // Go to next card
  if (currentSceneIndex.value < pairScenes.value.length - 1) {
    currentSceneIndex.value++;
    isRevealed.value = false;
  } else {
    isLessonCompleted.value = true;
  }
};

const nextNarrativeScene = async () => {
  const scene = currentNarrativeScene.value;
  if (!scene) return;
  
  // Mark all tokens of this scene as completed and save progress
  await recordProgress(scene.id);
  
  if (currentSceneIndex.value < narrativeScenes.value.length - 1) {
    currentSceneIndex.value++;
    unmaskedTokens.value.clear();
  } else {
    isLessonCompleted.value = true;
  }
};

const goBack = () => {
  router.push('/');
};

const startQuizDirect = () => {
  router.push({ name: 'quiz', params: { lessonId: props.lessonId } });
};
</script>

<style scoped>
.learn-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
}

.lesson-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.progress-bar-container {
  height: 6px;
  background-color: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--success);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
}

/* Flashcard elements */
.flashcard {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.card-sides {
  display: flex;
  flex-direction: column;
}

.front {
  display: flex;
  justify-content: center;
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

.item-display.to {
  border-left: 4px solid var(--success);
}

.item-display.masked {
  background-color: var(--border-color);
  opacity: 0.5;
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

.transition-arrow {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-muted);
}

/* Image Placeholder Style */
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  border: 1.5px dashed var(--border-color);
  color: var(--text-muted);
}

.image-icon {
  font-size: 2.2rem;
  margin-bottom: 6px;
}

.image-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.side-back {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.scene-desc-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.scene-desc-text {
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin-top: 4px;
}

/* Narrative story flow */
.story-card {
  padding: 24px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  min-height: 180px;
  display: flex;
  align-items: center;
}

.story-scene-content {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.tokens-flow {
  display: inline;
}

.token-item {
  font-weight: 800;
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
  padding: 0 4px;
  cursor: pointer;
  display: inline-block;
  margin: 0 2px;
  transition: background-color var(--transition-speed);
}

.token-item.masked {
  background-color: var(--primary-glow);
  color: var(--text-secondary);
  border-bottom: 2.5px dashed var(--primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.token-item.unmasked {
  background-color: hsla(145, 75%, 45%, 0.15);
  color: var(--success);
  border-bottom-color: var(--success);
  animation: pulseHighlight 0.4s ease;
}

@keyframes pulseHighlight {
  0% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Rating buttons */
.rating-buttons {
  width: 100%;
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

.blind-toggle-container {
  display: flex;
  align-items: center;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Recap */
.recap-card {
  padding: 24px;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
}

.trophy-icon {
  font-size: 3rem;
  display: block;
}

.recap-card h3 {
  font-size: 1.35rem;
  font-weight: 800;
  margin-top: 10px;
}

.recap-content h4 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
  border-bottom: 1.5px solid var(--border-color);
  padding-bottom: 8px;
}

.recap-section h5 {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.recap-text {
  font-size: 0.85rem;
  background-color: var(--bg-secondary);
  padding: 12px;
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  line-height: 1.6;
  margin-top: 6px;
}

.whitespace-pre {
  white-space: pre-wrap;
}

.py-14 {
  padding-top: 14px;
  padding-bottom: 14px;
}
</style>
