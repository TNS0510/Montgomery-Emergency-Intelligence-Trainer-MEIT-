import { Scenario, ResponseCategory } from '../types';
import { SCENARIOS as STATIC_SCENARIOS } from '../data/scenarios';

// Fisher-Yates shuffle algorithm to randomize the scenarios
const shuffleScenarios = (scenarios: Scenario[]): Scenario[] => {
  const shuffled = [...scenarios];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const scenarioEngine = {
  async getScenarios(): Promise<Scenario[]> {
    // Simulate async fetching
    return new Promise((resolve) => {
      setTimeout(() => {
        // For each session, we provide a randomly shuffled order of scenarios
        const randomScenarios = shuffleScenarios(STATIC_SCENARIOS);
        resolve(randomScenarios);
      }, 500);
    });
  },

  async fetchAIScenario(): Promise<Scenario | null> {
    // Placeholder for Gemini integration
    return null;
  }
};
