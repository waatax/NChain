<template>
  <div class="container">
    <!-- Header Summary Card -->
    <div class="dashboard-summary card mb-16">
      <div class="summary-header">
        <h2>學習概覽</h2>
        <span class="version-tag" v-if="manifest">v{{ manifest.contentVersion }}</span>
      </div>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-num">{{ stats.completedItems }} / 101</span>
          <span class="stat-label">已學習數字</span>
        </div>
        <div class="stat-item">
          <span class="stat-num text-primary">{{ appStore.dueCardCount }}</span>
          <span class="stat-label">待複習卡片</span>
        </div>
        <div class="stat-item">
          <span class="stat-num text-success">{{ stats.masteredItems }}</span>
          <span class="stat-label">精熟數字</span>
        </div>
      </div>
      <div class="quick-actions mt-16 flex gap-12">
        <button 
          class="btn btn-primary flex-1" 
          :disabled="appStore.dueCardCount === 0"
          @click="startGlobalReview"
        >
          ⏳ 開始複習 ({{ appStore.dueCardCount }} 題)
        </button>
        <button 
          class="btn btn-secondary flex-1" 
          @click="startGlobalTest"
        >
          ✍️ 00-100 全域測驗
        </button>
      </div>
    </div>

    <!-- Lessons List -->
    <h3 class="section-title mb-16">課程目錄</h3>
    <div class="lessons-list card">
      <div v-for="l in lessons" :key="l.id" class="lesson-row">
        <div class="lesson-info">
          <div class="lesson-title-container">
            <span class="lesson-mode-tag" :class="l.mode">
              {{ l.mode === 'pair' ? '配對' : '故事' }}
            </span>
            <span class="lesson-name">{{ l.title }}</span>
          </div>
          <div class="lesson-meta text-muted">
            數字範圍: {{ l.rangeStart }} – {{ l.rangeEnd }}
            <span class="dot-separator">•</span>
            已記: {{ getLessonProgress(l.id)?.completedSceneIds.length || 0 }} / {{ l.sceneIds.length }}
          </div>
        </div>
        
        <div class="lesson-actions">
          <button class="btn btn-secondary btn-sm" @click="startLesson(l.id)">
            📖 學習
          </button>
          <button class="btn btn-primary btn-sm" @click="startQuiz(l.id)">
            ✍️ 測驗
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { contentRepo, progressRepo } from '../repositories';
import { Lesson, ContentManifest, Module } from '../domain/types';
import { ProgressState } from '../repositories/ProgressRepository';

const router = useRouter();
const appStore = useAppStore();

const manifest = ref<ContentManifest | null>(null);
const lessons = ref<Lesson[]>([]);
const progressMap = reactive<Map<string, ProgressState>>(new Map());

const stats = reactive({
  completedItems: 0,
  masteredItems: 0
});

onMounted(async () => {
  manifest.value = contentRepo.getManifest();
  lessons.value = contentRepo.getLessons();
  
  // Load progress
  const allProgress = await progressRepo.getAllProgress();
  allProgress.forEach(p => progressMap.set(p.lessonId, p));
  
  // Calculate aggregate stats
  calculateStats();
});


const getLessonProgress = (id: string): ProgressState | undefined => {
  return progressMap.get(id);
};

const calculateStats = async () => {
  let completed = 0;
  // Calculate completed scenes
  progressMap.forEach(p => {
    completed += p.completedSceneIds.length;
  });
  stats.completedItems = Math.min(101, completed); // Approximate
  
  // Load review cards to count mastered items
  // Mastery = box >= 3
  const dueCounts = await progressRepo.getCardCountSummary();
  const allCards = await progressRepo.getDueCards(); // Not directly mastered, wait
  
  // To find actual mastered, let's count cards with box >= 3
  // Since we don't have a direct query, we can query them or just query counts.
  // Let's count unique itemIds that have cards with box >= 3.
  // Let's get cards with box >= 3 from IndexedDB
  const dbInstance = (progressRepo as any).db;
  if (dbInstance && dbInstance.reviewCards) {
    try {
      const masteredCards = await dbInstance.reviewCards.where('box').aboveOrEqual(3).toArray();
      const itemIds = masteredCards.map((c: any) => c.itemId);
      stats.masteredItems = new Set(itemIds).size;
    } catch (e) {
      console.error('Failed to calculate mastered items:', e);
    }
  }
};

const startLesson = (lessonId: string) => {
  router.push({ name: 'learn', params: { lessonId } });
};

const startQuiz = (lessonId: string) => {
  router.push({ name: 'quiz', params: { lessonId } });
};

const startGlobalReview = () => {
  router.push({ name: 'review' });
};

const startGlobalTest = () => {
  router.push({ name: 'global-test' });
};
</script>

<style scoped>
.dashboard-summary {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.summary-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
}

.version-tag {
  font-size: 0.7rem;
  font-weight: 700;
  background-color: var(--primary-glow);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 20px;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 1.35rem;
  font-weight: 800;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.module-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.module-header {
  background-color: var(--bg-secondary);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.module-header h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.lessons-list {
  padding: 8px 16px;
}

.lesson-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.lesson-row:last-child {
  border-bottom: none;
}

.lesson-title-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-mode-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}
.lesson-mode-tag.pair {
  background-color: hsla(200, 80%, 50%, 0.15);
  color: hsl(200, 80%, 40%);
}
.lesson-mode-tag.narrative {
  background-color: hsla(280, 80%, 50%, 0.15);
  color: hsl(280, 80%, 40%);
}

.lesson-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.lesson-meta {
  font-size: 0.75rem;
  margin-top: 4px;
}

.dot-separator {
  margin: 0 4px;
}

.lesson-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 6px;
}

.w-full {
  width: 100%;
}
</style>
