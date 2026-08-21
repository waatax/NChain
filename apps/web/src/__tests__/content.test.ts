import { describe, it, expect, beforeAll } from 'vitest';
import { contentRepo } from '../repositories/index';

describe('ContentRepository and Domain Logic', () => {
  beforeAll(async () => {
    await contentRepo.initialize();
  });

  it('should load all 101 mnemonic items plus shape codes', () => {
    const items = contentRepo.getItems();
    expect(items.length).toBeGreaterThanOrEqual(101);
  });

  it('should verify key canonical items', () => {
    const item00 = contentRepo.getItem('item-00');
    expect(item00).toBeDefined();
    expect(item00?.canonicalKeyword).toBe('鎖鏈');

    const item01 = contentRepo.getItem('item-01');
    expect(item01).toBeDefined();
    expect(item01?.canonicalKeyword).toBe('葉子');

    const item100 = contentRepo.getItem('item-100');
    expect(item100).toBeDefined();
    expect(item100?.canonicalKeyword).toBe('百元');
  });

  it('should have all lessons properly structured', () => {
    const lessons = contentRepo.getLessons();
    expect(lessons.length).toBe(11);
    const firstLesson = contentRepo.getLesson('lesson-00-10');
    expect(firstLesson).toBeDefined();
    expect(firstLesson?.rangeStart).toBe('00');
    const lastLesson = contentRepo.getLesson('lesson-91-100');
    expect(lastLesson).toBeDefined();
    expect(lastLesson?.rangeEnd).toBe('100');
  });
});
