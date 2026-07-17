<template>
  <div v-if="appStore.isLoading" class="loading-screen">
    <div class="spinner"></div>
    <p>正在載入記憶資料...</p>
  </div>
  
  <div v-else-if="appStore.error" class="error-screen">
    <h2>⚠️ 載入失敗</h2>
    <p>無法讀取數字鎖鏈內容，請確認 Excel 資料是否存在且正確。</p>
    <p class="error-detail">錯誤代碼: {{ appStore.error }}</p>
    <button class="btn btn-primary mt-16" @click="appStore.initialize">重試</button>
  </div>

  <div v-else class="app-layout" :class="{ 'layout-landscape': isLandscapeMode }">
    <header class="app-header">
      <router-link to="/" class="app-title">🧠 數字鎖鏈 NChain</router-link>
      <div class="header-actions" style="display: flex; align-items: center;">
        <nav class="desktop-nav">
          <router-link to="/" class="desktop-nav-item">📊 概覽</router-link>
          <router-link to="/catalog" class="desktop-nav-item">📖 圖鑑</router-link>
          <router-link to="/review" class="desktop-nav-item">
            ⏳ 複習
            <span v-if="appStore.dueCardCount > 0" class="nav-badge">{{ appStore.dueCardCount }}</span>
          </router-link>
          <router-link to="/settings" class="desktop-nav-item">⚙️ 設定</router-link>
        </nav>
        <!-- Layout Mode Switcher -->
        <button class="icon-btn" @click="toggleLayoutMode" :title="layoutTitle" style="margin-right: 8px; font-size: 1.05rem;">
          {{ layoutIcon }}
        </button>
        <button class="icon-btn" @click="toggleTheme" :title="themeTitle">
          {{ appStore.settings.theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <main class="app-content">
      <router-view />
    </main>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">📊</span>
        <span>主頁</span>
      </router-link>
      <router-link to="/catalog" class="nav-item">
        <span class="nav-icon">📖</span>
        <span>圖鑑</span>
      </router-link>
      <router-link to="/review" class="nav-item">
        <span class="nav-icon">⏳</span>
        <span>複習</span>
        <span v-if="appStore.dueCardCount > 0" class="badge">
          {{ appStore.dueCardCount }}
        </span>
      </router-link>
      <router-link to="/settings" class="nav-item">
        <span class="nav-icon">⚙️</span>
        <span>設定</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAppStore } from './stores/app';

const appStore = useAppStore();

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
  if (force === 'portrait') return '版面：強制直式';
  if (force === 'landscape') return '版面：強制橫式';
  return '版面：自適應';
});

const toggleLayoutMode = () => {
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
  appStore.settings.theme === 'dark' ? '切換成淺色模式' : '切換成深色模式'
);

const toggleTheme = () => {
  const newTheme = appStore.settings.theme === 'dark' ? 'light' : 'dark';
  appStore.updateSettings({ theme: newTheme });
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

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-detail {
  font-size: 0.85rem;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: 8px 12px;
  border-radius: var(--border-radius-sm);
  margin-top: 8px;
  font-family: monospace;
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

.icon-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed);
}

.icon-btn:hover {
  background-color: var(--bg-secondary);
}
</style>
