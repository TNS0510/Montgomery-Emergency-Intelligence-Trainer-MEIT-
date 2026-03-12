// src/services/soundManager.ts

import { Howl } from 'howler';

/**
 * A mapping of sound names to their corresponding file paths.
 * This makes it easy to manage and reference sound files throughout the app.
 */
const soundMap = {
  click: '/sounds/correct.wav',
  notification: '/sounds/call.wav',
  error: '/sounds/wrong.wav',
  correct: '/sounds/correct.wav',
  wrong: '/sounds/wrong.wav',
};

// Define the type for sound names to ensure type safety.
export type SoundName = keyof typeof soundMap;

/**
 * The SoundManager class is responsible for preloading and playing all sound effects in the application.
 * It uses the Howler.js library to handle audio playback efficiently.
 */
class SoundManager {
  private sounds: { [key in SoundName]?: Howl } = {};

  constructor() {
    this.preloadAll();
  }

  /**
   * Preloads all the sounds defined in the soundMap.
   * Preloading sounds ensures they are ready to play instantly when needed,
   * which is crucial for responsive user feedback.
   */
  private preloadAll() {
    for (const name in soundMap) {
      if (Object.prototype.hasOwnProperty.call(soundMap, name)) {
        const soundName = name as SoundName;
        this.sounds[soundName] = new Howl({
          src: [soundMap[soundName]],
          preload: true,
        });
      }
    }
  }

  /**
   * Plays a sound by its name.
   * @param name The name of the sound to play (e.g., 'click', 'notification').
   */
  playSound(name: SoundName) {
    const sound = this.sounds[name];
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound not found: ${name}`);
    }
  }
}

// Export a singleton instance of the SoundManager to be used throughout the app.
const soundManager = new SoundManager();
export default soundManager;
