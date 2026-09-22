import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, MessageSquare, Sparkles } from 'lucide-react';
import { SpatialTelemetryResponse, TrackingMode } from '../types';

interface Props {
  telemetry: SpatialTelemetryResponse | null;
  mode: TrackingMode;
  isActive: boolean;
}

export const LiveNeuralVoiceCoach: React.FC<Props> = ({ telemetry, mode, isActive }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('Voice coach ready. Click "Start Practice" and I\'ll guide you with live tips!');
  const lastSpokenTime = useRef<number>(0);

  const speak = (text: string) => {
    setLastMessage(text);
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isActive || !telemetry) return;

    const now = Date.now();
    if (now - lastSpokenTime.current < 12000) return;

    // Ergonomic Screen Distance
    if (telemetry.postureStatus === 'LEANING_TOO_CLOSE') {
      speak('You are leaning a bit too close to your screen. Sit back and relax your shoulders.');
      lastSpokenTime.current = now;
      return;
    }
    if (telemetry.postureStatus === 'CRANING_NECK_FORWARD') {
      speak('Quick posture check: gently lift your chin and relax your neck.');
      lastSpokenTime.current = now;
      return;
    }

    // Mode-specific coaching
    if (mode === 'INTERVIEW_COACH') {
      if (telemetry.smileType === 'GENUINE_DUCHENNE' && telemetry.smileAuthenticity > 70) {
        speak('Great smile! That looks genuine, warm, and confident.');
        lastSpokenTime.current = now;
      } else if (!telemetry.isLookingAtScreen && telemetry.gazeAttentionScore < 60) {
        speak('Remember to look into the camera to keep good eye contact with your interviewer.');
        lastSpokenTime.current = now;
      } else if (telemetry.symmetryStatus === 'ASYMMETRIC_SMIRK') {
        speak('Keep a relaxed, natural expression as you talk.');
        lastSpokenTime.current = now;
      }
    } else if (mode === 'MINDFUL_WELLNESS') {
      if (telemetry.stressScore > 50) {
        speak('Notice any tension in your forehead. Take a slow, deep breath in.');
        lastSpokenTime.current = now;
      } else if (telemetry.calm > 0.6) {
        speak('You look calm and centered. Keep up that steady, gentle breathing.');
        lastSpokenTime.current = now;
      }
    } else {
      // ERGONOMICS_SENTINEL
      if (telemetry.screenDistanceCm < 45) {
        speak('Try keeping an arm\'s length distance between you and your display.');
        lastSpokenTime.current = now;
      }
    }
  }, [telemetry, isActive, mode, isMuted]);

  return (
    <div className="relative group bg-gradient-to-r from-zinc-900/90 via-zinc-900/95 to-zinc-900/90 rounded-2xl border border-zinc-800/90 p-3 sm:p-4 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 hover:border-blue-500/40 transition-all duration-300">
      <div className="flex items-center space-x-2.5 sm:space-x-3.5 flex-1 min-w-0">
        {/* Animated Sound Wave Equalizer Icon */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
          <div className="flex items-center space-x-0.5 h-3.5 sm:h-4">
            <span className={`w-0.5 bg-blue-400 rounded-full transition-all duration-300 ${isActive ? 'h-3 animate-pulse' : 'h-1.5'}`} />
            <span className={`w-0.5 bg-indigo-400 rounded-full transition-all duration-300 ${isActive ? 'h-3.5 sm:h-4 animate-bounce' : 'h-2'}`} />
            <span className={`w-0.5 bg-cyan-400 rounded-full transition-all duration-300 ${isActive ? 'h-2 animate-pulse' : 'h-1'}`} />
            <span className={`w-0.5 bg-blue-400 rounded-full transition-all duration-300 ${isActive ? 'h-3 animate-bounce' : 'h-2'}`} />
          </div>
        </div>

        <div className="overflow-hidden flex-1 min-w-0">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">Live Voice Coach</span>
            <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full font-medium ${isActive ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'bg-zinc-800 text-zinc-500'}`}>
              {isActive ? 'Listening' : 'Ready'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-300 font-medium line-clamp-1 sm:truncate mt-0.5 flex items-center space-x-1">
            <span className="text-blue-400 shrink-0">“</span>
            <span className="truncate">{lastMessage}</span>
            <span className="text-blue-400 shrink-0">”</span>
          </p>
        </div>
      </div>

      <div className="flex items-center shrink-0">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-1.5 ${
            isMuted
              ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
          }`}
          title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xs:inline">Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xs:inline">Sound</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

