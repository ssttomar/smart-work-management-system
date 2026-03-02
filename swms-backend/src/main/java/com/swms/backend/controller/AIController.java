package com.swms.backend.controller;

import com.swms.backend.dto.request.ChatRequest;
import com.swms.backend.dto.response.ChatResponse;
import com.swms.backend.entity.ChatHistory;
import com.swms.backend.repository.ChatHistoryRepository;
import com.swms.backend.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AIController — REST endpoints for the AI Workforce Assistant.
 *
 * ENDPOINTS:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ POST /api/ai/chat           → send a message to the AI     │
 * │ POST /api/ai/weekly-summary → generate a weekly summary    │
 * │ GET  /api/ai/history        → retrieve conversation history│
 * └─────────────────────────────────────────────────────────────┘
 *
 * All endpoints require a valid JWT (Spring Security @authenticated).
 * Role-based data filtering is enforced inside AIService /
 * PromptBuilderService — not at the HTTP layer.
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService             aiService;
    private final ChatHistoryRepository chatHistoryRepo;
    private final com.swms.backend.repository.UserRepository userRepo;

    public AIController(AIService aiService,
                        ChatHistoryRepository chatHistoryRepo,
                        com.swms.backend.repository.UserRepository userRepo) {
        this.aiService       = aiService;
        this.chatHistoryRepo = chatHistoryRepo;
        this.userRepo        = userRepo;
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/ai/chat
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Core chat endpoint — processes a user message and returns the AI reply.
     *
     * Request:  { "message": "What tasks are due this week?", "conversationId": null }
     * Response: { "reply": "...", "conversationId": "uuid", "role": "EMPLOYEE", "timestamp": "..." }
     *
     * On the first message conversationId may be null — the backend generates one.
     * The client must store the returned conversationId and re-send it on follow-ups.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.processChat(request));
    }

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/ai/weekly-summary
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Bonus: generate an AI-powered weekly performance summary.
     * Works for all roles — each sees their own scope.
     */
    @PostMapping("/weekly-summary")
    public ResponseEntity<ChatResponse> weeklySummary() {
        return ResponseEntity.ok(aiService.generateWeeklySummary());
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/ai/history
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Returns all past chat messages for the authenticated user.
     * Useful for building a "history" panel in the frontend.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatHistory>> history(Authentication auth) {
        com.swms.backend.entity.User caller =
                userRepo.findByEmail(auth.getName())
                        .orElseThrow();
        List<ChatHistory> history =
                chatHistoryRepo.findByUserIdOrderByTimestampDesc(caller.getId());
        return ResponseEntity.ok(history);
    }
}
