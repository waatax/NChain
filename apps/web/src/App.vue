<template>
  <div v-if="appStore.isLoading" class="loading-screen">
    <div class="zen-spinner">
      <div class="spinner-ring"></div>
      <span class="zen-char">鎖</span>
    </div>
    <p class="loading-text">{{ t('正在載入記憶資料...') }}</p>
  </div>
  
  <div v-else-if="appStore.error" class="error-screen">
    <div class="error-card card text-center p-32">
      <span class="error-icon">⚠️</span>
      <h2>{{ t('載入失敗') }}</h2>
      <p class="text-muted mt-8">{{ t('無法讀取數字鎖鏈內容，請確認 Excel 資料是否存在且正確。') }}</p>
      <p class="error-detail mt-12">錯誤代碼: {{ appStore.error }}</p>
      <button class="btn btn-primary mt-20" @click="appStore.initialize">{{ t('重試') }}</button>
    </div>
  </div>

  <div v-else class="app-layout" :class="{ 'layout-landscape': isLandscapeMode }">
    <header class="app-header">
      <router-link to="/" class="brand-wrapper" @click="handleNavTap">
        <div class="brand-crest">
          <span>鎖</span>
        </div>
        <div class="brand-text-col">
          <span class="app-title">NChain <span class="brand-kanji-sub">記憶宮殿</span></span>
        </div>
      </router-link>

      <div class="header-actions">
        <!-- Desktop Nav -->
        <nav class="desktop-nav">
          <router-link to="/" class="desktop-nav-item" @click="handleNavTap">
            <span>📊</span> {{ t('概覽') }}
          </router-link>
          <router-link to="/catalog" class="desktop-nav-item" @click="handleNavTap">
            <span>📖</span> {{ t('圖鑑') }}
          </router-link>
          <router-link to="/review" class="desktop-nav-item" @click="handleNavTap">
            <span>⏳</span> {{ t('複習') }}
            <span v-if="appStore.dueCardCount > 0" class="nav-badge">{{ appStore.dueCardCount }}</span>
          </router-link>
          <router-link to="/palace" class="desktop-nav-item" @click="handleNavTap">
            <span>🏰</span> {{ t('記憶宮殿') }}
          </router-link>
          <router-link to="/science" class="desktop-nav-item" @click="handleNavTap">
            <span>🧠</span> {{ t('記憶科學') }}
          </router-link>
          <router-link to="/settings" class="desktop-nav-item" @click="handleNavTap">
            <span>⚙️</span> {{ t('設定') }}
          </router-link>
        </nav>

        <!-- Sound FX Toggle -->
        <button 
          class="icon-btn" 
          @click="toggleSound" 
          :title="appStore.settings.soundEffects ? '音效已開啟 (點擊關閉)' : '音效已關閉 (點擊開啟)'"
        >
          {{ appStore.settings.soundEffects ? '🔔' : '🔕' }}
        </button>

        <!-- Palette Cycle Button -->
        <button 
          class="icon-btn palette-btn" 
          @click="cyclePalette" 
          :title="paletteTitle"
        >
          🎨
        </button>



        <!-- Layout Mode Switcher -->
        <button 
          class="icon-btn" 
          @click="toggleLayoutMode" 
          :title="layoutTitle"
        >
          {{ layoutIcon }}
        </button>

        <!-- Dark / Light Theme Switcher -->
        <button 
          class="icon-btn" 
          @click="toggleTheme" 
          :title="themeTitle"
        >
          {{ appStore.settings.theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="app-content">
      <router-view />
    </main>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" @click="handleNavTap">
        <span class="nav-icon">📊</span>
        <span>{{ t('主頁') }}</span>
      </router-link>
      <router-link to="/catalog" class="nav-item" @click="handleNavTap">
        <span class="nav-icon">📖</span>
        <span>{{ t('圖鑑') }}</span>
      </router-link>
      <router-link to="/review" class="nav-item" @click="handleNavTap">
        <span class="nav-icon">⏳</span>
        <span>{{ t('複習') }}</span>
        <span v-if="appStore.dueCardCount > 0" class="badge">
          {{ appStore.dueCardCount }}
        </span>
      </router-link>
      <router-link to="/palace" class="nav-item" @click="handleNavTap">
        <span class="nav-icon">🏰</span>
        <span>{{ t('宮殿') }}</span>
      </router-link>
      <router-link to="/science" class="nav-item" @click="handleNavTap">
        <span class="nav-icon">🧠</span>
        <span>{{ t('科學') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAppStore } from './stores/app';
import { useI18n } from './utils/i18n';
import { soundFx } from './utils/sound';
import { ThemePalette } from './repositories/SettingsRepository';

const appStore = useAppStore();
const { t } = useI18n();

const isWidescreen = ref(false);
let mediaQuery: MediaQueryList | null = null;

const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
  isWidescreen.value = e.matches;
};

onMounted(() => {
  appStore.initialize();
  mediaQuery = window.matchMedia('(min-width: 1024px)');
  isWidescreen.value = mediaQuery.matches;
  mediaQuery.addEventListener('change', handleMediaChange);
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange);
  }
});

const handleNavTap = () => {
  soundFx.playTap();
};

const isLandscapeMode = computed(() => {
  const force = appStore.settings.forceLayout || 'auto';
  if (force === 'portrait') return false;
  if (force === 'landscape') return true;
  return isWidescreen.value;
});

const layoutIcon = computed(() => {
  const force = appStore.settings.forceLayout || 'auto';
  if (force === 'portrait') return '📱';
  if (force === 'landscape') return '💻';
  return '🔄';
});

const layoutTitle = computed(() => {
  const force = appStore.settings.forceLayout || 'auto';
  if (force === 'portrait') return t('版面：強制直式');
  if (force === 'landscape') return t('版面：強制橫式');
  return t('版面：自適應');
});

const toggleLayoutMode = () => {
  soundFx.playTap();
  const current = appStore.settings.forceLayout || 'auto';
  let next: 'auto' | 'portrait' | 'landscape' = 'auto';
  if (current === 'auto') {
    next = 'landscape';
  } else if (current === 'landscape') {
    next = 'portrait';
  } else {
    next = 'auto';
  }
  appStore.updateSettings({ forceLayout: next });
};

const themeTitle = computed(() => 
  appStore.settings.theme === 'dark' ? t('切換成淺色模式') : t('切換成深色模式')
);

const toggleTheme = () => {
  soundFx.playTap();
  const newTheme = appStore.settings.theme === 'dark' ? 'light' : 'dark';
  appStore.updateSettings({ theme: newTheme });
};

const toggleSound = () => {
  const next = !appStore.settings.soundEffects;
  appStore.updateSettings({ soundEffects: next });
  if (next) {
    soundFx.playSuccess();
  }
};

const palettes: { key: ThemePalette; label: string }[] = [
  { key: 'ruri', label: '瑠璃藍' },
  { key: 'sakura', label: '桜緋紅' },
  { key: 'matcha', label: '若竹翡翠' },
  { key: 'yamabuki', label: '山吹金茶' },
  { key: 'shion', label: '紫苑藤色' }
];

const paletteTitle = computed(() => {
  const current = appStore.settings.palette || 'ruri';
  const found = palettes.find(p => p.key === current);
  return `傳統和風配色：${found ? found.label : '瑠璃藍'} (點擊切換)`;
});

const cyclePalette = () => {
  soundFx.playTap();
  const current = appStore.settings.palette || 'ruri';
  const currentIndex = palettes.findIndex(p => p.key === current);
  const nextIndex = (currentIndex + 1) % palettes.length;
  appStore.updateSettings({ palette: palettes[nextIndex].key });
};


</script>

<style scoped>
.loading-screen, .error-screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 24px;
  text-align: center;
  z-index: 9999;
}

.zen-spinner {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-right-color: var(--accent-gold);
  border-radius: 50%;
  animation: zenSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.zen-char {
  font-family: var(--font-family-serif);
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary);
}

@keyframes zenSpin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.error-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 8px;
}

.error-detail {
  font-size: 0.85rem;
  color: var(--text-muted);
  background-color: var(--bg-secondary);
  padding: 8px 14px;
  border-radius: var(--border-radius-xs);
  font-family: var(--font-family-mono);
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  width: 100%;
}
</style>
