package com.trueface3d.spatial;

import com.trueface3d.spatial.model.Point3D;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SpatialAlgorithmsTest {

    private HeadPoseEulerService headPoseService;
    private DuchenneSmileService smileService;
    private BilateralSymmetryService symmetryService;
    private PostureErgonomicsService postureService;
    private GazeRayIntersectionService gazeService;

    @BeforeEach
    void setUp() {
        headPoseService = new HeadPoseEulerService();
        smileService = new DuchenneSmileService();
        symmetryService = new BilateralSymmetryService();
        postureService = new PostureErgonomicsService();
        gazeService = new GazeRayIntersectionService();
    }

    private List<Point3D> createNeutralFaceMesh() {
        List<Point3D> landmarks = new ArrayList<>(478);
        for (int i = 0; i < 478; i++) {
            landmarks.add(new Point3D(0.5, 0.5, 0.0));
        }

        // Rigid cranial anchors
        landmarks.set(HeadPoseEulerService.NOSE_TIP, new Point3D(0.50, 0.50, -0.05));
        landmarks.set(HeadPoseEulerService.CHIN, new Point3D(0.50, 0.75, 0.0));
        landmarks.set(HeadPoseEulerService.GLABELLA, new Point3D(0.50, 0.35, 0.0));
        landmarks.set(HeadPoseEulerService.LEFT_EYE_OUTER, new Point3D(0.40, 0.38, 0.0));
        landmarks.set(HeadPoseEulerService.RIGHT_EYE_OUTER, new Point3D(0.60, 0.38, 0.0));

        // Mouth anchors
        landmarks.set(DuchenneSmileService.LEFT_MOUTH_CORNER, new Point3D(0.43, 0.65, 0.0));
        landmarks.set(DuchenneSmileService.RIGHT_MOUTH_CORNER, new Point3D(0.57, 0.65, 0.0));

        // Cheeks
        landmarks.set(DuchenneSmileService.LEFT_CHEEK, new Point3D(0.38, 0.52, 0.02));
        landmarks.set(DuchenneSmileService.RIGHT_CHEEK, new Point3D(0.62, 0.52, 0.02));

        // Eyes
        landmarks.set(DuchenneSmileService.LEFT_EYE_TOP, new Point3D(0.40, 0.37, 0.0));
        landmarks.set(DuchenneSmileService.LEFT_EYE_BOTTOM, new Point3D(0.40, 0.39, 0.0));
        landmarks.set(DuchenneSmileService.RIGHT_EYE_TOP, new Point3D(0.60, 0.37, 0.0));
        landmarks.set(DuchenneSmileService.RIGHT_EYE_BOTTOM, new Point3D(0.60, 0.39, 0.0));

        return landmarks;
    }

    @Test
    void testNeutralHeadPoseAngles() {
        List<Point3D> face = createNeutralFaceMesh();
        var euler = headPoseService.calculateEulerAngles(face);

        assertEquals(0.0, euler.roll(), 1.0, "Roll should be centered around 0 deg");
        assertEquals(0.0, euler.yaw(), 1.0, "Yaw should be centered around 0 deg");
    }

    @Test
    void testHeadYawRotation() {
        List<Point3D> face = createNeutralFaceMesh();
        // Shift left eye back in depth (Z positive) to simulate looking right
        face.set(HeadPoseEulerService.LEFT_EYE_OUTER, new Point3D(0.40, 0.38, 0.04));
        face.set(HeadPoseEulerService.RIGHT_EYE_OUTER, new Point3D(0.60, 0.38, -0.04));

        var euler = headPoseService.calculateEulerAngles(face);
        assertTrue(euler.yaw() > 5.0, "Yaw should reflect positive angle on right turn");
    }

    @Test
    void testDuchenneVsCourtesySmile() {
        List<Point3D> face = createNeutralFaceMesh();

        // 1. Neutral face should have low smile score
        var neutralSmile = smileService.evaluateSmile(face);
        assertEquals("NEUTRAL", neutralSmile.smileType());

        // 2. Courtesy Smile: Stretch mouth wide horizontally, but leave cheeks low
        face.set(DuchenneSmileService.LEFT_MOUTH_CORNER, new Point3D(0.38, 0.63, 0.0));
        face.set(DuchenneSmileService.RIGHT_MOUTH_CORNER, new Point3D(0.62, 0.63, 0.0));
        var courtesySmile = smileService.evaluateSmile(face);
        assertTrue(courtesySmile.mouthSmileIntensity() > 40.0);

        // 3. Genuine Duchenne Smile: Elevate cheeks upward and compress eye aperture
        face.set(DuchenneSmileService.LEFT_CHEEK, new Point3D(0.37, 0.44, 0.04));
        face.set(DuchenneSmileService.RIGHT_CHEEK, new Point3D(0.63, 0.44, 0.04));
        face.set(DuchenneSmileService.LEFT_EYE_TOP, new Point3D(0.40, 0.375, 0.0));
        face.set(DuchenneSmileService.LEFT_EYE_BOTTOM, new Point3D(0.40, 0.385, 0.0));
        face.set(DuchenneSmileService.RIGHT_EYE_TOP, new Point3D(0.60, 0.375, 0.0));
        face.set(DuchenneSmileService.RIGHT_EYE_BOTTOM, new Point3D(0.60, 0.385, 0.0));

        var duchenneSmile = smileService.evaluateSmile(face);
        assertTrue(duchenneSmile.authenticityScore() > courtesySmile.authenticityScore(),
            "Duchenne smile authenticity must exceed courtesy smile");
    }

    @Test
    void testPostureDistanceAndNeckCrane() {
        List<Point3D> face = createNeutralFaceMesh();

        // Standard distance
        var optimalPosture = postureService.evaluatePosture(face, 0.0, 0.0);
        assertEquals("OPTIMAL_POSTURE", optimalPosture.postureStatus());

        // Lean too close (eye width expands in screen space)
        face.set(PostureErgonomicsService.LEFT_EYE_OUTER, new Point3D(0.25, 0.38, 0.0));
        face.set(PostureErgonomicsService.RIGHT_EYE_OUTER, new Point3D(0.75, 0.38, 0.0));
        var closePosture = postureService.evaluatePosture(face, 0.0, 0.0);
        assertEquals("LEANING_TOO_CLOSE", closePosture.postureStatus());
    }

    @Test
    void testBilateralSymmetry() {
        List<Point3D> face = createNeutralFaceMesh();
        var symResult = symmetryService.evaluateSymmetry(face);
        assertTrue(symResult.overallSymmetryScore() >= 85.0, "Neutral face should have high symmetry score");
    }
}
