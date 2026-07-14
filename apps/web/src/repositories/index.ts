import { ContentRepository } from './ContentRepository';
import { ProgressRepository } from './ProgressRepository';
import { SettingsRepository } from './SettingsRepository';

export const contentRepo = ContentRepository.getInstance();
export const progressRepo = ProgressRepository.getInstance();
export const settingsRepo = SettingsRepository.getInstance();
