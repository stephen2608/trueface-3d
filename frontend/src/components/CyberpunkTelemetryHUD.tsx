import React from 'react';
import { Smile, Compass, Ruler, Scale, Activity } from 'lucide-react';
import { SpatialTelemetryResponse } from '../types';

interface Props {
  telemetry: SpatialTelemetryResponse | null;
}

export const CyberpunkTelemetryHUD: React.FC<Props> = ({ telemetry }) => {
  if (!telemetry) {
    return (
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800 p-6 flex flex-col items-center justify-center min-h-[160px] text-zinc-500 text-sm shadow-sm backdrop-blur-xl">
        <Activity className="w-5 h-5 mb-2 text-zinc-600 animate-pulse" />
        <span>Waiting for face tracking data...</span>
      </div>
    );
  }

  const getSmileBadge = () => {
    switch (telemetry.smileType) {
      case 'GENUINE_DUCHENNE':
        return <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">Natural Smile</span>;
      case 'COURTESY_SOCIAL':
        return <span className="text-zinc-300 bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Polite Smile</span>;
      case 'FORCED_OR_MASKED':
        return <span className="text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">Tense Smile</span>;
      default:
        return <span className="text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Relaxed</span>;
    }
  };

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const authenticityOffset = circumference - (Math.min(100, telemetry.smileAuthenticity) / 100) * circumference;
  const postureOffset = circumference - (Math.min(100, telemetry.ergonomicHealthScore) / 100) * circumference;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Smile & Confidence */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/80 p-3 sm:p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-zinc-200 text-[11px] sm:text-xs font-semibold">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Smile className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="truncate">Smile</span>
          </div>
          {getSmileBadge()}
        </div>

        <div className="flex items-center justify-between my-1.5 sm:my-2">
          {/* Circular Ring */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
              <circle
                cx="35"
                cy="35"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="35"
                cy="35"
                r={radius}
                className="stroke-blue-500 transition-all duration-500"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={authenticityOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs sm:text-base font-bold font-mono text-white">{telemetry.smileAuthenticity}%</span>
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1 text-right text-[10px] sm:text-xs">
            <div>
              <span className="text-zinc-500">Cheek: </span>
              <strong className="text-zinc-200">{telemetry.cheekElevationIntensity}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Eyes: </span>
              <strong className="text-zinc-200">{telemetry.eyeCompressionIntensity}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Width: </span>
              <strong className="text-zinc-200">{telemetry.mouthSmileIntensity}%</strong>
            </div>
          </div>
        </div>

        <div className="text-[10px] sm:text-xs text-zinc-400 pt-1.5 sm:pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Expression:</span>
          <span className="text-blue-400 font-medium truncate ml-1">
            {telemetry.smileAuthenticity > 60 ? 'Genuine' : 'Neutral'}
          </span>
        </div>
      </div>

      {/* 2. 3D Head Angle */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/80 p-3 sm:p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-zinc-200 text-[11px] sm:text-xs font-semibold">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="truncate">Head Angle</span>
          </div>
          <span className="text-[10px] sm:text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 sm:px-2 py-0.5 rounded-full font-mono">
            Deg
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-2 my-1.5 sm:my-2 text-center">
          <div className="bg-zinc-800/60 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-zinc-700/60">
            <div className="text-[9px] sm:text-[11px] text-zinc-400 truncate">Pitch</div>
            <div className="text-xs sm:text-base font-bold font-mono text-white mt-0.5">{telemetry.pitch}°</div>
            <div className="text-[8px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">{telemetry.pitch < -8 ? 'Down' : telemetry.pitch > 8 ? 'Up' : 'Level'}</div>
          </div>

          <div className="bg-zinc-800/60 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-zinc-700/60">
            <div className="text-[9px] sm:text-[11px] text-zinc-400 truncate">Yaw</div>
            <div className="text-xs sm:text-base font-bold font-mono text-white mt-0.5">{telemetry.yaw}°</div>
            <div className="text-[8px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">{telemetry.yaw < -8 ? 'Left' : telemetry.yaw > 8 ? 'Right' : 'Center'}</div>
          </div>

          <div className="bg-zinc-800/60 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-zinc-700/60">
            <div className="text-[9px] sm:text-[11px] text-zinc-400 truncate">Roll</div>
            <div className="text-xs sm:text-base font-bold font-mono text-white mt-0.5">{telemetry.roll}°</div>
            <div className="text-[8px] sm:text-[10px] text-zinc-500 mt-0.5 truncate">{Math.abs(telemetry.roll) > 8 ? 'Tilt' : 'Level'}</div>
          </div>
        </div>

        <div className="text-[10px] sm:text-xs text-zinc-400 pt-1.5 sm:pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Align:</span>
          <span className="text-indigo-400 font-medium truncate ml-1">Direct</span>
        </div>
      </div>

      {/* 3. Distance & Posture */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/80 p-3 sm:p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-zinc-200 text-[11px] sm:text-xs font-semibold">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
              <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="truncate">Distance</span>
          </div>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
            telemetry.postureStatus === 'OPTIMAL_POSTURE'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
              : 'bg-amber-950 text-amber-400 border border-amber-800/80'
          }`}>
            {telemetry.postureStatus === 'OPTIMAL_POSTURE' ? 'Good' : 'Adjust'}
          </span>
        </div>

        <div className="flex items-center justify-between my-1.5 sm:my-2">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
              <circle
                cx="35"
                cy="35"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="35"
                cy="35"
                r={radius}
                className={`transition-all duration-500 ${telemetry.postureStatus === 'OPTIMAL_POSTURE' ? 'stroke-amber-400' : 'stroke-red-400'}`}
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={postureOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs sm:text-base font-bold font-mono text-white">{telemetry.screenDistanceCm}</span>
              <span className="text-[8px] sm:text-[10px] block text-zinc-400 leading-none">cm</span>
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1 text-right text-[10px] sm:text-xs">
            <div>
              <span className="text-zinc-500">Posture: </span>
              <strong className="text-zinc-200">{telemetry.ergonomicHealthScore}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Ideal: </span>
              <strong className="text-zinc-200">50-75cm</strong>
            </div>
            <div>
              <span className="text-zinc-500">Zone: </span>
              <strong className={telemetry.screenDistanceCm >= 45 ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.screenDistanceCm >= 45 ? 'Good' : 'Close'}
              </strong>
            </div>
          </div>
        </div>

        <div className="text-[10px] sm:text-xs text-zinc-400 pt-1.5 sm:pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Spine:</span>
          <span className={telemetry.screenDistanceCm >= 45 ? 'text-emerald-400 font-medium truncate ml-1' : 'text-amber-400 font-medium truncate ml-1'}>
            {telemetry.screenDistanceCm >= 45 ? 'Upright' : 'Craning'}
          </span>
        </div>
      </div>

      {/* 4. Eye Contact & Symmetry */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/80 p-3 sm:p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-zinc-200 text-[11px] sm:text-xs font-semibold">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
              <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="truncate">Gaze &amp; Balance</span>
          </div>
          <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
            telemetry.isLookingAtScreen ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}>
            {telemetry.isLookingAtScreen ? 'Screen' : 'Away'}
          </span>
        </div>

        <div className="space-y-2 sm:space-y-3 my-1.5 sm:my-2">
          <div>
            <div className="flex justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
              <span className="text-zinc-400">Eye Contact</span>
              <strong className={telemetry.isLookingAtScreen ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.gazeAttentionScore}%
              </strong>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${telemetry.isLookingAtScreen ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, telemetry.gazeAttentionScore)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
              <span className="text-zinc-400">Symmetry</span>
              <strong className="text-purple-400">{telemetry.symmetryScore}%</strong>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${Math.min(100, telemetry.symmetryScore)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] sm:text-xs text-zinc-400 pt-1.5 sm:pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Gaze:</span>
          <strong className={telemetry.isLookingAtScreen ? 'text-emerald-400 truncate ml-1' : 'text-amber-400 truncate ml-1'}>
            {telemetry.isLookingAtScreen ? 'Direct' : 'Away'}
          </strong>
        </div>
      </div>
    </div>
  );
};
