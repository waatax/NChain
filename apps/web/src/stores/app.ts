import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { contentRepo, progressRepo, settingsRepo } from '../repositories';
import { LocalSettings } from '../repositories/SettingsRepository';

export const useAppStore = defineStore('app', () => {
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const dueCardCount = ref(0);
  const totalCardCount = ref(0);
  
  const settings = reactive<LocalSettings>({
    theme: 'light',
    palette: 'ruri',
    fontSize: 'standard',
    readingWidth: 'standard',
    blindRecall: false,
    reducedMotion: false,
    downloadedImagesOnly: false,
    lang: 'zh-TW',
    soundEffects: true,
    sakuraParticles: true
  });

  const fontSizes: { key: LocalSettings['fontSize']; label: string; scale: string }[] = [
    { key: 'standard', label: '標準 (100%)', scale: '100%' },
    { key: 'comfortable', label: '舒適 (112%)', scale: '112%' },
    { key: 'large', label: '大字 (125%)', scale: '125%' },
    { key: 'huge', label: '特大 (140%)', scale: '140%' }
  ];

  const cycleFontSize = () => {
    const current = settings.fontSize || 'standard';
    const idx = fontSizes.findIndex(f => f.key === current);
    const next = fontSizes[(idx + 1) % fontSizes.length].key;
    updateSettings({ fontSize: next });
    return next;
  };

  const cycleReadingWidth = () => {
    const current = settings.readingWidth || 'standard';
    const next = current === 'standard' ? 'wide' : 'standard';
    updateSettings({ readingWidth: next });
    return next;
  };

  const initialize = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. Initialize content data
      await contentRepo.initialize();
      
      // 2. Load settings
      const currentSettings = settingsRepo.getSettings();
      Object.assign(settings, currentSettings);
      settingsRepo.applyInitialSettings();
      
      // 3. Update Leitner count
      await refreshReviewCounts();
    } catch (e: any) {
      console.error('App store initialization failed:', e);
      error.value = e.message || 'INITIALIZATION_ERROR';
    } finally {
      isLoading.value = false;
    }
  };

  const refreshReviewCounts = async () => {
    try {
      const summary = await progressRepo.getCardCountSummary();
      dueCardCount.value = summary.due;
      totalCardCount.value = summary.total;
    } catch (e) {
      console.error('Failed to load review counts:', e);
    }
  };

  const updateSettings = (newSettings: Partial<LocalSettings>) => {
    const updated = settingsRepo.saveSettings(newSettings);
    Object.assign(settings, updated);
  };

  return {
    isLoading,
    error,
    settings,
    fontSizes,
    dueCardCount,
    totalCardCount,
    initialize,
    refreshReviewCounts,
    updateSettings,
    cycleFontSize,
    cycleReadingWidth
  };
});
