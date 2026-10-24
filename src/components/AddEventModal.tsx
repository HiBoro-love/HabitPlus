import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Repeat, Sparkles, Check, Bell, Volume2, Cake } from 'lucide-react';
import { CalendarEvent, EventRepetition, EventCategory } from '../types';
import { formatDateToISO } from '../utils/dateUtils';
import { playNotificationChime } from '../utils/audioAlarm';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }) => void;
  editingEvent?: CalendarEvent | null;
  initialDate?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent,
  editingEvent,
  initialDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate || formatDateToISO(new Date()));
  const [time, setTime] = useState('09:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [repetition, setRepetition] = useState<EventRepetition>('weekly');
  const [category, setCategory] = useState<EventCategory>('focus');
  const [color, setColor] = useState('#8B5CF6');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setDate(editingEvent.date);
      if (editingEvent.time === 'All Day') {
        setIsAllDay(true);
        setTime('09:00');
      } else {
        setIsAllDay(false);
        setTime(editingEvent.time || '09:00');
      }
      setRepetition(editingEvent.repetition);
      setCategory(editingEvent.category);
      setColor(editingEvent.color || '#8B5CF6');
      setAlarmEnabled(editingEvent.alarmEnabled ?? true);
      setReminderMinutes(editingEvent.reminderMinutes ?? 15);
      setIsBirthday(editingEvent.isBirthday ?? false);
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate || formatDateToISO(new Date()));
      setTime('09:00');
      setIsAllDay(false);
      setRepetition('weekly');
      setCategory('focus');
      setColor('#8B5CF6');
      setAlarmEnabled(true);
      setReminderMinutes(15);
      setIsBirthday(false);
    }
  }, [editingEvent, isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveEvent({
      ...(editingEvent ? { id: editingEvent.id } : {}),
      title: title.trim(),
      description: description.trim(),
      date,
      time: isAllDay ? 'All Day' : time,
      category,
      repetition,
      color,
      alarmEnabled,
      reminderMinutes,
      isBirthday,
    });
    onClose();
  };

  const repetitionOptions: { id: EventRepetition; label: string; desc: string }[] = [
    { id: 'none', label: 'One-time', desc: 'Does not repeat' },
    { id: 'daily', label: 'Daily', desc: 'Every day' },
    { id: 'weekly', label: 'Weekly', desc: 'Same day each week' },
    { id: 'monthly', label: 'Monthly', desc: 'Same date each month' },
    { id: 'yearly', label: 'Yearly', desc: 'Annual milestone' },
  ];

  const colorPalette = [
    { label: 'Violet', hex: '#8B5CF6' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Cyan', hex: '#06B6D4' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Rose', hex: '#F43F5E' },
    { label: 'Indigo', hex: '#6366F1' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20 shadow-xs">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                {editingEvent ? 'Edit Calendar Event' : 'Schedule Event & Reminder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plan recurring events with audio alarm chime and reminder alerts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Strategy Sync, Friend's Birthday, Team Standup"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Birthday Wishing Flag Toggle */}
          <div className="flex items-center justify-between rounded-xl p-3 border border-pink-500/20 bg-pink-500/5 dark:bg-pink-500/10">
            <div className="flex items-center gap-2">
              <Cake className="h-4 w-4 text-pink-500" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Birthday / Milestone Wishing Event
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Plays celebration fanfare & triggers special wishing banner
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isBirthday}
              onChange={(e) => {
                setIsBirthday(e.target.checked);
                if (e.target.checked) {
                  setCategory('celebration');
                  setColor('#EC4899');
                  setRepetition('yearly');
                }
              }}
              className="h-4 w-4 rounded text-pink-600 focus:ring-pink-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Start Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-950/70 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Time
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span>All Day</span>
                </label>
              </div>
              <input
                type="time"
                disabled={isAllDay}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-950/70 dark:text-white disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Alarm & Reminder Option */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-white/10 dark:bg-slate-950/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Audio Alarm & Reminder Alert
                </span>
              </div>
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={(e) => setAlarmEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
              />
            </div>

            {alarmEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Alert Lead Time:
                </span>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value={0}>At time of event</option>
                  <option value={5}>5 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>
            )}
          </div>

          {/* Cycle Repetition Option */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Repeat className="h-3.5 w-3.5 text-violet-500" />
              <span>Cycle Repetition Pattern</span>
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {repetitionOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRepetition(opt.id)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                    repetition === opt.id
                      ? 'border-violet-500 bg-violet-500/10 dark:border-violet-400/50 dark:bg-violet-500/20 shadow-xs'
                      : 'border-slate-200 bg-white/50 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      repetition === opt.id
                        ? 'text-violet-700 dark:text-violet-300'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-800 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 capitalize"
              >
                <option value="focus">Focus & Deep Work</option>
                <option value="milestone">Milestone & Goals</option>
                <option value="celebration">Celebration & Birthday</option>
                <option value="health">Health & Bio-Routine</option>
                <option value="work">Work & Professional</option>
                <option value="personal">Personal & Life</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Accent Glow
              </label>
              <div className="mt-2 flex items-center gap-2">
                {colorPalette.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => setColor(p.hex)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform ${
                      color === p.hex
                        ? 'scale-110 ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-slate-900'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: p.hex }}
                    title={p.label}
                  >
                    {color === p.hex && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Key agenda items, preparation protocol, reminder note..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 active:scale-95 transition-all"
            >
              {editingEvent ? 'Save Changes' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
