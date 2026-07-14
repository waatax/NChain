<template>
  <div class="container">
    <div class="settings-header mb-16">
      <h2>設定與資料管理</h2>
    </div>

    <!-- Interface Settings -->
    <div class="settings-section card mb-16">
      <h3>🎨 介面偏好</h3>
      <div class="setting-item mt-12">
        <span class="label">主題顏色</span>
        <select v-model="localTheme" @change="updateTheme" class="settings-select">
          <option value="light">☀️ 淺色模式</option>
          <option value="dark">🌙 深色模式</option>
        </select>
      </div>

      <div class="setting-item mt-12">
        <span class="label">降低動態效果</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="localReducedMotion" @change="updateReducedMotion" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-item mt-12">
        <span class="label">預設開啟盲背模式</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="localBlindRecall" @change="updateBlindRecall" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- Data Management -->
    <div class="settings-section card mb-16">
      <h3>💾 資料備份與還原</h3>
      <p class="text-muted mt-4">您的進度完全保存在此裝置瀏覽器中，我們建議您定期備份資料。</p>
      
      <div class="backup-actions mt-12">
        <button class="btn btn-secondary w-full" @click="exportData">
          📤 匯出本機學習資料 (JSON)
        </button>
        
        <div class="import-container mt-12">
          <button class="btn btn-secondary w-full" @click="triggerFileInput">
            📥 匯入學習資料備份
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept=".json" 
            @change="importData"
          />
        </div>
      </div>
    </div>

    <!-- Reset progress -->
    <div class="settings-section card mb-16 border-danger">
      <h3 class="text-danger">⚠️ 重設與危險區域</h3>
      <p class="text-muted mt-4">這將會清除您本機的所有學習進度、複習排程與錯題事件，此操作不可還原！</p>
      
      <button 
        class="btn btn-danger w-full mt-12" 
        v-if="confirmResetStep === 0"
        @click="confirmResetStep = 1"
      >
        💥 清除本機所有資料
      </button>

      <div class="confirm-reset-box mt-12 text-center" v-else-if="confirmResetStep === 1">
        <p class="text-danger font-bold">您確定要清除嗎？這會刪除 100% 的學習記錄！</p>
        <div class="flex gap-16 mt-8">
          <button class="btn btn-secondary flex-1" @click="confirmResetStep = 0">取消</button>
          <button class="btn btn-danger flex-1" @click="executeReset">是的，確定重設</button>
        </div>
      </div>
    </div>

    <!-- About Link -->
    <div class="card text-center mb-16">
      <router-link to="/about" class="text-primary font-bold">📖 關於本應用程式與隱私政策</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from '../stores/app';
import { settingsRepo, progressRepo } from '../repositories';

const appStore = useAppStore();

const localTheme = ref('light');
const localReducedMotion = ref(false);
const localBlindRecall = ref(false);
const confirmResetStep = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  localTheme.value = appStore.settings.theme;
  localReducedMotion.value = appStore.settings.reducedMotion;
  localBlindRecall.value = appStore.settings.blindRecall;
});

const updateTheme = () => {
  appStore.updateSettings({ theme: localTheme.value as 'light' | 'dark' });
};

const updateReducedMotion = () => {
  appStore.updateSettings({ reducedMotion: localReducedMotion.value });
};

const updateBlindRecall = () => {
  appStore.updateSettings({ blindRecall: localBlindRecall.value });
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const exportData = async () => {
  try {
    const allProgress = await progressRepo.getAllProgress();
    // Since Dexie doesn't easily dump all tables out-of-the-box, we fetch them manually
    // Let's get reviewCards and progress tables
    const dbInstance = (progressRepo as any).db;
    const allCards = await dbInstance.reviewCards.toArray();
    const allEvents = await dbInstance.reviewEvents.toArray();
    const allDownloads = await dbInstance.offlineLessons.toArray();
    
    const dump = {
      progress: allProgress,
      reviewCards: allCards,
      reviewEvents: allEvents,
      offlineLessons: allDownloads,
      exportedAt: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(dump, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nchain-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('備份匯出失敗：' + e);
  }
};

const importData = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      
      // Basic validation checks
      if (!json.progress || !json.reviewCards) {
        alert('匯入失敗：無效的備份檔案格式。');
        return;
      }
      
      const dbInstance = (progressRepo as any).db;
      
      // Clear current
      await dbInstance.progress.clear();
      await dbInstance.reviewCards.clear();
      await dbInstance.reviewEvents.clear();
      await dbInstance.offlineLessons.clear();
      
      // Insert new
      for (const p of json.progress) await dbInstance.progress.put(p);
      for (const c of json.reviewCards) await dbInstance.reviewCards.put(c);
      if (json.reviewEvents) {
        for (const ev of json.reviewEvents) await dbInstance.reviewEvents.put(ev);
      }
      if (json.offlineLessons) {
        for (const dl of json.offlineLessons) await dbInstance.offlineLessons.put(dl);
      }
      
      await appStore.refreshReviewCounts();
      alert('🎉 備份還原成功！');
      
      if (fileInput.value) fileInput.value.value = '';
    } catch (err) {
      alert('匯入解析失敗：' + err);
    }
  };
  
  reader.readAsText(file);
};

const executeReset = async () => {
  try {
    await progressRepo.resetAllData();
    await appStore.refreshReviewCounts();
    alert('所有資料已成功清除！');
    confirmResetStep.value = 0;
  } catch (e) {
    alert('重設失敗: ' + e);
  }
};
</script>

<style scoped>
.settings-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
}

.settings-section h3 {
  font-size: 0.95rem;
  font-weight: 800;
  border-bottom: 1.5px solid var(--border-color);
  padding-bottom: 8px;
}

.settings-section.border-danger {
  border-color: hsla(355, 80%, 55%, 0.3);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.setting-item .label {
  font-size: 0.9rem;
  font-weight: 600;
}

.settings-select {
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
  color: var(--text-primary);
  outline: none;
  font-family: var(--font-family);
  font-size: 0.85rem;
  cursor: pointer;
}

/* Custom Toggle Switch styling */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--bg-secondary);
  transition: .3s;
  border-radius: 24px;
  border: 1px solid var(--border-color);
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-muted);
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-glow);
  border-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(20px);
  background-color: var(--primary);
}

.backup-actions {
  display: flex;
  flex-direction: column;
}

.font-bold {
  font-weight: 700;
}

.w-full {
  width: 100%;
}
</style>
