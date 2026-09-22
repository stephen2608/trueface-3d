import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import { SpatialTelemetryResponse } from '../types';

interface Props {
  telemetryHistory: SpatialTelemetryResponse[];
}

export const TelemetryTimelineChart: React.FC<Props> = ({ telemetryHistory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle horizontal grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += h / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (telemetryHistory.length < 2) return;

    const count = telemetryHistory.length;
    const stepX = w / Math.max(1, count - 1);

    // 1. Duchenne Marker Synchrony (Emerald)
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < count; i++) {
      const val = telemetryHistory[i].smileAuthenticity;
      const x = i * stepX;
      const y = h - (val / 100) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Somatic Arousal / Stress (Rose)
    ctx.beginPath();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < count; i++) {
      const val = telemetryHistory[i].stressScore;
      const x = i * stepX;
      const y = h - (val / 100) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3. Optical Working Distance Z (Blue)
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < count; i++) {
      const dist = telemetryHistory[i].screenDistanceCm;
      const val = Math.max(0, Math.min(100, ((dist - 30) / 60) * 100));
      const x = i * stepX;
      const y = h - (val / 100) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [telemetryHistory]);

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/90 p-3 sm:p-4 shadow-xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-bold text-white">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Motion &amp; Emotion Trends</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-zinc-300 font-medium">Warmth</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
            <span className="text-zinc-300 font-medium">Tension</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
            <span className="text-zinc-300 font-medium">Distance</span>
          </span>
        </div>
      </div>

      <div className="relative w-full h-16 sm:h-20 bg-zinc-950/80 rounded-xl overflow-hidden border border-zinc-800/80">
        <canvas ref={canvasRef} width={800} height={80} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};
