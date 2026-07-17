export interface LocalSettings {
  theme: 'light' | 'dark';
  blindRecall: boolean;
  reducedMotion: boolean;
  downloadedImagesOnly: boolean;
  forceLayout?: 'auto' | 'portrait' | 'landscape';
}

const SETTINGS_KEY = 'number-chain.settings.v1';

const DEFAULT_SETTINGS: LocalSettings = {
  theme: 'light',
  blindRecall: false,
  reducedMotion: false,
  downloadedImagesOnly: false,
  forceLayout: 'auto'
};

export class SettingsRepository {
  private static instance: SettingsRepository;

  private constructor() {}

  public static getInstance(): SettingsRepository {
    if (!SettingsRepository.instance) {
      SettingsRepository.instance = new SettingsRepository();
    }
    return SettingsRepository.instance;
  }

  public getSettings(): LocalSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: Partial<LocalSettings>): LocalSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      
      // Apply theme to HTML tag
      const html = document.documentElement;
      if (updated.theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      
      // Apply reduced motion attribute
      if (updated.reducedMotion) {
        html.setAttribute('data-reduced-motion', 'true');
      } else {
        html.removeAttribute('data-reduced-motion');
      }
    } catch (e) {
      console.error('Failed to write settings to localStorage:', e);
    }
    return updated;
  }

  public applyInitialSettings(): void {
    const settings = this.getSettings();
    
    // Apply theme
    const html = document.documentElement;
    if (settings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      html.setAttribute('data-reduced-motion', 'true');
    } else {
      html.removeAttribute('data-reduced-motion');
    }
  }
}
