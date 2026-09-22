package com.trueface3d.service;

import com.trueface3d.dto.ExecutiveScorecardDto;
import com.trueface3d.model.AnalysisSession;
import com.trueface3d.model.TelemetrySnapshot;
import com.trueface3d.repository.AnalysisSessionRepository;
import com.trueface3d.repository.TelemetrySnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SessionDiagnosticService {

    private final AnalysisSessionRepository sessionRepository;
    private final TelemetrySnapshotRepository snapshotRepository;
    private final AffectiveAnalyticsService analyticsService;

    public SessionDiagnosticService(
        AnalysisSessionRepository sessionRepository,
        TelemetrySnapshotRepository snapshotRepository,
        AffectiveAnalyticsService analyticsService
    ) {
        this.sessionRepository = sessionRepository;
        this.snapshotRepository = snapshotRepository;
        this.analyticsService = analyticsService;
    }

    @Transactional
    public ExecutiveScorecardDto concludeAndGenerateScorecard(String sessionUuid) {
        AnalysisSession session = sessionRepository.findBySessionUuid(sessionUuid)
            .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionUuid));

        List<TelemetrySnapshot> snapshots = snapshotRepository.findBySessionUuidOrderByTimestampMsAsc(sessionUuid);

        LocalDateTime now = LocalDateTime.now();
        session.setEndTime(now);
        long duration = Duration.between(session.getStartTime() != null ? session.getStartTime() : now.minusMinutes(1), now).getSeconds();
        session.setDurationSeconds(Math.max(1L, duration));

        if (snapshots.isEmpty()) {
            ExecutiveScorecardDto emptyCard = new ExecutiveScorecardDto();
            emptyCard.setSessionUuid(sessionUuid);
            emptyCard.setTitle(session.getTitle());
            emptyCard.setMode(session.getMode());
            emptyCard.setDurationSeconds(duration);
            emptyCard.setTotalFramesAnalyzed(0);
            emptyCard.setOverallScore(90.0);
            emptyCard.setExecutiveGrade("A");
            emptyCard.setExecutiveSummary("Session completed with minimal telemetry recorded.");
            emptyCard.setTacticalRecommendations(List.of("Ensure camera is positioned at eye level for next session."));
            return emptyCard;
        }

        // Aggregate statistics
        double sumAuthenticity = 0.0;
        double sumSymmetry = 0.0;
        double sumStress = 0.0;
        double sumAttention = 0.0;
        int optimalPostureCount = 0;

        for (TelemetrySnapshot s : snapshots) {
            sumAuthenticity += (s.getSmileAuthenticity() != null ? s.getSmileAuthenticity() : 0.0);
            sumSymmetry += (s.getSymmetryScore() != null ? s.getSymmetryScore() : 90.0);
            sumStress += (s.getStressScore() != null ? s.getStressScore() : 15.0);
            sumAttention += (s.getGazeAttentionScore() != null ? s.getGazeAttentionScore() : 90.0);
            if ("OPTIMAL_POSTURE".equals(s.getPostureStatus())) {
                optimalPostureCount++;
            }
        }

        int count = snapshots.size();
        double avgAuthenticity = Math.round((sumAuthenticity / count) * 10.0) / 10.0;
        double avgSymmetry = Math.round((sumSymmetry / count) * 10.0) / 10.0;
        double avgStress = Math.round((sumStress / count) * 10.0) / 10.0;
        double avgAttention = Math.round((sumAttention / count) * 10.0) / 10.0;
        double postureCompliance = Math.round(((double) optimalPostureCount / count) * 1000.0) / 10.0;
        double emotionalStability = analyticsService.calculateEmotionalStability(snapshots);

        // Calculate Overall Score based on mode
        double overallScore;
        List<String> recommendations = new ArrayList<>();
        String summary;

        if ("INTERVIEW_COACH".equals(session.getMode())) {
            overallScore = (avgAttention * 0.40) + (avgAuthenticity * 0.25) + (postureCompliance * 0.20) + (emotionalStability * 0.15);
            if (avgAttention < 75.0) recommendations.add("Eye Contact: Practice looking directly into the camera lens to project confidence.");
            if (avgAuthenticity > 60.0) recommendations.add("Charisma: Excellent natural Duchenne smile engagement observed.");
            if (postureCompliance < 70.0) recommendations.add("Posture: Avoid craning forward during difficult questions.");
            summary = String.format("Interview Performance: Candidate demonstrated %s attention (%.1f%%) and maintained %.1f%% posture composure.",
                avgAttention > 80 ? "exceptional" : "moderate", avgAttention, postureCompliance);
        } else if ("ERGONOMICS_SENTINEL".equals(session.getMode())) {
            overallScore = (postureCompliance * 0.50) + (avgSymmetry * 0.25) + ((100.0 - avgStress) * 0.25);
            if (postureCompliance < 80.0) recommendations.add("Ergonomics: Forward head craning detected. Raise laptop to eye level.");
            if (avgStress > 50.0) recommendations.add("Eye Rest: Practice the 20-20-20 rule every 20 minutes to reduce visual fatigue.");
            summary = String.format("Ergonomic Health: Recorded %.1f%% optimal spinal distance compliance over %d seconds.",
                postureCompliance, duration);
        } else {
            // MINDFUL_WELLNESS
            overallScore = (emotionalStability * 0.40) + ((100.0 - avgStress) * 0.35) + (avgSymmetry * 0.25);
            if (avgStress > 45.0) recommendations.add("Mindfulness: Subtle brow furrow tension noted. Inhale deeply for 4 seconds, exhale for 6.");
            if (emotionalStability > 85.0) recommendations.add("Resilience: Superb baseline equilibrium sustained.");
            summary = String.format("Mindful Wellness: Baseline stress averaged %.1f%% with %.1f%% emotional stability.",
                avgStress, emotionalStability);
        }

        overallScore = Math.max(10.0, Math.min(100.0, Math.round(overallScore * 10.0) / 10.0));

        // Assign Grade
        String grade;
        if (overallScore >= 93.0) grade = "A+";
        else if (overallScore >= 85.0) grade = "A";
        else if (overallScore >= 78.0) grade = "B+";
        else if (overallScore >= 70.0) grade = "B";
        else grade = "C";

        // Update Entity
        session.setOverallScore(overallScore);
        session.setAverageAuthenticity(avgAuthenticity);
        session.setAverageSymmetry(avgSymmetry);
        session.setPostureCompliance(postureCompliance);
        session.setEmotionalStability(emotionalStability);
        session.setExecutiveSummary(summary);
        sessionRepository.save(session);

        // Build Response DTO
        ExecutiveScorecardDto dto = new ExecutiveScorecardDto();
        dto.setSessionUuid(sessionUuid);
        dto.setTitle(session.getTitle());
        dto.setMode(session.getMode());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setDurationSeconds(duration);
        dto.setTotalFramesAnalyzed(count);
        dto.setOverallScore(overallScore);
        dto.setExecutiveGrade(grade);
        dto.setAverageAuthenticity(avgAuthenticity);
        dto.setAverageSymmetry(avgSymmetry);
        dto.setPostureCompliance(postureCompliance);
        dto.setEmotionalStability(emotionalStability);
        dto.setAverageStress(avgStress);
        dto.setAverageAttention(avgAttention);
        dto.setDominantEmotion(snapshots.get(snapshots.size() - 1).getDominantEmotion());
        dto.setExecutiveSummary(summary);
        dto.setTacticalRecommendations(recommendations);

        return dto;
    }
}
