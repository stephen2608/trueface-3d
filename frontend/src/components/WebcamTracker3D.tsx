import React, { useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';
import { Point3D, SpatialTelemetryResponse } from '../types';

interface Props {
  isStreaming: boolean;
  landmarks: Point3D[] | null;
  telemetry: SpatialTelemetryResponse | null;
}

export const WebcamTracker3D: React.FC<Props> = ({ isStreaming, landmarks, telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks || landmarks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Clean tracking dots
    ctx.fillStyle = '#60a5fa';

    for (let i = 0; i < landmarks.length; i += 3) {
      const pt = landmarks[i];
      const px = (1.0 - pt.x) * w;
      const py = pt.y * h;

      ctx.beginPath();
      ctx.arc(px, py, 1.4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Connect smile contours
    const lipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
    ctx.strokeStyle = telemetry?.smileType === 'GENUINE_DUCHENNE' ? '#34d399' : '#3b82f6';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < lipIndices.length; i++) {
      const pt = landmarks[lipIndices[i]];
      const px = (1.0 - pt.x) * w;
      const py = pt.y * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }, [landmarks, telemetry]);

  const getPostureBadge = () => {
    if (!telemetry) return null;
    const status = telemetry.postureStatus;
    if (status === 'OPTIMAL_POSTURE') {
      return (
        <span className="flex items-center space-x-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Great Posture</span>
        </span>
      );
    } else if (status === 'LEANING_TOO_CLOSE') {
      return (
        <span className="flex items-center space-x-1.5 bg-red-950/80 text-red-400 border border-red-800/80 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Too Close to Screen</span>
        </span>
      );
    } else if (status === 'CRANING_NECK_FORWARD') {
      return (
        <span className="flex items-center space-x-1.5 bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Sitting Forward</span>
        </span>
      );
    } else {
      return (
        <span className="flex items-center space-x-1.5 bg-zinc-800/80 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <span>{status.replace(/_/g, ' ')}</span>
        </span>
      );
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col shadow-xl backdrop-blur-xl group hover:border-zinc-700 transition-all min-h-[260px] sm:min-h-[340px]">
      {/* Top Status Bar */}
      <div className="absolute top-2.5 sm:top-3.5 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide">
            Camera Feed
          </span>
        </div>
        {getPostureBadge()}
      </div>

      {/* Video Stream & Coordinate Overlay */}
      <div className="relative w-full h-full min-h-[240px] sm:min-h-[320px] flex items-center justify-center bg-black/40">
        <video
          id="webcam-video"
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-90"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {!isStreaming && (
          <div className="z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center text-zinc-400">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 text-zinc-600" />
            <p className="text-xs sm:text-sm font-semibold text-zinc-200">Camera is Off</p>
            <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Click "Start" above to turn on face tracking</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 bg-zinc-900/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-zinc-800/80 backdrop-blur-md shadow-lg">
        <span>Vision: <strong className="text-white">3D Landmarks</strong></span>
        <span>Speed: <strong className="text-emerald-400">60 FPS</strong></span>
      </div>
    </div>
  );
};
