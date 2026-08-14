export type ThemePalette = 'ruri' | 'sakura' | 'matcha' | 'yamabuki' | 'shion';

export interface LocalSettings {
  theme: 'light' | 'dark';
  palette: ThemePalette;
  blindRecall: boolean;
  reducedMotion: boolean;
  downloadedImagesOnly: boolean;
  forceLayout?: 'auto' | 'portrait' | 'landscape';
  lang?: 'zh-TW' | 'vi';
  soundEffects: boolean;
  sakuraParticles: boolean;
}

const SETTINGS_KEY = 'number-chain.settings.v1';

const DEFAULT_SETTINGS: LocalSettings = {
  theme: 'light',
  palette: 'ruri',
  blindRecall: false,
  reducedMotion: false,
  downloadedImagesOnly: false,
  forceLayout: 'auto',
  lang: 'zh-TW',
  soundEffects: true,
  sakuraParticles: true
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
      this.applyDomAttributes(updated);
    } catch (e) {
      console.error('Failed to write settings to localStorage:', e);
    }
    return updated;
  }

  public applyInitialSettings(): void {
    const settings = this.getSettings();
    this.applyDomAttributes(settings);
  }

  private applyDomAttributes(settings: LocalSettings): void {
    const html = document.documentElement;
    
    // Apply theme
    if (settings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Apply Japanese Palette
    html.setAttribute('data-palette', settings.palette || 'ruri');

    // Apply reduced motion
    if (settings.reducedMotion) {
      html.setAttribute('data-reduced-motion', 'true');
    } else {
      html.removeAttribute('data-reduced-motion');
    }
  }
}
