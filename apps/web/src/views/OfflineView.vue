<template>
  <div class="container">
    <div class="offline-header mb-16">
      <h2>離線包下載管理</h2>
      <p class="text-muted">下載個別課程的圖片包，即可在無網路環境 (飛航模式) 瀏覽想像畫面</p>
    </div>

    <!-- Storage capacity estimation -->
    <div class="storage-estimate card mb-16" v-if="storageInfo">
      <div class="estimate-row">
        <span>裝置剩餘空間可用：</span>
        <span class="font-bold">{{ storageInfo.available }} GB</span>
      </div>
      <div class="estimate-row mt-4">
        <span>已使用空間：</span>
        <span>{{ storageInfo.used }} MB</span>
      </div>
    </div>

    <!-- Lessons Package List -->
    <div class="packs-list">
      <div v-for="l in lessons" :key="l.id" class="pack-row card mb-12">
        <div class="pack-info">
          <span class="pack-title">{{ l.title }}</span>
          <span class="pack-meta text-muted">
            圖片數量: {{ l.sceneIds.length }} 張 | 預估容量: {{ (l.sceneIds.length * 150 / 1024).toFixed(1) }} MB
          </span>
        </div>

        <div class="pack-status-actions">
          <!-- Downloaded -->
          <div v-if="downloadedPacks.has(l.id)" class="status-downloaded">
            <span class="badge-success">✓ 已下載</span>
            <button class="icon-btn-delete" @click="deletePack(l.id)" title="刪除離線包">🗑️</button>
          </div>
          
          <!-- Downloading simulation -->
          <div v-else-if="downloadingPackId === l.id" class="status-downloading">
            <div class="spinner-sm"></div>
            <span class="progress-pct font-bold">{{ downloadProgress }}%</span>
          </div>

          <!-- Not Downloaded -->
          <button 
            v-else 
            class="btn btn-secondary btn-sm" 
            :disabled="downloadingPackId !== null"
            @click="downloadPack(l.id)"
          >
            📥 下載
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { contentRepo, progressRepo } from '../repositories';
import { Lesson } from '../domain/types';

const lessons = ref<Lesson[]>([]);
const downloadedPacks = ref<Set<string>>(new Set());
const downloadingPackId = ref<string | null>(null);
const downloadProgress = ref(0);

const storageInfo = reactive({
  available: '0',
  used: '0'
});

onMounted(async () => {
  lessons.value = contentRepo.getLessons();
  await refreshDownloadStates();
  await checkStorageEstimate();
});

const refreshDownloadStates = async () => {
  const packs = await progressRepo.getOfflineLessons();
  const completed = packs
    .filter(p => p.status === 'completed')
    .map(p => p.lessonId);
  downloadedPacks.value = new Set(completed);
};

const checkStorageEstimate = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const quotaGB = ((estimate.quota || 0) / (1024 * 1024 * 1024)).toFixed(1);
      const usageMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
      
      storageInfo.available = quotaGB;
      storageInfo.used = usageMB;
    } catch (e) {
      console.warn('Storage estimate failed:', e);
    }
  }
};

const downloadPack = async (lessonId: string) => {
  const lessonObj = lessons.value.find(l => l.id === lessonId);
  if (!lessonObj) return;

  downloadingPackId.value = lessonId;
  downloadProgress.value = 0;

  // Set initial IndexedDB status
  await progressRepo.setOfflineLessonState({
    lessonId,
    downloadedAt: '',
    bytes: 0,
    status: 'downloading'
  });

  // Run download simulator
  const interval = setInterval(async () => {
    downloadProgress.value += 10;
    if (downloadProgress.value >= 100) {
      clearInterval(interval);
      
      const estimatedBytes = lessonObj.sceneIds.length * 150 * 1024; // Mock size
      
      // Save completed to IndexedDB
      await progressRepo.setOfflineLessonState({
        lessonId,
        downloadedAt: new Date().toISOString(),
        bytes: estimatedBytes,
        status: 'completed'
      });
      
      downloadingPackId.value = null;
      await refreshDownloadStates();
      await checkStorageEstimate();
    }
  }, 150);
};

const deletePack = async (lessonId: string) => {
  if (confirm('確定要刪除此課程的離線圖片以釋放空間嗎？')) {
    await progressRepo.deleteOfflineLesson(lessonId);
    await refreshDownloadStates();
    await checkStorageEstimate();
  }
};
</script>

<style scoped>
.offline-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
}

.storage-estimate {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.estimate-row {
  display: flex;
  justify-content: space-between;
}

.font-bold {
  font-weight: 700;
}

.pack-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
}

.pack-info {
  display: flex;
  flex-direction: column;
}

.pack-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.pack-meta {
  font-size: 0.75rem;
  margin-top: 4px;
}

.pack-status-actions {
  display: flex;
  align-items: center;
}

.badge-success {
  background-color: hsla(145, 75%, 45%, 0.15);
  color: var(--success);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  margin-right: 8px;
}

.icon-btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 1rem;
}

.status-downloaded {
  display: flex;
  align-items: center;
}

.status-downloading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-pct {
  font-size: 0.8rem;
  color: var(--primary);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 6px;
}
</style>
