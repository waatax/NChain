<template>
  <div class="container">
    <!-- Header -->
    <div class="test-header mb-16">
      <div class="header-top">
        <button class="back-btn" @click="goBack">◀ 返回</button>
        <span class="page-title">00-100 全域模擬測驗</span>
      </div>
    </div>

    <!-- CONFIGURATION SCREEN -->
    <div v-if="gameState === 'config'" class="card config-card text-center">
      <span class="brain-icon">📝</span>
      <h2>設定測驗</h2>
      <p class="text-muted mt-4">測驗範圍為 00 到 100 所有記憶密碼，考驗您的熟練度。</p>

      <div class="config-section mt-24">
        <p class="config-label">選擇測試題數：</p>
        <div class="options-flex mt-8">
          <button 
            v-for="num in [10, 20, 40, 60, 100]" 
            :key="num"
            class="btn btn-choice" 
            :class="{ active: selectedCount === num }"
            @click="selectedCount = num"
          >
            {{ num }} 題
          </button>
        </div>
      </div>

      <div class="config-section mt-24">
        <p class="config-label">選擇出題模式：</p>
        <select v-model="selectedMode" class="mode-select mt-8">
          <option value="mixed">🔀 混合模式 (雙向出題)</option>
          <option value="num-to-kw">數字 ➔ 聯想詞</option>
          <option value="kw-to-num">聯想詞 ➔ 數字</option>
        </select>
      </div>

      <button class="btn btn-primary w-full mt-32 py-14" @click="startTest">
        🚀 開始模擬測驗
      </button>
    </div>

    <!-- QUIZ PLAYER SCREEN -->
    <div v-else-if="gameState === 'playing' && currentQuestion" class="quiz-container">
      <div class="question-meta text-muted text-center mb-12">
        進度: {{ currentQuestionIndex + 1 }} / {{ questions.length }} | 當前答對: {{ score }} 題 | ⏱️ 費時: {{ elapsedTime }} 秒
      </div>

      <div class="question-card card">
        <span class="question-type-tag">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
        
        <div class="question-text mt-16 text-center">
          <p class="prompt">{{ currentQuestion.prompt }}</p>
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

    <!-- QUIZ RESULTS SCREEN -->
    <div v-else-if="gameState === 'results'" class="results-container">
      <div class="card results-card text-center mb-16">
        <span class="results-emoji">{{ scorePercent >= 80 ? '🎉' : scorePercent >= 60 ? '👍' : '💪' }}</span>
        <h3>測驗完成！</h3>
        <div class="score-display mt-12">
          <span class="score-num">{{ score }}</span>
          <span class="score-denom">/ {{ questions.length }}</span>
        </div>
        <p class="score-text mt-8">答對率: <span class="font-bold">{{ scorePercent }}%</span></p>

        <!-- Timer Statistics -->
        <div class="timer-stats mt-16 p-12" style="background-color: var(--bg-secondary); border-radius: var(--border-radius-md); display: flex; justify-content: space-around; font-size: 0.9rem;">
          <div>
            <span class="text-muted" style="display: block;">⏱️ 總答題時間 (s)</span>
            <span class="font-bold text-primary" style="font-size: 1.1rem; display: block; margin-top: 4px;">{{ elapsedTime }} 秒</span>
          </div>
          <div style="border-left: 1px solid var(--border-color); padding-left: 20px;">
            <span class="text-muted" style="display: block;">⚡ 平均單題答題時間 (s)</span>
            <span class="font-bold text-success" style="font-size: 1.1rem; display: block; margin-top: 4px;">{{ averageTimePerQuestion }} 秒</span>
          </div>
        </div>
      </div>

      <!-- INCORRECT NUMBERS DETAILS -->
      <div class="card error-summary-card mb-16">
        <h4 class="error-title">❌ 答錯數字分析 (共 {{ incorrectQuestions.length }} 題)</h4>
        
        <div v-if="incorrectQuestions.length === 0" class="text-center py-16 text-success font-bold">
          太完美了！您答對了所有題目！💯
        </div>
        
        <div v-else class="errors-list mt-12">
          <div v-for="(err, idx) in incorrectQuestions" :key="idx" class="error-row mb-12">
            <div class="error-row-header">
              <span class="badge-num">{{ err.item.number }}</span>
              <span class="kw-text font-bold">{{ err.item.canonicalKeyword }}</span>
              <span class="text-danger" style="margin-left: auto; font-size: 0.8rem;">
                您的回答: {{ err.userAnswer }}
              </span>
            </div>
            
            <div class="error-row-body mt-4 text-muted" v-if="err.association">
              💡 聯想提示: {{ err.association }}
            </div>
          </div>
        </div>
      </div>

      <div class="results-actions flex gap-16 mb-24">
        <button class="btn btn-secondary flex-1 py-12" @click="goBack">返回主頁</button>
        <button class="btn btn-primary flex-1 py-12" @click="restartTest">重新測驗</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { MnemonicItem, PairScene } from '../domain/types';

interface QuizOption {
  value: string;
  display: string;
}

interface Question {
  type: 'number-to-keyword' | 'keyword-to-number';
  item: MnemonicItem;
  prompt: string;
  options: QuizOption[];
  answer: QuizOption;
  association?: string;
}

interface IncorrectRecord {
  item: MnemonicItem;
  userAnswer: string;
  association?: string;
}

const router = useRouter();
const appStore = useAppStore();

const gameState = ref<'config' | 'playing' | 'results'>('config');
const selectedCount = ref(10);
const selectedMode = ref<'mixed' | 'num-to-kw' | 'kw-to-num'>('mixed');

const questions = ref<Question[]>([]);
const currentQuestionIndex = ref(0);
const selectedOption = ref<QuizOption | null>(null);
const isCorrect = ref(false);
const score = ref(0);

const incorrectQuestions = ref<IncorrectRecord[]>([]);

// Timer states
const startTime = ref<number | null>(null);
const elapsedTime = ref(0);
const timerInterval = ref<any>(null);

const scorePercent = computed(() => {
  if (questions.value.length === 0) return 0;
  return Math.round((score.value / questions.value.length) * 100);
});

const averageTimePerQuestion = computed(() => {
  if (questions.value.length === 0) return '0.0';
  return (elapsedTime.value / questions.value.length).toFixed(1);
});

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});

const currentQuestion = computed((): Question | null => {
  if (questions.value.length === 0) return null;
  return questions.value[currentQuestionIndex.value];
});

const startTest = () => {
  incorrectQuestions.value = [];
  score.value = 0;
  currentQuestionIndex.value = 0;
  selectedOption.value = null;
  isCorrect.value = false;

  // Start Timer
  startTime.value = Date.now();
  elapsedTime.value = 0;
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    if (startTime.value) {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }
  }, 1000);

  const allItems = contentRepo.getItems();
  // Shuffle all 101 items
  const shuffledItems = [...allItems].sort(() => Math.random() - 0.5);
  // Slice to selected count
  const testItems = shuffledItems.slice(0, selectedCount.value);

  const list: Question[] = [];
  testItems.forEach((item, idx) => {
    // Determine type based on mode selection or alternating for mixed mode
    let type: 'number-to-keyword' | 'keyword-to-number';
    if (selectedMode.value === 'num-to-kw') {
      type = 'number-to-keyword';
    } else if (selectedMode.value === 'kw-to-num') {
      type = 'keyword-to-number';
    } else {
      type = idx % 2 === 0 ? 'number-to-keyword' : 'keyword-to-number';
    }

    const distractors = generateDistractors(item.number, allItems);
    
    // Find association hint from pair scenes
    const allPairScenes = contentRepo.getPairScenes();
    // Find a scene that includes this item
    const scene = allPairScenes.find(s => s.fromItemId === item.id || s.toItemId === item.id);
    const association = scene ? scene.sceneText : undefined;

    let ansOpt: QuizOption;
    let options: QuizOption[] = [];

    if (type === 'number-to-keyword') {
      ansOpt = { value: item.number, display: item.canonicalKeyword };
      options = [
        ansOpt,
        ...distractors.map(d => ({ value: d.number, display: d.canonicalKeyword }))
      ].sort(() => Math.random() - 0.5);
    } else {
      ansOpt = { value: item.number, display: item.number };
      options = [
        ansOpt,
        ...distractors.map(d => ({ value: d.number, display: d.number }))
      ].sort(() => Math.random() - 0.5);
    }

    list.push({
      type,
      item,
      prompt: type === 'number-to-keyword' 
        ? `數字【 ${item.number} 】對應的記憶聯想詞是？` 
        : `聯想詞【 ${item.canonicalKeyword} 】對應的數字是？`,
      options,
      answer: ansOpt,
      association
    });
  });

  questions.value = list;
  gameState.value = 'playing';
};

// Leitner distractor rules: same tens, same units
const generateDistractors = (targetNumStr: string, allItems: MnemonicItem[]): MnemonicItem[] => {
  const targetVal = parseInt(targetNumStr);
  const targetTens = Math.floor(targetVal / 10);
  const targetUnits = targetVal % 10;
  
  const pool = allItems.filter(item => item.number !== targetNumStr);
  const results: MnemonicItem[] = [];

  const sameTens = pool.filter(i => Math.floor(i.numericValue / 10) === targetTens);
  if (sameTens.length > 0) {
    results.push(...sameTens.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  const sameUnits = pool.filter(i => i.numericValue % 10 === targetUnits && !results.includes(i));
  if (sameUnits.length > 0) {
    results.push(...sameUnits.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  while (results.length < 3) {
    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    if (!results.includes(randomItem)) {
      results.push(randomItem);
    }
  }

  return results.slice(0, 3);
};

const getQuestionTypeLabel = (type: string): string => {
  return type === 'number-to-keyword' ? '數字 ➔ 聯想詞' : '聯想詞 ➔ 數字';
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
  if (!currentQuestion.value) return;

  selectedOption.value = opt;
  const correct = currentQuestion.value.answer.value === opt.value;
  isCorrect.value = correct;

  if (correct) {
    score.value++;
    
    // Also promote the corresponding Leitner card box on-the-fly!
    const cardId = `${currentQuestion.value.item.id}_${currentQuestion.value.type}`;
    await progressRepo.submitReviewResult(cardId, 'good');
  } else {
    // Record incorrect question for display
    incorrectQuestions.value.push({
      item: currentQuestion.value.item,
      userAnswer: opt.display,
      association: currentQuestion.value.association
    });

    // Demote Leitner card box
    const cardId = `${currentQuestion.value.item.id}_${currentQuestion.value.type}`;
    await progressRepo.submitReviewResult(cardId, 'forgot');
  }
  await appStore.refreshReviewCounts();

  // Auto-advance to next question after 800ms
  setTimeout(() => {
    nextQuestion();
  }, 800);
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    selectedOption.value = null;
    isCorrect.value = false;
  } else {
    // Stop Timer
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
    gameState.value = 'results';
  }
};

const restartTest = () => {
  gameState.value = 'config';
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.test-header {
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

.page-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.brain-icon {
  font-size: 3.5rem;
  display: block;
}

.config-card h2 {
  font-size: 1.35rem;
  font-weight: 800;
  margin-top: 10px;
}

.config-section {
  text-align: left;
}

.config-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.options-flex {
  display: flex;
  gap: 12px;
}

.btn-choice {
  flex: 1;
  background-color: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 700;
  padding: 10px 0;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-speed);
}

.btn-choice:hover {
  border-color: var(--primary);
}

.btn-choice.active {
  background-color: var(--primary-glow);
  border-color: var(--primary);
  color: var(--primary);
}

.mode-select {
  width: 100%;
  padding: 12px;
  border-radius: var(--border-radius-md);
  border: 1.5px solid var(--border-color);
  background-color: var(--bg-card);
  color: var(--text-primary);
  font-weight: 600;
  outline: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.question-meta {
  font-size: 0.8rem;
}

.question-card {
  min-height: 120px;
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
  top: 12px;
  left: 12px;
  background-color: var(--primary-glow);
  color: var(--primary);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid var(--primary);
}

.question-text .prompt {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
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

.error-summary-card {
  padding: 20px;
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  text-align: left;
}

.error-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--danger);
  border-bottom: 1.5px solid var(--border-color);
  padding-bottom: 8px;
}

.errors-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.error-row {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.error-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.error-row-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge-num {
  background-color: var(--danger-glow);
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--danger);
  width: 32px;
  text-align: center;
}

.kw-text {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.error-row-body {
  font-size: 0.8rem;
  background-color: var(--bg-secondary);
  padding: 6px 10px;
  border-radius: 4px;
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

.py-12 {
  padding-top: 12px;
  padding-bottom: 12px;
}

.mt-24 {
  margin-top: 24px;
}

.mt-32 {
  margin-top: 32px;
}
</style>
