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
    blindRecall: false,
    reducedMotion: false,
    downloadedImagesOnly: false
  });

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
    dueCardCount,
    totalCardCount,
    initialize,
    refreshReviewCounts,
    updateSettings
  };
});
