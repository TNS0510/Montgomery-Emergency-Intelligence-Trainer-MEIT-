export enum ResponseCategory {
  POLICE = 'Police',
  FIRE = 'Fire',
  MEDICAL = 'Medical',
  MENTAL_HEALTH = 'Mental Health Team',
  LOW_PRIORITY = 'Low Priority',
}

export interface Scenario {
  id: number;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  category: string;
  incident: string;
  correctResponse: ResponseCategory;
  reason: string;
  impact: string;
  severity: number; // 1-10
}

export interface SimulationMetrics {
  score: number;
  correctDecisions: number;
  wrongDecisions: number;
  missedCalls: number;
  averageResponseTime: number;
  load: number;
  delay: number;
  officerUtil: number;
  availableUnits: number;
}

export interface DecisionRecord {
  scenarioId: number;
  choice: ResponseCategory | 'timeout';
  correct: ResponseCategory;
  isCorrect: boolean;
  category: string;
  timestamp: number;
  timeToDecide: number; // in seconds
}

export interface PlayerProgress {
  totalScore: number;
  totalScenarios: number;
  highScore: number;
  level: number;
  completedScenarioIds: number[];
}

// --- New Types for Bright Data Integration ---

/**
 * Represents the structure of a raw incident from the Bright Data API.
 * This is a hypothetical structure and should be adjusted to match the actual API response.
 */
export interface BrightDataIncident {
  case_id: string;
  timestamp: string;
  address: string;
  latitude: number;
  longitude: number;
  details: string;
  type: 'fire' | 'police' | 'medical' | 'other';
  urgency: 'high' | 'medium' | 'low';
}

/**
 * Configuration for the Bright Data API service.
 */
export interface ApiConfig {
  apiKey: string;
  datasetId: string;
}

/**
 * Status of a crawl job from the Bright Data API.
 */
export type CrawlStatus = 'running' | 'done' | 'failed';
