import { AppData, Habit, DailyLog, AppSettings, MoodTag, CalendarEvent, UserProfile, NotificationItem } from '../types';
import { formatDateToISO, getISOWeekString, getRecentDates } from './dateUtils';

const STORAGE_KEY = 'habitpulse_data_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'AnshuMan',
  email: 'guptaanshuman01102006@gmail.com',
  birthdate: '2006-10-24', // Tomorrow is his birthday!
  avatar: '👑',
  wakeTime: '06:30',
  primaryGoal: 'Build unbreakable momentum, peak physical energy & elite focus',
  soundEnabled: true,
  isLoggedIn: true,
  memberSince: 'October 2026',
};

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to HabitPulse, AnshuMan!',
    message: 'Your personal daily routine, alarms & energy correlation platform is active.',
    type: 'event',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Reminder & Alarm Chime Configured',
    message: 'Audio alarm tones and desktop notifications are armed for upcoming routines and events.',
    type: 'alarm',
    timestamp: '1 hour ago',
    read: false,
  },
];

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Hydration',
    category: 'health',
    frequency: 'daily',
    targetGoal: '1L filtered water with electrolytes',
    timeOfDay: 'morning',
    color: '#06B6D4',
    icon: 'droplets',
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-2',
    name: 'Deep Work Sprint',
    category: 'productivity',
    frequency: 'daily',
    targetGoal: '90 mins focused coding / writing',
    timeOfDay: 'morning',
    color: '#8B5CF6',
    icon: 'zap',
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-3',
    name: 'Cardio & Strength',
    category: 'fitness',
    frequency: 'daily',
    targetGoal: '30 mins zone-2 cardio or lifting',
    timeOfDay: 'afternoon',
    color: '#10B981',
    icon: 'activity',
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-4',
    name: 'Mindful Breathing',
    category: 'mind',
    frequency: 'daily',
    targetGoal: '10 mins box breathing or calm',
    timeOfDay: 'evening',
    color: '#F59E0B',
    icon: 'sun',
    createdAt: '2026-10-01',
  },
  {
    id: 'habit-5',
    name: 'Evening Screen Sunset',
    category: 'mind',
    frequency: 'daily',
    targetGoal: '30 mins book reading before bed',
    timeOfDay: 'evening',
    color: '#EC4899',
    icon: 'moon',
    createdAt: '2026-10-01',
  },
];

export const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Weekly Strategy & Habit Review',
    description: 'Analyze weekly streak metrics and energy drivers for the week ahead.',
    date: '2026-10-05',
    time: '09:00',
    category: 'focus',
    repetition: 'weekly',
    color: '#8B5CF6',
    alarmEnabled: true,
    reminderMinutes: 15,
    createdAt: '2026-10-01',
  },
  {
    id: 'event-2',
    title: 'Morning Sun Exposure Protocol',
    description: '15-minute outdoor morning sunlight to anchor circadian rhythm.',
    date: '2026-10-01',
    time: '07:30',
    category: 'health',
    repetition: 'daily',
    color: '#10B981',
    alarmEnabled: true,
    reminderMinutes: 5,
    createdAt: '2026-10-01',
  },
  {
    id: 'event-3',
    title: "AnshuMan's Birthday Celebration 🎂",
    description: 'Special annual milestone! Celebrate health, growth, and extraordinary achievements.',
    date: '2026-10-24',
    time: 'All Day',
    category: 'celebration',
    repetition: 'yearly',
    color: '#EC4899',
    alarmEnabled: true,
    isBirthday: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'event-4',
    title: 'Monthly Life & Goal Milestone',
    description: 'Comprehensive review of health biomarkers, habit adherence, and targets.',
    date: '2026-10-01',
    time: '18:00',
    category: 'milestone',
    repetition: 'monthly',
    color: '#F59E0B',
    alarmEnabled: true,
    reminderMinutes: 30,
    createdAt: '2026-10-01',
  },
];

export function getInitialSettings(): AppSettings {
  const currentWeek = getISOWeekString(new Date());
  return {
    theme: 'dark',
    freezeAvailable: 1,
    lastFreezeWeek: currentWeek,
  };
}

export function generateSampleData(): AppData {
  const currentWeek = getISOWeekString(new Date());
  const habits = [...DEFAULT_HABITS];
  const events = [...DEFAULT_EVENTS];
  const profile = { ...DEFAULT_PROFILE };
  const notifications = [...DEFAULT_NOTIFICATIONS];
  const completions: Record<string, Record<string, boolean>> = {};
  const dailyLogs: Record<string, DailyLog> = {};

  const recentDates = getRecentDates(14);
  const moods: MoodTag[] = ['Productive', 'Focused', 'Calm', 'Energetic', 'Tired'];

  recentDates.forEach((dateStr, idx) => {
    completions[dateStr] = {};

    const isCompleted1 = idx !== 4 && idx !== 9;
    const isCompleted2 = idx !== 1 && idx !== 6 && idx !== 13;
    const isCompleted3 = idx % 2 === 0;
    const isCompleted4 = idx !== 7;
    const isCompleted5 = idx % 3 !== 0;

    completions[dateStr]['habit-1'] = isCompleted1;
    completions[dateStr]['habit-2'] = isCompleted2;
    completions[dateStr]['habit-3'] = isCompleted3;
    completions[dateStr]['habit-4'] = isCompleted4;
    completions[dateStr]['habit-5'] = isCompleted5;

    let baseEnergy = 2.5;
    if (isCompleted1) baseEnergy += 0.5;
    if (isCompleted2) baseEnergy += 0.6;
    if (isCompleted3) baseEnergy += 0.8;
    if (isCompleted4) baseEnergy += 0.4;
    const finalEnergy = Math.min(5, Math.max(1, Math.round(baseEnergy)));

    const moodIndex = finalEnergy >= 4 ? (idx % 2 === 0 ? 0 : 1) : finalEnergy === 3 ? 2 : 4;

    dailyLogs[dateStr] = {
      date: dateStr,
      energyLevel: finalEnergy,
      primaryMood: moods[moodIndex],
      notes: idx === 13 ? 'Crushed the morning deep work sprint!' : undefined,
      streakFrozen: idx === 9,
    };
  });

  return {
    profile,
    habits,
    events,
    completions,
    dailyLogs,
    notifications,
    settings: {
      theme: 'dark',
      freezeAvailable: 1,
      lastFreezeWeek: currentWeek,
    },
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSampleData();
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppData;

    if (!parsed.profile || typeof parsed.profile !== 'object') {
      parsed.profile = DEFAULT_PROFILE;
    }
    if (!parsed.habits || !Array.isArray(parsed.habits)) {
      parsed.habits = DEFAULT_HABITS;
    }
    if (!parsed.events || !Array.isArray(parsed.events)) {
      parsed.events = DEFAULT_EVENTS;
    }
    if (!parsed.notifications || !Array.isArray(parsed.notifications)) {
      parsed.notifications = DEFAULT_NOTIFICATIONS;
    }
    if (!parsed.completions || typeof parsed.completions !== 'object') {
      parsed.completions = {};
    }
    if (!parsed.dailyLogs || typeof parsed.dailyLogs !== 'object') {
      parsed.dailyLogs = {};
    }
    if (!parsed.settings) {
      parsed.settings = getInitialSettings();
    }

    const currentWeek = getISOWeekString(new Date());
    if (parsed.settings.lastFreezeWeek !== currentWeek) {
      parsed.settings.freezeAvailable = 1;
      parsed.settings.lastFreezeWeek = currentWeek;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to load HabitPulse data, generating fallback:', err);
    return generateSampleData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save HabitPulse data to localStorage:', err);
  }
}

export function exportDataAsJSON(data: AppData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const todayStr = formatDateToISO(new Date());
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `habitpulse-backup-${todayStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseImportJSON(jsonText: string): AppData {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON format');
  }
  if (!Array.isArray(parsed.habits)) {
    throw new Error('Missing "habits" array in JSON');
  }
  return {
    profile: parsed.profile || DEFAULT_PROFILE,
    habits: parsed.habits,
    events: Array.isArray(parsed.events) ? parsed.events : DEFAULT_EVENTS,
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : DEFAULT_NOTIFICATIONS,
    completions: parsed.completions || {},
    dailyLogs: parsed.dailyLogs || {},
    settings: parsed.settings || getInitialSettings(),
  };
}
