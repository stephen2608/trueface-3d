import React from 'react';
import { Award, Download, X, CheckCircle2, Clock, Printer, Sparkles } from 'lucide-react';
import { ExecutiveScorecard } from '../types';

interface Props {
  scorecard: ExecutiveScorecard | null;
  onClose: () => void;
}

export const ExecutiveScorecardModal: React.FC<Props> = ({ scorecard, onClose }) => {
  if (!scorecard) return null;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(scorecard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrueFace3D_Scorecard_${scorecard.sessionUuid.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const getTierBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return { label: 'Top Tier • Outstanding', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
      case 'B+':
      case 'B':
        return { label: 'Solid • Strong Performance', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' };
      default:
        return { label: 'Good • Room to Grow', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
    }
  };

  const tier = getTierBadge(scorecard.executiveGrade);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Practice Session Scorecard
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Summary of your speech, eye contact, and posture during this session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Big Score Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-900/90 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-zinc-800 gap-3 sm:gap-5">
            <div>
              <div className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overall Composure &amp; Delivery</div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight my-0.5 sm:my-1">
                {scorecard.overallScore}%
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-300 max-w-md leading-relaxed">
                {scorecard.executiveSummary}
              </p>
            </div>
            <div className={`px-4 sm:px-5 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl border flex flex-row sm:flex-col items-center justify-center shrink-0 shadow-lg gap-2 sm:gap-0 ${tier.color}`}>
              <span className="text-2xl sm:text-3xl font-black font-mono">{scorecard.executiveGrade}</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{tier.label}</span>
            </div>
          </div>

          {/* 6 Clear Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-zinc-900/80 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate">Smile &amp; Warmth</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5">{scorecard.averageAuthenticity}%</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">Natural warmth</div>
            </div>

            <div className="bg-zinc-900/80 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate">Screen Posture</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-blue-400 mt-0.5">{scorecard.postureCompliance}%</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">Ideal working zone</div>
            </div>

            <div className="bg-zinc-900/80 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate">Face Balance</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-purple-400 mt-0.5">{scorecard.averageSymmetry}%</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">Relaxed symmetry</div>
            </div>

            <div className="bg-zinc-900/80 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate">Eye Contact</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-blue-400 mt-0.5">{scorecard.averageAttention}%</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">Focused on screen</div>
            </div>

            <div className="bg-zinc-900/80 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate">Composure &amp; Calm</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5">{scorecard.emotionalStability}%</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">Low tension</div>
            </div>

            <div className="bg-zinc-900/80 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800">
              <div className="text-[10px] sm:text-[11px] font-medium text-zinc-400 truncate">Filler Words</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">{scorecard.totalFillersUsed || 0}</div>
              <div className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">"um" / "uh" / "like"</div>
            </div>
          </div>

          {/* Actionable Tips */}
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Key Takeaways for Next Time</span>
            </h3>
            <div className="space-y-2">
              {scorecard.tacticalRecommendations && scorecard.tacticalRecommendations.length > 0 ? (
                scorecard.tacticalRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2.5 bg-zinc-900/70 p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-zinc-800 text-[11px] sm:text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] sm:text-xs text-zinc-400 italic">Looking great! Keep practicing to maintain your composure.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-zinc-950/80">
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 shrink-0" />
            <span className="truncate">Duration: {scorecard.durationSeconds}s ({scorecard.totalFramesAnalyzed} frames)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={downloadJson}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 text-center"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
