import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Keyboard,
  Database,
  Sparkles,
} from 'lucide-react';
import { AppData } from '../types';
import { exportDataAsJSON, parseImportJSON } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onImportData: (data: AppData) => void;
  onLoadSampleData: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appData,
  onImportData,
  onLoadSampleData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportDataAsJSON(appData);
    setImportStatus('Backup downloaded successfully!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseImportJSON(text);
        onImportData(parsed);
        setImportError(null);
        setImportStatus(`Successfully restored ${parsed.habits.length} habits and history!`);
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl glass-panel p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 shadow-xs">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-calligraphy">
                Data Portability & Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local storage backup, JSON transfer, and shortcuts
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

        {/* Notifications */}
        {importStatus && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Content sections */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Section 1: JSON Export & Import */}
          <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              JSON Data Portability
            </h4>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Your habits, completion history, and energy check-ins are saved in your browser’s LocalStorage. You can export a full JSON snapshot or restore one at any time.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Data (JSON)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import Data (JSON)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Quick Demo Seed & Reset */}
          <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Demonstration & Management
            </h4>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Populate with realistic sample check-ins to explore analytics, or reset your current workspace.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onLoadSampleData();
                  setImportStatus('Loaded realistic 14-day sample habits and correlations!');
                  setTimeout(() => setImportStatus(null), 3000);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load Sample Data</span>
              </button>

              {!showConfirmReset ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset All Data</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 font-semibold">Confirm erase?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowConfirmReset(false);
                      setImportStatus('Data reset to fresh slate.');
                      setTimeout(() => setImportStatus(null), 2500);
                    }}
                    className="rounded-lg bg-rose-600 px-2.5 py-1 text-white font-semibold hover:bg-rose-500"
                  >
                    Yes, Erase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="rounded-lg border px-2 py-1 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <Keyboard className="h-4 w-4 text-slate-400" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>New Routine:</span>
                <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                  N
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Jump to Today:</span>
                <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                  T
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Daily Tracker:</span>
                <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                  1
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Analytics Tab:</span>
                <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                  2
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
