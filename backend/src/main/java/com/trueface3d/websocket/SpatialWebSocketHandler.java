package com.trueface3d.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trueface3d.dto.SpatialFrameDto;
import com.trueface3d.dto.SpatialTelemetryResponseDto;
import com.trueface3d.model.TelemetrySnapshot;
import com.trueface3d.repository.TelemetrySnapshotRepository;
import com.trueface3d.service.AffectiveAnalyticsService;
import com.trueface3d.spatial.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * High-Throughput Real-Time 3D Spatial Telemetry WebSocket Handler.
 * Employs Java 21 Virtual Threads (Project Loom) for non-blocking sub-10ms packet dispatch.
 */
@Component
public class SpatialWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(SpatialWebSocketHandler.class);

    // Java 21 Virtual Thread Executor for concurrent 3D calculations
    private final ExecutorService virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();

    private final ObjectMapper objectMapper;
    private final HeadPoseEulerService headPoseService;
    private final DuchenneSmileService smileService;
    private final BilateralSymmetryService symmetryService;
    private final PostureErgonomicsService postureService;
    private final GazeRayIntersectionService gazeService;
    private final AffectiveAnalyticsService affectService;
    private final TelemetrySnapshotRepository snapshotRepository;

    // Rate-limiting DB writes per session (save snapshot every ~500ms)
    private final Map<String, Long> lastDbPersistTime = new ConcurrentHashMap<>();

    public SpatialWebSocketHandler(
        ObjectMapper objectMapper,
        HeadPoseEulerService headPoseService,
        DuchenneSmileService smileService,
        BilateralSymmetryService symmetryService,
        PostureErgonomicsService postureService,
        GazeRayIntersectionService gazeService,
        AffectiveAnalyticsService affectService,
        TelemetrySnapshotRepository snapshotRepository
    ) {
        this.objectMapper = objectMapper;
        this.headPoseService = headPoseService;
        this.smileService = smileService;
        this.symmetryService = symmetryService;
        this.postureService = postureService;
        this.gazeService = gazeService;
        this.affectService = affectService;
        this.snapshotRepository = snapshotRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("Client connected to TrueFace 3D WebSocket: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Dispatch computation onto Java 21 Virtual Thread
        virtualThreadExecutor.submit(() -> {
            try {
                SpatialFrameDto frame = objectMapper.readValue(message.getPayload(), SpatialFrameDto.class);
                if (frame.getLandmarks() == null || frame.getLandmarks().isEmpty()) return;

                // 1. Compute 3D Euler Angles (Pitch, Yaw, Roll)
                var euler = headPoseService.calculateEulerAngles(frame.getLandmarks());

                // 2. Compute 3D Smile Authenticity (Duchenne)
                var smile = smileService.evaluateSmile(frame.getLandmarks());

                // 3. Compute 3D Bilateral Facial Symmetry
                var symmetry = symmetryService.evaluateSymmetry(frame.getLandmarks());

                // 4. Compute 3D Ergonomic Posture & Z-Depth Distance
                var posture = postureService.evaluatePosture(frame.getLandmarks(), euler.pitch(), euler.roll());

                // 5. Compute 3D Gaze Ray & Screen Attention
                var gaze = gazeService.evaluateGaze(frame.getLandmarks(), euler.yaw(), euler.pitch());

                // 6. Compute Affective State & Stress Index
                var affect = affectService.computeAffect(
                    frame.getLandmarks(),
                    smile.mouthSmileIntensity(),
                    smile.authenticityScore(),
                    symmetry.eyebrowAsymmetry(),
                    gaze.gazeAttentionScore()
                );

                // Build Outgoing Telemetry Response
                SpatialTelemetryResponseDto resp = new SpatialTelemetryResponseDto();
                resp.setSessionUuid(frame.getSessionUuid());
                resp.setTimestampMs(frame.getTimestampMs() != null ? frame.getTimestampMs() : System.currentTimeMillis());

                resp.setPitch(euler.pitch());
                resp.setYaw(euler.yaw());
                resp.setRoll(euler.roll());

                resp.setScreenDistanceCm(posture.estimatedDistanceCm());
                resp.setPostureStatus(posture.postureStatus());
                resp.setErgonomicHealthScore(posture.ergonomicHealthScore());

                resp.setMouthSmileIntensity(smile.mouthSmileIntensity());
                resp.setCheekElevationIntensity(smile.cheekElevationIntensity());
                resp.setEyeCompressionIntensity(smile.eyeCompressionIntensity());
                resp.setSmileAuthenticity(smile.authenticityScore());
                resp.setSmileType(smile.smileType());

                resp.setSymmetryScore(symmetry.overallSymmetryScore());
                resp.setSymmetryStatus(symmetry.symmetryStatus());

                resp.setGazeAttentionScore(gaze.gazeAttentionScore());
                resp.setLookingAtScreen(gaze.isLookingAtScreen());

                resp.setJoy(affect.joy());
                resp.setCalm(affect.calm());
                resp.setFocusTension(affect.focusTension());
                resp.setSurprise(affect.surprise());
                resp.setSadness(affect.sadness());
                resp.setSkepticism(affect.skepticism());
                resp.setDominantEmotion(affect.dominantEmotion());
                resp.setStressScore(affect.stressScore());
                resp.setComposureScore(affect.composureScore());

                // Send live result back to client
                if (session.isOpen()) {
                    synchronized (session) {
                        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(resp)));
                    }
                }

                // Sampled DB persistence (every 500ms per session)
                if (frame.getSessionUuid() != null) {
                    long now = System.currentTimeMillis();
                    long lastTime = lastDbPersistTime.getOrDefault(frame.getSessionUuid(), 0L);
                    if (now - lastTime >= 500) {
                        lastDbPersistTime.put(frame.getSessionUuid(), now);
                        persistSnapshot(resp);
                    }
                }

            } catch (Exception e) {
                log.error("Error processing 3D spatial frame in virtual thread", e);
            }
        });
    }

    private void persistSnapshot(SpatialTelemetryResponseDto r) {
        TelemetrySnapshot s = new TelemetrySnapshot();
        s.setSessionUuid(r.getSessionUuid());
        s.setTimestampMs(r.getTimestampMs());
        s.setPitch(r.getPitch());
        s.setYaw(r.getYaw());
        s.setRoll(r.getRoll());
        s.setScreenDistanceCm(r.getScreenDistanceCm());
        s.setPostureStatus(r.getPostureStatus());
        s.setMouthSmileIntensity(r.getMouthSmileIntensity());
        s.setSmileAuthenticity(r.getSmileAuthenticity());
        s.setSmileType(r.getSmileType());
        s.setSymmetryScore(r.getSymmetryScore());
        s.setSymmetryStatus(r.getSymmetryStatus());
        s.setGazeAttentionScore(r.getGazeAttentionScore());
        s.setIsLookingAtScreen(r.isLookingAtScreen());
        s.setJoy(r.getJoy());
        s.setCalm(r.getCalm());
        s.setFocusTension(r.getFocusTension());
        s.setSkepticism(r.getSkepticism());
        s.setStressScore(r.getStressScore());
        s.setComposureScore(r.getComposureScore());
        s.setDominantEmotion(r.getDominantEmotion());
        snapshotRepository.save(s);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket session closed: {}", session.getId());
    }
}
