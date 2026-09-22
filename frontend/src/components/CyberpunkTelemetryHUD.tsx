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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Smile & Confidence */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/80 p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-zinc-200 text-xs font-semibold">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Smile className="w-3.5 h-3.5" />
            </div>
            <span>Smile &amp; Warmth</span>
          </div>
          {getSmileBadge()}
        </div>

        <div className="flex items-center justify-between my-2">
          {/* Circular Ring */}
          <div className="relative w-16 h-16 flex items-center justify-center">
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
              <span className="text-base font-bold font-mono text-white">{telemetry.smileAuthenticity}%</span>
            </div>
          </div>

          <div className="space-y-1 text-right text-xs">
            <div>
              <span className="text-zinc-500">Cheek Lift: </span>
              <strong className="text-zinc-200">{telemetry.cheekElevationIntensity}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Eye Crinkle: </span>
              <strong className="text-zinc-200">{telemetry.eyeCompressionIntensity}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Smile Width: </span>
              <strong className="text-zinc-200">{telemetry.mouthSmileIntensity}%</strong>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Expression:</span>
          <span className="text-blue-400 font-medium">
            {telemetry.smileAuthenticity > 60 ? 'Genuine Engagement' : 'Neutral Composure'}
          </span>
        </div>
      </div>

      {/* 2. 3D Head Angle */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/80 p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-zinc-200 text-xs font-semibold">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span>3D Head Angle</span>
          </div>
          <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-mono">
            Degrees
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 my-2 text-center">
          <div className="bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/60">
            <div className="text-[11px] text-zinc-400">Pitch (Up/Down)</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">{telemetry.pitch}°</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{telemetry.pitch < -8 ? 'Nod Down' : telemetry.pitch > 8 ? 'Tilt Up' : 'Level'}</div>
          </div>

          <div className="bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/60">
            <div className="text-[11px] text-zinc-400">Yaw (Turn)</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">{telemetry.yaw}°</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{telemetry.yaw < -8 ? 'Left' : telemetry.yaw > 8 ? 'Right' : 'Center'}</div>
          </div>

          <div className="bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/60">
            <div className="text-[11px] text-zinc-400">Roll (Tilt)</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">{telemetry.roll}°</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{Math.abs(telemetry.roll) > 8 ? 'Tilted' : 'Level'}</div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Alignment:</span>
          <span className="text-indigo-400 font-medium">Facing Camera Directly</span>
        </div>
      </div>

      {/* 3. Distance & Posture */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/80 p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-zinc-200 text-xs font-semibold">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Ruler className="w-3.5 h-3.5" />
            </div>
            <span>Screen Distance</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            telemetry.postureStatus === 'OPTIMAL_POSTURE'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
              : 'bg-amber-950 text-amber-400 border border-amber-800/80'
          }`}>
            {telemetry.postureStatus === 'OPTIMAL_POSTURE' ? 'Good Posture' : 'Adjust Distance'}
          </span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div className="relative w-16 h-16 flex items-center justify-center">
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
              <span className="text-base font-bold font-mono text-white">{telemetry.screenDistanceCm}</span>
              <span className="text-[10px] block text-zinc-400">cm</span>
            </div>
          </div>

          <div className="space-y-1 text-right text-xs">
            <div>
              <span className="text-zinc-500">Posture Score: </span>
              <strong className="text-zinc-200">{telemetry.ergonomicHealthScore}%</strong>
            </div>
            <div>
              <span className="text-zinc-500">Ideal Zone: </span>
              <strong className="text-zinc-200">50 – 75 cm</strong>
            </div>
            <div>
              <span className="text-zinc-500">Current: </span>
              <strong className={telemetry.screenDistanceCm >= 45 ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.screenDistanceCm >= 45 ? 'Healthy' : 'Too Close'}
              </strong>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Spine Status:</span>
          <span className={telemetry.screenDistanceCm >= 45 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
            {telemetry.screenDistanceCm >= 45 ? 'Upright & Comfortable' : 'Craning Forward'}
          </span>
        </div>
      </div>

      {/* 4. Eye Contact & Symmetry */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/80 p-4 shadow-xl backdrop-blur-xl hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-zinc-200 text-xs font-semibold">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span>Eye Contact</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            telemetry.isLookingAtScreen ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}>
            {telemetry.isLookingAtScreen ? 'Looking at Screen' : 'Looking Away'}
          </span>
        </div>

        <div className="space-y-3 my-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Eye Contact Rate</span>
              <strong className={telemetry.isLookingAtScreen ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.gazeAttentionScore}%
              </strong>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${telemetry.isLookingAtScreen ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, telemetry.gazeAttentionScore)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">Face Symmetry</span>
              <strong className="text-purple-400">{telemetry.symmetryScore}%</strong>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${Math.min(100, telemetry.symmetryScore)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 flex justify-between">
          <span>Gaze Direction:</span>
          <strong className={telemetry.isLookingAtScreen ? 'text-emerald-400' : 'text-amber-400'}>
            {telemetry.isLookingAtScreen ? 'Locked on Camera' : 'Drifting Away'}
          </strong>
        </div>
      </div>
    </div>
  );
};
