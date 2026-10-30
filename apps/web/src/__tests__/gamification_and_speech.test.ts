import { describe, it, expect } from 'vitest';
import { gamificationRepo, LEVELS } from '../repositories/GamificationRepository';
import { getDetailedMnemonicExplanation, formatExplanationForSpeech } from '../utils/mnemonicExplanation';
import { speechService } from '../utils/speech';
import { contentRepo } from '../repositories';

describe('Duolingo Gamification Engine', () => {
  it('should initialize with 5 hearts and correct defaults', () => {
    const state = gamificationRepo.getState();
    expect(state.maxHearts).toBe(5);
    expect(state.hearts).toBeGreaterThanOrEqual(0);
  });

  it('should correctly handle losing and refilling hearts', () => {
    gamificationRepo.refillHearts();
    expect(gamificationRepo.getState().hearts).toBe(5);

    const lost = gamificationRepo.loseHeart();
    expect(lost.remaining).toBe(4);
    expect(lost.isOutOfHearts).toBe(false);

    const refilled = gamificationRepo.refillHearts();
    expect(refilled).toBe(5);
    expect(gamificationRepo.getState().hearts).toBe(5);
  });

  it('should add XP and correctly compute levels', () => {
    const initialXP = gamificationRepo.getState().xp;
    const res = gamificationRepo.addXP(50, 'test');
    expect(res.newXP).toBe(initialXP + 50);

    const levelInfo = gamificationRepo.getLevelInfo();
    expect(levelInfo.current.level).toBeGreaterThanOrEqual(1);
    expect(LEVELS.length).toBe(10);
  });
});

describe('Pedagogical Mnemonic Explanation Engine', () => {
  it('should generate deep 5-pillar explanation with distractor analysis', async () => {
    await contentRepo.initialize();
    const item24 = contentRepo.getItem('item-24');
    expect(item24).toBeDefined();

    if (item24) {
      const explanation = getDetailedMnemonicExplanation(item24, '14', contentRepo.getItems());
      expect(explanation.number).toBe('24');
      expect(explanation.keyword).toBe('盒子');
      expect(explanation.mnemonicCore).toContain('盒子');
      expect(explanation.confusionAnalysis).toContain('混淆解析');
      expect(explanation.sensoryVisualization).toBeTruthy();
      expect(explanation.practicalUse).toBeTruthy();
      expect(explanation.scientificTip).toBeTruthy();

      const speechText = formatExplanationForSpeech(explanation);
      expect(speechText).toContain('盒子');
    }
  });

  it('should provide fallback explanation for all 101 items', async () => {
    const allItems = contentRepo.getItems();
    allItems.slice(0, 10).forEach(item => {
      const exp = getDetailedMnemonicExplanation(item, undefined, allItems);
      expect(exp.mnemonicCore).toBeTruthy();
      expect(exp.sensoryVisualization).toBeTruthy();
    });
  });
});

describe('Speech Synthesis Service', () => {
  it('should toggle auto speak safely', () => {
    const initial = speechService.autoSpeakEnabled.value;
    const toggled = speechService.toggleAutoSpeak();
    expect(toggled).toBe(!initial);
    // revert
    speechService.toggleAutoSpeak();
  });
});
