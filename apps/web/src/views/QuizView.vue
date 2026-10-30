<template>
  <div class="container quiz-page-container">
    <!-- Duolingo-style Top Gamification Header -->
    <div class="quiz-header card mb-16" v-if="lesson">
      <div class="header-top-row">
        <button class="back-btn" @click="goBack" title="返回上一頁">
          <span class="back-arrow">◀</span> 返回
        </button>
        <span class="lesson-title">{{ lesson.title }}</span>

        <!-- Duolingo Status Badges -->
        <div class="duo-status-badges">
          <!-- Hearts Indicator -->
          <div class="heart-badge" :class="{ 'heart-shake': heartShaking }">
            <span class="heart-icon">❤️</span>
            <span class="heart-count">{{ appStore.hearts }}</span>
          </div>

          <!-- Combo Streak Badge -->
          <div class="combo-badge" v-if="comboStreak >= 2">
            <span class="flame-icon">🔥</span>
            <span class="combo-count">{{ comboStreak }} 連對</span>
          </div>

          <!-- XP Badge -->
          <div class="xp-badge">
            <span class="star-icon">⭐</span>
            <span class="xp-count">{{ appStore.xp }} XP</span>
          </div>

          <!-- Auto TTS Toggle -->
          <button 
            class="tts-toggle-btn" 
            :class="{ active: autoSpeak }" 
            @click="toggleAutoSpeak"
            :title="autoSpeak ? '語音自動朗讀：已開啟' : '語音自動朗讀：已關閉'"
          >
            {{ autoSpeak ? '🔊' : '🔇' }}
          </button>
        </div>
      </div>

      <!-- Animated Progress Bar -->
      <div class="progress-bar-container mt-12" v-if="!isQuizFinished">
        <div class="progress-bar duo-striped-bar" :style="{ width: `${progressPercent}%` }"></div>
      </div>
      <div class="progress-meta mt-6 text-muted text-center" v-if="!isQuizFinished">
        <span>題號: <strong>{{ currentQuestionIndex + 1 }}</strong> / {{ questions.length }}</span>
        <span class="ml-12">得分: <strong>{{ score }}</strong> 題</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="questions.length === 0 && !isQuizFinished" class="card text-center p-32">
      <div class="zen-spinner-small mb-12"></div>
      <p>正在為您精心生成科學測驗題目與解析...</p>
    </div>

    <!-- Out of Hearts Warning Modal -->
    <div v-if="showHeartModal" class="modal-overlay">
      <div class="modal-content card text-center p-24">
        <div class="heart-break-icon mb-12">💔</div>
        <h3 class="mb-8">愛心暫時用光囉！</h3>
        <p class="text-muted text-sm mb-16">
          學習記憶需要大腦深呼吸。不用擔心，點擊下方即可立即免費回血，繼續快樂學習！
        </p>
        <button class="btn btn-primary w-full py-14 font-bold" @click="handleRefillHearts">
          💖 立即免費補滿愛心 (恢復 5 顆心)
        </button>
      </div>
    </div>

    <!-- Quiz Player -->
    <div v-else-if="currentQuestion && !isQuizFinished" class="quiz-container">
      <div class="question-card card">
        <div class="question-top-bar">
          <span class="question-type-tag">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
          
          <!-- Speak Question Button -->
          <button 
            class="speak-btn" 
            @click="speakCurrentQuestion" 
            :class="{ 'is-speaking': isSpeaking }"
            title="點擊語音朗讀題目與選項"
          >
            <span class="speak-icon">🔊</span>
            <span class="speak-label">語音念題</span>
          </button>
        </div>
        
        <div class="question-text mt-16 text-center">
          <h3 class="prompt">{{ currentQuestion.prompt }}</h3>
          <p class="sub-prompt mt-8 text-muted" v-if="currentQuestion.subPrompt">{{ currentQuestion.subPrompt }}</p>
          
          <!-- Watercolor icon directly in prompt for Keyword to Number -->
          <div class="prompt-icon-container my-12" v-if="currentQuestion.type === 'keyword-to-number' && targetMnemonicItem">
            <img 
              v-if="hasIcon(targetMnemonicItem.id)" 
              :src="getIconUrl(targetMnemonicItem.id)" 
              @error="handleIconError(targetMnemonicItem.id)"
              class="prompt-graphic-img" 
              alt="icon" 
            />
            <div v-else class="prompt-graphic-placeholder">
              <span class="prompt-placeholder-char">{{ targetMnemonicItem.canonicalKeyword ? targetMnemonicItem.canonicalKeyword[0] : '？' }}</span>
            </div>
          </div>
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
          <div class="opt-left">
            <span class="opt-label">{{ String.fromCharCode(65 + idx) }}.</span>
            <span class="opt-text">{{ opt.display }}</span>
          </div>

          <!-- Small Voice Speaker for Option -->
          <span 
            class="opt-speaker-btn" 
            @click.stop="speakText(opt.display)" 
            title="點擊朗讀此選項"
          >
            🔊
          </span>
        </button>
      </div>

      <!-- Keyboard Shortcut Hint -->
      <p class="keyboard-hint text-center text-xs text-muted mt-8" v-if="selectedOption === null">
        💡 鍵盤快速鍵：按數字 1 ~ 4 選擇答案，按 Enter 進入下一題
      </p>

      <!-- Duolingo-style Bottom Feedback Banner -->
      <div class="duo-feedback-banner mt-16 card" v-if="selectedOption !== null" :class="isCorrect ? 'banner-correct' : 'banner-incorrect'">
        <div class="feedback-top-row">
          <div class="feedback-status">
            <span class="status-emoji">{{ isCorrect ? '🎉' : '💡' }}</span>
            <div class="status-text-col">
              <span class="status-title">{{ isCorrect ? '答對了！太厲害了！' : '別灰心！這正是大腦神經元成長的關鍵時刻！' }}</span>
              <span class="status-reward text-xs" v-if="isCorrect">
                獲得 +{{ comboStreak >= 3 ? 15 : 10 }} XP ⭐ {{ comboStreak >= 3 ? '🔥 連對加成！' : '' }}
              </span>
              <span class="status-penalty text-xs text-danger" v-else>
                失去 1 顆愛心 💔 (剩餘 {{ appStore.hearts }} 顆)
              </span>
            </div>
          </div>

          <button class="btn btn-primary next-step-btn" @click="nextQuestion">
            下一題 ➡️
          </button>
        </div>

        <!-- Correct Answer Display -->
        <div class="feedback-answer-line mt-10">
          {{ t('正確答案是:') }} <span class="font-bold correct-highlight">{{ currentQuestion.answer.display }}</span>
        </div>

        <!-- Optional Watercolor Icon in Feedback -->
        <div class="feedback-icon-container my-12" v-if="targetMnemonicItem && hasIcon(targetMnemonicItem.id)">
          <img 
            :src="getIconUrl(targetMnemonicItem.id)" 
            @error="handleIconError(targetMnemonicItem.id)"
            class="feedback-graphic-img" 
            alt="icon" 
          />
        </div>

        <!-- 💡 Rich Pedagogical Error Explanation (錯誤時有深度解說) -->
        <div class="detailed-explanation-card mt-12" v-if="detailedExplanation">
          <div class="explanation-card-header">
            <span class="badge-title">🧠 名師深度解析與防錯秘笈</span>
            <button class="btn btn-sm btn-speak-explain" @click="speakExplanationAloud">
              🔊 語音朗讀解析
            </button>
          </div>

          <div class="explanation-body mt-8">
            <!-- 1. Mnemonic Core -->
            <div class="explain-item">
              <span class="explain-tag tag-core">🏷️ 記憶密碼拆解</span>
              <p class="explain-text">{{ detailedExplanation.mnemonicCore }}</p>
            </div>

            <!-- 2. Confusion Buster -->
            <div class="explain-item mt-8" v-if="!isCorrect">
              <span class="explain-tag tag-confusion">⚠️ 防混淆對比辨析</span>
              <p class="explain-text text-danger-soft">{{ detailedExplanation.confusionAnalysis }}</p>
            </div>

            <!-- 3. Sensory Visualization -->
            <div class="explain-item mt-8">
              <span class="explain-tag tag-visual">👁️ 3 秒多感官視覺定樁</span>
              <p class="explain-text">{{ detailedExplanation.sensoryVisualization }}</p>
            </div>

            <!-- 4. Real-world application -->
            <div class="explain-item mt-8">
              <span class="explain-tag tag-practical">📱 生活實戰速記</span>
              <p class="explain-text">{{ detailedExplanation.practicalUse }}</p>
            </div>

            <!-- 5. Scientific tip -->
            <div class="explain-item mt-8">
              <span class="explain-tag tag-science">🔬 大腦記憶科學提示</span>
              <p class="explain-text text-muted text-xs">{{ detailedExplanation.scientificTip }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Results Screen -->
    <div v-else-if="isQuizFinished" class="results-container mt-16">
      <div class="card results-card text-center p-32">
        <span class="results-emoji">{{ score >= 8 ? '🎉' : '💪' }}</span>
        <h2 class="mt-8">{{ t('測驗完成！') }}</h2>
        
        <div class="score-display mt-16">
          <span class="score-num">{{ score }}</span>
          <span class="score-denom">/ {{ questions.length }}</span>
        </div>

        <div class="results-duo-rewards mt-16 p-16 card">
          <div class="reward-row">
            <span>獲得經驗值：</span>
            <strong class="text-primary">+{{ earnedXP }} XP ⭐</strong>
          </div>
          <div class="reward-row mt-6">
            <span>連續學習天數：</span>
            <strong class="text-warning">🔥 {{ appStore.currentStreak }} 天</strong>
          </div>
          <div class="reward-row mt-6">
            <span>當前心智頭銜：</span>
            <strong class="text-success">{{ appStore.levelInfo.current.badge }} {{ appStore.levelInfo.current.title }}</strong>
          </div>
        </div>

        <p class="score-text mt-12">
          {{ score >= 8 ? '太棒了！您的右腦圖像與神經突觸掌握得非常深刻！' : '別灰心，每次練習都讓大腦神經元更穩固，多測幾次就能瞬間直覺反射囉！' }}
        </p>

        <div class="results-actions mt-20 flex gap-16">
          <button class="btn btn-secondary flex-1 py-14" @click="goBack">返回主頁</button>
          <button class="btn btn-primary flex-1 py-14 font-bold" @click="restartQuiz">再試一次 🚀</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../utils/i18n';
const { t } = useI18n();
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { Lesson, MnemonicItem, PairScene, NarrativeScene } from '../domain/types';
import { soundFx } from '../utils/sound';
import { sakuraConfetti } from '../utils/confetti';
import { speechService } from '../utils/speech';
import { getDetailedMnemonicExplanation, formatExplanationForSpeech, ExplanationDetail } from '../utils/mnemonicExplanation';

interface QuizOption {
  value: string; // number string e.g. "05" or keyword
  display: string;
}

interface Question {
  type: 'number-to-keyword' | 'keyword-to-number' | 'pair-next-item' | 'story-cloze' | 'practical-scenario';
  prompt: string;
  subPrompt?: string;
  options: QuizOption[];
  answer: QuizOption;
  association?: string;
  cardId?: string; // For spaced repetition update
  itemId?: string;
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
const comboStreak = ref(0);
const heartShaking = ref(false);
const showHeartModal = ref(false);
const earnedXP = ref(0);

const autoSpeak = ref(appStore.settings.speechAutoRead !== false);
const isSpeaking = computed(() => speechService.isSpeaking.value);

const detailedExplanation = ref<ExplanationDetail | null>(null);

const handleKeyDown = (e: KeyboardEvent) => {
  if (showHeartModal.value) return;

  if (isQuizFinished.value) {
    if (e.key === 'Enter' || e.code === 'Space') {
      restartQuiz();
    }
    return;
  }

  if (selectedOption.value !== null) {
    if (e.key === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      nextQuestion();
    }
    return;
  }

  const currentOpts = currentQuestion.value?.options;
  if (!currentOpts) return;

  if (e.key === '1' && currentOpts[0]) selectOption(currentOpts[0]);
  else if (e.key === '2' && currentOpts[1]) selectOption(currentOpts[1]);
  else if (e.key === '3' && currentOpts[2]) selectOption(currentOpts[2]);
  else if (e.key === '4' && currentOpts[3]) selectOption(currentOpts[3]);
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  const loadedLesson = contentRepo.getLesson(props.lessonId);
  if (!loadedLesson) {
    router.replace('/');
    return;
  }
  lesson.value = loadedLesson;
  generateQuiz(loadedLesson);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  speechService.stop();
});

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0;
  return Math.round((currentQuestionIndex.value / questions.value.length) * 100);
});

const currentQuestion = computed((): Question | null => {
  if (questions.value.length === 0) return null;
  return questions.value[currentQuestionIndex.value];
});

const targetMnemonicItem = computed((): MnemonicItem | null => {
  if (!currentQuestion.value || !currentQuestion.value.itemId) return null;
  const item = contentRepo.getItem(currentQuestion.value.itemId);
  return item || null;
});

// Auto speak question when index changes
watch(currentQuestionIndex, () => {
  if (autoSpeak.value && currentQuestion.value && !isQuizFinished.value) {
    speakCurrentQuestion();
  }
});

const toggleAutoSpeak = () => {
  autoSpeak.value = !autoSpeak.value;
  appStore.updateSettings({ speechAutoRead: autoSpeak.value });
  if (autoSpeak.value && currentQuestion.value) {
    speakCurrentQuestion();
  } else {
    speechService.stop();
  }
};

const speakCurrentQuestion = () => {
  if (!currentQuestion.value) return;
  speechService.speakQuestion(currentQuestion.value.prompt, currentQuestion.value.options, false);
};

const speakText = (text: string) => {
  speechService.speak(text);
};

const speakExplanationAloud = () => {
  if (!detailedExplanation.value) return;
  const speechText = formatExplanationForSpeech(detailedExplanation.value);
  speechService.speakExplanation(speechText);
};

// Generate 10-11 rich questions from the lesson range, including useful scenario questions
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

  // Add practical scenario bonus questions (+10% useful content directly in quiz)
  if (loadedLesson.usefulContent && loadedLesson.usefulContent.scenarios.length > 0) {
    const scenario = loadedLesson.usefulContent.scenarios[0];
    const targetItem = lessonItems[0] || allItems[0];
    if (targetItem) {
      list.push({
        type: 'practical-scenario',
        prompt: `【生活速記實戰】${scenario.title}`,
        subPrompt: `${scenario.scenario} 口訣：${scenario.hook}`,
        options: [
          { value: targetItem.number, display: `${targetItem.number} ${targetItem.canonicalKeyword}` },
          ...generateDistractors(targetItem.number, allItems).map(d => ({
            value: d.number,
            display: `${d.number} ${d.canonicalKeyword}`
          }))
        ].sort(() => Math.random() - 0.5),
        answer: { value: targetItem.number, display: `${targetItem.number} ${targetItem.canonicalKeyword}` },
        cardId: `${targetItem.id}_practical_scenario`,
        itemId: targetItem.id
      });
    }
  }

  // Shuffle questions and limit to 10
  questions.value = list.sort(() => Math.random() - 0.5).slice(0, 10);

  // Trigger initial TTS if autoSpeak is on
  setTimeout(() => {
    if (autoSpeak.value && currentQuestion.value) {
      speakCurrentQuestion();
    }
  }, 400);
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
    cardId: `${item.id}_number-to-keyword`,
    itemId: item.id
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
    cardId: `${item.id}_keyword-to-number`,
    itemId: item.id
  };
};

const generateDistractors = (targetNumStr: string, allItems: MnemonicItem[]): MnemonicItem[] => {
  const targetVal = parseInt(targetNumStr);
  const targetTens = Math.floor(targetVal / 10);
  const targetUnits = targetVal % 10;
  
  const pool = allItems.filter(item => item.number !== targetNumStr);
  const results: MnemonicItem[] = [];

  // Same tens
  const sameTens = pool.filter(i => Math.floor(i.numericValue / 10) === targetTens);
  if (sameTens.length > 0) {
    results.push(...sameTens.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  // Same units
  const sameUnits = pool.filter(i => i.numericValue % 10 === targetUnits && !results.includes(i));
  if (sameUnits.length > 0) {
    results.push(...sameUnits.sort(() => Math.random() - 0.5).slice(0, 2));
  }

  // Fallback
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
    case 'practical-scenario': return '🌟 實用生活速記';
    default: return '測驗問題';
  }
};

const getOptionClass = (opt: QuizOption) => {
  if (selectedOption.value === null) return 'btn-secondary duo-opt-default';
  
  const isCurrentOpt = selectedOption.value.value === opt.value;
  const isCorrectOpt = currentQuestion.value?.answer.value === opt.value;
  
  if (isCorrectOpt) {
    return 'btn-success-opt duo-opt-correct';
  }
  if (isCurrentOpt && !isCorrect.value) {
    return 'btn-danger-opt duo-opt-incorrect';
  }
  return 'btn-muted-opt duo-opt-muted';
};

const selectOption = async (opt: QuizOption) => {
  selectedOption.value = opt;
  const correct = currentQuestion.value?.answer.value === opt.value;
  isCorrect.value = correct;

  // Build pedagogical error explanation
  if (targetMnemonicItem.value) {
    detailedExplanation.value = getDetailedMnemonicExplanation(
      targetMnemonicItem.value,
      opt.value,
      contentRepo.getItems()
    );
  }

  if (correct) {
    score.value++;
    comboStreak.value++;
    const points = comboStreak.value >= 3 ? 15 : 10;
    earnedXP.value += points;
    appStore.addXP(points, 'quiz_answer');

    if (comboStreak.value >= 3) {
      soundFx.playComboStreak(comboStreak.value);
    } else {
      soundFx.playSuccess();
    }
  } else {
    comboStreak.value = 0;
    soundFx.playError();
    
    // Heart loss animation
    heartShaking.value = true;
    setTimeout(() => { heartShaking.value = false; }, 600);

    const { remaining, isOutOfHearts } = appStore.loseHeart();
    if (isOutOfHearts) {
      showHeartModal.value = true;
    }
  }

  // Leitner spaced repetition card update
  const cardId = currentQuestion.value?.cardId;
  if (cardId) {
    const rating = correct ? 'good' : 'forgot';
    await progressRepo.submitReviewResult(cardId, rating);
    await appStore.refreshReviewCounts();
  }
};

const handleRefillHearts = () => {
  appStore.refillHearts();
  showHeartModal.value = false;
};

const nextQuestion = () => {
  soundFx.playTap();
  speechService.stop();

  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++;
    selectedOption.value = null;
    isCorrect.value = false;
    detailedExplanation.value = null;
  } else {
    isQuizFinished.value = true;
    earnedXP.value += 50;
    appStore.addXP(50, 'quiz_finish');
    soundFx.playComplete();
    if (score.value >= 7) {
      sakuraConfetti.trigger(70);
    }
  }
};

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

const restartQuiz = () => {
  currentQuestionIndex.value = 0;
  score.value = 0;
  comboStreak.value = 0;
  earnedXP.value = 0;
  selectedOption.value = null;
  isCorrect.value = false;
  isQuizFinished.value = false;
  detailedExplanation.value = null;
  if (lesson.value) {
    generateQuiz(lesson.value);
  }
};

const goBack = () => {
  speechService.stop();
  router.push('/');
};
</script>

<style scoped>
.quiz-page-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 16px;
}

/* Duolingo Top Header */
.quiz-header {
  padding: 16px 20px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.back-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-secondary);
}

.lesson-title {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.duo-status-badges {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heart-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 999px;
  font-weight: 800;
  color: #ef4444;
  font-size: 0.85rem;
  transition: transform 0.2s ease;
}

.heart-shake {
  animation: heartShake 0.5s ease-in-out;
}

@keyframes heartShake {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.25) rotate(-8deg); }
  50% { transform: scale(0.9) rotate(8deg); }
  75% { transform: scale(1.1) rotate(-4deg); }
}

.combo-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 999px;
  font-weight: 800;
  color: #f59e0b;
  font-size: 0.85rem;
  animation: pulseFlame 1.5s infinite alternate;
}

@keyframes pulseFlame {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(245, 158, 11, 0); }
  100% { transform: scale(1.05); box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
}

.xp-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 999px;
  font-weight: 800;
  color: var(--primary);
  font-size: 0.85rem;
}

.tts-toggle-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tts-toggle-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.progress-bar-container {
  height: 10px;
  background: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--primary);
}

.duo-striped-bar {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: moveStripes 2s linear infinite;
}

@keyframes moveStripes {
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
}

/* Question Card */
.question-card {
  padding: 24px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.question-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-type-tag {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.speak-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speak-btn:hover {
  background: var(--primary);
  color: white;
}

.speak-btn.is-speaking {
  animation: pulseSpeaking 1s infinite alternate;
  background: var(--primary);
  color: white;
}

@keyframes pulseSpeaking {
  0% { transform: scale(1); }
  100% { transform: scale(1.06); }
}

.prompt {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.4;
}

/* Option Buttons Grid */
.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 600px) {
  .options-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.option-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: var(--border-radius-md);
  font-size: 1.05rem;
  font-weight: 700;
  text-align: left;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 3px 0 var(--border-color);
  cursor: pointer;
  transition: all 0.15s ease;
}

.option-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 0 var(--border-color);
  border-color: var(--primary);
}

.option-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--border-color);
}

.opt-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.opt-label {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 800;
}

.opt-speaker-btn {
  font-size: 0.9rem;
  opacity: 0.6;
  padding: 4px;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.opt-speaker-btn:hover {
  opacity: 1;
}

.duo-opt-correct {
  background: #dcfce7 !important;
  border-color: #22c55e !important;
  color: #15803d !important;
  box-shadow: 0 3px 0 #16a34a !important;
}

.duo-opt-incorrect {
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #b91c1c !important;
  box-shadow: 0 3px 0 #dc2626 !important;
}

.duo-opt-muted {
  opacity: 0.6;
}

/* Duolingo Bottom Feedback Banner */
.duo-feedback-banner {
  padding: 20px;
  border-radius: var(--border-radius-lg);
  border: 2px solid;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  0% { transform: translateY(16px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.banner-correct {
  background: #f0fdf4;
  border-color: #86efac;
}

.banner-incorrect {
  background: #fef2f2;
  border-color: #fca5a5;
}

.feedback-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.feedback-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-emoji {
  font-size: 2rem;
}

.status-title {
  font-size: 1.15rem;
  font-weight: 900;
  display: block;
}

.next-step-btn {
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 800;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.feedback-answer-line {
  font-size: 1rem;
  color: var(--text-secondary);
}

.correct-highlight {
  color: var(--primary);
  font-size: 1.15rem;
}

/* Detailed Explanation Card */
.detailed-explanation-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
}

.explanation-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.badge-title {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.btn-speak-explain {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.78rem;
  cursor: pointer;
  color: var(--primary);
  font-weight: 700;
}

.btn-speak-explain:hover {
  background: var(--primary);
  color: white;
}

.explain-tag {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 4px;
}

.tag-core { background: rgba(59, 130, 246, 0.12); color: #2563eb; }
.tag-confusion { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.tag-visual { background: rgba(168, 85, 247, 0.12); color: #9333ea; }
.tag-practical { background: rgba(16, 185, 129, 0.12); color: #059669; }
.tag-science { background: rgba(107, 114, 128, 0.12); color: #4b5563; }

.explain-text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
}

.text-danger-soft {
  color: #b91c1c;
  font-weight: 600;
}

/* Heart Refill Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  max-width: 400px;
  width: 100%;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
  animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.heart-break-icon {
  font-size: 3.5rem;
}

/* Results Screen */
.results-duo-rewards {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  margin: 16px auto;
  max-width: 380px;
}

.reward-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.score-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.score-num {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--primary);
}

.score-denom {
  font-size: 1.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-left: 4px;
}

/* Prompt Icon Styles */
.prompt-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px auto;
  max-width: 240px;
}

.prompt-graphic-img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08));
}

.prompt-graphic-placeholder {
  width: 160px;
  height: 160px;
  background-color: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.prompt-placeholder-char {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-secondary);
}

/* Feedback Graphic Styles */
.feedback-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-secondary);
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  max-width: 260px;
  margin: 12px auto;
}

.feedback-graphic-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.1));
}
</style>
