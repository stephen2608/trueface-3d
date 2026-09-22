package com.trueface3d.model;

import jakarta.persistence.*;

@Entity
@Table(name = "telemetry_snapshots", indexes = {
    @Index(name = "idx_session_uuid", columnList = "sessionUuid")
})
public class TelemetrySnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String sessionUuid;

    private Long timestampMs;

    // 3D Spatial Metrics
    private Double pitch;
    private Double yaw;
    private Double roll;
    private Double screenDistanceCm;
    private String postureStatus;

    // Smile & Authenticity
    private Double mouthSmileIntensity;
    private Double smileAuthenticity;
    private String smileType;

    // Symmetry & Gaze
    private Double symmetryScore;
    private String symmetryStatus;
    private Double gazeAttentionScore;
    private Boolean isLookingAtScreen;

    // Emotions & Stress
    private Double joy;
    private Double calm;
    private Double focusTension;
    private Double skepticism;
    private Double stressScore;
    private Double composureScore;
    private String dominantEmotion;

    public TelemetrySnapshot() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionUuid() { return sessionUuid; }
    public void setSessionUuid(String sessionUuid) { this.sessionUuid = sessionUuid; }

    public Long getTimestampMs() { return timestampMs; }
    public void setTimestampMs(Long timestampMs) { this.timestampMs = timestampMs; }

    public Double getPitch() { return pitch; }
    public void setPitch(Double pitch) { this.pitch = pitch; }

    public Double getYaw() { return yaw; }
    public void setYaw(Double yaw) { this.yaw = yaw; }

    public Double getRoll() { return roll; }
    public void setRoll(Double roll) { this.roll = roll; }

    public Double getScreenDistanceCm() { return screenDistanceCm; }
    public void setScreenDistanceCm(Double screenDistanceCm) { this.screenDistanceCm = screenDistanceCm; }

    public String getPostureStatus() { return postureStatus; }
    public void setPostureStatus(String postureStatus) { this.postureStatus = postureStatus; }

    public Double getMouthSmileIntensity() { return mouthSmileIntensity; }
    public void setMouthSmileIntensity(Double mouthSmileIntensity) { this.mouthSmileIntensity = mouthSmileIntensity; }

    public Double getSmileAuthenticity() { return smileAuthenticity; }
    public void setSmileAuthenticity(Double smileAuthenticity) { this.smileAuthenticity = smileAuthenticity; }

    public String getSmileType() { return smileType; }
    public void setSmileType(String smileType) { this.smileType = smileType; }

    public Double getSymmetryScore() { return symmetryScore; }
    public void setSymmetryScore(Double symmetryScore) { this.symmetryScore = symmetryScore; }

    public String getSymmetryStatus() { return symmetryStatus; }
    public void setSymmetryStatus(String symmetryStatus) { this.symmetryStatus = symmetryStatus; }

    public Double getGazeAttentionScore() { return gazeAttentionScore; }
    public void setGazeAttentionScore(Double gazeAttentionScore) { this.gazeAttentionScore = gazeAttentionScore; }

    public Boolean getIsLookingAtScreen() { return isLookingAtScreen; }
    public void setIsLookingAtScreen(Boolean isLookingAtScreen) { this.isLookingAtScreen = isLookingAtScreen; }

    public Double getJoy() { return joy; }
    public void setJoy(Double joy) { this.joy = joy; }

    public Double getCalm() { return calm; }
    public void setCalm(Double calm) { this.calm = calm; }

    public Double getFocusTension() { return focusTension; }
    public void setFocusTension(Double focusTension) { this.focusTension = focusTension; }

    public Double getSkepticism() { return skepticism; }
    public void setSkepticism(Double skepticism) { this.skepticism = skepticism; }

    public Double getStressScore() { return stressScore; }
    public void setStressScore(Double stressScore) { this.stressScore = stressScore; }

    public Double getComposureScore() { return composureScore; }
    public void setComposureScore(Double composureScore) { this.composureScore = composureScore; }

    public String getDominantEmotion() { return dominantEmotion; }
    public void setDominantEmotion(String dominantEmotion) { this.dominantEmotion = dominantEmotion; }
}
