<template>
  <div class="container learn-view-container">
    <!-- Header with progress -->
    <div class="learn-header mb-24" v-if="lesson">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">◀</span> 返回
        </button>
        <span class="lesson-title">{{ lesson.title }}</span>
      </div>
      <div class="progress-bar-container mt-12">
        <div class="progress-bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-text mt-6 text-muted text-center">
        進度: {{ currentSceneIndex + 1 }} / {{ totalScenes }}
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!lesson" class="loading-card card text-center p-48">
      <div class="spinner"></div>
      <p class="text-muted mt-16">正在加載課程...</p>
    </div>

    <!-- PAIR MODE PLAYER -->
    <div v-else-if="lesson.mode === 'pair' && currentPairScene && !isLessonCompleted" class="player-container learn-split-layout">
      <div class="learn-left-col">
        <div class="flashcard-wrapper">
          <!-- CARD DISPLAY -->
          <div class="flashcard-inner">
            
            <!-- FRONT SIDE (From Item) -->
            <div class="card-side card-front card" v-if="!isRevealed">
              <span class="card-indicator">起點字 / 提示</span>
              
              <div class="graphic-container">
                <img 
                  v-if="hasIcon(currentPairScene.fromItemId)" 
                  :src="getIconUrl(currentPairScene.fromItemId)" 
                  @error="handleIconError(currentPairScene.fromItemId)" 
                  class="large-icon-img" 
                  alt="icon" 
                />
                <div v-else class="large-icon-placeholder">
                  <span class="placeholder-char-large">{{ currentPairScene.displayFromKeyword[0] }}</span>
                </div>
              </div>
              
              <div class="meta-container mt-16">
                <span class="item-number-badge">{{ currentPairScene.fromItemId.split('-')[1] }}</span>
                <span class="item-keyword-large">{{ currentPairScene.displayFromKeyword }}</span>
              </div>
            </div>

            <!-- BACK SIDE (To Item) -->
            <div class="card-side card-back card" v-else>
              <span class="card-indicator">聯想目標字 / 答案</span>
              
              <div class="graphic-container">
                <img 
                  v-if="hasIcon(currentPairScene.toItemId)" 
                  :src="getIconUrl(currentPairScene.toItemId)" 
                  @error="handleIconError(currentPairScene.toItemId)" 
                  class="large-icon-img" 
                  alt="icon" 
                />
                <div v-else class="large-icon-placeholder">
                  <span class="placeholder-char-large">{{ currentPairScene.displayToKeyword[0] }}</span>
                </div>
              </div>
              
              <div class="meta-container mt-16">
                <span class="item-number-badge dest">{{ currentPairScene.toItemId.split('-')[1] }}</span>
                <span class="item-keyword-large">{{ currentPairScene.displayToKeyword }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="learn-right-col">
        <!-- REVEAL CONTROL (When NOT revealed) -->
        <div class="reveal-actions" v-if="!isRevealed">
          <button class="btn btn-primary btn-reveal w-full py-16" @click="revealAnswer">
            👁️ 顯示下一個字與聯想畫面
          </button>
        </div>

        <!-- ASSOCIATION & RATING (When revealed) -->
        <div class="revealed-content" v-else>
          <!-- Story / Illustration -->
          <div class="association-details-card card p-20 mb-20">
            <div class="association-header mb-12">
              <span class="association-tag">💡 聯想故事鏈</span>
              <div class="association-flow">
                <span>【{{ currentPairScene.fromItemId.split('-')[1] }} {{ currentPairScene.displayFromKeyword }}】</span>
                <span class="flow-arrow">➔</span>
                <span class="highlight">【{{ currentPairScene.toItemId.split('-')[1] }} {{ currentPairScene.displayToKeyword }}】</span>
              </div>
            </div>
            
            <p class="scene-story-text">{{ currentPairScene.sceneText }}</p>

            <!-- Scene Illustration if exists -->
            <div class="scene-illustration-wrapper mt-16" v-if="hasIllustration(currentPairScene)">
              <img :src="getIllustrationUrl(currentPairScene)" class="scene-illustration-img" alt="聯想畫面插圖" />
            </div>
          </div>

          <!-- Rating Buttons -->
          <div class="rating-section">
            <p class="rating-prompt text-center mb-12">請在腦海中複習此聯想畫面，並記錄熟練度：</p>
            <div class="buttons-grid">
              <button class="btn btn-danger rate-btn" @click="submitRating('forgot')">
                <span class="rate-title">忘記</span>
                <span class="rate-sub">重來</span>
              </button>
              <button class="btn btn-warning rate-btn" @click="submitRating('hard')">
                <span class="rate-title">模糊</span>
                <span class="rate-sub">減半</span>
              </button>
              <button class="btn btn-primary rate-btn" @click="submitRating('good')">
                <span class="rate-title">記得</span>
                <span class="rate-sub">升箱</span>
              </button>
              <button class="btn rate-btn btn-easy" @click="submitRating('easy')">
                <span class="rate-title">輕鬆</span>
                <span class="rate-sub">+2箱</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NARRATIVE MODE PLAYER (Story highlights) -->
    <div v-else-if="lesson.mode === 'narrative' && currentNarrativeScene && !isLessonCompleted" class="player-container learn-split-layout">
      <div class="learn-left-col">
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
      </div>

      <div class="learn-right-col">
        <!-- Image Placeholder -->
        <div class="image-placeholder">
          <span class="image-icon">🎭</span>
          <span class="image-label">劇本插圖</span>
        </div>

        <div class="player-actions mt-16">
          <button class="btn btn-primary w-full py-14" @click="nextNarrativeScene">
            {{ currentSceneIndex < totalScenes - 1 ? '➡️ 下一幕' : '🏁 查看故事總結' }}
          </button>
        </div>
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
import { ref, computed, onMounted } from 'vue';
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
  return `${import.meta.env.BASE_URL || '/'}assets/icons/icon_${num}.png?v=3`;
};

const failedIcons = ref<Set<string>>(new Set());

const handleIconError = (itemId: string) => {
  const num = itemId.split('-')[1];
  failedIcons.value.add(num);
};

const hasIcon = (itemId: string): boolean => {
  const num = itemId.split('-')[1];
  return !failedIcons.value.has(num);
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
.learn-view-container {
  max-width: 600px;
  margin: 0 auto;
}

.learn-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary);
}

.lesson-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.progress-bar-container {
  height: 8px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--success) 100%);
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.1, 0.8, 0.25, 1);
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 3.5px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Flashcard Container and Large Icons */
.flashcard-wrapper {
  perspective: 1000px;
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.flashcard-inner {
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  transform-style: preserve-3d;
}

.card-side {
  width: 100%;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  position: relative;
  transition: all 0.3s ease;
}

.card-indicator {
  position: absolute;
  top: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.graphic-container {
  width: 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0.01) 70%);
  border-radius: 20px;
  padding: 10px;
}

.large-icon-img {
  width: 240px;
  height: 240px;
  object-fit: contain;
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.18));
  transition: transform 0.3s ease;
}

.large-icon-img:hover {
  transform: scale(1.03);
}

.large-icon-placeholder {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed var(--border-color);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-char-large {
  font-size: 5rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.meta-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-number-badge {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary);
  background: rgba(139, 92, 246, 0.1);
  padding: 4px 14px;
  border-radius: 8px;
}

.item-number-badge.dest {
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

.item-keyword-large {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--text-primary);
}

/* Actions and Buttons */
.btn-reveal {
  font-size: 1.05rem;
  font-weight: 800;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, #6d28d9 100%);
  box-shadow: 0 4px 16px var(--primary-glow);
  transition: all 0.3s ease;
}

.btn-reveal:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--primary-glow);
}

/* Revealed Association Card */
.association-details-card {
  border: 1.5px solid var(--border-color);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(0, 0, 0, 0) 100%);
  border-radius: 16px;
}

.association-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.association-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.association-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.association-flow .highlight {
  color: var(--success);
}

.flow-arrow {
  color: var(--text-muted);
}

.scene-story-text {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-primary);
  font-weight: 500;
}

.scene-illustration-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.scene-illustration-img {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
}

/* Rating Box */
.rating-section {
  background: var(--bg-card);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.rating-prompt {
  font-size: 0.85rem;
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
  justify-content: center;
  align-items: center;
  padding: 10px 4px;
  border-radius: 10px;
  height: 58px;
  transition: all 0.2s ease;
}

.rate-btn:hover {
  transform: translateY(-2px);
}

.rate-title {
  font-size: 0.95rem;
  font-weight: 800;
}

.rate-sub {
  font-size: 0.65rem;
  font-weight: 600;
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

/* Narrative Mode overrides */
.story-card {
  padding: 24px;
  border: 1.5px solid var(--border-color);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  min-height: 180px;
  display: flex;
  align-items: center;
}

.story-scene-content {
  font-size: 1.15rem;
  line-height: 1.8;
}

.token-item {
  font-weight: 800;
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
  padding: 0 4px;
  cursor: pointer;
  display: inline-block;
  margin: 0 2px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.token-item.masked {
  background-color: var(--primary-glow);
  color: var(--text-secondary);
  border-bottom: 2px dashed var(--primary);
  font-size: 0.95rem;
}

.token-item.unmasked {
  background-color: hsla(145, 75%, 45%, 0.15);
  color: var(--success);
  border-bottom-color: var(--success);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1.5px dashed var(--border-color);
  color: var(--text-muted);
}

/* Recap view */
.recap-card {
  padding: 32px 24px;
  border-radius: 24px;
  border: 1.5px solid var(--border-color);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
}

.trophy-icon {
  font-size: 3.5rem;
  display: block;
  animation: bounceRecap 2s infinite;
}

@keyframes bounceRecap {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.recap-card h3 {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-top: 12px;
}

.recap-content h4 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary);
  border-bottom: 1.5px solid var(--border-color);
  padding-bottom: 8px;
}

.recap-section h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.keyword-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  background-color: var(--bg-secondary);
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.keyword-item-row {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.95rem;
}

.kw-num {
  text-align: center;
  background-color: var(--primary-glow);
  color: var(--primary);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  min-width: 26px;
}

.kw-text {
  color: var(--text-primary);
}

.recap-text {
  font-size: 0.9rem;
  background-color: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-primary);
  line-height: 1.6;
  border: 1px solid var(--border-color);
}

/* Learn split layout responsive rules */
.learn-split-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 1024px) {
  .learn-split-layout {
    flex-direction: row !important;
    gap: 32px !important;
    align-items: flex-start !important;
  }

  .learn-left-col {
    flex: 1.1 !important;
    min-width: 0;
  }

  .learn-right-col {
    flex: 0.9 !important;
    min-width: 0;
    position: sticky;
    top: 90px;
  }

  .flashcard-wrapper {
    max-width: 100% !important;
  }

  .rating-section {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 20px;
    border-radius: var(--border-radius-lg);
  }
}
</style>
