package com.swms.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * ChatRequest — payload sent by the frontend for each AI chat message.
 *
 * Flow:
 *   POST /api/ai/chat  →  { message, conversationId }
 *
 * - message        : the user's typed question / command
 * - conversationId : UUID that groups messages into a session.
 *                    If null / blank the AIService generates a new UUID,
 *                    starting a fresh conversation with no prior memory.
 *                    The frontend must persist this ID and re-send it on
 *                    every follow-up message to maintain conversation context.
 */
@Getter
@Setter
public class ChatRequest {

    /** The user's question or instruction to the AI. */
    @NotBlank(message = "Message must not be blank")
    private String message;

    /**
     * Optional conversation session ID (UUID string).
     * Null on first message of a new session — backend will create one.
     */
    private String conversationId;
}
