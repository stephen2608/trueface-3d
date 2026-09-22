package com.trueface3d.spatial;

import com.trueface3d.spatial.model.Point3D;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Evaluates 3D Ergonomic Posture, Camera Distance ($Z$-Depth in cm),
 * and Forward Neck Craning ("Text-Neck Syndrome") in real time.
 */
@Service
public class PostureErgonomicsService {

    public static final int LEFT_EYE_OUTER = 33;
    public static final int RIGHT_EYE_OUTER = 263;
    public static final int NOSE_TIP = 1;
    public static final int CHIN = 152;

    public record PostureMetrics(
        double estimatedDistanceCm,
        double verticalPositionRatio,
        String postureStatus,
        double ergonomicHealthScore
    ) {}

    public PostureMetrics evaluatePosture(List<Point3D> landmarks, double pitchDeg, double rollDeg) {
        if (landmarks == null || landmarks.size() < 300) {
            return new PostureMetrics(60.0, 0.5, "OPTIMAL_POSTURE", 100.0);
        }

        Point3D leftEye = landmarks.get(LEFT_EYE_OUTER);
        Point3D rightEye = landmarks.get(RIGHT_EYE_OUTER);
        Point3D nose = landmarks.get(NOSE_TIP);

        // Calculate 2D span of eye width in normalized screen space
        double eyeSpan = leftEye.distance2D(rightEye);
        if (eyeSpan < 1e-4) eyeSpan = 0.2;

        // Metric depth approximation based on human anthropometric eye distance (~9.5cm)
        // At normal 60cm distance, eyeSpan is approx 0.18 - 0.22 in normalized coordinates
        double estimatedDist = (0.20 / eyeSpan) * 60.0;
        estimatedDist = Math.max(25.0, Math.min(120.0, estimatedDist));

        // Vertical positioning (0.0 = top of screen, 1.0 = bottom)
        double verticalRatio = nose.y();

        // Determine ergonomic posture status
        String status;
        double healthScore = 100.0;

        if (estimatedDist < 42.0) {
            status = "LEANING_TOO_CLOSE";
            healthScore -= 35.0;
        } else if (estimatedDist > 85.0) {
            status = "TOO_FAR_AWAY";
            healthScore -= 15.0;
        } else if (verticalRatio > 0.70 && pitchDeg > 15.0) {
            status = "SLOUCHING_BACKWARD";
            healthScore -= 40.0;
        } else if (Math.abs(rollDeg) > 18.0) {
            status = "HEAD_TILTED_ASYMMETRIC";
            healthScore -= 20.0;
        } else if (pitchDeg < -16.0) {
            status = "CRANING_NECK_FORWARD";
            healthScore -= 30.0;
        } else {
            status = "OPTIMAL_POSTURE";
        }

        return new PostureMetrics(
            Math.round(estimatedDist * 10.0) / 10.0,
            Math.round(verticalRatio * 100.0) / 100.0,
            status,
            Math.max(10.0, Math.min(100.0, healthScore))
        );
    }
}
