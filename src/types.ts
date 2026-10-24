export type HabitCategory = 'health' | 'productivity' | 'mind' | 'fitness' | 'learning' | 'routine';

export type HabitFrequency = 'daily' | 'weekly' | 'weekdays' | 'weekends';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type MoodTag = 'Productive' | 'Focused' | 'Calm' | 'Tired' | 'Stressed' | 'Energetic';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetGoal: string; // e.g., "30 mins", "2 liters", "10 pages"
  timeOfDay: TimeOfDay;
  color: string; // Tailwind color token or hex
  icon: string;
  createdAt: string; // YYYY-MM-DD
  archived?: boolean;
}

export type EventRepetition = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type EventCategory = 'focus' | 'milestone' | 'health' | 'work' | 'personal' | 'celebration';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // Start date YYYY-MM-DD
  time?: string; // e.g. "09:00", "14:30" or "All Day"
  category: EventCategory;
  repetition: EventRepetition;
  color: string;
  createdAt: string;
  completedDates?: Record<string, boolean>; // date -> boolean
  alarmEnabled?: boolean; // triggers audio alarm & notification
  reminderMinutes?: number; // 0, 5, 15, 30, 60 mins before
  isBirthday?: boolean; // special wishing event for user or loved one
}

export interface UserProfile {
  name: string;
  email: string;
  birthdate: string; // YYYY-MM-DD
  avatar: string; // emoji or avatar identifier
  wakeTime?: string; // "06:30"
  primaryGoal?: string; // main focus
  soundEnabled: boolean; // audio alarm chime
  isLoggedIn: boolean;
  memberSince: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'birthday' | 'alarm' | 'event' | 'streak';
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  energyLevel?: number; // 1 to 5
  primaryMood?: MoodTag;
  notes?: string;
  streakFrozen?: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  freezeAvailable: number; // 1 max per week
  lastFreezeWeek: string; // e.g. "2026-W43"
}

export interface AppData {
  profile: UserProfile;
  habits: Habit[];
  events: CalendarEvent[];
  completions: Record<string, Record<string, boolean>>; // date -> habitId -> boolean
  dailyLogs: Record<string, DailyLog>; // date -> DailyLog
  notifications: NotificationItem[];
  settings: AppSettings;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  weeklyRate: number; // 0 to 100
}

export interface CorrelationInsight {
  habitId: string;
  habitName: string;
  category: HabitCategory;
  avgEnergyWithHabit: number;
  avgEnergyWithoutHabit: number;
  diff: number; // positive = boosts energy
  sampleSize: number;
}
