import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Repeat,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Target,
} from 'lucide-react';
import { CalendarEvent, Habit, EventRepetition } from '../types';
import {
  formatDateToISO,
  formatFriendlyDate,
  formatFullDate,
  getMonthCalendarDays,
  formatMonthName,
  isEventOccurringOnDate,
  parseISODate,
} from '../utils/dateUtils';

interface CalendarViewProps {
  events: CalendarEvent[];
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenNewEvent: (date?: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleEventCompleted: (eventId: string, date: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  habits,
  completions,
  selectedDate,
  onSelectDate,
  onOpenNewEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleEventCompleted,
  onToggleHabit,
}) => {
  const selectedDateObj = parseISODate(selectedDate);
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth());

  const todayStr = formatDateToISO(new Date());
  const monthDays = getMonthCalendarDays(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate(todayStr);
  };

  // Find all events occurring on the currently selected date
  const selectedDateEvents = events.filter((ev) => isEventOccurringOnDate(ev, selectedDate));

  // Find habits completed on selected date
  const activeHabits = habits.filter((h) => !h.archived);
  const completedHabitsCount = activeHabits.filter((h) => completions[selectedDate]?.[h.id]).length;

  const repetitionBadgeLabels: Record<EventRepetition, string> = {
    none: 'One-Time Event',
    daily: 'Repeats Daily',
    weekly: 'Repeats Weekly',
    monthly: 'Repeats Monthly',
    yearly: 'Repeats Yearly',
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header with Glassmorphism */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 transition-all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-calligraphy">
                {formatMonthName(viewYear, viewMonth)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synchronized routine tracker & recurring event scheduler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl glass-pill p-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenNewEvent(selectedDate)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-violet-500 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid & Side Schedule Split */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Month Grid (7 cols) */}
          <div className="lg:col-span-8">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {monthDays.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                const occurringEvents = events.filter((ev) => isEventOccurringOnDate(ev, cell.dateStr));
                const habitsCompletedForCell = activeHabits.filter(
                  (h) => completions[cell.dateStr]?.[h.id]
                ).length;

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => onSelectDate(cell.dateStr)}
                    className={`group relative flex min-h-[72px] sm:min-h-[84px] flex-col justify-between rounded-xl p-2 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-2 border-violet-500 bg-violet-500/10 dark:border-violet-400 dark:bg-violet-500/20 shadow-md ring-2 ring-violet-500/20'
                        : cell.isCurrentMonth
                        ? 'border border-slate-200/70 bg-white/60 hover:bg-white hover:border-slate-300 dark:border-white/5 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 dark:hover:border-white/20'
                        : 'border border-transparent bg-slate-100/40 text-slate-400 dark:bg-slate-950/20 dark:text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-medium ${
                          cell.isToday
                            ? 'flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white font-bold'
                            : isSelected
                            ? 'font-bold text-violet-600 dark:text-violet-300'
                            : cell.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Small habit count indicator */}
                      {habitsCompletedForCell > 0 && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {habitsCompletedForCell}✓
                        </span>
                      )}
                    </div>

                    {/* Events indicators in cell */}
                    <div className="mt-1 flex flex-col gap-1 w-full overflow-hidden">
                      {occurringEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate leading-tight font-medium"
                          style={{
                            backgroundColor: `${ev.color}18`,
                            color: ev.color,
                            borderLeft: `2px solid ${ev.color}`,
                          }}
                        >
                          {ev.repetition !== 'none' && <Repeat className="h-2.5 w-2.5 shrink-0" />}
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {occurringEvents.length > 2 && (
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 pl-1 font-mono">
                          +{occurringEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Schedule View for Selected Date (4 cols) */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 dark:border-white/10 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
            <div className="border-b border-slate-200/60 pb-3 dark:border-white/10">
              <span className="text-[11px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Schedule Focus
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-calligraphy mt-0.5">
                {formatFriendlyDate(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFullDate(selectedDate)}
              </p>
            </div>

            {/* Recurring & Scheduled Events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Events ({selectedDateEvents.length})
                </span>
                <button
                  type="button"
                  onClick={() => onOpenNewEvent(selectedDate)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Event</span>
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                  No events on this date. Click "+ Add Event" to schedule with daily, weekly, monthly, or yearly cycle repetition.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedDateEvents.map((ev) => {
                    const isDone = Boolean(ev.completedDates?.[selectedDate]);

                    return (
                      <div
                        key={ev.id}
                        className="group flex flex-col gap-1.5 rounded-xl border p-3 transition-all border-slate-200/70 bg-white/80 hover:border-slate-300 dark:border-white/5 dark:bg-slate-950/40 dark:hover:border-white/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleEventCompleted(ev.id, selectedDate)}
                              aria-label="Toggle Event Completed"
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                isDone
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-slate-300 hover:border-emerald-500 dark:border-slate-700'
                              }`}
                            >
                              {isDone && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>
                            <span
                              className={`text-xs font-semibold ${
                                isDone
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {ev.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEditEvent(ev)}
                              aria-label="Edit Event"
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(ev.id)}
                              aria-label="Delete Event"
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pl-6">
                            {ev.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 pl-6 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{ev.time}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                            {ev.repetition !== 'none' && <Repeat className="h-3 w-3" />}
                            <span>{repetitionBadgeLabels[ev.repetition]}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Daily Habits Summary for this date */}
            <div className="border-t border-slate-200/60 pt-3 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Daily Routines ({completedHabitsCount}/{activeHabits.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeHabits.map((habit) => {
                  const isDone = Boolean(completions[selectedDate]?.[habit.id]);
                  return (
                    <div
                      key={habit.id}
                      onClick={() => onToggleHabit(habit.id, selectedDate)}
                      className={`flex items-center justify-between rounded-lg p-2 text-xs cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`h-2 w-2 rounded-full`}
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className={`truncate ${isDone ? 'line-through opacity-80' : ''}`}>
                          {habit.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] tabular-nums shrink-0">
                        {isDone ? 'Completed' : habit.timeOfDay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
