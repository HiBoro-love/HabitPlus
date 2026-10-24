/**
 * Audio Alarm Chime & Notification Engine
 * Synthesizes crystal-clear audio tones using Web Audio API (zero asset dependencies)
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a gentle, harmonic chime for event reminders
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.65);
    });
  } catch (err) {
    console.warn('Audio chime could not play:', err);
  }
}

/**
 * Plays a joyous fanfare chime for Birthday wishing celebration
 */
export function playBirthdayCelebrationSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Celebration melody: C5, E5, G5, high C6 chord
    const melody = [
      { freq: 523.25, start: 0, dur: 0.18 },
      { freq: 659.25, start: 0.16, dur: 0.18 },
      { freq: 783.99, start: 0.32, dur: 0.22 },
      { freq: 1046.5, start: 0.52, dur: 0.8 },
      { freq: 1318.51, start: 0.56, dur: 0.75 },
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.start);

      gain.gain.setValueAtTime(0, now + note.start);
      gain.gain.linearRampToValueAtTime(0.25, now + note.start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur + 0.1);
    });
  } catch (err) {
    console.warn('Birthday audio chime could not play:', err);
  }
}

/**
 * Plays an alert chime for active event alarms
 */
export function playAlarmAlertSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pulses = [0, 0.2, 0.4];

    pulses.forEach((timeOffset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now + timeOffset); // A5

      gain.gain.setValueAtTime(0, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.28, now + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.16);
    });
  } catch (err) {
    console.warn('Alarm sound could not play:', err);
  }
}

/**
 * Request desktop notification permission and dispatch notification if allowed
 */
export async function sendDesktopNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }

    if (perm === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'habitpulse-reminder',
      });
      return true;
    }
  } catch (err) {
    console.warn('Could not show desktop notification:', err);
  }
  return false;
}

/**
 * Greeting based on current hour
 */
export function getTimeGreeting(
  name: string,
  now: Date = new Date()
): { greeting: string; period: 'morning' | 'noon' | 'evening' | 'night'; periodLabel: string; icon: string } {
  const hour = now.getHours();
  const displayName = name.trim() || 'Champion';

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good morning, ${displayName}`,
      period: 'morning',
      periodLabel: 'Morning Focus',
      icon: '☀️',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good afternoon, ${displayName}`,
      period: 'noon',
      periodLabel: 'Afternoon Momentum',
      icon: '🌤️',
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      greeting: `Good evening, ${displayName}`,
      period: 'evening',
      periodLabel: 'Evening Wind-Down',
      icon: '🌙',
    };
  } else {
    return {
      greeting: `Good night, ${displayName}`,
      period: 'night',
      periodLabel: 'Rest & Recovery',
      icon: '✨',
    };
  }
}

/**
 * Checks if target date matches birthdate (month and day)
 */
export function isBirthdayToday(birthdateStr?: string, targetDate: Date = new Date()): boolean {
  if (!birthdateStr) return false;
  const parts = birthdateStr.split('-');
  if (parts.length !== 3) return false;

  const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
  const birthDay = parseInt(parts[2], 10);

  return targetDate.getMonth() === birthMonth && targetDate.getDate() === birthDay;
}
