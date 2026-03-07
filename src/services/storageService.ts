import { PlayerProgress, DecisionRecord } from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'meit_progress',
  HISTORY: 'meit_history',
  SETTINGS: 'meit_settings'
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

  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
};
