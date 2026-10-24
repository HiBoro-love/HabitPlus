import confetti from 'canvas-confetti';
import { playNotificationChime } from './audioAlarm';

/**
 * Lightweight canvas-confetti animation effect for completing the last remaining habit of the day
 */
export function triggerLastHabitCelebration(): void {
  try {
    // Left cannon
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0.05, y: 0.75 },
      colors: ['#10B981', '#34D399', '#06B6D4', '#8B5CF6', '#F59E0B'],
      ticks: 180,
      gravity: 1.1,
      scalar: 0.9,
      disableForReducedMotion: true,
    });

    // Right cannon
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 0.95, y: 0.75 },
      colors: ['#10B981', '#34D399', '#06B6D4', '#8B5CF6', '#F59E0B'],
      ticks: 180,
      gravity: 1.1,
      scalar: 0.9,
      disableForReducedMotion: true,
    });

    // Follow-up center star burst
    setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 75,
        origin: { x: 0.5, y: 0.65 },
        colors: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'],
        ticks: 160,
        gravity: 1.0,
        scalar: 0.85,
        disableForReducedMotion: true,
      });
    }, 180);

    // Audio chime feedback
    playNotificationChime();
  } catch (err) {
    console.warn('Confetti could not be fired:', err);
  }
}

/**
 * Subtle micro-burst for regular habit completion
 */
export function triggerSingleHabitMicroBurst(): void {
  try {
    confetti({
      particleCount: 16,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#10B981', '#06B6D4'],
      ticks: 110,
      gravity: 1.2,
      scalar: 0.75,
      disableForReducedMotion: true,
    });
  } catch {
    // Fallback silently
  }
}
