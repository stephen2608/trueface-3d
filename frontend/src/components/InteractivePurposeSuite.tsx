import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, Heart, AlertCircle, CheckCircle2, UserCheck, Mic, MicOff, Zap, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { SpatialTelemetryResponse, SpeechAnalysisMetrics, TrackingMode } from '../types';

interface Props {
  mode: TrackingMode;
  telemetry: SpatialTelemetryResponse | null;
  speechMetrics: SpeechAnalysisMetrics;
  isActive: boolean;
}

const INTERVIEW_QUESTIONS = [
  "Tell me about yourself, what you love building, and what makes you excited about this opportunity.",
  "Describe a tough bug, outage, or technical bottleneck you had to diagnose and solve.",
  "How do you handle disagreements or different technical opinions when working with your team?",
  "How do you organize your work and stay productive when facing tight deadlines and competing priorities?",
  "Where do you see yourself growing technically over the next two to three years?"
];

export const InteractivePurposeSuite: React.FC<Props> = ({ mode, telemetry, speechMetrics, isActive }) => {
  const [promptIdx, setPromptIdx] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [eyeContactStreak, setEyeContactStreak] = useState(0);

  // Breathing state: Inhale (4s), Hold (7s), Exhale (8s)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCounter, setBreathCounter] = useState(4);

  useEffect(() => {
    if (!isActive) {
      setDurationSeconds(0);
      setEyeContactStreak(0);
      return;
    }
    const interval = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Eye contact streak timer
  useEffect(() => {
    if (!isActive || !telemetry) return;
    const interval = setInterval(() => {
      if (telemetry.isLookingAtScreen && telemetry.gazeAttentionScore >= 70) {
        setEyeContactStreak((prev) => prev + 1);
      } else {
        setEyeContactStreak(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, telemetry]);

  // 4-7-8 Breathing Protocol loop
  useEffect(() => {
    if (mode !== 'MINDFUL_WELLNESS' || !isActive) return;

    let count = 4;
    let phase: 'Inhale' | 'Hold' | 'Exhale' = 'Inhale';

    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        if (phase === 'Inhale') {
          phase = 'Hold';
          count = 7;
        } else if (phase === 'Hold') {
          phase = 'Exhale';
          count = 8;
        } else {
          phase = 'Inhale';
          count = 4;
        }
      }
      setBreathPhase(phase);
      setBreathCounter(count);
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isActive]);

  const speakPrompt = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
  };

  const handleNextPrompt = () => {
    const next = (promptIdx + 1) % INTERVIEW_QUESTIONS.length;
    setPromptIdx(next);
    speakPrompt(INTERVIEW_QUESTIONS[next]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. INTERVIEW PRACTICE MODE
  if (mode === 'INTERVIEW_COACH') {
    const isLookingAtScreen = telemetry ? telemetry.isLookingAtScreen && telemetry.gazeAttentionScore >= 65 : false;
    const isGenuineSmile = telemetry ? telemetry.smileAuthenticity >= 60 : false;
    const isGoodPosture = telemetry ? telemetry.postureStatus === 'OPTIMAL_POSTURE' : false;

    let wpmStatus = 'Start speaking...';
    let wpmColor = 'text-zinc-400';
    if (speechMetrics.wordCount > 5) {
      if (speechMetrics.wpm >= 120 && speechMetrics.wpm <= 165) {
        wpmStatus = 'Ideal Speaking Pace';
        wpmColor = 'text-emerald-400';
      } else if (speechMetrics.wpm < 120) {
        wpmStatus = 'A bit slow, try picking up pace';
        wpmColor = 'text-amber-400';
      } else {
        wpmStatus = 'Fast pace, remember to breathe';
        wpmColor = 'text-amber-400';
      }
    }

    return (
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-2xl border border-zinc-800/90 p-3.5 sm:p-6 shadow-xl backdrop-blur-xl space-y-3.5 sm:space-y-5">
        {/* Practice Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center font-bold text-xs">
              0{promptIdx + 1}
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Interview Practice
                </h3>
                <span className="text-[9px] sm:text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full">
                  Q{promptIdx + 1} of {INTERVIEW_QUESTIONS.length}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Answer aloud • Live gaze, warmth &amp; pacing analysis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-[10px] sm:text-xs font-mono bg-zinc-900/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-zinc-800 text-zinc-300">
              Time: <strong className="text-white font-semibold">{formatTime(durationSeconds)}</strong>
            </div>
            <button
              onClick={() => speakPrompt(INTERVIEW_QUESTIONS[promptIdx])}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-medium border border-zinc-700/80 transition-all shadow-sm"
              title="Hear this question read aloud"
            >
              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              <span>Read</span>
            </button>
            <button
              onClick={handleNextPrompt}
              className="flex items-center space-x-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-semibold shadow-md shadow-blue-600/25 hover:scale-[1.02] transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Question */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950/20 via-zinc-900/60 to-indigo-950/20 p-3 sm:p-4 rounded-xl border border-blue-500/20">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500" />
          <p className="text-xs sm:text-sm md:text-base font-medium text-zinc-100 leading-relaxed pl-1.5 sm:pl-2">
            "{INTERVIEW_QUESTIONS[promptIdx]}"
          </p>
        </div>

        {/* Live Speech, Equalizer & Transcript */}
        <div className="bg-zinc-900/80 p-3 sm:p-4 rounded-xl border border-zinc-800 space-y-2.5 sm:space-y-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Audio equalizer bar */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold text-[11px] sm:text-xs">
                {speechMetrics.isListening ? (
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-zinc-500" />
                )}
                <span>Mic</span>
              </div>

              {/* 12-bar dynamic equalizer */}
              <div className="flex items-end space-x-0.5 h-3.5 sm:h-4 bg-zinc-950/60 px-1.5 sm:px-2 py-0.5 rounded-md border border-zinc-800">
                {[0.4, 0.8, 1.2, 0.6, 1.4, 0.9, 1.5, 0.7, 1.1, 0.5, 1.3, 0.8].map((mult, i) => {
                  const barHeight = speechMetrics.isListening
                    ? Math.max(3, Math.min(14, (speechMetrics.audioVolume / 4) * mult))
                    : 2;
                  return (
                    <div
                      key={i}
                      className="w-0.5 sm:w-1 rounded-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-75"
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Speaking Stats (Mobile 3-box Grid / Desktop flex) */}
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:space-x-4 text-[10px] sm:text-xs w-full sm:w-auto">
              <div className="bg-zinc-950/60 p-1 sm:p-0 rounded-md sm:rounded-none border border-zinc-800/60 sm:border-none text-center sm:text-left">
                <span className="text-zinc-500 block sm:inline">Words: </span>
                <strong className="text-white">{speechMetrics.wordCount}</strong>
              </div>
              <div className="bg-zinc-950/60 p-1 sm:p-0 rounded-md sm:rounded-none border border-zinc-800/60 sm:border-none text-center sm:text-left">
                <span className="text-zinc-500 block sm:inline">Speed: </span>
                <strong className={wpmColor}>{speechMetrics.wpm} WPM</strong>
              </div>
              <div className="bg-zinc-950/60 p-1 sm:p-0 rounded-md sm:rounded-none border border-zinc-800/60 sm:border-none text-center sm:text-left">
                <span className="text-zinc-500 block sm:inline">Fillers: </span>
                <strong className={speechMetrics.fillerCount > 2 ? 'text-amber-400' : 'text-emerald-400'}>
                  {speechMetrics.fillerCount}
                </strong>
              </div>
            </div>
          </div>

          {/* Transcript Area */}
          <div className="min-h-[44px] sm:min-h-[52px] max-h-20 sm:max-h-24 overflow-y-auto bg-zinc-950/70 p-2.5 sm:p-3 rounded-lg border border-zinc-800/80 text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-sans">
            {speechMetrics.transcript || speechMetrics.interimTranscript ? (
              <span>
                {speechMetrics.transcript}{' '}
                <span className="text-blue-400 font-medium italic">{speechMetrics.interimTranscript}</span>
              </span>
            ) : (
              <span className="text-zinc-500 italic">
                Microphone listening... Speak naturally to see live transcription and speaking pace.
              </span>
            )}
          </div>
        </div>

        {/* 4 Live Feedback Cards: Clean 2x2 Grid on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
          {/* Eye Contact */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-blue-500/50 hover:bg-zinc-850 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 group">
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isLookingAtScreen ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {eyeContactStreak > 3 ? <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-bounce" /> : <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">Eye Contact</div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                {isLookingAtScreen ? (
                  <span className="text-emerald-400">{eyeContactStreak}s on screen</span>
                ) : (
                  <span className="text-zinc-400">Away</span>
                )}
              </div>
            </div>
          </div>

          {/* Warmth & Smile */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-850 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 group">
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isGenuineSmile ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'
            }`}>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">Warmth</div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                {isGenuineSmile ? (
                  <span className="text-emerald-400">Friendly</span>
                ) : (
                  <span className="text-zinc-400">Neutral</span>
                )}
              </div>
            </div>
          </div>

          {/* Posture */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-850 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 group">
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isGoodPosture ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">Posture</div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                {isGoodPosture ? (
                  <span className="text-emerald-400">Upright</span>
                ) : (
                  <span className="text-amber-400">Forward</span>
                )}
              </div>
            </div>
          </div>

          {/* Speech Flow */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/50 hover:bg-zinc-850 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 group">
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              speechMetrics.fillerCount === 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate">Clarity</div>
              <div className="text-[11px] sm:text-xs font-bold text-white truncate">
                {speechMetrics.fillerCount === 0 ? (
                  <span className="text-emerald-400">Crisp</span>
                ) : (
                  <span className="text-amber-400">{speechMetrics.fillerCount} fillers</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. BREATH & RELAXATION MODE (Crazy pulsating glowing ripple orb)
  if (mode === 'MINDFUL_WELLNESS') {
    const isCalm = telemetry ? telemetry.stressScore < 35 : true;

    return (
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 gap-2.5 sm:gap-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Guided Breathing &amp; Stress Reset (4-7-8 Technique)
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Synchronize your breath with the visual circle to release facial tension and calm your nervous system
              </p>
            </div>
          </div>
          <div className="text-[10px] sm:text-xs bg-zinc-900/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-zinc-800 text-zinc-300 self-start sm:self-auto">
            Tension: <strong className={isCalm ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {telemetry?.stressScore || 18}% ({isCalm ? 'Relaxed' : 'Mild Tension'})
            </strong>
          </div>
        </div>

        {/* Crazy Interactive Breathing Orb Visualizer */}
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-8 py-2 sm:py-4">
          <div className="relative flex flex-col items-center justify-center">
            {/* Concentric glowing ripple ring */}
            <div
              className={`absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full transition-all duration-1000 ${
                breathPhase === 'Inhale'
                  ? 'scale-125 bg-emerald-500/20 blur-xl'
                  : breathPhase === 'Hold'
                  ? 'scale-110 bg-cyan-500/25 blur-xl'
                  : 'scale-90 bg-teal-500/10 blur-lg'
              }`}
            />

            {/* Main Interactive Breathing Ball */}
            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
                breathPhase === 'Inhale'
                  ? 'scale-125 border-emerald-400 bg-gradient-to-tr from-emerald-600/30 to-teal-500/30 shadow-emerald-500/40'
                  : breathPhase === 'Hold'
                  ? 'scale-115 border-cyan-400 bg-gradient-to-tr from-cyan-600/30 to-blue-500/30 shadow-cyan-500/40'
                  : 'scale-95 border-teal-500/60 bg-gradient-to-tr from-teal-950/40 to-zinc-900/60 shadow-teal-500/10'
              }`}
            >
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-zinc-200">
                {breathPhase}
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
                {breathCounter}s
              </span>
            </div>

            <p className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-3 sm:mt-4 text-center">
              {breathPhase === 'Inhale' && 'Breathe in slowly through your nose...'}
              {breathPhase === 'Hold' && 'Gently hold your breath...'}
              {breathPhase === 'Exhale' && 'Slowly exhale out through your mouth...'}
            </p>
          </div>

          {/* Simple Human Feedback on Face Relaxation */}
          <div className="w-full max-w-md space-y-2.5 sm:space-y-3 bg-zinc-900/80 p-3 sm:p-4 rounded-xl border border-zinc-800">
            <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">
              Real-Time Facial Relaxation
            </h4>
            <div className="flex items-start space-x-2.5 text-[11px] sm:text-xs text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Forehead &amp; Brow:</strong>{' '}
                {telemetry && telemetry.stressScore > 40 ? 'Slight furrowing detected. Let your brow smooth out.' : 'Smooth and relaxed.'}
              </span>
            </div>
            <div className="flex items-start space-x-2.5 text-[11px] sm:text-xs text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Jaw &amp; Mouth:</strong> Resting comfortably in a neutral, unstrained posture.
              </span>
            </div>
            <div className="flex items-start space-x-2.5 text-[11px] sm:text-xs text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Heart Rate &amp; Calmness:</strong> Deep exhalation triggers your body's natural rest response.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. POSTURE GUARD MODE
  const isLeaningTooClose = telemetry ? telemetry.postureStatus === 'LEANING_TOO_CLOSE' || telemetry.screenDistanceCm < 45 : false;
  const isCraning = telemetry ? telemetry.postureStatus === 'CRANING_NECK_FORWARD' : false;

  return (
    <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 rounded-xl sm:rounded-2xl border border-zinc-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-zinc-800/80 gap-2.5 sm:gap-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Screen Posture &amp; Ergonomics Guard
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400">
              Protects your neck and back by monitoring your distance and head tilt in real time
            </p>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs bg-zinc-900/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-zinc-800 text-zinc-300 self-start sm:self-auto">
          Ideal Zone: <strong className="text-white">50 – 75 cm</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-center">
        {/* Posture Status Card */}
        <div className={`p-3 sm:p-4 rounded-xl border flex items-center space-x-3 sm:space-x-4 transition-all ${
          isLeaningTooClose || isCraning
            ? 'bg-amber-950/30 border-amber-800/80 text-amber-300 shadow-lg shadow-amber-950/20'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-200'
        }`}>
          <AlertCircle className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 ${isLeaningTooClose || isCraning ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
          <div>
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              {isLeaningTooClose
                ? 'Leaning Too Close to Screen'
                : isCraning
                ? 'Head Craning Forward'
                : 'Great Posture & Distance'}
            </div>
            <div className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">
              {isLeaningTooClose
                ? 'You are closer than 45 cm. Sit back comfortably and rest your shoulders.'
                : isCraning
                ? 'Try lifting your chin slightly to avoid neck strain.'
                : 'Your distance and head tilt are well-aligned with your display.'}
            </div>
          </div>
        </div>

        {/* Distance & Tilt Details */}
        <div className="bg-zinc-900/80 p-3 sm:p-4 rounded-xl border border-zinc-800 text-[11px] sm:text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Distance from Screen:</span>
            <strong className="text-sm sm:text-base font-mono text-white">{telemetry?.screenDistanceCm || 62} cm</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Head Tilt (Up / Down):</span>
            <strong className="text-white font-mono">{telemetry?.pitch || 0}°</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Ergonomic Score:</span>
            <strong className="text-emerald-400 font-bold">{telemetry?.ergonomicHealthScore || 100}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
