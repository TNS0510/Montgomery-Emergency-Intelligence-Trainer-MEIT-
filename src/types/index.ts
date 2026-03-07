export enum TriageCategory {
  EMERGENCY = 'emergency',
  NON_EMERGENCY = 'non-emergency',
  REDIRECT = 'redirect'
}

export interface Scenario {
  id: number;
  location: string;
  category: string;
  incident: string;
  correct: TriageCategory;
  reason: string;
  impact: string;
  severity: number; // 1-10
}

export interface SimulationMetrics {
  load: number;
  delay: number;
  officerUtil: number;
  availableUnits: number;
}

export interface DecisionRecord {
  scenarioId: number;
  choice: TriageCategory | 'timeout';
  correct: TriageCategory;
  isCorrect: boolean;
  category: string;
  timestamp: number;
}

export interface PlayerProgress {
  totalScore: number;
  totalScenarios: number;
  highScore: number;
  level: number;
  completedScenarioIds: number[];
}
