<template>
  <div class="container">
    <div class="settings-header mb-16">
      <div class="header-badge-row mb-6">
        <span class="hanko-seal">設定</span>
        <span class="catalog-subtitle text-muted">個人化體驗與資料管理</span>
      </div>
      <h2>{{ t('設定與資料管理') }}</h2>
    </div>

    <!-- 1. 和風傳統配色系統 -->
    <div class="settings-section card mb-16">
      <h3 class="mb-8">🎨 日系和風主題色盤 (和の伝統色)</h3>
      <p class="text-muted text-xs mb-12">選擇最符合您心境的傳統和風色調：</p>
      
      <div class="palette-picker-grid">
        <div 
          v-for="p in palettes" 
          :key="p.id" 
          class="palette-chip-card"
          :class="{ active: localPalette === p.id }"
          @click="selectPalette(p.id)"
        >
          <div class="palette-preview-circle" :style="{ backgroundColor: p.color }"></div>
          <div class="palette-info">
            <span class="palette-name">{{ p.name }}</span>
            <span class="palette-desc">{{ p.desc }}</span>
          </div>
          <span v-if="localPalette === p.id" class="palette-check">✓</span>
        </div>
      </div>
    </div>

    <!-- 2. 介面與動態偏好 -->
    <div class="settings-section card mb-16">
      <h3 class="mb-12">⚙️ {{ t('介面偏好') }}</h3>
      
      <div class="setting-item">
        <span class="label">{{ t('語系') }}</span>
        <select v-model="localLang" @change="updateLang" class="settings-select">
          <option value="zh-TW">🇹🇼 繁體中文</option>
          <option value="vi">🇻🇳 Tiếng Việt</option>
        </select>
      </div>

      <div class="setting-item mt-12">
        <span class="label">{{ t('主題顏色') }}</span>
        <select v-model="localTheme" @change="updateTheme" class="settings-select">
          <option value="light">{{ t('☀️ 淺色模式') }} (白練和紙)</option>
          <option value="dark">{{ t('🌙 深色模式') }} (漆黑藍墨)</option>
        </select>
      </div>

      <div class="setting-item mt-12">
        <span class="label">🔔 雅音音效回饋 (Web Audio)</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="localSound" @change="updateSound" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-item mt-12">
        <span class="label">🌸 櫻吹雪慶典粒子 (Sakura Confetti)</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="localSakura" @change="updateSakura" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-item mt-12">
        <span class="label">{{ t('降低動態效果') }}</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="localReducedMotion" @change="updateReducedMotion" />
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-item mt-12">
        <span class="label">{{ t('預設開啟盲背模式') }}</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="localBlindRecall" @change="updateBlindRecall" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- 3. Leitner 記憶箱分佈統計 -->
    <div class="settings-section card mb-16">
      <h3 class="mb-12">🧠 Leitner 記憶宮殿卡箱分佈</h3>
      <p class="text-muted text-xs mb-16">卡片隨著複習成功由第 0 箱逐級升至第 5 箱（永久精熟）：</p>
      
      <div class="box-stats-grid">
        <div v-for="(count, boxIdx) in boxCounts" :key="boxIdx" class="box-stat-item">
          <div class="box-bar-wrapper">
            <div 
              class="box-bar-fill" 
              :style="{ height: `${maxBoxCount > 0 ? (count / maxBoxCount) * 100 : 0}%` }"
            ></div>
          </div>
          <span class="box-count font-bold">{{ count }}</span>
          <span class="box-label">{{ boxIdx === 0 ? '未學' : `箱 ${boxIdx}` }}</span>
        </div>
      </div>
    </div>

    <!-- 4. 資料備份與還原 -->
    <div class="settings-section card mb-16">
      <h3>💾 {{ t('資料備份與還原') }}</h3>
      <p class="text-muted mt-4 text-xs">{{ t('您的進度完全保存在此裝置瀏覽器中，我們建議您定期備份資料。') }}</p>
      
      <div class="backup-actions mt-12">
        <button class="btn btn-secondary w-full" @click="exportData">
          {{ t('📤 匯出本機學習資料 (JSON)') }}
        </button>
        
        <div class="import-container mt-12">
          <button class="btn btn-secondary w-full" @click="triggerFileInput">
            {{ t('📥 匯入學習資料備份') }}
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

    <!-- 5. 危險區域 -->
    <div class="settings-section card mb-16 border-danger">
      <h3 class="text-danger">{{ t('⚠️ 重設與危險區域') }}</h3>
      <p class="text-muted mt-4 text-xs">{{ t('這將會清除您本機的所有學習進度、複習排程與錯題事件，此操作不可還原！') }}</p>
      
      <button 
        class="btn btn-danger w-full mt-12" 
        v-if="confirmResetStep === 0"
        @click="confirmResetStep = 1"
      >
        {{ t('💥 清除本機所有資料') }}
      </button>

      <div class="confirm-reset-box mt-12 text-center" v-else-if="confirmResetStep === 1">
        <p class="text-danger font-bold text-sm">{{ t('您確定要清除嗎？這會刪除 100% 的學習記錄！') }}</p>
        <div class="flex gap-16 mt-12">
          <button class="btn btn-secondary flex-1" @click="confirmResetStep = 0">{{ t('取消') }}</button>
          <button class="btn btn-danger flex-1" @click="executeReset">{{ t('是的，確定重設') }}</button>
        </div>
      </div>
    </div>

    <!-- 6. 關於與隱私 -->
    <div class="card text-center mb-16">
      <router-link to="/about" class="text-primary font-bold">📖 {{ t('關於本應用程式與隱私政策') }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../stores/app';
import { settingsRepo, progressRepo } from '../repositories';
import { useI18n } from '../utils/i18n';
import { ThemePalette } from '../repositories/SettingsRepository';
import { soundFx } from '../utils/sound';

const appStore = useAppStore();
const { t } = useI18n();

const localTheme = ref('light');
const localPalette = ref<ThemePalette>('ruri');
const localSound = ref(true);
const localSakura = ref(true);
const localReducedMotion = ref(false);
const localBlindRecall = ref(false);
const localLang = ref('zh-TW');
const confirmResetStep = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const boxCounts = ref<number[]>([0, 0, 0, 0, 0, 0]);

const palettes = [
  { id: 'ruri' as ThemePalette, name: '瑠璃藍 (Ruri Indigo)', color: '#1E50A2', desc: '冷靜專注・深海琉璃' },
  { id: 'sakura' as ThemePalette, name: '桜緋紅 (Sakura & Akane)', color: '#B7282E', desc: '春櫻緋紅・溫潤雅緻' },
  { id: 'matcha' as ThemePalette, name: '若竹翡翠 (Matcha & Bamboo)', color: '#006E54', desc: '竹林靜謐・翡翠抹茶' },
  { id: 'yamabuki' as ThemePalette, name: '山吹金茶 (Yamabuki Gold)', color: '#C37829', desc: '金箔古韻・豐收書香' },
  { id: 'shion' as ThemePalette, name: '紫苑藤色 (Shion Iris)', color: '#5A3B7E', desc: '高貴紫藤・靈感沉澱' }
];

const maxBoxCount = computed(() => {
  return Math.max(...boxCounts.value, 1);
});

onMounted(async () => {
  localTheme.value = appStore.settings.theme;
  localPalette.value = appStore.settings.palette || 'ruri';
  localSound.value = appStore.settings.soundEffects !== false;
  localSakura.value = appStore.settings.sakuraParticles !== false;
  localReducedMotion.value = appStore.settings.reducedMotion;
  localBlindRecall.value = appStore.settings.blindRecall;
  localLang.value = appStore.settings.lang || 'zh-TW';

  await loadBoxCounts();
});

const loadBoxCounts = async () => {
  try {
    const dbInstance = (progressRepo as any).db;
    if (dbInstance && dbInstance.reviewCards) {
      const allCards = await dbInstance.reviewCards.toArray();
      const counts = [0, 0, 0, 0, 0, 0];
      allCards.forEach((c: any) => {
        const b = typeof c.box === 'number' && c.box >= 0 && c.box <= 5 ? c.box : 0;
        counts[b]++;
      });
      boxCounts.value = counts;
    }
  } catch (e) {
    console.error('Failed to load box counts:', e);
  }
};

const selectPalette = (id: ThemePalette) => {
  soundFx.playTap();
  localPalette.value = id;
  appStore.updateSettings({ palette: id });
};

const updateLang = () => {
  soundFx.playTap();
  appStore.updateSettings({ lang: localLang.value as 'zh-TW' | 'vi' });
  window.location.reload();
};

const updateTheme = () => {
  soundFx.playTap();
  appStore.updateSettings({ theme: localTheme.value as 'light' | 'dark' });
};

const updateSound = () => {
  appStore.updateSettings({ soundEffects: localSound.value });
  if (localSound.value) soundFx.playSuccess();
};

const updateSakura = () => {
  soundFx.playTap();
  appStore.updateSettings({ sakuraParticles: localSakura.value });
};

const updateReducedMotion = () => {
  soundFx.playTap();
  appStore.updateSettings({ reducedMotion: localReducedMotion.value });
};

const updateBlindRecall = () => {
  soundFx.playTap();
  appStore.updateSettings({ blindRecall: localBlindRecall.value });
};

const triggerFileInput = () => {
  soundFx.playTap();
  fileInput.value?.click();
};

const exportData = async () => {
  soundFx.playTap();
  try {
    const dbInstance = (progressRepo as any).db;
    const allProgress = await dbInstance.progress.toArray();
    const allCards = await dbInstance.reviewCards.toArray();
    const allEvents = await dbInstance.reviewEvents.toArray();

    const backupObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: allProgress,
      reviewCards: allCards,
      reviewEvents: allEvents,
      settings: appStore.settings
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `nchain-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
  } catch (e: any) {
    soundFx.playError();
    alert('備份匯出失敗：' + e.message);
  }
};

const importData = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.reviewCards)) {
      soundFx.playError();
      alert('匯入失敗：無效的備份檔案格式。');
      return;
    }

    const dbInstance = (progressRepo as any).db;
    await dbInstance.transaction('rw', [dbInstance.progress, dbInstance.reviewCards, dbInstance.reviewEvents], async () => {
      await dbInstance.progress.clear();
      await dbInstance.reviewCards.clear();
      await dbInstance.reviewEvents.clear();

      if (parsed.progress?.length) await dbInstance.progress.bulkAdd(parsed.progress);
      if (parsed.reviewCards?.length) await dbInstance.reviewCards.bulkAdd(parsed.reviewCards);
      if (parsed.reviewEvents?.length) await dbInstance.reviewEvents.bulkAdd(parsed.reviewEvents);
    });

    if (parsed.settings) {
      appStore.updateSettings(parsed.settings);
    }

    await appStore.refreshReviewCounts();
    await loadBoxCounts();
    soundFx.playSuccess();
    alert('備份還原成功！');
  } catch (err: any) {
    soundFx.playError();
    alert('匯入解析失敗：' + err.message);
  } finally {
    if (fileInput.value) fileInput.value.value = '';
  }
};

const executeReset = async () => {
  try {
    const dbInstance = (progressRepo as any).db;
    await dbInstance.transaction('rw', [dbInstance.progress, dbInstance.reviewCards, dbInstance.reviewEvents], async () => {
      await dbInstance.progress.clear();
      await dbInstance.reviewCards.clear();
      await dbInstance.reviewEvents.clear();
    });

    await appStore.initialize();
    await loadBoxCounts();
    confirmResetStep.value = 0;
    soundFx.playSuccess();
    alert('所有資料已成功清除！');
  } catch (e: any) {
    soundFx.playError();
    alert('重設失敗: ' + e.message);
  }
};
</script>

<style scoped>
.settings-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
}

.header-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.palette-picker-grid {
  display: grid;
  gap: 10px;
}

.palette-chip-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.palette-chip-card:hover {
  border-color: var(--primary-border);
  background: var(--bg-card);
}

.palette-chip-card.active {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 2px 10px var(--primary-glow);
}

.palette-preview-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.palette-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.palette-name {
  font-weight: 800;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.palette-desc {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.palette-check {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--primary);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed var(--border-subtle);
}

.setting-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-select {
  padding: 6px 12px;
  border-radius: var(--border-radius-xs);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-family-base);
  font-size: 0.88rem;
  outline: none;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 46px;
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
  background-color: var(--border-color);
  transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Box Stats Grid */
.box-stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  align-items: flex-end;
  height: 140px;
  padding: 12px 8px 4px 8px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
}

.box-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.box-bar-wrapper {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.box-bar-fill {
  width: 70%;
  background: linear-gradient(180deg, var(--primary), var(--accent-gold));
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.4s ease;
}

.box-count {
  font-size: 0.8rem;
  margin-top: 4px;
}

.box-label {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.border-danger {
  border-color: rgba(197, 48, 48, 0.4) !important;
}
</style>
