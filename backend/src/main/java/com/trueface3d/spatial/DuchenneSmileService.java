package com.trueface3d.spatial;

import com.trueface3d.spatial.model.Point3D;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Evaluates Smile Authenticity (Genuine Duchenne vs Courtesy/Forced Smile)
 * by analyzing 3D volumetric cheek displacement (Zygomaticus Major)
 * and eye aperture compression (Orbicularis Oculi).
 */
@Service
public class DuchenneSmileService {

    // Landmark Indices
    public static final int LEFT_MOUTH_CORNER = 61;
    public static final int RIGHT_MOUTH_CORNER = 291;
    public static final int UPPER_LIP_MID = 0;
    public static final int LOWER_LIP_MID = 17;

    public static final int LEFT_CHEEK = 205;
    public static final int RIGHT_CHEEK = 425;

    public static final int LEFT_EYE_TOP = 159;
    public static final int LEFT_EYE_BOTTOM = 145;
    public static final int RIGHT_EYE_TOP = 386;
    public static final int RIGHT_EYE_BOTTOM = 374;

    public static final int LEFT_EYE_OUTER = 33;
    public static final int RIGHT_EYE_OUTER = 263;

    public record SmileMetrics(
        double mouthSmileIntensity,
        double cheekElevationIntensity,
        double eyeCompressionIntensity,
        double authenticityScore,
        String smileType
    ) {}

    public SmileMetrics evaluateSmile(List<Point3D> landmarks) {
        if (landmarks == null || landmarks.size() < 430) {
            return new SmileMetrics(0.0, 0.0, 0.0, 0.0, "NEUTRAL");
        }

        Point3D leftMouth = landmarks.get(LEFT_MOUTH_CORNER);
        Point3D rightMouth = landmarks.get(RIGHT_MOUTH_CORNER);
        Point3D leftEyeOuter = landmarks.get(LEFT_EYE_OUTER);
        Point3D rightEyeOuter = landmarks.get(RIGHT_EYE_OUTER);

        double interOcularDistance = Math.max(1e-5, leftEyeOuter.distance3D(rightEyeOuter));

        // 1. Mouth Smile Expansion (Horizontal & Upward Stretch)
        double mouthWidth = leftMouth.distance3D(rightMouth);
        double normalizedMouthWidth = mouthWidth / interOcularDistance;
        // Baseline mouth width is ~0.65 - 0.72 of inter-ocular; smiling reaches 0.85 - 1.05
        double rawMouthSmile = Math.max(0.0, Math.min(1.0, (normalizedMouthWidth - 0.68) / 0.28));

        // 2. 3D Cheek Elevation (Zygomaticus Major Lift)
        Point3D leftCheek = landmarks.get(LEFT_CHEEK);
        Point3D rightCheek = landmarks.get(RIGHT_CHEEK);

        double leftCheekLiftY = (leftEyeOuter.y() - leftCheek.y()) / interOcularDistance;
        double rightCheekLiftY = (rightEyeOuter.y() - rightCheek.y()) / interOcularDistance;
        double avgCheekElevation = (leftCheekLiftY + rightCheekLiftY) / 2.0;
        // Normal baseline is ~0.38; smiling elevates cheeks upwards (decreasing Y distance to ~0.24)
        double rawCheekIntensity = Math.max(0.0, Math.min(1.0, (0.38 - avgCheekElevation) / 0.14));

        // 3. Eye Aperture Compression (Orbicularis Oculi crinkling)
        double leftEyeOpening = landmarks.get(LEFT_EYE_TOP).distance3D(landmarks.get(LEFT_EYE_BOTTOM));
        double rightEyeOpening = landmarks.get(RIGHT_EYE_TOP).distance3D(landmarks.get(RIGHT_EYE_BOTTOM));
        double avgEyeOpening = ((leftEyeOpening + rightEyeOpening) / 2.0) / interOcularDistance;
        // Resting eye aperture is ~0.12 - 0.15; smiling compresses eyes down to 0.05 - 0.09
        double rawEyeSquint = Math.max(0.0, Math.min(1.0, (0.13 - avgEyeOpening) / 0.065));

        // 4. Calculate Smile Authenticity
        // A genuine smile requires both cheek lift and eye involvement.
        // If mouth is wide but cheeks & eyes are motionless, it's a polite/courtesy smile.
        double authenticity;
        String type;

        if (rawMouthSmile < 0.25) {
            authenticity = 0.0;
            type = "NEUTRAL";
        } else {
            // Harmonic blend of cheek engagement and eye squinting relative to mouth
            double eyeCheekCoEngagement = (rawCheekIntensity * 0.55) + (rawEyeSquint * 0.45);
            double ratio = eyeCheekCoEngagement / Math.max(0.2, rawMouthSmile);

            if (ratio >= 0.75) {
                authenticity = Math.min(100.0, 70.0 + (ratio * 30.0));
                type = "GENUINE_DUCHENNE";
            } else if (ratio >= 0.40) {
                authenticity = Math.round(ratio * 75.0);
                type = "COURTESY_SOCIAL";
            } else {
                authenticity = Math.round(ratio * 50.0);
                type = "FORCED_OR_MASKED";
            }
        }

        return new SmileMetrics(
            Math.round(rawMouthSmile * 100.0),
            Math.round(rawCheekIntensity * 100.0),
            Math.round(rawEyeSquint * 100.0),
            Math.round(authenticity),
            type
        );
    }
}
