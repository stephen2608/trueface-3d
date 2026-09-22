package com.trueface3d.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ExecutiveScorecardDto {
    private String sessionUuid;
    private String title;
    private String mode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private long durationSeconds;
    private long totalFramesAnalyzed;

    // Core Metrics
    private double overallScore;
    private String executiveGrade; // A+, A, B+, B, C
    private double averageAuthenticity;
    private double averageSymmetry;
    private double postureCompliance;
    private double emotionalStability;
    private double averageStress;
    private double averageAttention;

    // Dominant emotion breakdown
    private String dominantEmotion;
    private String executiveSummary;
    private List<String> tacticalRecommendations;

    public ExecutiveScorecardDto() {}

    // Getters and Setters
    public String getSessionUuid() { return sessionUuid; }
    public void setSessionUuid(String sessionUuid) { this.sessionUuid = sessionUuid; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(long durationSeconds) { this.durationSeconds = durationSeconds; }

    public long getTotalFramesAnalyzed() { return totalFramesAnalyzed; }
    public void setTotalFramesAnalyzed(long totalFramesAnalyzed) { this.totalFramesAnalyzed = totalFramesAnalyzed; }

    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }

    public String getExecutiveGrade() { return executiveGrade; }
    public void setExecutiveGrade(String executiveGrade) { this.executiveGrade = executiveGrade; }

    public double getAverageAuthenticity() { return averageAuthenticity; }
    public void setAverageAuthenticity(double averageAuthenticity) { this.averageAuthenticity = averageAuthenticity; }

    public double getAverageSymmetry() { return averageSymmetry; }
    public void setAverageSymmetry(double averageSymmetry) { this.averageSymmetry = averageSymmetry; }

    public double getPostureCompliance() { return postureCompliance; }
    public void setPostureCompliance(double postureCompliance) { this.postureCompliance = postureCompliance; }

    public double getEmotionalStability() { return emotionalStability; }
    public void setEmotionalStability(double emotionalStability) { this.emotionalStability = emotionalStability; }

    public double getAverageStress() { return averageStress; }
    public void setAverageStress(double averageStress) { this.averageStress = averageStress; }

    public double getAverageAttention() { return averageAttention; }
    public void setAverageAttention(double averageAttention) { this.averageAttention = averageAttention; }

    public String getDominantEmotion() { return dominantEmotion; }
    public void setDominantEmotion(String dominantEmotion) { this.dominantEmotion = dominantEmotion; }

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }

    public List<String> getTacticalRecommendations() { return tacticalRecommendations; }
    public void setTacticalRecommendations(List<String> tacticalRecommendations) { this.tacticalRecommendations = tacticalRecommendations; }
}
