export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type TrackingMode = 'INTERVIEW_COACH' | 'MINDFUL_WELLNESS' | 'ERGONOMICS_SENTINEL';

export interface SpatialTelemetryResponse {
  sessionUuid: string;
  timestampMs: number;

  // 3D Head Pose
  pitch: number;
  yaw: number;
  roll: number;

  // Ergonomics & Distance
  screenDistanceCm: number;
  postureStatus: 'OPTIMAL_POSTURE' | 'LEANING_TOO_CLOSE' | 'TOO_FAR_AWAY' | 'SLOUCHING_BACKWARD' | 'CRANING_NECK_FORWARD' | 'HEAD_TILTED_ASYMMETRIC';
  ergonomicHealthScore: number;

  // Smile Authenticity
  mouthSmileIntensity: number;
  cheekElevationIntensity: number;
  eyeCompressionIntensity: number;
  smileAuthenticity: number;
  smileType: 'GENUINE_DUCHENNE' | 'COURTESY_SOCIAL' | 'FORCED_OR_MASKED' | 'NEUTRAL';

  // Bilateral Symmetry
  symmetryScore: number;
  symmetryStatus: 'BALANCED_HARMONY' | 'ASYMMETRIC_SMIRK' | 'SKEPTICAL_INQUIRY' | 'MILD_MICRO_TENSION';

  // 3D Gaze & Attention
  gazeAttentionScore: number;
  isLookingAtScreen: boolean;

  // Core Emotions
  joy: number;
  calm: number;
  focusTension: number;
  surprise: number;
  sadness: number;
  skepticism: number;
  dominantEmotion: string;
  stressScore: number;
  composureScore: number;
}

export interface SpeechAnalysisMetrics {
  transcript: string;
  interimTranscript: string;
  wordCount: number;
  wpm: number;
  fillerCount: number;
  fillersDetected: string[];
  isListening: boolean;
  audioVolume: number; // 0 - 100
}

export interface AnalysisSession {
  id?: number;
  sessionUuid: string;
  title: string;
  mode: TrackingMode;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  overallScore?: number;
  averageAuthenticity?: number;
  averageSymmetry?: number;
  postureCompliance?: number;
  emotionalStability?: number;
  executiveSummary?: string;
}

export interface ExecutiveScorecard {
  sessionUuid: string;
  title: string;
  mode: TrackingMode;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  totalFramesAnalyzed: number;
  overallScore: number;
  executiveGrade: string;
  averageAuthenticity: number;
  averageSymmetry: number;
  postureCompliance: number;
  emotionalStability: number;
  averageStress: number;
  averageAttention: number;
  dominantEmotion: string;
  executiveSummary: string;
  tacticalRecommendations: string[];

  // Speech Metrics in Scorecard
  totalWordsSpoken?: number;
  averageWpm?: number;
  totalFillersUsed?: number;
}
