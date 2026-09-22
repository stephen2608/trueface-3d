import React from 'react';
import { Target, Heart, Shield, Play, Square, Sparkles } from 'lucide-react';
import { TrackingMode } from '../types';

interface Props {
  mode: TrackingMode;
  onModeChange: (mode: TrackingMode) => void;
  isSessionActive: boolean;
  onToggleSession: () => void;
  wsConnected: boolean;
}

export const Navbar: React.FC<Props> = ({
  mode,
  onModeChange,
  isSessionActive,
  onToggleSession,
  wsConnected,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/70 backdrop-blur-2xl border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Brand */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-700/80 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              TrueFace<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">3D</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-full">
              Live AI Mirror
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time face tracking, speech &amp; posture coach
          </p>
        </div>
      </div>

      {/* Mode Switcher with crazy tactile UI effects */}
      <div className="flex items-center bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <button
          onClick={() => onModeChange('INTERVIEW_COACH')}
          disabled={isSessionActive}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
            mode === 'INTERVIEW_COACH'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.45)] scale-[1.03]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Interview Practice</span>
          {mode === 'INTERVIEW_COACH' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-300 rounded-full blur-[1px]" />
          )}
        </button>

        <button
          onClick={() => onModeChange('MINDFUL_WELLNESS')}
          disabled={isSessionActive}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
            mode === 'MINDFUL_WELLNESS'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)] scale-[1.03]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Breath &amp; Reset</span>
          {mode === 'MINDFUL_WELLNESS' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-emerald-300 rounded-full blur-[1px]" />
          )}
        </button>

        <button
          onClick={() => onModeChange('ERGONOMICS_SENTINEL')}
          disabled={isSessionActive}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
            mode === 'ERGONOMICS_SENTINEL'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.45)] scale-[1.03]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Posture Guard</span>
          {mode === 'ERGONOMICS_SENTINEL' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-amber-300 rounded-full blur-[1px]" />
          )}
        </button>
      </div>

      {/* Connection & Action Button */}
      <div className="flex items-center space-x-3.5">
        <div className="hidden sm:flex items-center space-x-2 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected
                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                : 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'
            }`}
          />
          <span className="font-medium">{wsConnected ? 'Backend Connected' : 'Connecting to Server...'}</span>
        </div>

        <button
          onClick={onToggleSession}
          className={`relative group flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 shadow-lg ${
            isSessionActive
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/40 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.03] active:scale-[0.98]'
          }`}
        >
          {isSessionActive ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Finish &amp; See Results</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Practice</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
