package com.swms.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ChatResponse — the structured JSON payload returned from POST /api/ai/chat.
 *
 * Fields:
 *   reply          — the AI's generated text response
 *   conversationId — session UUID; frontend must store and re-send this
 *   role           — the role under which this response was generated
 *   timestamp      — server-side time of the exchange
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /** AI-generated reply text. */
    private String reply;

    /**
     * Conversation session UUID.
     * Returned on every response so the frontend always has the latest value.
     * On the first message of a new session the backend generates a fresh UUID.
     */
    private String conversationId;

    /** Role (EMPLOYEE / MANAGER / ADMIN) used to scope this response. */
    private String role;

    /** When the response was generated on the server. Serialized as ISO-8601 string. */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}
