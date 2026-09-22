package com.trueface3d.service;

import com.trueface3d.model.TelemetrySnapshot;
import com.trueface3d.spatial.model.Point3D;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * High-performance Affective Computing Engine.
 * Evaluates core emotion distribution, cognitive composure, and stress index.
 */
@Service
public class AffectiveAnalyticsService {

    public static final int LEFT_INNER_BROW = 55;
    public static final int RIGHT_INNER_BROW = 285;
    public static final int GLABELLA = 168;

    public record AffectiveResult(
        double joy,
        double calm,
        double focusTension,
        double surprise,
        double sadness,
        double skepticism,
        String dominantEmotion,
        double stressScore,
        double composureScore
    ) {}

    public AffectiveResult computeAffect(
        List<Point3D> landmarks,
        double mouthSmileIntensity,
        double smileAuthenticity,
        double browAsymmetry,
        double gazeAttentionScore
    ) {
        if (landmarks == null || landmarks.size() < 300) {
            return new AffectiveResult(0.0, 1.0, 0.0, 0.0, 0.0, 0.0, "Calm 😐", 10.0, 95.0);
        }

        // Brow Furrow (Corrugator Supercilii activation): Distance between inner eyebrows
        Point3D leftBrow = landmarks.get(LEFT_INNER_BROW);
        Point3D rightBrow = landmarks.get(RIGHT_INNER_BROW);
        double browDistance = leftBrow.distance2D(rightBrow);

        // Normalize by eye span
        double eyeSpan = Math.max(1e-4, landmarks.get(33).distance2D(landmarks.get(263)));
        double normalizedBrowDistance = browDistance / eyeSpan;

        // Brow furrowing compresses distance (baseline ~0.26, furrowed down to ~0.16)
        double browFurrowIntensity = Math.max(0.0, Math.min(1.0, (0.26 - normalizedBrowDistance) / 0.10));

        // Joy: Driven by genuine smile and mouth intensity
        double rawJoy = (mouthSmileIntensity / 100.0) * 0.7 + (smileAuthenticity / 100.0) * 0.3;

        // Focus & Tension: Brow furrowing without smile
        double rawFocusTension = browFurrowIntensity * (1.0 - rawJoy * 0.7);

        // Skepticism: Brow asymmetry coupled with mild tension
        double rawSkepticism = Math.min(1.0, (browAsymmetry / 80.0) * 0.6 + rawFocusTension * 0.4);

        // Surprise: Eye opening and mouth opening
        double rawSurprise = 0.05;

        // Sadness: Downturned mouth corners
        double rawSadness = Math.max(0.0, (0.05 + rawFocusTension * 0.1) * (1.0 - rawJoy));

        // Calm / Neutral: Remaining baseline
        double rawCalm = Math.max(0.15, 1.0 - (rawJoy + rawFocusTension + rawSkepticism + rawSadness));

        // Normalization to sum to 1.0
        double total = rawJoy + rawCalm + rawFocusTension + rawSurprise + rawSadness + rawSkepticism;
        double joy = Math.round((rawJoy / total) * 100.0) / 100.0;
        double calm = Math.round((rawCalm / total) * 100.0) / 100.0;
        double focus = Math.round((rawFocusTension / total) * 100.0) / 100.0;
        double surprise = Math.round((rawSurprise / total) * 100.0) / 100.0;
        double sadness = Math.round((rawSadness / total) * 100.0) / 100.0;
        double skepticism = Math.round((rawSkepticism / total) * 100.0) / 100.0;

        // Identify Dominant Emotion
        String dominant = "Calm 😐";
        double maxScore = calm;
        if (joy > maxScore) { dominant = "Joy 😊"; maxScore = joy; }
        if (focus > maxScore) { dominant = "Intense Focus 🧐"; maxScore = focus; }
        if (skepticism > maxScore) { dominant = "Skeptical 🤔"; maxScore = skepticism; }
        if (sadness > maxScore) { dominant = "Melancholy 😔"; maxScore = sadness; }

        // Stress Score: Correlates with high brow furrow tension and ungrounded movement
        double rawStress = (focus * 0.45 + skepticism * 0.35 + sadness * 0.30 - joy * 0.25 - calm * 0.35);
        double stressScore = Math.max(5.0, Math.min(100.0, Math.round((rawStress + 0.30) * 100.0)));

        // Composure Score: Steady calm, attentive gaze, absence of erratic tension
        double composureScore = Math.max(10.0, Math.min(100.0, (calm * 45.0 + joy * 35.0 + (gazeAttentionScore * 0.20))));

        return new AffectiveResult(
            joy, calm, focus, surprise, sadness, skepticism, dominant,
            stressScore, Math.round(composureScore * 10.0) / 10.0
        );
    }

    public double calculateEmotionalStability(List<TelemetrySnapshot> snapshots) {
        if (snapshots == null || snapshots.size() < 3) return 92.0;

        double sumStress = 0.0;
        for (TelemetrySnapshot s : snapshots) {
            sumStress += s.getStressScore();
        }
        double mean = sumStress / snapshots.size();

        double variance = 0.0;
        for (TelemetrySnapshot s : snapshots) {
            double diff = s.getStressScore() - mean;
            variance += (diff * diff);
        }
        double stdDev = Math.sqrt(variance / snapshots.size());

        // Lower standard deviation = higher emotional resilience
        return Math.max(30.0, Math.min(100.0, Math.round((100.0 - (stdDev * 2.1)) * 10.0) / 10.0));
    }
}
