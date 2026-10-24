import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
} from 'chart.js';
import { Habit, DailyLog } from '../types';
import { getRecentDates, parseISODate } from '../utils/dateUtils';
import { calculateEnergyCorrelations } from '../utils/streak';
import { Zap, TrendingUp, BarChart2, Activity, Sparkles, CheckCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
);

interface AnalyticsViewProps {
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>;
  dailyLogs: Record<string, DailyLog>;
  theme: 'dark' | 'light';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  habits,
  completions,
  dailyLogs,
  theme,
}) => {
  const [energyDaysRange, setEnergyDaysRange] = useState<7 | 14 | 30>(14);

  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const barInstance = useRef<ChartJS | null>(null);
  const lineInstance = useRef<ChartJS | null>(null);

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  // 1. Weekly Habit Completion Rate Data (last 7 days)
  const last7Days = getRecentDates(7);
  const weeklyLabels = last7Days.map((dStr) => {
    const d = parseISODate(dStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  });

  const activeHabits = habits.filter((h) => !h.archived);
  const weeklyCompletionRates = last7Days.map((dStr) => {
    if (activeHabits.length === 0) return 0;
    const completed = activeHabits.filter((h) => completions[dStr]?.[h.id]).length;
    return Math.round((completed / activeHabits.length) * 100);
  });

  // 2. Energy Level Trend Data (7, 14, or 30 days)
  const energyDates = getRecentDates(energyDaysRange);
  const energyLabels = energyDates.map((dStr) => {
    const d = parseISODate(dStr);
    return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  });

  const energyScores = energyDates.map((dStr) => {
    const log = dailyLogs[dStr];
    return log && typeof log.energyLevel === 'number' && log.energyLevel > 0 ? log.energyLevel : null;
  });

  // Calculate correlation insights
  const correlations = calculateEnergyCorrelations(habits, completions, dailyLogs, 30);

  // Initialize & Update Bar Chart
  useEffect(() => {
    if (!barChartRef.current) return;

    if (barInstance.current) {
      barInstance.current.destroy();
    }

    const ctx = barChartRef.current.getContext('2d');
    if (!ctx) return;

    barInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: weeklyLabels,
        datasets: [
          {
            label: 'Completion Rate (%)',
            data: weeklyCompletionRates,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.75)' : 'rgba(16, 185, 129, 0.85)',
            hoverBackgroundColor: isDark ? 'rgba(52, 211, 153, 0.95)' : 'rgba(5, 150, 105, 1)',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            titleColor: isDark ? '#F8FAFC' : '#0F172A',
            bodyColor: isDark ? '#CBD5E1' : '#334155',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (item) => `Completion: ${item.formattedValue}%`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 11 } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback: (val) => `${val}%`,
            },
          },
        },
      },
    });

    return () => {
      if (barInstance.current) {
        barInstance.current.destroy();
      }
    };
  }, [theme, completions, habits]);

  // Initialize & Update Line Chart
  useEffect(() => {
    if (!lineChartRef.current) return;

    if (lineInstance.current) {
      lineInstance.current.destroy();
    }

    const ctx = lineChartRef.current.getContext('2d');
    if (!ctx) return;

    lineInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: energyLabels,
        datasets: [
          {
            label: 'Energy Level',
            data: energyScores,
            borderColor: '#8B5CF6',
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: isDark ? '#0F172A' : '#FFFFFF',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            titleColor: isDark ? '#F8FAFC' : '#0F172A',
            bodyColor: isDark ? '#CBD5E1' : '#334155',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (item) => `Energy Level: ${item.formattedValue} / 5.0`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 10 } },
          },
          y: {
            min: 1,
            max: 5,
            grid: { color: gridColor },
            ticks: {
              stepSize: 1,
              color: textColor,
              font: { size: 11 },
              callback: (val) => `${val} ★`,
            },
          },
        },
      },
    });

    return () => {
      if (lineInstance.current) {
        lineInstance.current.destroy();
      }
    };
  }, [theme, energyDaysRange, dailyLogs]);

  return (
    <div className="space-y-6">
      {/* 1. Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Completion Rate Bar Chart */}
        <div className="rounded-2xl glass-panel p-5 sm:p-6 transition-all duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <BarChart2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                  Weekly Habit Completion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Percentage of active routines completed daily
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              Last 7 Days
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <canvas ref={barChartRef} />
          </div>
        </div>

        {/* Energy Level Trend Line Chart */}
        <div className="rounded-2xl glass-panel p-5 sm:p-6 transition-all duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20 shadow-xs">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                  Energy & Vitality Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily recorded score across 1 to 5 scale
                </p>
              </div>
            </div>

            {/* Range Selector */}
            <div className="flex items-center gap-1 glass-pill p-1 rounded-xl">
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEnergyDaysRange(r)}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                    energyDaysRange === r
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <canvas ref={lineChartRef} />
          </div>
        </div>
      </div>

      {/* 2. Energy & Habit Correlation Analysis */}
      <div className="rounded-2xl glass-panel p-5 sm:p-6 transition-all duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                Habit & Energy Correlation Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statistical correlation showing which routines power your highest vitality days
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            30-day cross-analysis
          </span>
        </div>

        {correlations.length === 0 ? (
          <div className="py-10 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-slate-400" />
            <h4 className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Collecting Correlation Data
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Log both your habit completions and your daily energy rating over at least 2 distinct days to reveal your personal peak energy catalysts.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 text-slate-400 dark:border-white/10">
                    <th className="pb-2.5 font-medium">Routine / Habit</th>
                    <th className="pb-2.5 font-medium">Category</th>
                    <th className="pb-2.5 font-medium text-right">Avg Energy (Done)</th>
                    <th className="pb-2.5 font-medium text-right">Avg Energy (Skipped)</th>
                    <th className="pb-2.5 font-medium text-right">Impact Delta</th>
                    <th className="pb-2.5 font-medium text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {correlations.map((item) => {
                    const isPositive = item.diff > 0;
                    const isNeutral = item.diff === 0;

                    return (
                      <tr key={item.habitId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">
                          {item.habitName}
                        </td>
                        <td className="py-3 capitalize text-slate-500 dark:text-slate-400">
                          {item.category}
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          {item.avgEnergyWithHabit.toFixed(1)} / 5.0
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          {item.avgEnergyWithoutHabit.toFixed(1)} / 5.0
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex items-center font-mono tabular-nums font-semibold ${
                              isPositive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isNeutral
                                ? 'text-slate-500 dark:text-slate-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? `+${item.diff.toFixed(1)}` : item.diff.toFixed(1)} pts
                          </span>
                        </td>
                        <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                          <span className="font-mono tabular-nums">{item.sampleSize}</span> logs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Top Catalyst Callout */}
            {correlations[0] && correlations[0].diff > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Top Vitality Catalyst:</strong> Days you complete{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    "{correlations[0].habitName}"
                  </span>{' '}
                  show an average energy of {correlations[0].avgEnergyWithHabit.toFixed(1)}/5 (
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    +{correlations[0].diff.toFixed(1)} pts higher
                  </span>{' '}
                  than skipped days).
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
