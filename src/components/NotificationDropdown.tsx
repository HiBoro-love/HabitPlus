import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Volume2,
  Cake,
  Calendar,
  Flame,
  CheckCheck,
  Sparkles,
  Clock,
} from 'lucide-react';
import { NotificationItem, CalendarEvent } from '../types';
import { playNotificationChime } from '../utils/audioAlarm';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  events: CalendarEvent[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  events,
  onMarkAllAsRead,
  onClearNotifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTestChime = () => {
    playNotificationChime();
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'birthday':
        return <Cake className="h-4 w-4 text-pink-500" />;
      case 'alarm':
        return <Volume2 className="h-4 w-4 text-amber-500" />;
      case 'streak':
        return <Flame className="h-4 w-4 text-emerald-500" />;
      default:
        return <Calendar className="h-4 w-4 text-violet-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Event Reminders & Alarms"
        title="Event Reminders & Alarms"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl glass-pill text-slate-700 hover:scale-105 active:scale-95 dark:text-slate-200 transition-all duration-200 shadow-xs"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 transition-all border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-calligraphy">
                Reminders & Alarms
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTestChime}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title="Test Web Audio Chime"
              >
                <Volume2 className="h-3 w-3 text-amber-500" />
                <span>Test Chime</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Read</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <Sparkles className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600 mb-1" />
                No new reminders right now. All events are quiet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors border ${
                    !notif.read
                      ? 'border-violet-500/20 bg-violet-500/[0.04] dark:border-violet-500/30 dark:bg-violet-500/[0.08]'
                      : 'border-transparent bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800 shadow-xs border border-slate-200/50 dark:border-white/5">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-white/10 flex justify-between items-center text-[11px] text-slate-400">
              <span>Alarms play audio chime automatically</span>
              <button
                type="button"
                onClick={onClearNotifications}
                className="text-slate-500 hover:text-rose-500 dark:hover:text-rose-400"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
