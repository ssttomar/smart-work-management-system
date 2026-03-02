package com.swms.backend.service;

import com.swms.backend.dto.request.ChatRequest;
import com.swms.backend.dto.response.ChatResponse;
import com.swms.backend.entity.ChatHistory;
import com.swms.backend.entity.User;
import com.swms.backend.enums.Role;
import com.swms.backend.repository.ChatHistoryRepository;
import com.swms.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AIService — main orchestrator for AI chat interactions.
 *
 * PROCESSING PIPELINE:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ 1. Resolve authenticated user from SecurityContext               │
 * │ 2. Determine or create conversationId (session UUID)            │
 * │ 3. Fetch N recent turns from ChatHistory for memory             │
 * │ 4. Build role-scoped system prompt via PromptBuilderService     │
 * │ 5. Send {systemPrompt + history + userMessage} to AI API        │
 * │ 6. Persist the exchange as a new ChatHistory row                │
 * │ 7. Return ChatResponse DTO to the controller                    │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * SECURITY:
 *   Role is read from the SecurityContext (set by JwtFilter).
 *   The PromptBuilderService only fetches DB data authorised for that role.
 *   Raw DB records are never forwarded to the AI — only formatted text.
 */
@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    /** How many recent conversation turns to include as memory. */
    @Value("${app.ai.conversation.memory-turns:6}")
    private int memoryTurns;

    private final UserRepository        userRepo;
    private final ChatHistoryRepository chatHistoryRepo;
    private final PromptBuilderService  promptBuilder;
    private final AIClientService       aiClient;

    public AIService(UserRepository        userRepo,
                     ChatHistoryRepository chatHistoryRepo,
                     PromptBuilderService  promptBuilder,
                     AIClientService       aiClient) {
        this.userRepo        = userRepo;
        this.chatHistoryRepo = chatHistoryRepo;
        this.promptBuilder   = promptBuilder;
        this.aiClient        = aiClient;
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Process a chat request for the currently authenticated user.
     *
     * @param request contains { message, conversationId? }
     * @return the AI reply wrapped in a ChatResponse DTO
     */
    public ChatResponse processChat(ChatRequest request) {
        // ── 1. Resolve caller identity from SecurityContext ──────────────
        String email = SecurityContextHolder.getContext()
                                            .getAuthentication()
                                            .getName();   // set by JwtFilter

        User caller = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));

        Role role = caller.getRole();

        // ── 2. Resolve conversation session ──────────────────────────────
        String conversationId = (request.getConversationId() != null &&
                                 !request.getConversationId().isBlank())
                ? request.getConversationId()
                : UUID.randomUUID().toString();

        log.debug("[AI] User={}, Role={}, ConvId={}", email, role, conversationId);

        // ── 3. Load conversation memory ──────────────────────────────────
        List<ChatHistory> recentHistory = chatHistoryRepo
                .findByUserIdAndConversationIdOrderByTimestampDesc(
                        caller.getId(),
                        conversationId,
                        PageRequest.of(0, memoryTurns)
                );
        // buildHistory() reverses these to chronological order internally
        List<Map<String, String>> historyMessages = recentHistory.isEmpty()
                ? Collections.emptyList()
                : promptBuilder.buildHistory(recentHistory);

        // ── 4. Build role-scoped system prompt ───────────────────────────
        String systemPrompt = promptBuilder.buildSystemPrompt(caller, role);

        // ── 5. Call AI API ───────────────────────────────────────────────
        String aiReply = aiClient.chat(systemPrompt, historyMessages, request.getMessage());

        // ── 6. Persist the exchange ──────────────────────────────────────
        ChatHistory entry = ChatHistory.builder()
                .conversationId(conversationId)
                .userId(caller.getId())
                .role(role)
                .message(request.getMessage())
                .response(aiReply)
                .build();
        chatHistoryRepo.save(entry);

        // ── 7. Return response ───────────────────────────────────────────
        return ChatResponse.builder()
                .reply(aiReply)
                .conversationId(conversationId)
                .role(role.name())
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────
    // WEEKLY SUMMARY (bonus feature)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Generate a weekly performance summary for the caller.
     * Uses a fixed prompt asking the AI to summarise the last 7 days of data.
     *
     * @return ChatResponse with the summary as the reply
     */
    public ChatResponse generateWeeklySummary() {
        ChatRequest syntheticRequest = new ChatRequest();
        syntheticRequest.setMessage(
                "Please generate a concise weekly performance summary for me " +
                "based on my tasks and attendance data from the last 7 days. " +
                "Include: tasks completed, pending tasks, attendance rate, " +
                "and one key improvement suggestion.");
        // A weekly summary starts a fresh conversation (no prior context needed)
        syntheticRequest.setConversationId(UUID.randomUUID().toString());
        return processChat(syntheticRequest);
    }
}
