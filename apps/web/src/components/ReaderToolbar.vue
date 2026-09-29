<template>
  <div class="reader-toolbar-wrapper">
    <div class="reader-toolbar">
      <!-- 1. Font Size Controls -->
      <div class="reader-control-group font-control-group">
        <span class="control-label text-muted">字級</span>
        <button 
          class="reader-btn font-btn" 
          @click="decreaseFontSize" 
          :disabled="isMinFontSize"
          title="縮小字級 (A-)"
          aria-label="縮小字級"
        >
          <span class="font-icon-sm">A<sup>-</sup></span>
        </button>

        <span class="font-scale-badge" :title="`目前字級：${currentFontSizeLabel}`">
          {{ currentFontSizeScale }}
        </span>

        <button 
          class="reader-btn font-btn" 
          @click="increaseFontSize" 
          :disabled="isMaxFontSize"
          title="放大字級 (A+)"
          aria-label="放大字級"
        >
          <span class="font-icon-lg">A<sup>+</sup></span>
        </button>
      </div>

      <!-- Divider -->
      <div class="reader-divider"></div>

      <!-- 2. Reading Palette Quick Switcher -->
      <div class="reader-control-group palette-group">
        <span class="control-label text-muted">色調</span>
        <div class="palette-mini-chips">
          <button
            v-for="p in availablePalettes"
            :key="p.key"
            class="mini-palette-chip"
            :class="{ active: appStore.settings.palette === p.key }"
            :style="{ backgroundColor: p.color }"
            :title="`切換為 ${p.label}`"
            @click="setPalette(p.key)"
          >
            <span v-if="appStore.settings.palette === p.key" class="chip-check">✓</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="reader-divider hide-mobile"></div>

      <!-- 3. Reading Width Switcher (Desktop) -->
      <div class="reader-control-group width-group hide-mobile">
        <button 
          class="reader-btn width-toggle-btn"
          @click="toggleWidth"
          :title="appStore.settings.readingWidth === 'wide' ? '切換為舒適閱讀寬度 (880px)' : '切換為全螢幕寬度 (1200px)'"
        >
          <span class="btn-icon">{{ appStore.settings.readingWidth === 'wide' ? '📖' : '🖥️' }}</span>
          <span class="btn-text">{{ appStore.settings.readingWidth === 'wide' ? '全幅' : '護眼專注' }}</span>
        </button>
      </div>

      <!-- 4. Dark / Light Toggle -->
      <div class="reader-control-group theme-group">
        <button 
          class="reader-btn theme-toggle-btn"
          @click="toggleTheme"
          :title="appStore.settings.theme === 'dark' ? '切換為淺色模式' : '切換為夜讀模式'"
        >
          <span>{{ appStore.settings.theme === 'dark' ? '☀️ 晨光' : '🌙 夜讀' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../stores/app';
import { ThemePalette, FontSizeScale } from '../repositories/SettingsRepository';
import { soundFx } from '../utils/sound';

const appStore = useAppStore();

const availablePalettes: { key: ThemePalette; label: string; color: string }[] = [
  { key: 'washi', label: '溫潤和紙 (護眼推薦)', color: '#D8C6A5' },
  { key: 'matcha', label: '若竹翡翠 (清新護眼)', color: '#3E8E6A' },
  { key: 'ruri', label: '瑠璃靛藍 (沉著理性)', color: '#2B5EAA' },
  { key: 'yamabuki', label: '山吹金茶 (溫暖明亮)', color: '#D99B26' },
  { key: 'sakura', label: '桜緋紅 (靈動熱情)', color: '#DE6B7E' },
  { key: 'shion', label: '紫苑藤色 (典雅深邃)', color: '#7E68A8' }
];

const fontOrder: FontSizeScale[] = ['standard', 'comfortable', 'large', 'huge'];

const currentFontSizeIndex = computed(() => {
  const current = appStore.settings.fontSize || 'standard';
  const idx = fontOrder.indexOf(current);
  return idx >= 0 ? idx : 0;
});

const isMinFontSize = computed(() => currentFontSizeIndex.value <= 0);
const isMaxFontSize = computed(() => currentFontSizeIndex.value >= fontOrder.length - 1);

const currentFontSizeScale = computed(() => {
  const current = appStore.settings.fontSize || 'standard';
  const found = appStore.fontSizes.find(f => f.key === current);
  return found ? found.scale : '100%';
});

const currentFontSizeLabel = computed(() => {
  const current = appStore.settings.fontSize || 'standard';
  const found = appStore.fontSizes.find(f => f.key === current);
  return found ? found.label : '標準 (100%)';
});

const decreaseFontSize = () => {
  if (isMinFontSize.value) return;
  soundFx.playTap();
  const next = fontOrder[currentFontSizeIndex.value - 1];
  appStore.updateSettings({ fontSize: next });
};

const increaseFontSize = () => {
  if (isMaxFontSize.value) return;
  soundFx.playTap();
  const next = fontOrder[currentFontSizeIndex.value + 1];
  appStore.updateSettings({ fontSize: next });
};

const setPalette = (palette: ThemePalette) => {
  soundFx.playTap();
  appStore.updateSettings({ palette });
};

const toggleWidth = () => {
  soundFx.playTap();
  appStore.cycleReadingWidth();
};

const toggleTheme = () => {
  soundFx.playTap();
  const newTheme = appStore.settings.theme === 'dark' ? 'light' : 'dark';
  appStore.updateSettings({ theme: newTheme });
};
</script>

<style scoped>
.reader-toolbar-wrapper {
  margin-bottom: 16px;
  width: 100%;
}

.reader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-pill, 9999px);
  padding: 8px 16px;
  box-shadow: var(--shadow-xs);
  transition: all var(--transition-base);
}

.reader-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.reader-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--border-radius-sm, 6px);
  padding: 4px 10px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all var(--transition-fast);
  user-select: none;
}

.reader-btn:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-border);
  color: var(--primary);
  transform: translateY(-1px);
}

.reader-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.font-btn {
  width: 32px;
  height: 28px;
  padding: 0;
}

.font-icon-sm {
  font-size: 0.75rem;
  font-weight: 800;
}

.font-icon-lg {
  font-size: 0.95rem;
  font-weight: 900;
}

.font-scale-badge {
  font-family: var(--font-family-mono, monospace);
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--primary);
  background: var(--primary-light);
  padding: 3px 8px;
  border-radius: var(--border-radius-pill);
  min-width: 44px;
  text-align: center;
}

.palette-mini-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-palette-chip {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform var(--transition-fast), border-color var(--transition-fast);
}

.mini-palette-chip:hover {
  transform: scale(1.2);
}

.mini-palette-chip.active {
  transform: scale(1.25);
  box-shadow: 0 0 0 2px var(--primary);
}

.chip-check {
  font-size: 0.65rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.reader-divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-color);
}

.width-toggle-btn, .theme-toggle-btn {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: var(--border-radius-pill);
}

@media (max-width: 640px) {
  .reader-toolbar {
    border-radius: var(--border-radius-sm);
    padding: 6px 10px;
    gap: 8px;
  }
  .hide-mobile {
    display: none !important;
  }
  .palette-mini-chips {
    gap: 4px;
  }
  .mini-palette-chip {
    width: 18px;
    height: 18px;
  }
}
</style>
