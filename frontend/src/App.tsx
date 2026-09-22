import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { WebcamTracker3D } from './components/WebcamTracker3D';
import { ThreeDigitalTwinViewer } from './components/ThreeDigitalTwinViewer';
import { CyberpunkTelemetryHUD } from './components/CyberpunkTelemetryHUD';
import { LiveNeuralVoiceCoach } from './components/LiveNeuralVoiceCoach';
import { InteractivePurposeSuite } from './components/InteractivePurposeSuite';
import { TelemetryTimelineChart } from './components/TelemetryTimelineChart';
import { ExecutiveScorecardModal } from './components/ExecutiveScorecardModal';
import { spatialWsClient } from './services/websocketClient';
import { mediaPipeEngine } from './services/mediapipe3d';
import { speechEngine } from './services/speechAnalysis';
import { api } from './services/api';
import { AnalysisSession, ExecutiveScorecard, Point3D, SpatialTelemetryResponse, SpeechAnalysisMetrics, TrackingMode } from './types';
import { localSpatialEngine } from './services/localSpatialEngine';

export const App: React.FC = () => {
  const [mode, setMode] = useState<TrackingMode>('INTERVIEW_COACH');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [landmarks, setLandmarks] = useState<Point3D[] | null>(null);
  const [telemetry, setTelemetry] = useState<SpatialTelemetryResponse | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<SpatialTelemetryResponse[]>([]);
  const [scorecard, setScorecard] = useState<ExecutiveScorecard | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [mobileView, setMobileView] = useState<'CAMERA' | '3D_TWIN' | 'SPLIT'>('CAMERA');
  const [speechMetrics, setSpeechMetrics] = useState<SpeechAnalysisMetrics>({
    transcript: '',
    interimTranscript: '',
    wordCount: 0,
    wpm: 0,
    fillerCount: 0,
    fillersDetected: [],
    isListening: false,
    audioVolume: 0,
  });

  const sessionRef = useRef<AnalysisSession | null>(null);
  sessionRef.current = currentSession;
  const wsConnectedRef = useRef(wsConnected);
  wsConnectedRef.current = wsConnected;
  const historyRef = useRef<SpatialTelemetryResponse[]>([]);
  historyRef.current = telemetryHistory;

  // Initialize WebSocket connection to Java Spring Boot Backend
  useEffect(() => {
    spatialWsClient.connect(
      (data) => {
        setTelemetry(data);
        setTelemetryHistory((prev) => [...prev.slice(-60), data]);
      },
      (connected) => {
        setWsConnected(connected);
      }
    );

    return () => {
      spatialWsClient.disconnect();
      speechEngine.stop();
    };
  }, []);

  // Handle Session Toggle (Start / Conclude)
  const handleToggleSession = async () => {
    if (isSessionActive) {
      // Conclude Session
      mediaPipeEngine.stop();
      speechEngine.stop();
      setIsSessionActive(false);

      const durationSecs = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));

      if (currentSession && wsConnected) {
        try {
          const card = await api.concludeSession(currentSession.sessionUuid);
          card.totalWordsSpoken = speechMetrics.wordCount;
          card.averageWpm = speechMetrics.wpm;
          card.totalFillersUsed = speechMetrics.fillerCount;
          setScorecard(card);
        } catch (e) {
          console.warn('Backend conclude failed, falling back to local scorecard generator', e);
          const localCard = localSpatialEngine.generateScorecard(
            currentSession.sessionUuid,
            mode,
            historyRef.current,
            durationSecs,
            speechMetrics
          );
          setScorecard(localCard);
        }
      } else {
        // Standalone Vercel mode: Generate scorecard locally with high precision
        const localCard = localSpatialEngine.generateScorecard(
          currentSession?.sessionUuid || 'session-' + Date.now(),
          mode,
          historyRef.current,
          durationSecs,
          speechMetrics
        );
        setScorecard(localCard);
      }
      setCurrentSession(null);
    } else {
      // Start Session
      setSessionStartTime(Date.now());
      setTelemetryHistory([]);

      try {
        const title =
          mode === 'INTERVIEW_COACH'
            ? 'Executive Interview Composure Practice'
            : mode === 'MINDFUL_WELLNESS'
            ? 'Mindful Stress Equilibrium Session'
            : 'Ergonomic Screen Posture Diagnostic';

        const session = await api.startSession(title, mode);
        setCurrentSession(session);
        setIsSessionActive(true);

        // Start Speech Analysis
        speechEngine.start((metrics) => {
          setSpeechMetrics(metrics);
        });

        // Start 3D Video & Landmark Stream
        const video = document.getElementById('webcam-video') as HTMLVideoElement;
        if (video) {
          await mediaPipeEngine.start(video, (pts) => {
            setLandmarks(pts);
            if (sessionRef.current && wsConnectedRef.current) {
              spatialWsClient.sendFrame(sessionRef.current.sessionUuid, pts);
            } else {
              // High-speed local calculation fallback
              const localData = localSpatialEngine.computeTelemetry(pts);
              setTelemetry(localData);
              setTelemetryHistory((prev) => [...prev.slice(-60), localData]);
            }
          });
        }
      } catch (e) {
        console.warn('Backend server offline or running in standalone mode; starting locally.', e);
        // Fallback: start camera locally
        setIsSessionActive(true);
        setCurrentSession({
          id: 1,
          sessionUuid: 'local-session-' + Date.now(),
          title: 'Local Practice Session',
          mode: mode,
          startTime: new Date().toISOString(),
        });

        speechEngine.start((metrics) => {
          setSpeechMetrics(metrics);
        });

        const video = document.getElementById('webcam-video') as HTMLVideoElement;
        if (video) {
          await mediaPipeEngine.start(video, (pts) => {
            setLandmarks(pts);
            const localData = localSpatialEngine.computeTelemetry(pts);
            setTelemetry(localData);
            setTelemetryHistory((prev) => [...prev.slice(-60), localData]);
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08080b] text-zinc-100 flex flex-col font-sans relative selection:bg-blue-500/30 selection:text-white">
      {/* Dynamic Ambient Background Glows to eliminate starkness */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[550px] h-[550px] bg-emerald-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <Navbar
        mode={mode}
        onModeChange={setMode}
        isSessionActive={isSessionActive}
        onToggleSession={handleToggleSession}
        wsConnected={wsConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-5 relative z-10">
        {/* Mobile Viewport Selector (Visible on mobile screens < lg) */}
        <div className="flex lg:hidden items-center justify-between bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs shadow-md">
          <button
            onClick={() => setMobileView('CAMERA')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
              mobileView === 'CAMERA' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📹 Camera Feed
          </button>
          <button
            onClick={() => setMobileView('3D_TWIN')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
              mobileView === '3D_TWIN' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🌐 3D Face Model
          </button>
          <button
            onClick={() => setMobileView('SPLIT')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
              mobileView === 'SPLIT' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ⚏ Split View
          </button>
        </div>

        {/* Top Viewports: Camera Feed (Left) & 3D Spatial Model (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5 min-h-[280px] sm:min-h-[380px]">
          <div className={`${mobileView === '3D_TWIN' ? 'hidden lg:block' : 'block'} h-full min-h-[280px] sm:min-h-[360px]`}>
            <WebcamTracker3D
              isStreaming={isSessionActive}
              landmarks={landmarks}
              telemetry={telemetry}
            />
          </div>

          <div className={`${mobileView === 'CAMERA' ? 'hidden lg:block' : 'block'} h-full min-h-[280px] sm:min-h-[360px]`}>
            <ThreeDigitalTwinViewer
              landmarks={landmarks}
              telemetry={telemetry}
            />
          </div>
        </div>

        {/* Live Audio Coach */}
        <LiveNeuralVoiceCoach
          telemetry={telemetry}
          mode={mode}
          isActive={isSessionActive}
        />

        {/* Practice Suite: Interview / Breathing / Posture */}
        <InteractivePurposeSuite
          mode={mode}
          telemetry={telemetry}
          speechMetrics={speechMetrics}
          isActive={isSessionActive}
        />

        {/* Real-time Biometric Metric Cards */}
        <CyberpunkTelemetryHUD telemetry={telemetry} />

        {/* Waveform Telemetry Chart */}
        <TelemetryTimelineChart telemetryHistory={telemetryHistory} />
      </main>

      {/* Human-crafted, clean footer */}
      <footer className="border-t border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-500 bg-zinc-950/60 backdrop-blur-md relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="font-semibold text-zinc-400">TrueFace 3D</span>
          <span>•</span>
          <span>Real-time face tracking, speech clarity &amp; posture coaching</span>
          <span>•</span>
          <span className="text-zinc-600 font-mono">Powered by Java 21 &amp; WebGL</span>
        </div>
      </footer>

      {/* Session Scorecard Modal */}
      <ExecutiveScorecardModal
        scorecard={scorecard}
        onClose={() => setScorecard(null)}
      />
    </div>
  );
};
