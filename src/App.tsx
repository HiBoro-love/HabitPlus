/**
 * HabitPulse - Modern Daily Routine & Energy Tracker
 * Linear / Vercel-inspired aesthetic, Dark Mode (default) & Light Mode
 * Designed & Engineered with precision for AnshuMan
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { HabitTracker } from './components/HabitTracker';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddHabitModal } from './components/AddHabitModal';
import { AddEventModal } from './components/AddEventModal';
import { ProfileModal } from './components/ProfileModal';
import { BirthdayWishingModal } from './components/BirthdayWishingModal';
import { SettingsModal } from './components/SettingsModal';
import {
  AppData,
  Habit,
  CalendarEvent,
  DailyLog,
  UserProfile,
  NotificationItem,
} from './types';
import {
  loadAppData,
  saveAppData,
  generateSampleData,
  DEFAULT_HABITS,
  DEFAULT_EVENTS,
  DEFAULT_PROFILE,
  DEFAULT_NOTIFICATIONS,
  getInitialSettings,
} from './utils/storage';
import {
  calculateOverallMetrics,
  calculateEnergyCorrelations,
} from './utils/streak';
import {
  formatDateToISO,
  isEventOccurringOnDate,
} from './utils/dateUtils';
import {
  getTimeGreeting,
  isBirthdayToday,
  playNotificationChime,
  playAlarmAlertSound,
  sendDesktopNotification,
} from './utils/audioAlarm';
import {
  triggerLastHabitCelebration,
  triggerSingleHabitMicroBurst,
} from './utils/confettiCelebration';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Flame,
  ShieldCheck,
  Calendar as CalendarIcon,
  Cake,
  Volume2,
} from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'calendar' | 'analytics'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateToISO(new Date()));
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventInitialDate, setEventInitialDate] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [birthdayEventTitle, setBirthdayEventTitle] = useState<string | undefined>(undefined);
  const [activeAlarmAlert, setActiveAlarmAlert] = useState<{ title: string; time: string } | null>(null);

  const alarmedEventsRef = useRef<Set<string>>(new Set());

  // Sync theme with document element
  const theme = appData.settings?.theme || 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  // Save to LocalStorage on every state update
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Check for Birthday on mount or date change
  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateToISO(today);

    // Check if user's birthday
    const isUserBday = isBirthdayToday(appData.profile.birthdate, today);

    // Check if any calendar event on today is a birthday event
    const bdayEvent = (appData.events || []).find(
      (ev) => ev.isBirthday && isEventOccurringOnDate(ev, todayStr)
    );

    if (isUserBday || bdayEvent) {
      setBirthdayEventTitle(bdayEvent?.title);
      // Auto open birthday modal once per session
      const sessionKey = `bday_celebrated_${todayStr}`;
      if (!sessionStorage.getItem(sessionKey)) {
        setIsBirthdayModalOpen(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [appData.profile.birthdate, appData.events]);

  // Background Alarm Checker (runs every 25 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = formatDateToISO(now);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      (appData.events || []).forEach((ev) => {
        if (!ev.alarmEnabled || !isEventOccurringOnDate(ev, todayStr)) return;
        if (!ev.time || ev.time === 'All Day') return;

        const [evH, evM] = ev.time.split(':').map(Number);
        if (isNaN(evH) || isNaN(evM)) return;

        const eventTimeInMinutes = evH * 60 + evM;
        const lead = ev.reminderMinutes ?? 0;
        const triggerTimeInMinutes = eventTimeInMinutes - lead;

        const alarmKey = `${ev.id}_${todayStr}_${triggerTimeInMinutes}`;

        // If trigger time matches within 1 minute window and hasn't alarmed yet today
        if (
          Math.abs(currentTimeInMinutes - triggerTimeInMinutes) <= 1 &&
          !alarmedEventsRef.current.has(alarmKey)
        ) {
          alarmedEventsRef.current.add(alarmKey);

          // Play audio chime if sound is enabled
          if (appData.profile.soundEnabled) {
            playAlarmAlertSound();
          }

          // Desktop notification
          sendDesktopNotification(
            `Reminder: ${ev.title}`,
            lead > 0 ? `Starts in ${lead} minutes at ${ev.time}` : `Happening now at ${ev.time}`
          );

          // In-app alert banner
          setActiveAlarmAlert({ title: ev.title, time: ev.time });
          setTimeout(() => setActiveAlarmAlert(null), 8000);

          // Add to notifications
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: `Alarm: ${ev.title}`,
            message:
              lead > 0
                ? `Event reminder triggered ${lead}m ahead of scheduled time (${ev.time}).`
                : `Event alert triggered at ${ev.time}.`,
            type: 'alarm',
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            eventId: ev.id,
          };

          setAppData((prev) => ({
            ...prev,
            notifications: [newNotif, ...(prev.notifications || [])].slice(0, 30),
          }));
        }
      });
    }, 25000);

    return () => clearInterval(interval);
  }, [appData.events, appData.profile.soundEnabled]);

  // Overall stats
  const overallMetrics = calculateOverallMetrics(
    appData.habits,
    appData.completions,
    appData.dailyLogs,
    formatDateToISO(new Date())
  );

  // Toggle Dark / Light Theme
  const handleToggleTheme = () => {
    setAppData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  // Toggle habit completion on a specific date
  const handleToggleHabit = useCallback((habitId: string, date: string) => {
    setAppData((prev) => {
      const activeHabitsList = prev.habits.filter((h) => !h.archived);
      const dayCompletions = { ...(prev.completions[date] || {}) };
      const wasCompleted = Boolean(dayCompletions[habitId]);
      const willBeCompleted = !wasCompleted;

      dayCompletions[habitId] = willBeCompleted;

      // Check if user is completing their last remaining habit for the day
      if (willBeCompleted) {
        const completedCount = activeHabitsList.filter((h) => dayCompletions[h.id]).length;
        const isLastRemaining = completedCount === activeHabitsList.length && activeHabitsList.length > 0;

        if (isLastRemaining) {
          triggerLastHabitCelebration();
        } else {
          triggerSingleHabitMicroBurst();
        }
      }

      return {
        ...prev,
        completions: {
          ...prev.completions,
          [date]: dayCompletions,
        },
      };
    });
  }, []);

  // Update daily energy & mood log
  const handleUpdateDailyLog = useCallback((date: string, partial: Partial<DailyLog>) => {
    setAppData((prev) => {
      const existing = prev.dailyLogs[date] || { date };
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [date]: {
            ...existing,
            ...partial,
          },
        },
      };
    });
  }, []);

  // Apply Streak Freeze
  const handleApplyStreakFreeze = useCallback((date: string) => {
    setAppData((prev) => {
      if (prev.settings.freezeAvailable <= 0) return prev;

      const existingLog = prev.dailyLogs[date] || { date };
      return {
        ...prev,
        settings: {
          ...prev.settings,
          freezeAvailable: Math.max(0, prev.settings.freezeAvailable - 1),
        },
        dailyLogs: {
          ...prev.dailyLogs,
          [date]: {
            ...existingLog,
            streakFrozen: true,
          },
        },
      };
    });
  }, []);

  // Save habit (create or edit)
  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt'> & { id?: string }) => {
    setAppData((prev) => {
      if (habitData.id) {
        return {
          ...prev,
          habits: prev.habits.map((h) =>
            h.id === habitData.id
              ? { ...h, ...habitData, id: habitData.id, createdAt: h.createdAt }
              : h
          ),
        };
      } else {
        const newHabit: Habit = {
          ...habitData,
          id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: formatDateToISO(new Date()),
        };
        return {
          ...prev,
          habits: [...prev.habits, newHabit],
        };
      }
    });
    setEditingHabit(null);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to remove this habit?')) {
      setAppData((prev) => ({
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
      }));
    }
  };

  // Calendar Events Management
  const handleOpenNewEvent = (date?: string) => {
    setEditingEvent(null);
    setEventInitialDate(date || selectedDate);
    setIsAddEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventInitialDate(event.date);
    setIsAddEventModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'> & { id?: string }) => {
    setAppData((prev) => {
      if (eventData.id) {
        return {
          ...prev,
          events: (prev.events || []).map((ev) =>
            ev.id === eventData.id
              ? { ...ev, ...eventData, id: eventData.id, createdAt: ev.createdAt }
              : ev
          ),
        };
      } else {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: formatDateToISO(new Date()),
          completedDates: {},
        };
        return {
          ...prev,
          events: [...(prev.events || []), newEvent],
        };
      }
    });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setAppData((prev) => ({
        ...prev,
        events: (prev.events || []).filter((ev) => ev.id !== eventId),
      }));
    }
  };

  const handleToggleEventCompleted = (eventId: string, date: string) => {
    setAppData((prev) => {
      const targetEvent = (prev.events || []).find((ev) => ev.id === eventId);
      if (!targetEvent) return prev;

      const currentCompleted = Boolean(targetEvent.completedDates?.[date]);
      const updatedCompletedDates = {
        ...(targetEvent.completedDates || {}),
        [date]: !currentCompleted,
      };

      return {
        ...prev,
        events: prev.events.map((ev) =>
          ev.id === eventId ? { ...ev, completedDates: updatedCompletedDates } : ev
        ),
      };
    });
  };

  // Profile save
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setAppData((prev) => ({
      ...prev,
      profile: updatedProfile,
    }));
  };

  // Notifications management
  const handleMarkAllAsRead = () => {
    setAppData((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) => ({ ...n, read: true })),
    }));
  };

  const handleClearNotifications = () => {
    setAppData((prev) => ({
      ...prev,
      notifications: [],
    }));
  };

  // Claim birthday bonus
  const handleClaimBirthdayBonus = () => {
    setAppData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        freezeAvailable: prev.settings.freezeAvailable + 1,
      },
    }));
  };

  // Import JSON
  const handleImportData = (newData: AppData) => {
    setAppData(newData);
  };

  // Load sample data
  const handleLoadSampleData = () => {
    const sample = generateSampleData();
    setAppData(sample);
  };

  // Reset data
  const handleResetData = () => {
    const blank: AppData = {
      profile: DEFAULT_PROFILE,
      habits: DEFAULT_HABITS,
      events: DEFAULT_EVENTS,
      completions: {},
      dailyLogs: {},
      notifications: DEFAULT_NOTIFICATIONS,
      settings: getInitialSettings(),
    };
    setAppData(blank);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingHabit(null);
        setIsAddHabitModalOpen(true);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleOpenNewEvent();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsProfileModalOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setSelectedDate(formatDateToISO(new Date()));
      } else if (e.key === '1') {
        setActiveTab('dashboard');
      } else if (e.key === '2') {
        setActiveTab('tracker');
      } else if (e.key === '3') {
        setActiveTab('calendar');
      } else if (e.key === '4') {
        setActiveTab('analytics');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate]);

  const correlations = calculateEnergyCorrelations(appData.habits, appData.completions, appData.dailyLogs, 30);
  const todayStr = formatDateToISO(new Date());

  // Dynamic Time Greeting
  const timeGreeting = getTimeGreeting(appData.profile?.name || 'AnshuMan', new Date());
  const isBdayToday = isBirthdayToday(appData.profile?.birthdate, new Date());

  return (
    <div className="relative min-h-screen bg-slate-100/90 text-slate-900 transition-colors duration-300 dark:bg-[#070A12] dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Ambient background lighting mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-1/4 -right-32 h-96 w-96 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Active Alarm Audio Banner Toast */}
      {activeAlarmAlert && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-2xl glass-panel p-4 border border-amber-500/40 shadow-2xl animate-bounce">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
            <Volume2 className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>ALARM REMINDER DUE</span>
              <span>· {activeAlarmAlert.time}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {activeAlarmAlert.title}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setActiveAlarmAlert(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsAddHabitModalOpen(true);
        }}
        onOpenNewEvent={() => handleOpenNewEvent()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        profile={appData.profile}
        notifications={appData.notifications || []}
        events={appData.events || []}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearNotifications={handleClearNotifications}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        longestStreak={overallMetrics.maxLongestStreak}
      />

      {/* Main Content Viewport */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Top Summary Cards */}
        <DashboardStats
          totalActiveHabits={overallMetrics.totalActiveHabits}
          longestStreak={overallMetrics.maxLongestStreak}
          overallWeeklyRate={overallMetrics.overallWeeklyRate}
          averageEnergyScore={overallMetrics.averageEnergyScore}
          totalLogsCount={overallMetrics.totalLogsCount}
          onNavigateToTracker={() => setActiveTab('tracker')}
          onNavigateToAnalytics={() => setActiveTab('analytics')}
        />

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dynamic Time-of-Day Greeting Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl glass-panel p-5 sm:p-7 border border-white/40 dark:border-white/10 shadow-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <span className="text-base">{timeGreeting.icon}</span>
                    <span>{timeGreeting.periodLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{appData.profile.email}</span>
                  </div>

                  <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-calligraphy">
                    {timeGreeting.greeting}!
                  </h1>

                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    {appData.profile.primaryGoal ||
                      'Track consistency, schedule recurring events with alarms, and power your highest energy days.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Birthday Celebration Banner Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsBirthdayModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3.5 py-2 text-xs font-bold text-pink-600 hover:bg-pink-500/20 dark:text-pink-300 transition-all shadow-xs"
                  >
                    <Cake className="h-3.5 w-3.5" />
                    <span>{isBdayToday ? 'Birthday Today! 🎂' : 'Birthday Wishes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(todayStr);
                      setActiveTab('tracker');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
                  >
                    <span>Check off Routines</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('calendar')}
                    className="inline-flex items-center gap-1.5 rounded-xl glass-pill px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-violet-500" />
                    <span>Calendar & Alarms</span>
                  </button>
                </div>
              </div>

              {/* Sub-strip with streak protections and morning wake-time */}
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-200/60 pt-3.5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>Unbroken Streak: <strong className="font-mono text-slate-800 dark:text-slate-200">{overallMetrics.maxLongestStreak} days</strong></span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Weekly Freeze: <strong className="text-cyan-600 dark:text-cyan-400">{appData.settings.freezeAvailable} Available</strong></span>
                </span>
                {appData.profile.wakeTime && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Wake-up Goal: <strong className="font-mono text-slate-800 dark:text-slate-200">{appData.profile.wakeTime}</strong></span>
                  </>
                )}
                {correlations[0] && correlations[0].diff > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Top Vitality Driver: <strong className="text-emerald-600 dark:text-emerald-400">{correlations[0].habitName} (+{correlations[0].diff} pts)</strong></span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Embedded Daily Tracker for quick actions */}
            <HabitTracker
              habits={appData.habits}
              events={appData.events}
              completions={appData.completions}
              dailyLogs={appData.dailyLogs}
              freezeAvailable={appData.settings.freezeAvailable}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleHabit={handleToggleHabit}
              onUpdateDailyLog={handleUpdateDailyLog}
              onApplyStreakFreeze={handleApplyStreakFreeze}
              onOpenNewHabit={() => {
                setEditingHabit(null);
                setIsAddHabitModalOpen(true);
              }}
              onEditHabit={(habit) => {
                setEditingHabit(habit);
                setIsAddHabitModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
              onNavigateToCalendar={() => setActiveTab('calendar')}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Daily Tracker View */}
        {activeTab === 'tracker' && (
          <HabitTracker
            habits={appData.habits}
            events={appData.events}
            completions={appData.completions}
            dailyLogs={appData.dailyLogs}
            freezeAvailable={appData.settings.freezeAvailable}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleHabit={handleToggleHabit}
            onUpdateDailyLog={handleUpdateDailyLog}
            onApplyStreakFreeze={handleApplyStreakFreeze}
            onOpenNewHabit={() => {
              setEditingHabit(null);
              setIsAddHabitModalOpen(true);
            }}
            onEditHabit={(habit) => {
              setEditingHabit(habit);
              setIsAddHabitModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onNavigateToCalendar={() => setActiveTab('calendar')}
          />
        )}

        {/* Tab 3: Dedicated Recurring Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            events={appData.events || []}
            habits={appData.habits}
            completions={appData.completions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenNewEvent={handleOpenNewEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onToggleEventCompleted={handleToggleEventCompleted}
            onToggleHabit={handleToggleHabit}
          />
        )}

        {/* Tab 4: Analytics & Correlation View */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            habits={appData.habits}
            completions={appData.completions}
            dailyLogs={appData.dailyLogs}
            theme={theme}
          />
        )}
      </main>

      {/* Clean, Prestigious Footer with AnshuMan signature */}
      <footer className="relative z-10 border-t border-slate-200/80 py-8 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400 glass-panel">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-calligraphy text-base font-bold text-slate-900 dark:text-white">
              HabitPulse
            </span>
            <span aria-hidden="true">·</span>
            <span>Daily Routine, Alarms & Vitality Platform</span>
          </div>

          {/* User Name Signature: AnshuMan */}
          <div className="flex items-center gap-2 rounded-full glass-pill px-4 py-1.5 border border-emerald-500/20 text-slate-800 dark:text-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Crafted with precision for</span>
            <span className="font-calligraphy font-extrabold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-violet-500">
              AnshuMan
            </span>
            <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
            >
              Account Profile
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
            >
              Backup & Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => {
          setIsAddHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        editingHabit={editingHabit}
      />

      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => {
          setIsAddEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSaveEvent={handleSaveEvent}
        editingEvent={editingEvent}
        initialDate={eventInitialDate}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={appData.profile}
        onSaveProfile={handleSaveProfile}
      />

      <BirthdayWishingModal
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
        userName={appData.profile.name || 'AnshuMan'}
        isUserBirthday={isBdayToday}
        eventTitle={birthdayEventTitle}
        onClaimBirthdayBonus={handleClaimBirthdayBonus}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appData={appData}
        onImportData={handleImportData}
        onLoadSampleData={handleLoadSampleData}
        onResetData={handleResetData}
      />
    </div>
  );
}
