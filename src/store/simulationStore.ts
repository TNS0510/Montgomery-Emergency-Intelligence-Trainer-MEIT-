import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Scenario, DecisionRecord, SimulationMetrics, ResponseCategory } from '../types';

const SCENARIO_TIME_LIMIT = 10;

interface SimulationState {
  scenarios: Scenario[];
  currentScenarioIndex: number;
  history: DecisionRecord[];
  isGameOver: boolean;
  metrics: Omit<SimulationMetrics, 'load' | 'delay' | 'officerUtil' | 'availableUnits'>;
  remainingTime: number;

  setScenarios: (scenarios: Scenario[]) => void;
  nextScenario: () => void;
  handleDecision: (choice: ResponseCategory | 'timeout') => DecisionRecord | undefined;
  reset: () => void;
  setRemainingTime: (time: number) => void;
}

export const useSimulationStore = create<SimulationState>()(
  devtools(
    (set, get) => ({
      // Initial State
      scenarios: [],
      currentScenarioIndex: 0,
      history: [],
      isGameOver: false,
      metrics: {
        score: 0,
        correctDecisions: 0,
        wrongDecisions: 0,
        missedCalls: 0,
        averageResponseTime: 0,
      },
      remainingTime: SCENARIO_TIME_LIMIT,

      // Actions
      setScenarios: (scenarios) => set({ scenarios }),

      setRemainingTime: (time) => set({ remainingTime: time }),

      nextScenario: () => {
        const { currentScenarioIndex, scenarios } = get();
        if (currentScenarioIndex < scenarios.length - 1) {
          set({ currentScenarioIndex: currentScenarioIndex + 1, remainingTime: SCENARIO_TIME_LIMIT });
        } else {
          set({ isGameOver: true });
        }
      },
      
      handleDecision: (choice) => {
        const { isGameOver, scenarios, currentScenarioIndex, remainingTime, history, metrics } = get();
        const currentScenario = scenarios[currentScenarioIndex];

        if (isGameOver || !currentScenario) return;

        const timeToDecide = SCENARIO_TIME_LIMIT - remainingTime;
        const isCorrect = choice === currentScenario.correctResponse;

        const record: DecisionRecord = {
          scenarioId: currentScenario.id,
          choice,
          correct: currentScenario.correctResponse,
          isCorrect,
          category: currentScenario.category,
          timestamp: Date.now(),
          timeToDecide,
        };

        const newHistory = [...history, record];
        const totalDecisions = newHistory.length;
        const totalResponseTime = newHistory.reduce((acc, rec) => acc + (rec.timeToDecide || 0), 0);
        
        let newMetrics = { ...metrics };
        if (choice === 'timeout') {
            newMetrics = {
                ...newMetrics,
                score: newMetrics.score - 10,
                missedCalls: newMetrics.missedCalls + 1,
            };
        } else if (isCorrect) {
            newMetrics = {
                ...newMetrics,
                score: newMetrics.score + 10,
                correctDecisions: newMetrics.correctDecisions + 1,
            };
        } else {
            newMetrics = {
                ...newMetrics,
                score: newMetrics.score - 5,
                wrongDecisions: newMetrics.wrongDecisions + 1,
            };
        }

        newMetrics.averageResponseTime = totalResponseTime / totalDecisions;

        set({
          history: newHistory,
          metrics: newMetrics,
        });

        return record;
      },

      reset: () => {
        set({
          currentScenarioIndex: 0,
          history: [],
          isGameOver: false,
          metrics: {
            score: 0,
            correctDecisions: 0,
            wrongDecisions: 0,
            missedCalls: 0,
            averageResponseTime: 0,
          },
          remainingTime: SCENARIO_TIME_LIMIT,
        });
      },
    }),
    { name: 'MEIT Simulation Store' }
  )
);
