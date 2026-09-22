package com.trueface3d.spatial;

import com.trueface3d.spatial.model.Point3D;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Computes 3D Eye Gaze Ray and Attention Retention Score
 * by decoupling eye pupil orientation from rigid head pose.
 */
@Service
public class GazeRayIntersectionService {

    // Left Eye Landmarks
    public static final int LEFT_EYE_OUTER = 33;
    public static final int LEFT_EYE_INNER = 133;

    // Right Eye Landmarks
    public static final int RIGHT_EYE_OUTER = 263;
    public static final int RIGHT_EYE_INNER = 362;

    public record GazeMetrics(
        double gazeAttentionScore,
        double horizontalGazeAngle,
        double verticalGazeAngle,
        boolean isLookingAtScreen
    ) {}

    public GazeMetrics evaluateGaze(List<Point3D> landmarks, double yawDeg, double pitchDeg) {
        if (landmarks == null || landmarks.size() < 400) {
            return new GazeMetrics(90.0, 0.0, 0.0, true);
        }

        // Midpoints of left and right eyes
        Point3D leftEyeMid = landmarks.get(LEFT_EYE_OUTER).midpoint(landmarks.get(LEFT_EYE_INNER));
        Point3D rightEyeMid = landmarks.get(RIGHT_EYE_OUTER).midpoint(landmarks.get(RIGHT_EYE_INNER));

        // Use iris landmarks if available (indices 468, 473) or estimated optical centers
        Point3D leftPupil = landmarks.size() > 468 ? landmarks.get(468) : leftEyeMid;
        Point3D rightPupil = landmarks.size() > 473 ? landmarks.get(473) : rightEyeMid;

        // Pupil horizontal offset inside the eye aperture (-1.0 = looking far left, +1.0 = looking far right)
        double leftOffset = (leftPupil.x() - leftEyeMid.x()) / Math.max(1e-4, landmarks.get(LEFT_EYE_OUTER).distance2D(landmarks.get(LEFT_EYE_INNER)));
        double rightOffset = (rightPupil.x() - rightEyeMid.x()) / Math.max(1e-4, landmarks.get(RIGHT_EYE_OUTER).distance2D(landmarks.get(RIGHT_EYE_INNER)));
        double eyeTurnAngleDeg = ((leftOffset + rightOffset) / 2.0) * 45.0;

        // Combined Net Gaze Angle (Head Yaw + Eye Angle)
        double netHorizontalGaze = yawDeg + eyeTurnAngleDeg;
        double netVerticalGaze = pitchDeg;

        // Screen boundary conical threshold (+/- 18 degrees horizontally, +/- 15 degrees vertically)
        double gazeDeviation = Math.sqrt(netHorizontalGaze * netHorizontalGaze + netVerticalGaze * netVerticalGaze);

        double attentionScore = Math.max(10.0, Math.min(100.0, 100.0 - (gazeDeviation * 2.8)));
        boolean lookingAtScreen = gazeDeviation <= 22.0;

        return new GazeMetrics(
            Math.round(attentionScore * 10.0) / 10.0,
            Math.round(netHorizontalGaze * 10.0) / 10.0,
            Math.round(netVerticalGaze * 10.0) / 10.0,
            lookingAtScreen
        );
    }
}
