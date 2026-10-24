import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Cake, Sparkles, X, Gift, Flame, Trophy } from 'lucide-react';
import { playBirthdayCelebrationSound } from '../utils/audioAlarm';

interface BirthdayWishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  isUserBirthday: boolean;
  eventTitle?: string;
  onClaimBirthdayBonus?: () => void;
}

export const BirthdayWishingModal: React.FC<BirthdayWishingModalProps> = ({
  isOpen,
  onClose,
  userName,
  isUserBirthday,
  eventTitle,
  onClaimBirthdayBonus,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti shower
      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4'],
          ticks: 240,
        });
        playBirthdayCelebrationSound();
      } catch (err) {
        console.warn(err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 text-center shadow-2xl border border-pink-500/30 overflow-hidden">
        {/* Glow behind */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Crown & Cake Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500/20 via-amber-500/20 to-violet-500/20 text-3xl border border-pink-500/30 shadow-lg">
          🎂
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-500">
          <Sparkles className="h-4 w-4" />
          <span>Annual Celebration Alert</span>
          <Sparkles className="h-4 w-4" />
        </div>

        <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-calligraphy">
          {isUserBirthday
            ? `Happy Birthday, ${userName}!`
            : `${eventTitle || 'Birthday Celebration!'}`}
        </h3>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
          {isUserBirthday
            ? `May this year bring you boundless physical vitality, unshakable focus, compounding streaks, and magnificent triumphs in every routine you build!`
            : `Today marks a joyous annual milestone celebration! Send warmest wishes and celebrate this extraordinary day.`}
        </p>

        {/* Birthday Badge */}
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-amber-500/10 to-violet-500/10 p-4 border border-pink-500/20 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-600 dark:text-pink-400">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Birthday Streak Immunity Gift
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enjoy your day worry-free! Your streaks remain fully protected.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {onClaimBirthdayBonus && (
            <button
              type="button"
              onClick={() => {
                onClaimBirthdayBonus();
                onClose();
              }}
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 py-3 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all"
            >
              🎉 Claim Birthday Immunity & Celebrate!
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl glass-pill py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Continue to HabitPulse
          </button>
        </div>
      </div>
    </div>
  );
};
