import { ContentRepository } from './ContentRepository';
import { ProgressRepository } from './ProgressRepository';
import { SettingsRepository } from './SettingsRepository';
import { GamificationRepository } from './GamificationRepository';

export const contentRepo = ContentRepository.getInstance();
export const progressRepo = ProgressRepository.getInstance();
export const settingsRepo = SettingsRepository.getInstance();
export const gamificationRepo = GamificationRepository.getInstance();
