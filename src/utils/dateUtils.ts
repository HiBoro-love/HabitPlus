import { CalendarEvent } from '../types';

/**
 * Date utility helpers for HabitPulse
 */

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatFriendlyDate(dateStr: string): string {
  const target = parseISODate(dateStr);
  const today = new Date();
  const todayStr = formatDateToISO(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterday);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateToISO(tomorrow);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  if (dateStr === tomorrowStr) return 'Tomorrow';

  return target.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateStr: string): string {
  const target = parseISODate(dateStr);
  return target.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getWeekDaysFor(currentDateStr: string): { dateStr: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const curr = parseISODate(currentDateStr);
  // Get Monday of this week (1 = Mon, ..., 0 = Sun)
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr);
  monday.setDate(diffToMonday);

  const todayStr = formatDateToISO(new Date());
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDateToISO(d);
    days.push({
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function getRecentDates(count: number, upToDateStr: string = formatDateToISO(new Date())): string[] {
  const end = parseISODate(upToDateStr);
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(formatDateToISO(d));
  }
  return dates;
}

export function getISOWeekString(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Checks if a calendar event recurs on the given target date
 */
export function isEventOccurringOnDate(event: CalendarEvent, targetDateStr: string): boolean {
  if (targetDateStr < event.date) {
    return false; // Event has not started yet
  }

  if (event.repetition === 'none') {
    return event.date === targetDateStr;
  }

  const startDate = parseISODate(event.date);
  const targetDate = parseISODate(targetDateStr);

  if (event.repetition === 'daily') {
    return true;
  }

  if (event.repetition === 'weekly') {
    return targetDate.getDay() === startDate.getDay();
  }

  if (event.repetition === 'monthly') {
    return targetDate.getDate() === startDate.getDate();
  }

  if (event.repetition === 'yearly') {
    return (
      targetDate.getMonth() === startDate.getMonth() &&
      targetDate.getDate() === startDate.getDate()
    );
  }

  return false;
}

/**
 * Generates a standard 35 or 42 grid of days for a monthly calendar view
 */
export function getMonthCalendarDays(year: number, month: number): {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Align to Monday as 1st col (0 = Sunday in JS, so convert Monday -> 0, Sunday -> 6)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const todayStr = formatDateToISO(new Date());

  const days = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, month - 1, dayNum);
    const dateStr = formatDateToISO(d);
    days.push({
      dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const curr = new Date(year, month, d);
    const dateStr = formatDateToISO(curr);
    days.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete grid (multiples of 7, up to 35 or 42)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextD = new Date(year, month + 1, i);
    const dateStr = formatDateToISO(nextD);
    days.push({
      dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function formatMonthName(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
