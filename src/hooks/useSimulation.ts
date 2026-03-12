import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { useSoundEffects } from './useSoundEffects';
import { useCountdown } from './useCountdown';
import { storageService } from '../services/storageService';
import { AppMode } from '../App'; // Assuming AppMode is exported from App.tsx

export const useSimulation = (mode: AppMode) => {
  // 1. Select all required state and actions with a single selector
  const {
    scenarios,
    currentScenarioIndex,
    isGameOver,
    metrics,
    history,
    setScenarios,
    handleDecision: originalHandleDecision,
    nextScenario: originalNextScenario,
    reset,
    setRemainingTime,
  } = useSimulationStore(state => ({
    scenarios: state.scenarios,
    currentScenarioIndex: state.currentScenarioIndex,
    isGameOver: state.isGameOver,
    metrics: state.metrics,
    history: state.history,
    setScenarios: state.setScenarios,
    handleDecision: state.handleDecision,
    nextScenario: state.nextScenario,
    reset: state.reset,
    setRemainingTime: state.setRemainingTime,
  }));

  const { playAlert, playSuccess, playError } = useSoundEffects();

  const handleTimeout = () => {
    const record = originalHandleDecision('timeout');
    if (record) {
      storageService.saveDecision(record);
      playError();
    }
    nextScenarioWithSound();
  };

  const { remainingTime, startTimer, resetTimer } = useCountdown(handleTimeout);

  // Synchronize the store's remainingTime with the countdown hook
  useEffect(() => {
    setRemainingTime(remainingTime);
  }, [remainingTime, setRemainingTime]);

  // 2. Make the timer logic aware of the application mode
  useEffect(() => {
    if ((mode === 'training' || mode === 'recruit') && scenarios.length > 0 && !isGameOver) {
      playAlert();
      // Only start the timer in recruit mode
      if (mode === 'recruit') {
        startTimer(10); // SCENARIO_TIME_LIMIT
      }
    }
    // Reset timer if the game is over or we return to the landing page
    if (isGameOver || mode === 'landing') {
      resetTimer();
    }
  }, [mode, currentScenarioIndex, scenarios, isGameOver, playAlert, startTimer, resetTimer]);

  const handleDecisionWithSound = (choice: any) => {
    const record = originalHandleDecision(choice);
    if (record) {
      storageService.saveDecision(record);
      if (record.isCorrect) {
        playSuccess();
      } else {
        playError();
      }
    }
    return record;
  };

  const nextScenarioWithSound = () => {
    resetTimer();
    originalNextScenario();
  };

  // 3. Return only the state and actions needed by the UI
  return {
    scenarios,
    currentScenarioIndex,
    isGameOver,
    metrics,
    history,
    remainingTime,
    setScenarios,
    handleDecision: handleDecisionWithSound,
    nextScenario: nextScenarioWithSound,
    reset,
  };
};
