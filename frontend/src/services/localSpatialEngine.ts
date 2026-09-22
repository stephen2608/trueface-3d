import { ExecutiveScorecard, Point3D, SpatialTelemetryResponse, TrackingMode } from '../types';

export class LocalSpatialEngine {
  public computeTelemetry(landmarks: Point3D[]): SpatialTelemetryResponse {
    if (!landmarks || landmarks.length < 478) {
      return this.getDefaultTelemetry();
    }

    // Key anatomical anchors
    const nose = landmarks[1];
    const chin = landmarks[152];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const leftCheek = landmarks[205] || landmarks[116];
    const rightCheek = landmarks[425] || landmarks[345];
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const upperLip = landmarks[0];
    const lowerLip = landmarks[17];

    // 1. Head Pose (Pitch, Yaw, Roll)
    const dxEyes = rightEye.x - leftEye.x;
    const dyEyes = rightEye.y - leftEye.y;
    const roll = Math.round(Math.atan2(dyEyes, dxEyes) * (180 / Math.PI));

    const distLeft = Math.abs(nose.x - leftEye.x);
    const distRight = Math.abs(rightEye.x - nose.x);
    const yawRatio = (distRight - distLeft) / (distRight + distLeft + 1e-6);
    const yaw = Math.round(yawRatio * 75);

    const verticalNoseChin = chin.y - nose.y;
    const pitch = Math.round((verticalNoseChin - 0.22) * 120);

    // 2. Smile & Duchenne Authenticity
    const mouthWidth = Math.sqrt(
      Math.pow(mouthRight.x - mouthLeft.x, 2) + Math.pow(mouthRight.y - mouthLeft.y, 2)
    );
    const mouthOpen = Math.abs(lowerLip.y - upperLip.y);
    const smileWidthIntensity = Math.min(100, Math.round(Math.max(0, (mouthWidth - 0.12) / 0.10) * 100));

    // Cheek elevation
    const cheekLift = Math.min(100, Math.round(Math.max(0, (0.35 - (leftCheek.y + rightCheek.y) / 2) * 200)));
    const eyeSquint = Math.min(100, Math.round(Math.max(0, 100 - (mouthOpen * 250))));

    let authenticity = Math.min(100, Math.round(smileWidthIntensity * 0.4 + cheekLift * 0.4 + eyeSquint * 0.2));
    let smileType: 'GENUINE_DUCHENNE' | 'COURTESY_SOCIAL' | 'FORCED_OR_MASKED' | 'NEUTRAL' = 'NEUTRAL';

    if (authenticity > 65 && smileWidthIntensity > 35) {
      smileType = 'GENUINE_DUCHENNE';
    } else if (smileWidthIntensity > 25) {
      smileType = 'COURTESY_SOCIAL';
    } else if (authenticity > 45) {
      smileType = 'FORCED_OR_MASKED';
    }

    // 3. Screen Distance (cm)
    const eyeDist3D = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) +
      Math.pow(rightEye.y - leftEye.y, 2) +
      Math.pow(rightEye.z - leftEye.z, 2)
    );
    const screenDistanceCm = Math.round(Math.max(30, Math.min(95, 62 * (0.145 / Math.max(0.08, eyeDist3D)))));

    // Posture evaluation
    let postureStatus: 'OPTIMAL_POSTURE' | 'LEANING_TOO_CLOSE' | 'TOO_FAR_AWAY' | 'SLOUCHING_BACKWARD' | 'CRANING_NECK_FORWARD' | 'HEAD_TILTED_ASYMMETRIC' = 'OPTIMAL_POSTURE';
    let ergonomicHealthScore = 95;

    if (screenDistanceCm < 45) {
      postureStatus = 'LEANING_TOO_CLOSE';
      ergonomicHealthScore = 65;
    } else if (pitch < -12) {
      postureStatus = 'CRANING_NECK_FORWARD';
      ergonomicHealthScore = 70;
    } else if (screenDistanceCm > 85) {
      postureStatus = 'TOO_FAR_AWAY';
      ergonomicHealthScore = 80;
    }

    // 4. Eye Gaze Attention
    const isLookingAtScreen = Math.abs(yaw) < 18 && Math.abs(pitch) < 16;
    const gazeAttentionScore = isLookingAtScreen
      ? Math.max(70, Math.round(98 - Math.abs(yaw) * 1.2 - Math.abs(pitch) * 1.1))
      : Math.max(20, Math.round(55 - Math.abs(yaw)));

    // 5. Bilateral Symmetry
    const symmetryScore = Math.max(75, Math.round(96 - Math.abs(roll) * 1.5 - Math.abs(yaw) * 0.8));

    // Stress / Tension Score
    const stressScore = Math.max(10, Math.min(85, Math.round(18 + Math.abs(pitch) * 1.2 + (postureStatus !== 'OPTIMAL_POSTURE' ? 20 : 0))));

    return {
      sessionUuid: 'local-session',
      timestampMs: Date.now(),
      pitch,
      yaw,
      roll,
      smileType,
      smileAuthenticity: authenticity,
      cheekElevationIntensity: cheekLift,
      eyeCompressionIntensity: eyeSquint,
      mouthSmileIntensity: smileWidthIntensity,
      symmetryScore,
      symmetryStatus: symmetryScore > 85 ? 'BALANCED_HARMONY' : 'ASYMMETRIC_SMIRK',
      screenDistanceCm,
      postureStatus,
      ergonomicHealthScore,
      gazeAttentionScore,
      isLookingAtScreen,
      joy: authenticity > 50 ? authenticity / 100 : 0.05,
      calm: Math.max(0.2, (100 - stressScore) / 100),
      focusTension: gazeAttentionScore / 100,
      surprise: 0.05,
      sadness: 0.02,
      skepticism: 0.04,
      dominantEmotion: authenticity > 60 ? 'Warm & Engaged' : 'Neutral & Calm',
      stressScore,
      composureScore: Math.max(20, 100 - stressScore),
    };
  }

  public generateScorecard(
    sessionUuid: string,
    mode: TrackingMode,
    history: SpatialTelemetryResponse[],
    durationSeconds: number,
    speechMetrics: { wordCount: number; wpm: number; fillerCount: number }
  ): ExecutiveScorecard {
    const totalFrames = Math.max(1, history.length);
    const avgAuth = Math.round(history.reduce((acc, h) => acc + h.smileAuthenticity, 0) / totalFrames) || 72;
    const avgAttn = Math.round(history.reduce((acc, h) => acc + h.gazeAttentionScore, 0) / totalFrames) || 84;
    const avgSymm = Math.round(history.reduce((acc, h) => acc + h.symmetryScore, 0) / totalFrames) || 91;
    const goodPostureFrames = history.filter((h) => h.postureStatus === 'OPTIMAL_POSTURE').length;
    const postureCompliance = Math.round((goodPostureFrames / totalFrames) * 100) || 88;
    const avgStress = Math.round(history.reduce((acc, h) => acc + h.stressScore, 0) / totalFrames) || 20;
    const stability = Math.max(10, 100 - avgStress);

    // Composite score
    const overallScore = Math.min(98, Math.round(
      avgAuth * 0.25 + avgAttn * 0.30 + postureCompliance * 0.25 + stability * 0.20
    ));

    const executiveGrade = overallScore >= 90 ? 'A+' : overallScore >= 82 ? 'A' : overallScore >= 72 ? 'B+' : 'B';

    const recommendations: string[] = [];
    if (avgAttn >= 80) {
      recommendations.push('Superb eye contact! You kept strong visual connection with the camera.');
    } else {
      recommendations.push('Try centering your gaze on the camera lens to build stronger rapport.');
    }

    if (avgAuth >= 60) {
      recommendations.push('Your smile was warm, authentic, and naturally engaging.');
    } else {
      recommendations.push('Incorporate occasional warm smiles to convey approachable confidence.');
    }

    if (postureCompliance >= 80) {
      recommendations.push('Excellent working distance and spinal posture maintained throughout.');
    } else {
      recommendations.push('Remember to sit upright and avoid leaning closer than 50 cm to your display.');
    }

    if (speechMetrics.fillerCount === 0) {
      recommendations.push('Flawless verbal clarity with zero filler words detected!');
    } else {
      recommendations.push(`Keep an ear out for ${speechMetrics.fillerCount} filler words ("um", "like") by taking brief pauses.`);
    }

    const startTimeStr = new Date(Date.now() - durationSeconds * 1000).toISOString();
    const endTimeStr = new Date().toISOString();

    return {
      sessionUuid,
      title: mode === 'INTERVIEW_COACH' ? 'Executive Interview Practice' : mode === 'MINDFUL_WELLNESS' ? 'Mindful Breathing Session' : 'Posture Ergonomics Sentinel',
      mode,
      startTime: startTimeStr,
      endTime: endTimeStr,
      durationSeconds: Math.max(1, durationSeconds),
      totalFramesAnalyzed: totalFrames,
      overallScore,
      executiveGrade,
      averageAuthenticity: avgAuth,
      averageAttention: avgAttn,
      postureCompliance,
      averageSymmetry: avgSymm,
      emotionalStability: stability,
      averageStress: avgStress,
      dominantEmotion: avgAuth > 60 ? 'Engaged & Warm' : 'Composed & Focused',
      executiveSummary: `Solid delivery with an overall composure rating of ${overallScore}%. Maintained good camera presence, natural vocal pacing, and healthy posture.`,
      tacticalRecommendations: recommendations,
      totalWordsSpoken: speechMetrics.wordCount,
      averageWpm: speechMetrics.wpm,
      totalFillersUsed: speechMetrics.fillerCount,
    };
  }

  private getDefaultTelemetry(): SpatialTelemetryResponse {
    return {
      sessionUuid: 'local-session',
      timestampMs: Date.now(),
      pitch: 0,
      yaw: 0,
      roll: 0,
      smileType: 'NEUTRAL',
      smileAuthenticity: 0,
      cheekElevationIntensity: 0,
      eyeCompressionIntensity: 0,
      mouthSmileIntensity: 0,
      symmetryScore: 92,
      symmetryStatus: 'BALANCED_HARMONY',
      screenDistanceCm: 60,
      postureStatus: 'OPTIMAL_POSTURE',
      ergonomicHealthScore: 95,
      gazeAttentionScore: 85,
      isLookingAtScreen: true,
      joy: 0.1,
      calm: 0.8,
      focusTension: 0.15,
      surprise: 0.05,
      sadness: 0.02,
      skepticism: 0.04,
      dominantEmotion: 'Neutral & Calm',
      stressScore: 18,
      composureScore: 82,
    };
  }
}

export const localSpatialEngine = new LocalSpatialEngine();
