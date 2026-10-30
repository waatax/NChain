import { ref } from 'vue';
import { settingsRepo } from '../repositories';

export interface SpeakOptions {
  lang?: string;
  rate?: number; // 0.5 - 2.0
  pitch?: number; // 0 - 2.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public isSpeaking = ref(false);
  public isSupported = ref(false);
  public autoSpeakEnabled = ref(false);

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported.value = true;
      this.initVoices();

      // Load saved setting
      const settings = settingsRepo.getSettings() as any;
      this.autoSpeakEnabled.value = settings.speechAutoRead !== false;
    }
  }

  private initVoices() {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth?.getVoices() || [];
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
      }
    };

    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.voicesLoaded && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  /**
   * Find best voice matching the current language preference
   */
  private findBestVoice(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const targetLang = lang.toLowerCase();

    // 1. Exact match (e.g. zh-TW, cmn-Hant-TW)
    let matched = voices.find(v => v.lang.toLowerCase() === targetLang);
    if (matched) return matched;

    // 2. Prefix match (e.g. zh, cmn)
    const langPrefix = targetLang.split('-')[0];
    if (langPrefix === 'zh') {
      // Prioritize Taiwan Mandarin if target is zh-TW
      if (targetLang.includes('tw') || targetLang.includes('hant')) {
        matched = voices.find(v => {
          const l = v.lang.toLowerCase();
          const name = v.name.toLowerCase();
          return l.includes('tw') || l.includes('hant') || name.includes('taiwan') || name.includes('台灣');
        });
        if (matched) return matched;
      }
      // Any Chinese voice
      matched = voices.find(v => v.lang.toLowerCase().startsWith('zh') || v.lang.toLowerCase().startsWith('cmn'));
      if (matched) return matched;
    } else if (langPrefix === 'vi') {
      matched = voices.find(v => v.lang.toLowerCase().startsWith('vi'));
      if (matched) return matched;
    }

    return null;
  }

  /**
   * Stop any current speech playback
   */
  public stop(): void {
    if (!this.synth) return;
    try {
      this.synth.cancel();
    } catch (e) {
      // ignore
    }
    this.isSpeaking.value = false;
    this.currentUtterance = null;
  }

  /**
   * Toggle auto-reading for questions and save setting
   */
  public toggleAutoSpeak(): boolean {
    this.autoSpeakEnabled.value = !this.autoSpeakEnabled.value;
    try {
      settingsRepo.saveSettings({ speechAutoRead: this.autoSpeakEnabled.value } as any);
    } catch (e) {
      // ignore
    }
    return this.autoSpeakEnabled.value;
  }

  /**
   * Speak a text string clearly with natural pauses
   */
  public speak(text: string, options: SpeakOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported.value || !this.synth) {
        resolve();
        return;
      }

      // Stop previous
      this.stop();

      // Clean text: strip emojis, unnecessary symbols
      const cleanText = text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/【|】|➔|💡|🔊|🎉|💪|❌|✅|❤️|🔥/g, ' ')
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const settings = settingsRepo.getSettings() as any;
      const lang = options.lang || (settings.lang === 'vi' ? 'vi-VN' : 'zh-TW');
      const rate = options.rate ?? (settings.speechRate || 1.0);
      const pitch = options.pitch ?? 1.0;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voice = this.findBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking.value = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking.value = false;
        this.currentUtterance = null;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        this.isSpeaking.value = false;
        this.currentUtterance = null;
        options.onError?.(e);
        resolve();
      };

      this.currentUtterance = utterance;

      // Chrome bug workaround: sometimes speech synthesis pauses if backgrounded or long
      if (this.synth.paused) {
        this.synth.resume();
      }

      this.synth.speak(utterance);
    });
  }

  /**
   * Speak question prompt and optional answer choices
   */
  public async speakQuestion(
    prompt: string,
    options?: Array<{ display: string }>,
    includeOptions = false
  ): Promise<void> {
    let fullText = prompt;
    if (includeOptions && options && options.length > 0) {
      const optionTexts = options.map((opt, i) => `選項 ${String.fromCharCode(65 + i)}：${opt.display}`).join('。');
      fullText += `。請選擇：${optionTexts}`;
    }
    await this.speak(fullText);
  }

  /**
   * Speak detailed error explanation smoothly
   */
  public async speakExplanation(text: string): Promise<void> {
    await this.speak(`解析如下：${text}`, { rate: 0.95 });
  }
}

export const speechService = new SpeechService();
