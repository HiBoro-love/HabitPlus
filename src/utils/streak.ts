import { Habit, DailyLog, HabitStats, CorrelationInsight } from '../types';
import { formatDateToISO, parseISODate, getRecentDates } from './dateUtils';

/**
 * Calculates current streak and longest streak for a habit.
 * Streak rules:
 * - Walking backward starting from today (or yesterday if today is not completed yet).
 * - If habit is completed on date, streak +1.
 * - If day was frozen (streak freeze applied in dailyLogs), streak continues unbroken!
 * - Once an uncompleted non-frozen day is encountered, current streak stops.
 */
export function calculateHabitStats(
  habit: Habit,
  completions: Record<string, Record<string, boolean>>,
  dailyLogs: Record<string, DailyLog>,
  referenceDateStr: string = formatDateToISO(new Date())
): HabitStats {
  const habitId = habit.id;
  let totalCompletions = 0;

  // Total completions across all logged dates
  for (const dateKey of Object.keys(completions)) {
    if (completions[dateKey]?.[habitId]) {
      totalCompletions++;
    }
  }

  // Calculate current streak
  const refDate = parseISODate(referenceDateStr);
  let currentStreak = 0;
  let checkDate = new Date(refDate);

  // If today isn't completed yet, check if yesterday was done so streak isn't prematurely 0 mid-day
  const todayStr = formatDateToISO(checkDate);
  const isDoneToday = Boolean(completions[todayStr]?.[habitId]);
  const isFrozenToday = Boolean(dailyLogs[todayStr]?.streakFrozen);

  if (!isDoneToday && !isFrozenToday) {
    // Check yesterday
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateToISO(yesterday);
    const isDoneYesterday = Boolean(completions[yesterdayStr]?.[habitId]);
    const isFrozenYesterday = Boolean(dailyLogs[yesterdayStr]?.streakFrozen);

    if (isDoneYesterday || isFrozenYesterday) {
      checkDate = yesterday;
    } else {
      // Streak broken
      currentStreak = 0;
    }
  }

  // Walk backwards from checkDate
  const maxLookback = 365;
  let daysChecked = 0;
  let walkingDate = new Date(checkDate);

  while (daysChecked < maxLookback) {
    const dStr = formatDateToISO(walkingDate);
    const done = Boolean(completions[dStr]?.[habitId]);
    const frozen = Boolean(dailyLogs[dStr]?.streakFrozen);

    if (done || frozen) {
      currentStreak++;
      walkingDate.setDate(walkingDate.getDate() - 1);
      daysChecked++;
    } else {
      break;
    }
  }

  // Calculate Longest Streak in history (over last 90 days of recorded data)
  const historyDates = getRecentDates(90, referenceDateStr);
  let longestStreak = 0;
  let tempStreak = 0;

  for (const dStr of historyDates) {
    const done = Boolean(completions[dStr]?.[habitId]);
    const frozen = Boolean(dailyLogs[dStr]?.streakFrozen);

    if (done || frozen) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Weekly completion rate (last 7 days)
  const last7Days = getRecentDates(7, referenceDateStr);
  let completedInLast7 = 0;
  for (const dStr of last7Days) {
    if (completions[dStr]?.[habitId]) {
      completedInLast7++;
    }
  }
  const weeklyRate = Math.round((completedInLast7 / 7) * 100);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    weeklyRate,
  };
}

/**
 * Calculates overall summary metrics for the top cards:
 * - Total active habits
 * - Current longest streak among all habits
 * - Overall weekly completion rate (%)
 * - Average daily energy score (e.g. 4.2 / 5)
 */
export function calculateOverallMetrics(
  habits: Habit[],
  completions: Record<string, Record<string, boolean>>,
  dailyLogs: Record<string, DailyLog>,
  referenceDateStr: string = formatDateToISO(new Date())
): {
  totalActiveHabits: number;
  maxLongestStreak: number;
  overallWeeklyRate: number;
  averageEnergyScore: number;
  totalLogsCount: number;
} {
  const activeHabits = habits.filter((h) => !h.archived);
  const totalActiveHabits = activeHabits.length;

  let maxLongestStreak = 0;
  for (const habit of activeHabits) {
    const stats = calculateHabitStats(habit, completions, dailyLogs, referenceDateStr);
    if (stats.currentStreak > maxLongestStreak) {
      maxLongestStreak = stats.currentStreak;
    }
  }

  // Last 7 days overall completion rate
  const last7Days = getRecentDates(7, referenceDateStr);
  let totalPossible = last7Days.length * (totalActiveHabits || 1);
  let totalActual = 0;

  for (const dStr of last7Days) {
    for (const habit of activeHabits) {
      if (completions[dStr]?.[habit.id]) {
        totalActual++;
      }
    }
  }

  const overallWeeklyRate = totalActiveHabits === 0 ? 0 : Math.round((totalActual / totalPossible) * 100);

  // Average daily energy score over last 14 days
  const energyDates = getRecentDates(14, referenceDateStr);
  let energySum = 0;
  let energyCount = 0;

  for (const dStr of energyDates) {
    const log = dailyLogs[dStr];
    if (log && typeof log.energyLevel === 'number' && log.energyLevel > 0) {
      energySum += log.energyLevel;
      energyCount++;
    }
  }

  const averageEnergyScore = energyCount === 0 ? 0 : Number((energySum / energyCount).toFixed(1));

  return {
    totalActiveHabits,
    maxLongestStreak,
    overallWeeklyRate,
    averageEnergyScore,
    totalLogsCount: energyCount,
  };
}

/**
 * Calculates correlation between completed habits and daily energy levels.
 * Analyzes days where energy was logged:
 * Compares average energy on days habit was COMPLETED vs NOT COMPLETED.
 */
export function calculateEnergyCorrelations(
  habits: Habit[],
  completions: Record<string, Record<string, boolean>>,
  dailyLogs: Record<string, DailyLog>,
  lookbackDays: number = 30
): CorrelationInsight[] {
  const activeHabits = habits.filter((h) => !h.archived);
  const recentDates = getRecentDates(lookbackDays);
  const datesWithEnergy = recentDates.filter(
    (dStr) => dailyLogs[dStr] && typeof dailyLogs[dStr].energyLevel === 'number' && dailyLogs[dStr].energyLevel! > 0
  );

  if (datesWithEnergy.length < 2) {
    return [];
  }

  const insights: CorrelationInsight[] = [];

  for (const habit of activeHabits) {
    let withSum = 0;
    let withCount = 0;
    let withoutSum = 0;
    let withoutCount = 0;

    for (const dStr of datesWithEnergy) {
      const energy = dailyLogs[dStr].energyLevel!;
      const isDone = Boolean(completions[dStr]?.[habit.id]);

      if (isDone) {
        withSum += energy;
        withCount++;
      } else {
        withoutSum += energy;
        withoutCount++;
      }
    }

    if (withCount > 0) {
      const avgWith = Number((withSum / withCount).toFixed(2));
      const avgWithout = withoutCount > 0 ? Number((withoutSum / withoutCount).toFixed(2)) : avgWith;
      const diff = Number((avgWith - avgWithout).toFixed(2));

      insights.push({
        habitId: habit.id,
        habitName: habit.name,
        category: habit.category,
        avgEnergyWithHabit: avgWith,
        avgEnergyWithoutHabit: avgWithout,
        diff,
        sampleSize: withCount,
      });
    }
  }

  // Sort descending by highest positive difference (energy booster)
  return insights.sort((a, b) => b.diff - a.diff);
}
