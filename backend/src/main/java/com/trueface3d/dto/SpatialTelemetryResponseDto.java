package com.trueface3d.dto;

public class SpatialTelemetryResponseDto {
    private String sessionUuid;
    private Long timestampMs;

    // 3D Head Pose
    private double pitch;
    private double yaw;
    private double roll;

    // Ergonomic Posture
    private double screenDistanceCm;
    private String postureStatus;
    private double ergonomicHealthScore;

    // Smile & Authenticity
    private double mouthSmileIntensity;
    private double cheekElevationIntensity;
    private double eyeCompressionIntensity;
    private double smileAuthenticity;
    private String smileType;

    // Symmetry & Gaze
    private double symmetryScore;
    private String symmetryStatus;
    private double gazeAttentionScore;
    private boolean isLookingAtScreen;

    // Affective Metrics
    private double joy;
    private double calm;
    private double focusTension;
    private double surprise;
    private double sadness;
    private double skepticism;
    private String dominantEmotion;
    private double stressScore;
    private double composureScore;

    public SpatialTelemetryResponseDto() {}

    // Getters and Setters
    public String getSessionUuid() { return sessionUuid; }
    public void setSessionUuid(String sessionUuid) { this.sessionUuid = sessionUuid; }

    public Long getTimestampMs() { return timestampMs; }
    public void setTimestampMs(Long timestampMs) { this.timestampMs = timestampMs; }

    public double getPitch() { return pitch; }
    public void setPitch(double pitch) { this.pitch = pitch; }

    public double getYaw() { return yaw; }
    public void setYaw(double yaw) { this.yaw = yaw; }

    public double getRoll() { return roll; }
    public void setRoll(double roll) { this.roll = roll; }

    public double getScreenDistanceCm() { return screenDistanceCm; }
    public void setScreenDistanceCm(double screenDistanceCm) { this.screenDistanceCm = screenDistanceCm; }

    public String getPostureStatus() { return postureStatus; }
    public void setPostureStatus(String postureStatus) { this.postureStatus = postureStatus; }

    public double getErgonomicHealthScore() { return ergonomicHealthScore; }
    public void setErgonomicHealthScore(double ergonomicHealthScore) { this.ergonomicHealthScore = ergonomicHealthScore; }

    public double getMouthSmileIntensity() { return mouthSmileIntensity; }
    public void setMouthSmileIntensity(double mouthSmileIntensity) { this.mouthSmileIntensity = mouthSmileIntensity; }

    public double getCheekElevationIntensity() { return cheekElevationIntensity; }
    public void setCheekElevationIntensity(double cheekElevationIntensity) { this.cheekElevationIntensity = cheekElevationIntensity; }

    public double getEyeCompressionIntensity() { return eyeCompressionIntensity; }
    public void setEyeCompressionIntensity(double eyeCompressionIntensity) { this.eyeCompressionIntensity = eyeCompressionIntensity; }

    public double getSmileAuthenticity() { return smileAuthenticity; }
    public void setSmileAuthenticity(double smileAuthenticity) { this.smileAuthenticity = smileAuthenticity; }

    public String getSmileType() { return smileType; }
    public void setSmileType(String smileType) { this.smileType = smileType; }

    public double getSymmetryScore() { return symmetryScore; }
    public void setSymmetryScore(double symmetryScore) { this.symmetryScore = symmetryScore; }

    public String getSymmetryStatus() { return symmetryStatus; }
    public void setSymmetryStatus(String symmetryStatus) { this.symmetryStatus = symmetryStatus; }

    public double getGazeAttentionScore() { return gazeAttentionScore; }
    public void setGazeAttentionScore(double gazeAttentionScore) { this.gazeAttentionScore = gazeAttentionScore; }

    public boolean isLookingAtScreen() { return isLookingAtScreen; }
    public void setLookingAtScreen(boolean lookingAtScreen) { isLookingAtScreen = lookingAtScreen; }

    public double getJoy() { return joy; }
    public void setJoy(double joy) { this.joy = joy; }

    public double getCalm() { return calm; }
    public void setCalm(double calm) { this.calm = calm; }

    public double getFocusTension() { return focusTension; }
    public void setFocusTension(double focusTension) { this.focusTension = focusTension; }

    public double getSurprise() { return surprise; }
    public void setSurprise(double surprise) { this.surprise = surprise; }

    public double getSadness() { return sadness; }
    public void setSadness(double sadness) { this.sadness = sadness; }

    public double getSkepticism() { return skepticism; }
    public void setSkepticism(double skepticism) { this.skepticism = skepticism; }

    public String getDominantEmotion() { return dominantEmotion; }
    public void setDominantEmotion(String dominantEmotion) { this.dominantEmotion = dominantEmotion; }

    public double getStressScore() { return stressScore; }
    public void setStressScore(double stressScore) { this.stressScore = stressScore; }

    public double getComposureScore() { return composureScore; }
    public void setComposureScore(double composureScore) { this.composureScore = composureScore; }
}
