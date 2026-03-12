// src/hooks/useCountdown.ts

import { useState, useRef, useCallback, useEffect } from 'react';

export const useCountdown = (onEnd: () => void) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onEndRef.current();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = useCallback((seconds: number) => {
    setRemainingTime(seconds);
    setIsRunning(true);
  }, []);

  const resetTimer = useCallback(() => {
    setRemainingTime(0);
    setIsRunning(false);
  }, []);

  return { remainingTime, startTimer, resetTimer };
};
