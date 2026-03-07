import { Scenario, TriageCategory } from '../types';
import { SCENARIOS as STATIC_SCENARIOS } from '../data/scenarios';

export const scenarioEngine = {
  async getScenarios(): Promise<Scenario[]> {
    // Simulate async fetching
    return new Promise((resolve) => {
      setTimeout(() => {
        // In the future, this could fetch from an API
        const normalized = STATIC_SCENARIOS.map(s => ({
          ...s,
          severity: this.calculateSeverity(s)
        }));
        resolve(normalized);
      }, 500);
    });
  },

  calculateSeverity(scenario: any): number {
    if (scenario.correct === TriageCategory.EMERGENCY) return 8;
    if (scenario.correct === TriageCategory.NON_EMERGENCY) return 4;
    return 2;
  },

  async fetchAIScenario(): Promise<Scenario | null> {
    // Placeholder for Gemini integration
    return null;
  }
};
