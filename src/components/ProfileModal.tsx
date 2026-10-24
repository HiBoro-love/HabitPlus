import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Cake,
  Clock,
  Target,
  Bell,
  Volume2,
  Sparkles,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { playNotificationChime, sendDesktopNotification } from '../utils/audioAlarm';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name || 'AnshuMan');
  const [email, setEmail] = useState(profile.email || '');
  const [birthdate, setBirthdate] = useState(profile.birthdate || '2006-10-24');
  const [avatar, setAvatar] = useState(profile.avatar || '👑');
  const [wakeTime, setWakeTime] = useState(profile.wakeTime || '06:30');
  const [primaryGoal, setPrimaryGoal] = useState(
    profile.primaryGoal || 'Build unbreakable momentum, peak physical energy & elite focus'
  );
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled ?? true);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'AnshuMan');
      setEmail(profile.email || '');
      setBirthdate(profile.birthdate || '2006-10-24');
      setAvatar(profile.avatar || '👑');
      setWakeTime(profile.wakeTime || '06:30');
      setPrimaryGoal(profile.primaryGoal || '');
      setSoundEnabled(profile.soundEnabled ?? true);
      setNotificationStatus(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleTestSound = () => {
    playNotificationChime();
  };

  const handleRequestNotification = async () => {
    const granted = await sendDesktopNotification(
      'HabitPulse Notifications Active',
      `Hello ${name || 'AnshuMan'}! Your event alarms and reminder chimes are ready.`
    );
    if (granted) {
      setNotificationStatus('Desktop notifications enabled!');
    } else {
      setNotificationStatus('Browser notifications blocked or unavailable in this view.');
    }
    setTimeout(() => setNotificationStatus(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim() || 'AnshuMan',
      email: email.trim(),
      birthdate,
      avatar,
      wakeTime,
      primaryGoal: primaryGoal.trim(),
      soundEnabled,
      isLoggedIn: true,
    });
    onClose();
  };

  const avatarChoices = ['👑', '⚡', '🚀', '🦁', '💎', '🎯', '🔥', '🦅'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 to-violet-500/20 text-2xl border border-emerald-500/30 shadow-xs">
              {avatar}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-calligraphy">
                User Profile & Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal details for time-based greetings, alarms & birthday wishes
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

        {notificationStatus && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{notificationStatus}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Avatar Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Avatar Persona
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {avatarChoices.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all ${
                    avatar === av
                      ? 'scale-110 border-2 border-emerald-500 bg-emerald-500/15 shadow-xs'
                      : 'border border-slate-200 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Email (2-col grid) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AnshuMan"
                  className="w-full rounded-xl border border-slate-200 bg-white/90 pl-8 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anshuman@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white/90 pl-8 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Birthday & Wake-up Time (for wishing & greetings) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Date of Birth
                </label>
                <span className="text-[10px] text-amber-500 font-medium flex items-center gap-0.5">
                  <Cake className="h-3 w-3" />
                  <span>Birthday Wish</span>
                </span>
              </div>
              <input
                type="date"
                required
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-950/70 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Morning Wake Time
              </label>
              <div className="relative mt-1.5">
                <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 pl-8 pr-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-slate-950/70 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Core Discipline & Vitality Goal
            </label>
            <div className="relative mt-1.5">
              <Target className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="e.g. Build unbreakable momentum, peak physical energy & elite focus"
                className="w-full rounded-xl border border-slate-200 bg-white/90 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Audio Chime & Browser Notification Toggles */}
          <div className="rounded-xl border border-slate-200/70 p-3.5 dark:border-white/10 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Audio Alarm Chimes
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Plays gentle Web Audio chime for event reminders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 transition-colors"
                >
                  Test Chime 🔔
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-2.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-500" />
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Desktop Notifications
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Show native OS banner when alarms trigger
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRequestNotification}
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-500 shadow-xs transition-colors"
              >
                Enable Alerts
              </button>
            </div>
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
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
