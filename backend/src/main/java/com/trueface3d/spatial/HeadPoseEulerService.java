package com.trueface3d.spatial;

import com.trueface3d.spatial.model.Point3D;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Computes 3D Metric Head Pose (Yaw, Pitch, Roll in Degrees)
 * using rigid 3D cranial anchors from 478-point facial topology.
 */
@Service
public class HeadPoseEulerService {

    // Landmark Indices (MediaPipe Topology)
    public static final int NOSE_TIP = 1;
    public static final int CHIN = 152;
    public static final int LEFT_EYE_OUTER = 33;
    public static final int RIGHT_EYE_OUTER = 263;
    public static final int LEFT_MOUTH_CORNER = 61;
    public static final int RIGHT_MOUTH_CORNER = 291;
    public static final int GLABELLA = 168;

    public record EulerAngles(double pitch, double yaw, double roll) {}

    public EulerAngles calculateEulerAngles(List<Point3D> landmarks) {
        if (landmarks == null || landmarks.size() < 300) {
            return new EulerAngles(0.0, 0.0, 0.0);
        }

        Point3D nose = landmarks.get(NOSE_TIP);
        Point3D chin = landmarks.get(CHIN);
        Point3D leftEye = landmarks.get(LEFT_EYE_OUTER);
        Point3D rightEye = landmarks.get(RIGHT_EYE_OUTER);
        Point3D glabella = landmarks.get(GLABELLA);

        Point3D midEyes = leftEye.midpoint(rightEye);

        // 1. Roll: In-plane rotation around Z-axis (head tilting towards shoulders)
        double deltaY = rightEye.y() - leftEye.y();
        double deltaX = rightEye.x() - leftEye.x();
        double rollRad = Math.atan2(deltaY, deltaX);
        double rollDeg = Math.toDegrees(rollRad);

        // 2. Yaw: Rotation around Y-axis (turning head left or right)
        // Contrast the Z-depth disparity between left and right facial anchors
        double deltaZ_eyes = leftEye.z() - rightEye.z();
        double eyeSpanX = Math.max(1e-5, Math.abs(deltaX));
        double yawRad = Math.atan2(deltaZ_eyes * 2.2, eyeSpanX);
        double yawDeg = Math.toDegrees(yawRad);

        // 3. Pitch: Rotation around X-axis (nodding head up or down)
        // Contrast the nose protrusion relative to cranial base line
        double verticalSpan = Math.max(1e-5, chin.y() - glabella.y());
        double noseProtrusionZ = nose.z() - midEyes.z();
        double pitchRad = Math.atan2(-noseProtrusionZ * 2.5, verticalSpan);
        double pitchDeg = Math.toDegrees(pitchRad);

        return new EulerAngles(
            Math.round(pitchDeg * 10.0) / 10.0,
            Math.round(yawDeg * 10.0) / 10.0,
            Math.round(rollDeg * 10.0) / 10.0
        );
    }
}
