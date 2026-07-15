<template>
  <div class="container">
    <!-- Header -->
    <div class="quiz-header mb-16" v-if="lesson">
      <div class="header-top">
        <button class="back-btn" @click="goBack">◀ 返回</button>
        <span class="lesson-title">{{ lesson.title }} 測驗</span>
      </div>
      <div class="progress-bar-container mt-8" v-if="!isQuizFinished">
        <div class="progress-bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-text mt-4 text-muted text-center" v-if="!isQuizFinished">
        問題: {{ currentQuestionIndex + 1 }} / {{ questions.length }}
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="questions.length === 0 && !isQuizFinished" class="card text-center">
      <p>正在生成測驗題目...</p>
    </div>

    <!-- Quiz Player -->
    <div v-else-if="currentQuestion && !isQuizFinished" class="quiz-container">
      <div class="question-card card">
        <span class="question-type-tag">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
        
        <div class="question-text mt-16 text-center">
          <p class="prompt">{{ currentQuestion.prompt }}</p>
          <p class="sub-prompt" v-if="currentQuestion.subPrompt">{{ currentQuestion.subPrompt }}</p>
        </div>
      </div>

      <!-- Options Grid -->
      <div class="options-grid mt-16">
        <button 
          v-for="(opt, idx) in currentQuestion.options" 
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

    </div>

    <!-- Quiz Results Screen -->
    <div v-else-if="isQuizFinished" class="results-container mt-16">
      <div class="card results-card text-center">
        <span class="results-emoji">{{ score >= 8 ? '🎉' : '💪' }}</span>
        <h3>測驗完成！</h3>
        <div class="score-display mt-12">
          <span class="score-num">{{ score }}</span>
          <span class="score-denom">/ {{ questions.length }}</span>
        </div>
        <p class="score-text mt-8">{{ score >= 8 ? '太棒了！您對這些聯想掌握得非常好！' : '別灰心，多複習幾次就能更熟練囉！' }}</p>

        <div class="results-actions mt-16 flex gap-16">
          <button class="btn btn-secondary flex-1" @click="goBack">返回主頁</button>
          <button class="btn btn-primary flex-1" @click="restartQuiz">再試一次</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { Lesson, MnemonicItem, PairScene, NarrativeScene } from '../domain/types';

interface QuizOption {
  value: string; // number string e.g. "05" or keyword
  display: string;
}

interface Question {
  type: 'number-to-keyword' | 'keyword-to-number' | 'pair-next-item' | 'story-cloze';
  prompt: string;
  subPrompt?: string;
  options: QuizOption[];
  answer: QuizOption;
  association?: string;
  cardId?: string; // For spaced repetition update
}

const props = defineProps<{
  lessonId: string;
}>();

const router = useRouter();
const appStore = useAppStore();

const lesson = ref<Lesson | null>(null);
const questions = ref<Question[]>([]);
const currentQuestionIndex = ref(0);
const selectedOption = ref<QuizOption | null>(null);
const isCorrect = ref(false);
const score = ref(0);
const isQuizFinished = ref(false);

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0;
  return Math.round((currentQuestionIndex.value / questions.value.length) * 100);
});

const currentQuestion = computed((): Question | null => {
  if (questions.value.length === 0) return null;
  return questions.value[currentQuestionIndex.value];
});

onMounted(() => {
  const loadedLesson = contentRepo.getLesson(props.lessonId);
  if (!loadedLesson) {
    router.replace('/');
    return;
  }
  lesson.value = loadedLesson;
  generateQuiz(loadedLesson);
});

// Generate 10 random questions from the lesson range
const generateQuiz = (loadedLesson: Lesson) => {
  const list: Question[] = [];
  const allItems = contentRepo.getItems();
  
  // Lesson items
  const lessonItems = allItems.filter(item => loadedLesson.itemIds.includes(item.id as any));
  const shuffledItems = [...lessonItems].sort(() => Math.random() - 0.5);
  
  // Split half for num-to-kw, half for kw-to-num
  const mid = Math.ceil(shuffledItems.length / 2);
  
  shuffledItems.slice(0, mid).forEach(item => {
    list.push(createNumToKwQuestion(item, allItems));
  });
  
  shuffledItems.slice(mid).forEach(item => {
    list.push(createKwToNumQuestion(item, allItems));
  });

  // Shuffle questions and limit to 10
  questions.value = list.sort(() => Math.random() - 0.5).slice(0, 10);
};

const createNumToKwQuestion = (item: MnemonicItem, allItems: MnemonicItem[]): Question => {
  const distractors = generateDistractors(item.number, allItems);
  const options: QuizOption[] = [
    { value: item.number, display: item.canonicalKeyword },
    ...distractors.map(d => ({ value: d.number, display: d.canonicalKeyword }))
  ].sort(() => Math.random() - 0.5);

  return {
    type: 'number-to-keyword',
    prompt: `數字【 ${item.number} 】對應的記憶聯想詞是？`,
    options,
    answer: { value: item.number, display: item.canonicalKeyword },
    cardId: `${item.id}_number-to-keyword`
  };
};

const createKwToNumQuestion = (item: MnemonicItem, allItems: MnemonicItem[]): Question => {
  const distractors = generateDistractors(item.number, allItems);
  const options: QuizOption[] = [
    { value: item.number, display: item.number },
    ...distractors.map(d => ({ value: d.number, display: d.number }))
  ].sort(() => Math.random() - 0.5);

  return {
    type: 'keyword-to-number',
    prompt: `聯想詞【 ${item.canonicalKeyword} 】對應的數字是？`,
    options,
    answer: { value: item.number, display: item.number },
    cardId: `${item.id}_keyword-to-number`
  };
};

const createPairNextItemQuestion = (scene: PairScene, allItems: MnemonicItem[]): Question => {
  const toNum = scene.toItemId.split('-')[1];
  
  const distractors = generateDistractors(toNum, allItems);
  const options: QuizOption[] = [
    { value: toNum, display: `${toNum} ${scene.displayToKeyword}` },
    ...distractors.map(d => ({ value: d.number, display: `${d.number} ${d.canonicalKeyword}` }))
  ].sort(() => Math.random() - 0.5);

  return {
    type: 'pair-next-item',
    prompt: `在聯想畫面中，下一個數字是？`,
    subPrompt: `畫面：【${scene.displayFromKeyword}】 ➔ 【 ？ 】：${scene.sceneText.slice(0, 30)}...`,
    options,
    answer: { value: toNum, display: `${toNum} ${scene.displayToKeyword}` },
    association: scene.sceneText,
    cardId: `${scene.fromItemId}_pair-next-item`
  };
};

const createStoryClozeQuestion = (scene: NarrativeScene, allItems: MnemonicItem[]): Question => {
  // Find the first item in the scene to hide
  const targetItemId = scene.itemIds[0];
  const targetItem = allItems.find(i => i.id === targetItemId);
  const targetNum = targetItemId.split('-')[1];
  const cleanKeyword = targetItem ? targetItem.canonicalKeyword : '';

  // Mask original text
  // Replace e.g. "(61) 老人" or "(61)老人" with "(61) [ ___ ]"
  const regex = new RegExp(`\\(${parseInt(targetNum)}\\)\\s*[^，。！、；：()]+`);
  const maskedText = scene.originalText.replace(regex, `(${targetNum}) [  ❓  ]`);

  const distractors = generateDistractors(targetNum, allItems);
  const options: QuizOption[] = [
    { value: targetNum, display: cleanKeyword },
    ...distractors.map(d => ({ value: d.number, display: d.canonicalKeyword }))
  ].sort(() => Math.random() - 0.5);

  return {
    type: 'story-cloze',
    prompt: `請填入故事空缺的記憶詞：`,
    subPrompt: maskedText,
    options,
    answer: { value: targetNum, display: cleanKeyword },
    association: scene.originalText,
    cardId: `${targetItemId}_story-cloze`
  };
};

// Leitner distractor rules: same tens digit, or same units digit, or general random
const generateDistractors = (targetNumStr: string, allItems: MnemonicItem[]): MnemonicItem[] => {
  const targetVal = parseInt(targetNumStr);
  const targetTens = Math.floor(targetVal / 10);
  const targetUnits = targetVal % 10;
  
  const pool = allItems.filter(item => item.number !== targetNumStr);
  const results: MnemonicItem[] = [];

  // 1. Same tens digit (e.g. 24 -> 20 to 29)
  const sameTens = pool.filter(i => Math.floor(i.numericValue / 10) === targetTens);
  if (sameTens.length > 0) {
    results.push(...sameTens.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  // 2. Same units digit (e.g. 24 -> 04, 14, 34...)
  const sameUnits = pool.filter(i => i.numericValue % 10 === targetUnits && !results.includes(i));
  if (sameUnits.length > 0) {
    results.push(...sameUnits.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  // 3. Fallback to random draw
  while (results.length < 3) {
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    if (!results.includes(randomItem)) {
      results.push(randomItem);
    }
  }

  return results.slice(0, 3);
};

const getQuestionTypeLabel = (type: string): string => {
  switch (type) {
    case 'number-to-keyword': return '數字 ➔ 聯想詞';
    case 'keyword-to-number': return '聯想詞 ➔ 數字';
    case 'pair-next-item': return '配對聯想 ➔ 下個數字';
    case 'story-cloze': return '故事填空 ➔ 聯想詞';
    default: return '測驗問題';
  }
};

const getOptionClass = (opt: QuizOption) => {
  if (selectedOption.value === null) return 'btn-secondary';
  
  const isCurrentOpt = selectedOption.value.value === opt.value;
  const isCorrectOpt = currentQuestion.value?.answer.value === opt.value;
  
  if (isCorrectOpt) {
    return 'btn-success-opt';
  }
  if (isCurrentOpt && !isCorrect.value) {
    return 'btn-danger-opt';
  }
  return 'btn-muted-opt';
};

const selectOption = async (opt: QuizOption) => {
  selectedOption.value = opt;
  const correct = currentQuestion.value?.answer.value === opt.value;
  isCorrect.value = correct;
  
  if (correct) {
    score.value++;
  }

  // Save Leitner schedule result
  const cardId = currentQuestion.value?.cardId;
  if (cardId) {
    const rating = correct ? 'good' : 'forgot';
    await progressRepo.submitReviewResult(cardId, rating);
    await appStore.refreshReviewCounts();
  }

  // Auto-advance to next question instantly
  nextQuestion();
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    selectedOption.value = null;
    isCorrect.value = false;
  } else {
    isQuizFinished.value = true;
  }
};

const restartQuiz = () => {
  currentQuestionIndex.value = 0;
  selectedOption.value = null;
  isCorrect.value = false;
  score.value = 0;
  isQuizFinished.value = false;
  if (lesson.value) {
    generateQuiz(lesson.value);
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.quiz-header {
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
  background-color: var(--primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
}

.question-card {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.question-type-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: var(--primary-glow);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1.2px solid var(--primary);
}

.question-text .prompt {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.question-text .sub-prompt {
  font-size: 0.95rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: 10px 14px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  margin-top: 10px;
  line-height: 1.6;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 14px 16px;
  text-align: left;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
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
}

.btn-danger-opt {
  background-color: var(--danger) !important;
  color: white !important;
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

/* Results styling */
.results-card {
  padding: 40px 24px;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
}

.results-emoji {
  font-size: 3.5rem;
  display: block;
}

.results-card h3 {
  font-size: 1.35rem;
  font-weight: 900;
  margin-top: 12px;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.score-num {
  font-size: 3.2rem;
  font-weight: 900;
  color: var(--primary);
}

.score-denom {
  font-size: 1.35rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: 4px;
}

.score-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
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
