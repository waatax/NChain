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
              <img v-if="hasIcon(currentPairScene.fromItemId)" :src="getIconUrl(currentPairScene.fromItemId)" class="item-icon-img" alt="icon" />
              <div v-else class="item-icon-placeholder">
                <span class="placeholder-char">{{ currentPairScene.displayFromKeyword[0] }}</span>
              </div>
              <div class="item-display-meta">
                <span class="num">{{ currentPairScene.fromItemId.split('-')[1] }}</span>
                <span class="kw">{{ currentPairScene.displayFromKeyword }}</span>
              </div>
            </div>
            
            <div class="transition-arrow">➔</div>
            
            <div class="item-display to">
              <img v-if="hasIcon(currentPairScene.toItemId)" :src="getIconUrl(currentPairScene.toItemId)" class="item-icon-img" alt="icon" />
              <div v-else class="item-icon-placeholder">
                <span class="placeholder-char">{{ currentPairScene.displayToKeyword[0] }}</span>
              </div>
              <div class="item-display-meta">
                <span class="num">{{ currentPairScene.toItemId.split('-')[1] }}</span>
                <span class="kw">{{ currentPairScene.displayToKeyword }}</span>
              </div>
            </div>
          </div>

          <!-- Generated illustration -->
          <div class="image-container mt-16" v-if="hasIllustration(currentPairScene)">
            <img :src="getIllustrationUrl(currentPairScene)" class="scene-image" alt="聯想畫面插圖" />
          </div>

          <!-- Premium CSS Gradient Fallback Card -->
          <div class="card-art-fallback mt-16" v-else>
            <div class="art-backdrop"></div>
            <div class="art-glow-ring"></div>
            
            <div class="art-content">
              <div class="art-node from">
                <img v-if="hasIcon(currentPairScene.fromItemId)" :src="getIconUrl(currentPairScene.fromItemId)" class="art-node-icon" alt="icon" />
                <div v-else class="art-node-icon-placeholder">
                  <span class="art-placeholder-char">{{ currentPairScene.displayFromKeyword[0] }}</span>
                </div>
                <span class="art-node-num">{{ currentPairScene.fromItemId.split('-')[1] }}</span>
                <span class="art-node-kw">{{ currentPairScene.displayFromKeyword }}</span>
              </div>
              
              <div class="art-link">
                <div class="art-link-line"></div>
                <span class="art-link-spark">✨</span>
              </div>
              
              <div class="art-node to">
                <img v-if="hasIcon(currentPairScene.toItemId)" :src="getIconUrl(currentPairScene.toItemId)" class="art-node-icon" alt="icon" />
                <div v-else class="art-node-icon-placeholder">
                  <span class="art-placeholder-char">{{ currentPairScene.displayToKeyword[0] }}</span>
                </div>
                <span class="art-node-num">{{ currentPairScene.toItemId.split('-')[1] }}</span>
                <span class="art-node-kw">{{ currentPairScene.displayToKeyword }}</span>
              </div>
            </div>
            
            <span class="fallback-tag">🧠 智慧聯想引擎</span>
          </div>

          <!-- Scene description - Shown Immediately -->
          <div class="side-back mt-16">
            <p class="scene-desc-title">💡 聯想畫面：</p>
            <p class="scene-desc-text">{{ currentPairScene.sceneText }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="player-actions mt-16">
        <div class="rating-buttons">
          <p class="rating-prompt text-center mb-8">請在腦海中想像上述畫面，並點擊下方按鈕記錄熟練度：</p>
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

        <div class="recap-content mt-16">
          <h4 v-if="storyRecap && storyRecap.title" class="mb-12">{{ storyRecap.title }} 總結</h4>
          <h4 v-else class="mb-12">課程重點總結</h4>

          <div class="recap-section mt-12">
            <h5>🔍 記憶聯想關鍵點（複習專用）：</h5>
            <div class="keyword-list mt-8">
              <div v-for="item in lessonItems" :key="item.id" class="keyword-item-row">
                <span class="kw-num font-bold">{{ item.number }}</span>
                <span class="kw-text font-bold">{{ item.canonicalKeyword }}</span>
              </div>
            </div>
          </div>

          <div class="recap-section mt-12" v-if="storyRecap && storyRecap.memoryTip">
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

const lessonItems = computed(() => {
  if (!lesson.value) return [];
  const all = contentRepo.getItems();
  return all.filter(i => lesson.value!.itemIds.includes(i.id as any));
});

const generatedScenes: string[] = [];

const hasIllustration = (scene: PairScene): boolean => {
  const fromNum = scene.fromItemId.split('-')[1];
  const toNum = scene.toItemId.split('-')[1];
  return generatedScenes.includes(`${fromNum}_${toNum}`);
};

const getIllustrationUrl = (scene: PairScene): string => {
  const fromNum = scene.fromItemId.split('-')[1];
  const toNum = scene.toItemId.split('-')[1];
  return `${import.meta.env.BASE_URL || '/'}assets/scenes/scene_${fromNum}_${toNum}.png`;
};

const getIconUrl = (itemId: string): string => {
  const num = itemId.split('-')[1];
  return `${import.meta.env.BASE_URL || '/'}assets/icons/icon_${num}.png`;
};

const presentIcons = Array.from({ length: 17 }, (_, i) => String(i).padStart(2, '0'));

const hasIcon = (itemId: string): boolean => {
  const num = itemId.split('-')[1];
  return presentIcons.includes(num);
};

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
  padding: 16px 8px;
  border-radius: var(--border-radius-md);
  width: 135px;
  min-height: 170px;
  justify-content: center;
}

.item-icon-img {
  width: 82px;
  height: 82px;
  object-fit: contain;
  margin-bottom: 6px;
}

.item-display-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
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

/* Dynamic Keyword Grid List */
.keyword-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  background-color: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.keyword-item-row {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.95rem;
}

.kw-num {
  width: 32px;
  text-align: center;
  background-color: var(--primary-glow);
  color: var(--primary);
  border-radius: 4px;
  padding: 1px 4px;
  font-size: 0.8rem;
}

.kw-text {
  color: var(--text-primary);
}

/* Premium AI Illustration & Fallback CSS Art Card */
.image-container {
  width: 100%;
  height: 200px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-secondary);
}

.scene-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-art-fallback {
  position: relative;
  width: 100%;
  height: 180px;
  background: radial-gradient(circle at 50% 50%, #2e1065 0%, #0f052d 100%);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1.5px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.art-backdrop {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 180deg at 50% 50%, #4f46e5 0deg, #db2777 120deg, #9333ea 240deg, #4f46e5 360deg);
  animation: rotateBackdrop 25s linear infinite;
  opacity: 0.12;
  filter: blur(35px);
}

@keyframes rotateBackdrop {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.art-glow-ring {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%);
  filter: blur(10px);
}

.art-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
}

.art-node {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 75px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform var(--transition-speed);
}

.art-node-num {
  font-size: 1.25rem;
  font-weight: 900;
  background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.art-node-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-bottom: 4px;
}

.art-node-kw {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f3f4f6;
  margin-top: 2px;
}

.art-link {
  display: flex;
  align-items: center;
  position: relative;
  width: 50px;
}

.art-link-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #4f46e5 0%, #db2777 50%, #9333ea 100%);
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
}

.art-link-spark {
  position: absolute;
  left: 0;
  font-size: 0.95rem;
  animation: travelSpark 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes travelSpark {
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 80%; opacity: 0; }
}

.fallback-tag {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
}

/* Icon Placeholders */
.item-icon-placeholder {
  width: 82px;
  height: 82px;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--border-color) 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
  border: 1.5px solid var(--border-color);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.placeholder-char {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.art-node-icon-placeholder {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.art-placeholder-char {
  font-size: 0.95rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
}
</style>
