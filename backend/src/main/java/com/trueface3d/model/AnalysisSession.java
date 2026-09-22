package com.trueface3d.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_sessions")
public class AnalysisSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 64)
    private String sessionUuid;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String mode; // INTERVIEW_COACH, MINDFUL_WELLNESS, ERGONOMICS_SENTINEL

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationSeconds;

    private Double overallScore;
    private Double averageAuthenticity;
    private Double averageSymmetry;
    private Double postureCompliance;
    private Double emotionalStability;

    @Column(length = 2048)
    private String executiveSummary;

    public AnalysisSession() {}

    public AnalysisSession(String sessionUuid, String title, String mode) {
        this.sessionUuid = sessionUuid;
        this.title = title;
        this.mode = mode;
        this.startTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public Double getAverageAuthenticity() { return averageAuthenticity; }
    public void setAverageAuthenticity(Double averageAuthenticity) { this.averageAuthenticity = averageAuthenticity; }

    public Double getAverageSymmetry() { return averageSymmetry; }
    public void setAverageSymmetry(Double averageSymmetry) { this.averageSymmetry = averageSymmetry; }

    public Double getPostureCompliance() { return postureCompliance; }
    public void setPostureCompliance(Double postureCompliance) { this.postureCompliance = postureCompliance; }

    public Double getEmotionalStability() { return emotionalStability; }
    public void setEmotionalStability(Double emotionalStability) { this.emotionalStability = emotionalStability; }

    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
}
