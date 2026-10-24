import React, { useState, useEffect } from 'react';
import { X, Sparkles, Target, Clock, Calendar, Check } from 'lucide-react';
import { Habit, HabitCategory, HabitFrequency, TimeOfDay } from '../types';
import { formatDateToISO } from '../utils/dateUtils';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habit: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => void;
  editingHabit?: Habit | null;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  editingHabit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetGoal, setTargetGoal] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [color, setColor] = useState('#10B981'); // Emerald default

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setCategory(editingHabit.category);
      setFrequency(editingHabit.frequency);
      setTargetGoal(editingHabit.targetGoal);
      setTimeOfDay(editingHabit.timeOfDay);
      setColor(editingHabit.color || '#10B981');
    } else {
      setName('');
      setCategory('health');
      setFrequency('daily');
      setTargetGoal('');
      setTimeOfDay('morning');
      setColor('#10B981');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveHabit({
      ...(editingHabit ? { id: editingHabit.id } : {}),
      name: name.trim(),
      category,
      frequency,
      targetGoal: targetGoal.trim() || 'Daily completion',
      timeOfDay,
      color,
      icon: 'sparkles',
    });
    onClose();
  };

  const presetGoals: Record<HabitCategory, string[]> = {
    health: ['1L Water with Electrolytes', 'Take Vitamins', '8 Hours Sleep', 'No Processed Sugar'],
    productivity: ['90 Mins Deep Work', 'Inbox Zero', 'Plan Tomorrow Evening', 'Review Priorities'],
    fitness: ['30 Mins Cardio', '10,000 Steps', 'Weight Training', 'Morning Stretch'],
    mind: ['10 Mins Meditation', 'Read 15 Pages', 'Gratitude Journaling', 'Digital Sunset'],
    learning: ['30 Mins Course / Book', 'Practice Language', 'Read Scientific Paper', 'Flashcards'],
    routine: ['Morning Cold Shower', 'Make Bed', 'Tidy Workspace', 'Evening Reflection'],
  };

  const colorPalette = [
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Violet', hex: '#8B5CF6' },
    { label: 'Cyan', hex: '#06B6D4' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Rose', hex: '#F43F5E' },
    { label: 'Blue', hex: '#3B82F6' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                {editingHabit ? 'Edit Habit Routine' : 'Create New Routine'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define your target goal, category, and daily cadence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Routine Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning 20-min Zone 2 Run"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Time of Day (2-col grid) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 capitalize"
              >
                <option value="health">Health & Hydration</option>
                <option value="productivity">Productivity & Deep Work</option>
                <option value="mind">Mindfulness & Mental Clarity</option>
                <option value="fitness">Fitness & Movement</option>
                <option value="learning">Learning & Knowledge</option>
                <option value="routine">Daily Routine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 capitalize"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cadence / Frequency
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'daily', label: 'Every Day' },
                  { id: 'weekdays', label: 'Mon - Fri' },
                  { id: 'weekends', label: 'Weekends' },
                  { id: 'weekly', label: 'Weekly' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id)}
                  className={`rounded-lg border py-1.5 px-2 text-xs font-medium text-center transition-all ${
                    frequency === f.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/40 dark:text-emerald-400 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Goal & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Specific Target Metric / Goal
            </label>
            <input
              type="text"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. 30 mins, 2 Liters, 1 Session"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            {/* Suggestions */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Suggestions:</span>
              {presetGoals[category]?.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setTargetGoal(suggestion)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Accent Color
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              {colorPalette.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setColor(p.hex)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${
                    color === p.hex ? 'scale-110 ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={p.label}
                >
                  {color === p.hex && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition-all"
            >
              {editingHabit ? 'Save Changes' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
