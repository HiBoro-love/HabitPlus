import React from 'react';
import { Plus, Sun, Moon, Flame, Sparkles, Calendar as CalendarIcon, User } from 'lucide-react';
import { UserProfile, NotificationItem, CalendarEvent } from '../types';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  activeTab: 'dashboard' | 'tracker' | 'calendar' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'tracker' | 'calendar' | 'analytics') => void;
  onOpenNewHabit: () => void;
  onOpenNewEvent: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  profile: UserProfile;
  notifications: NotificationItem[];
  events: CalendarEvent[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  longestStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewHabit,
  onOpenNewEvent,
  onOpenSettings,
  onOpenProfile,
  profile,
  notifications,
  events,
  onMarkAllAsRead,
  onClearNotifications,
  theme,
  onToggleTheme,
  longestStreak,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 md:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 to-violet-500/20 text-emerald-500 border border-emerald-500/30 shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-calligraphy whitespace-nowrap">
              HabitPulse
            </span>
          </div>
          {longestStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 pl-2 text-xs font-medium text-amber-600 dark:text-amber-400 border-l border-slate-200/80 dark:border-white/10">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span className="font-mono tabular-nums font-semibold">{longestStreak}d</span>
              <span className="text-slate-400 dark:text-slate-500">streak</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            Checklist
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5 hidden sm:inline" />
            <span>Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            Analytics & Energy
          </button>
        </nav>

        {/* Zone 3: Actions, Reminders, Theme Toggle & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Reminders & Alarms Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            events={events}
            onMarkAllAsRead={onMarkAllAsRead}
            onClearNotifications={onClearNotifications}
          />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl glass-pill text-slate-700 hover:scale-105 active:scale-95 dark:text-slate-200 transition-all duration-200 shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-200" />
            )}
          </button>

          {/* User Profile / Account Trigger */}
          <button
            type="button"
            onClick={onOpenProfile}
            title={`Account: ${profile.name}`}
            className="flex items-center gap-1.5 rounded-xl glass-pill px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all shadow-xs"
          >
            <span className="text-sm">{profile.avatar || '👑'}</span>
            <span className="hidden sm:inline font-calligraphy text-xs font-bold text-slate-900 dark:text-white">
              {profile.name || 'AnshuMan'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden lg:inline-flex px-2.5 py-1.5 text-xs font-medium rounded-xl glass-pill hover:bg-white dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Backup
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenNewEvent}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-600 hover:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40 transition-all whitespace-nowrap"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>+ Event</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewHabit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Habit</span>
              <span className="sm:hidden">Habit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
