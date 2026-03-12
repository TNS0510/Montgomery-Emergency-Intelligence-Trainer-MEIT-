// src/hooks/useSoundEffects.ts

import { useRef, useCallback } from 'react';

// Defines the paths to the sound files.
const SOUND_PATHS = {
  alert: '/sounds/call.wav',
  success: '/sounds/correct.wav',
  error: '/sounds/wrong.wav',
};

/**
 * A custom hook to manage sound effects for the application.
 * It preloads audio files and provides functions to play them.
 * This approach centralizes sound management and is easy to use in any component.
 */
export const useSoundEffects = () => {
  const soundsRef = useRef<{
    alert: HTMLAudioElement;
    success: HTMLAudioElement;
    error: HTMLAudioElement;
  } | null>(null);

  // Initialize the audio objects only once.
  if (!soundsRef.current) {
    const alertSound = new Audio(SOUND_PATHS.alert);
    alertSound.preload = 'auto';

    const successSound = new Audio(SOUND_PATHS.success);
    successSound.preload = 'auto';

    const errorSound = new Audio(SOUND_PATHS.error);
    errorSound.preload = 'auto';

    soundsRef.current = {
      alert: alertSound,
      success: successSound,
      error: errorSound,
    };
  }

  const playAlert = useCallback(() => {
    if (soundsRef.current) {
      soundsRef.current.alert.currentTime = 0;
      soundsRef.current.alert.play();
    }
  }, []);

  const playSuccess = useCallback(() => {
    if (soundsRef.current) {
      soundsRef.current.success.currentTime = 0;
      soundsRef.current.success.play();
    }
  }, []);

  const playError = useCallback(() => {
    if (soundsRef.current) {
      soundsRef.current.error.currentTime = 0;
      soundsRef.current.error.play();
    }
  }, []);

  return { playAlert, playSuccess, playError };
};
