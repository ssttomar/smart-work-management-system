package com.swms.backend.entity;

import com.swms.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ChatHistory — stores every AI conversation turn for a user.
 *
 * One row per exchange (user message + AI response).
 * Rows sharing the same conversationId belong to the same session,
 * enabling multi-turn conversation memory to be replayed to the AI.
 *
 * Fields:
 *   conversationId  — client-generated UUID grouping messages in one session
 *   userId          — FK to the user (stored as Long, not @ManyToOne to keep reads fast)
 *   role            — captured at message time in case the user's role changes later
 *   message         — what the user typed
 *   response        — what the AI replied
 *   timestamp       — when the exchange occurred
 */
@Entity
@Table(name = "chat_history", indexes = {
        @Index(name = "idx_chat_user",         columnList = "userId"),
        @Index(name = "idx_chat_conversation",  columnList = "conversationId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Groups messages belonging to the same conversation session. */
    @Column(nullable = false, length = 36)
    private String conversationId;

    /** Owning user — stored as plain Long for read efficiency. */
    @Column(nullable = false)
    private Long userId;

    /** Role the user held when this message was sent. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** The user's message text — unbounded length. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** The AI's reply — unbounded length. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String response;

    /** Auto-set on creation — not updatable. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
