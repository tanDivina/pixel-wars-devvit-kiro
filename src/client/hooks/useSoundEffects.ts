/**
 * Sound Effects Hook
 * 
 * Provides simple sound effects for game interactions.
 * Uses Web Audio API to generate sounds programmatically (no audio files needed).
 */

import { useCallback, useRef, useEffect } from 'react';

interface SoundEffectsHook {
  playPixelPlace: () => void;
  playZoneCapture: () => void;
  playCreditRegeneration: () => void;
  playError: () => void;
  setEnabled: (enabled: boolean) => void;
}

export const useSoundEffects = (): SoundEffectsHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Initialize on first click/touch
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Pixel placement - soft "pop" sound
  const playPixelPlace = useCallback(() => {
    if (!enabledRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Create a quick "pop" with two frequencies
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      oscillator1.frequency.value = 800;
      oscillator2.frequency.value = 1200;

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator1.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime);
      oscillator1.stop(ctx.currentTime + 0.1);
      oscillator2.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.warn('Pixel place sound failed:', error);
    }
  }, []);

  // Zone capture - victory chime (ascending notes)
  const playZoneCapture = useCallback(() => {
    if (!enabledRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
      
      notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        const startTime = ctx.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.12, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.warn('Zone capture sound failed:', error);
    }
  }, []);

  // Credit regeneration - subtle "ding"
  const playCreditRegeneration = useCallback(() => {
    if (!enabledRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = 1200;

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.warn('Credit regeneration sound failed:', error);
    }
  }, []);

  // Error sound - low buzz
  const playError = useCallback(() => {
    if (!enabledRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 200;

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.warn('Error sound failed:', error);
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return {
    playPixelPlace,
    playZoneCapture,
    playCreditRegeneration,
    playError,
    setEnabled,
  };
};
