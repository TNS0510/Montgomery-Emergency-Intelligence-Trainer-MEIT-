import { useState, useCallback, useEffect } from 'react';
import { TriageCategory, SimulationMetrics, DecisionRecord, Scenario } from '../types';
import { storageService } from '../services/storageService';

export const useSimulation = (scenarios: Scenario[]) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<DecisionRecord[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    load: 10,
    delay: 5,
    officerUtil: 40,
    availableUnits: 10
  });
  const [isGameOver, setIsGameOver] = useState(false);

  const currentScenario = scenarios[currentScenarioIndex];

  const handleDecision = useCallback((choice: TriageCategory | 'timeout') => {
    if (isGameOver || !currentScenario) return;

    const isCorrect = choice === currentScenario.correct;
    const record: DecisionRecord = {
      scenarioId: currentScenario.id,
      choice,
      correct: currentScenario.correct,
      isCorrect,
      category: currentScenario.category,
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, record]);
    storageService.saveDecision(record);

    if (isCorrect) setScore(prev => prev + 1);

    // Update metrics
    setMetrics(prev => {
      let newDelay = prev.delay;
      let newLoad = prev.load;
      let newUtil = prev.officerUtil;
      let newUnits = prev.availableUnits;

      if (!isCorrect) {
        newDelay += (currentScenario.correct === TriageCategory.EMERGENCY) ? 8 : 3;
        newLoad += 15;
        newUtil += 10;
        newUnits = Math.max(0, newUnits - 1);
      } else {
        newDelay = Math.max(2, newDelay - 1);
        newLoad = Math.max(5, newLoad - 5);
        newUtil = Math.max(30, newUtil - 2);
        newUnits = Math.min(10, newUnits + 1);
      }

      return {
        load: Math.min(100, newLoad),
        delay: newDelay,
        officerUtil: Math.min(100, newUtil),
        availableUnits: newUnits
      };
    });

    return record;
  }, [currentScenario, isGameOver]);

  const nextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const reset = () => {
    setCurrentScenarioIndex(0);
    setScore(0);
    setHistory([]);
    setMetrics({ load: 10, delay: 5, officerUtil: 40, availableUnits: 10 });
    setIsGameOver(false);
  };

  return {
    currentScenarioIndex,
    currentScenario,
    score,
    history,
    metrics,
    isGameOver,
    handleDecision,
    nextScenario,
    reset
  };
};
