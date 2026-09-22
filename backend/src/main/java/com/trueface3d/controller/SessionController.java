package com.trueface3d.controller;

import com.trueface3d.dto.ExecutiveScorecardDto;
import com.trueface3d.dto.SessionStartDto;
import com.trueface3d.model.AnalysisSession;
import com.trueface3d.repository.AnalysisSessionRepository;
import com.trueface3d.service.SessionDiagnosticService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final AnalysisSessionRepository sessionRepository;
    private final SessionDiagnosticService diagnosticService;

    public SessionController(AnalysisSessionRepository sessionRepository, SessionDiagnosticService diagnosticService) {
        this.sessionRepository = sessionRepository;
        this.diagnosticService = diagnosticService;
    }

    @PostMapping("/start")
    public ResponseEntity<AnalysisSession> startSession(@RequestBody SessionStartDto dto) {
        String uuid = UUID.randomUUID().toString();
        String title = dto.getTitle() != null && !dto.getTitle().isBlank() ? dto.getTitle() : "TrueFace 3D Session";
        String mode = dto.getMode() != null ? dto.getMode() : "INTERVIEW_COACH";

        AnalysisSession session = new AnalysisSession(uuid, title, mode);
        AnalysisSession saved = sessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{sessionUuid}/conclude")
    public ResponseEntity<ExecutiveScorecardDto> concludeSession(@PathVariable String sessionUuid) {
        ExecutiveScorecardDto scorecard = diagnosticService.concludeAndGenerateScorecard(sessionUuid);
        return ResponseEntity.ok(scorecard);
    }

    @GetMapping
    public ResponseEntity<List<AnalysisSession>> listAllSessions() {
        return ResponseEntity.ok(sessionRepository.findAllByOrderByStartTimeDesc());
    }

    @GetMapping("/{sessionUuid}")
    public ResponseEntity<AnalysisSession> getSession(@PathVariable String sessionUuid) {
        return sessionRepository.findBySessionUuid(sessionUuid)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
