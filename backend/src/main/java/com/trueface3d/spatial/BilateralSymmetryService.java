package com.trueface3d.spatial;

import com.trueface3d.spatial.model.Point3D;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Computes 3D Bilateral Facial Symmetry across the sagittal plane
 * to detect asymmetric micro-expressions (smirks, skepticism, micro-contempt).
 */
@Service
public class BilateralSymmetryService {

    // Center Sagittal Anchors
    public static final int GLABELLA = 168;
    public static final int CHIN = 152;

    // Bilateral Pairs (Left vs Right)
    private static final int[][] SYMMETRY_PAIRS = {
        {61, 291},   // Mouth corners
        {205, 425},  // Cheeks
        {70, 300},   // Inner Eyebrows
        {105, 334},  // Mid Eyebrows
        {33, 263},   // Outer Eye corners
        {145, 374},  // Lower Eyelids
        {172, 397}   // Jawline boundaries
    };

    public record SymmetryResult(
        double overallSymmetryScore,
        double eyebrowAsymmetry,
        double mouthAsymmetry,
        String symmetryStatus
    ) {}

    public SymmetryResult evaluateSymmetry(List<Point3D> landmarks) {
        if (landmarks == null || landmarks.size() < 430) {
            return new SymmetryResult(95.0, 0.0, 0.0, "BALANCED");
        }

        Point3D glabella = landmarks.get(GLABELLA);
        Point3D chin = landmarks.get(CHIN);
        Point3D centerMidpoint = glabella.midpoint(chin);

        double interOcularDist = Math.max(1e-5, landmarks.get(33).distance3D(landmarks.get(263)));

        double totalDiscrepancy = 0.0;
        double browDiscrepancy = 0.0;
        double mouthDiscrepancy = 0.0;

        for (int[] pair : SYMMETRY_PAIRS) {
            Point3D left = landmarks.get(pair[0]);
            Point3D right = landmarks.get(pair[1]);

            // Distance of left and right points to center sagittal line
            double leftDistX = Math.abs(left.x() - centerMidpoint.x());
            double rightDistX = Math.abs(right.x() - centerMidpoint.x());
            double horizontalDelta = Math.abs(leftDistX - rightDistX);

            // Vertical delta between matching features
            double verticalDelta = Math.abs(left.y() - right.y());

            // 3D Depth delta
            double depthDelta = Math.abs(left.z() - right.z());

            double pairDiscrepancy = (horizontalDelta * 0.4 + verticalDelta * 0.4 + depthDelta * 0.2) / interOcularDist;
            totalDiscrepancy += pairDiscrepancy;

            if (pair[0] == 61) {
                mouthDiscrepancy = pairDiscrepancy;
            } else if (pair[0] == 70 || pair[0] == 105) {
                browDiscrepancy += pairDiscrepancy / 2.0;
            }
        }

        double avgDiscrepancy = totalDiscrepancy / SYMMETRY_PAIRS.length;
        double symmetryScore = Math.max(20.0, Math.min(100.0, 100.0 - (avgDiscrepancy * 320.0)));

        String status;
        if (symmetryScore >= 88.0) {
            status = "BALANCED_HARMONY";
        } else if (mouthDiscrepancy > 0.08) {
            status = "ASYMMETRIC_SMIRK";
        } else if (browDiscrepancy > 0.07) {
            status = "SKEPTICAL_INQUIRY";
        } else {
            status = "MILD_MICRO_TENSION";
        }

        return new SymmetryResult(
            Math.round(symmetryScore * 10.0) / 10.0,
            Math.round(browDiscrepancy * 1000.0) / 10.0,
            Math.round(mouthDiscrepancy * 1000.0) / 10.0,
            status
        );
    }
}
