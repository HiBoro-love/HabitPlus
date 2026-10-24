import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  ShieldAlert,
  Calendar as CalendarIcon,
  Sparkles,
  Smile,
  Battery,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Target,
  Search,
  Repeat,
  ArrowRight,
} from 'lucide-react';
import { Habit, DailyLog, HabitCategory, TimeOfDay, MoodTag, CalendarEvent } from '../types';
import {
  formatDateToISO,
  formatFriendlyDate,
  formatFullDate,
  getWeekDaysFor,
  parseISODate,
  isEventOccurringOnDate,
} from '../utils/dateUtils';
import { calculateHabitStats } from '../utils/streak';

interface HabitTrackerProps {
  habits: Habit[];
  events?: CalendarEvent[];
  completions: Record<string, Record<string, boolean>>;
  dailyLogs: Record<string, DailyLog>;
  freezeAvailable: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
  onUpdateDailyLog: (date: string, partial: Partial<DailyLog>) => void;
  onApplyStreakFreeze: (date: string) => void;
  onOpenNewHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onNavigateToCalendar?: () => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  events = [],
  completions,
  dailyLogs,
  freezeAvailable,
  selectedDate,
  onSelectDate,
  onToggleHabit,
  onUpdateDailyLog,
  onApplyStreakFreeze,
  onOpenNewHabit,
  onEditHabit,
  onDeleteHabit,
  onNavigateToCalendar,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<HabitCategory | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeOfDay | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFreezeModal, setShowFreezeModal] = useState(false);

  const todayStr = formatDateToISO(new Date());
  const isToday = selectedDate === todayStr;
  const currentLog = dailyLogs[selectedDate] || { date: selectedDate };
  const weekDays = getWeekDaysFor(selectedDate);
  const isDateFrozen = Boolean(currentLog.streakFrozen);

  // Events occurring on this selected date
  const eventsForDate = events.filter((ev) => isEventOccurringOnDate(ev, selectedDate));

  // Navigate dates
  const handlePrevDay = () => {
    const d = parseISODate(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(formatDateToISO(d));
  };

  const handleNextDay = () => {
    const d = parseISODate(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(formatDateToISO(d));
  };

  const handleToggle = (habitId: string) => {
    onToggleHabit(habitId, selectedDate);
  };

  // Filter habits
  const filteredHabits = habits.filter((h) => {
    if (h.archived) return false;
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (timeFilter !== 'all' && h.timeOfDay !== timeFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return h.name.toLowerCase().includes(q) || h.targetGoal.toLowerCase().includes(q);
    }
    return true;
  });

  const totalForDate = filteredHabits.length;
  const completedForDate = filteredHabits.filter((h) => completions[selectedDate]?.[h.id]).length;
  const dayProgressPercent = totalForDate > 0 ? Math.round((completedForDate / totalForDate) * 100) : 0;

  const energyLabels: Record<number, string> = {
    1: 'Drained',
    2: 'Low Battery',
    3: 'Balanced',
    4: 'High Energy',
    5: 'Peak Flow',
  };

  const moodList: MoodTag[] = ['Productive', 'Focused', 'Calm', 'Tired', 'Stressed', 'Energetic'];

  return (
    <div className="space-y-6">
      {/* 1. Calendar Header & Date Navigator with Glassmorphism */}
      <div className="rounded-2xl glass-panel p-4 sm:p-6 transition-all duration-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl glass-pill p-1">
              <button
                type="button"
                onClick={handlePrevDay}
                aria-label="Previous Day"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectDate(todayStr)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  isToday
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                aria-label="Next Day"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-calligraphy">
                  {formatFriendlyDate(selectedDate)}
                </h2>
                {isDateFrozen && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Streak Shield Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFullDate(selectedDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick date picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="h-8 rounded-xl glass-pill px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            {/* Streak Freeze Trigger */}
            <button
              type="button"
              onClick={() => setShowFreezeModal(true)}
              disabled={isDateFrozen || (freezeAvailable <= 0 && !isDateFrozen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                isDateFrozen
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 cursor-default'
                  : freezeAvailable > 0
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-400 shadow-xs'
                  : 'border-slate-200 text-slate-400 dark:border-white/5 dark:text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              title="Saves your streak once a week if you missed a day"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>
                {isDateFrozen
                  ? 'Shield Active'
                  : freezeAvailable > 0
                  ? 'Streak Freeze (1 available)'
                  : 'Freeze Used this week'}
              </span>
            </button>
          </div>
        </div>

        {/* 7-Day Week Strip */}
        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
          {weekDays.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            const logForD = dailyLogs[d.dateStr];
            const isFrozen = Boolean(logForD?.streakFrozen);

            const completedCount = habits.filter((h) => !h.archived && completions[d.dateStr]?.[h.id]).length;
            const hasActivity = completedCount > 0;
            const allDone = completedCount >= habits.filter((h) => !h.archived).length && habits.length > 0;

            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => onSelectDate(d.dateStr)}
                className={`flex flex-col items-center justify-center rounded-xl py-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider">{d.dayName}</span>
                <span className="text-sm sm:text-base font-mono tabular-nums">{d.dayNumber}</span>
                <div className="mt-1 flex items-center gap-0.5 h-1.5">
                  {isFrozen ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  ) : allDone ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ) : hasActivity ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* If recurring events are scheduled for today, show quick integrated banner */}
        {eventsForDate.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-violet-500" />
              <span>Events Today ({eventsForDate.length}):</span>
            </span>
            {eventsForDate.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${ev.color}15`,
                  color: ev.color,
                  border: `1px solid ${ev.color}30`,
                }}
              >
                {ev.repetition !== 'none' && <Repeat className="h-3 w-3" />}
                <span>{ev.title}</span>
                <span className="text-[10px] opacity-75">({ev.time})</span>
              </div>
            ))}
            {onNavigateToCalendar && (
              <button
                type="button"
                onClick={onNavigateToCalendar}
                className="ml-auto text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Energy & Mood Check-In Card with Glassmorphism */}
      <div className="rounded-2xl glass-panel p-4 sm:p-6 transition-all duration-300">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20 shadow-xs">
              <Battery className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                Daily Energy & Mood Check-In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log vitality for {formatFriendlyDate(selectedDate)} to power statistical correlation insights
              </p>
            </div>
          </div>

          {/* Energy Rating Scale (1 to 5) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const isActive = currentLog.energyLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onUpdateDailyLog(selectedDate, { energyLevel: lvl })}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 scale-105'
                      : 'glass-pill text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono tabular-nums font-bold">{lvl}</span>
                  <span className="hidden sm:inline text-[11px] opacity-90">{energyLabels[lvl]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Mood & Quick Note */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 pt-3 border-t border-slate-200/60 dark:border-white/10">
          <div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Primary Mental State / Mood
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {moodList.map((m) => {
                const isSelected = currentLog.primaryMood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onUpdateDailyLog(selectedDate, { primaryMood: m })}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'glass-pill text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Daily Reflection Note (Optional)
            </span>
            <input
              type="text"
              value={currentLog.notes || ''}
              onChange={(e) => onUpdateDailyLog(selectedDate, { notes: e.target.value })}
              placeholder="e.g. Deep sleep last night, great stamina after morning cardio..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 p-1 glass-pill rounded-xl">
          {(['all', 'health', 'productivity', 'fitness', 'mind'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="h-8 w-full rounded-xl border border-slate-200 bg-white/80 pl-8 pr-2.5 text-xs text-slate-700 placeholder-slate-400 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeOfDay | 'all')}
            className="h-8 rounded-xl border border-slate-200 bg-white/80 px-2.5 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Anytime</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>

      {/* 4. Habit List Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Routines for {formatFriendlyDate(selectedDate)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {completedForDate} of {totalForDate} completed ({dayProgressPercent}%)
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenNewHabit}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Routine</span>
          </button>
        </div>

        {/* 100% Completion Celebration Banner */}
        {dayProgressPercent === 100 && totalForDate > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl glass-card p-3.5 border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-xs shadow-xs">
                ✓
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  All Daily Routines Completed!
                </h4>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                  Every habit checked off. Daily streak compounding with excellence!
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              100% DONE
            </span>
          </div>
        )}

        {filteredHabits.length === 0 ? (
          <div className="rounded-2xl glass-panel p-8 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-400" />
            <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
              No habits found
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || timeFilter !== 'all'
                ? 'Try clearing your filters or search query to see your full daily checklist.'
                : 'Start tracking your daily routines to boost energy and build compounding streaks.'}
            </p>
            <button
              type="button"
              onClick={onOpenNewHabit}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Routine</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredHabits.map((habit) => {
                const isCompleted = Boolean(completions[selectedDate]?.[habit.id]);
                const stats = calculateHabitStats(habit, completions, dailyLogs, selectedDate);

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className={`group flex items-center justify-between gap-3 rounded-2xl glass-card p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                      isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/[0.04] dark:border-emerald-500/30 dark:bg-emerald-500/[0.05]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkmark button */}
                      <button
                        type="button"
                        onClick={() => handleToggle(habit.id)}
                        aria-label={`Toggle ${habit.name}`}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                            : 'border-slate-300 bg-white/80 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-900/60'
                        }`}
                      >
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0.5, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </motion.div>
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isCompleted
                                ? 'text-slate-800 line-through decoration-emerald-500/60 dark:text-slate-200'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {habit.name}
                          </span>
                        </div>

                        {/* Unboxed metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="capitalize">{habit.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="capitalize">{habit.timeOfDay}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{habit.targetGoal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Streak & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium border ${
                          stats.currentStreak > 0
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'border-slate-200/80 text-slate-400 dark:border-white/5 dark:text-slate-500'
                        }`}
                        title={`Current streak: ${stats.currentStreak} days | Longest: ${stats.longestStreak} days`}
                      >
                        <Flame
                          className={`h-3.5 w-3.5 ${
                            stats.currentStreak > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <span className="font-mono tabular-nums font-semibold">{stats.currentStreak}d</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onEditHabit(habit)}
                        aria-label="Edit Habit"
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteHabit(habit.id)}
                        aria-label="Delete Habit"
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Streak Freeze Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 shadow-2xl transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white font-calligraphy">
              Streak Freeze Protection
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Streak Freeze acts as an emergency shield for missed days. It prevents your hard-earned habit streaks from resetting back to zero when life gets in the way.
            </p>

            <div className="mt-4 rounded-xl bg-slate-100/60 p-3 text-xs dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-400">Available this week:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {freezeAvailable} of 1
                </span>
              </div>
              <div className="mt-1 flex justify-between font-medium">
                <span className="text-slate-600 dark:text-slate-400">Selected date:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {formatFriendlyDate(selectedDate)} ({selectedDate})
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={freezeAvailable <= 0 || isDateFrozen}
                onClick={() => {
                  onApplyStreakFreeze(selectedDate);
                  setShowFreezeModal(false);
                }}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-cyan-500 disabled:opacity-50 transition-colors"
              >
                {isDateFrozen ? 'Shield Already Active' : 'Activate Freeze Shield'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
