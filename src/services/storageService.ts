import { PlayerProgress, DecisionRecord } from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'meit_progress',
  HISTORY: 'meit_history',
  SETTINGS: 'meit_settings',
  HIGH_SCORE: 'meit_high_score'
};

export const storageService = {
  saveProgress(progress: PlayerProgress) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  },

  getProgress(): PlayerProgress | null {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : null;
  },

  saveDecision(decision: DecisionRecord) {
    const history = this.getHistory();
    history.push(decision);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  getHistory(): DecisionRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveHighScore(score: number) {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(score));
  },

  getHighScore(): number {
    const score = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return score ? parseInt(score, 10) : 0;
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
};
