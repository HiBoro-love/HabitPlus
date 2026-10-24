import React from 'react';
import { Flame, CheckCircle2, BatteryCharging, Target, ArrowUpRight } from 'lucide-react';

interface DashboardStatsProps {
  totalActiveHabits: number;
  longestStreak: number;
  overallWeeklyRate: number;
  averageEnergyScore: number;
  totalLogsCount: number;
  onNavigateToTracker: () => void;
  onNavigateToAnalytics: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalActiveHabits,
  longestStreak,
  overallWeeklyRate,
  averageEnergyScore,
  totalLogsCount,
  onNavigateToTracker,
  onNavigateToAnalytics,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Active Habits */}
      <div
        onClick={onNavigateToTracker}
        className="group relative cursor-pointer rounded-2xl glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-white/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Active Habits
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 shadow-xs">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {totalActiveHabits}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">routines</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 pt-2.5 dark:border-white/5">
          <span>Daily target tracking</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      {/* 2. Longest Streak */}
      <div
        onClick={onNavigateToTracker}
        className="group relative cursor-pointer rounded-2xl glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-white/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Longest Active Streak
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 shadow-xs">
            <Flame className="h-4 w-4 fill-amber-500" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {longestStreak}
          </span>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            {longestStreak === 1 ? 'day unbroken' : 'days unbroken'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 pt-2.5 dark:border-white/5">
          <span>Protected with Streak Freeze</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      {/* 3. Weekly Completion Rate */}
      <div
        onClick={onNavigateToAnalytics}
        className="group relative cursor-pointer rounded-2xl glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-white/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            7-Day Completion Rate
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {overallWeeklyRate}%
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {overallWeeklyRate >= 80 ? 'Optimal pace' : overallWeeklyRate >= 50 ? 'Steady pace' : 'Building momentum'}
          </span>
        </div>
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow-xs"
              style={{ width: `${Math.min(100, Math.max(0, overallWeeklyRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Average Daily Energy Score */}
      <div
        onClick={onNavigateToAnalytics}
        className="group relative cursor-pointer rounded-2xl glass-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-white/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
            Avg Daily Energy
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20 shadow-xs">
            <BatteryCharging className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {averageEnergyScore > 0 ? averageEnergyScore.toFixed(1) : '—'}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            / 5.0 scale
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 pt-2.5 dark:border-white/5">
          <span>{totalLogsCount} check-ins logged</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
