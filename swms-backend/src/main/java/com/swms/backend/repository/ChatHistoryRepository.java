package com.swms.backend.repository;

import com.swms.backend.entity.ChatHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ChatHistoryRepository — persistence for AI conversation history.
 *
 * The two key queries supply the conversation-memory feature:
 *   – recent turns within a session (by conversationId)
 *   – all sessions for a user (for the history panel)
 */
@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

    /**
     * Fetch the most-recent turns in a conversation, newest first.
     * Pass {@code PageRequest.of(0, N)} to limit to N turns.
     * The service reverses this list before replaying to the AI so that
     * the oldest message appears first (chronological order).
     *
     * @param userId         owner of the conversation
     * @param conversationId session UUID
     * @param pageable       use PageRequest.of(0, memoryTurns)
     * @return up to N ChatHistory rows ordered newest → oldest
     */
    List<ChatHistory> findByUserIdAndConversationIdOrderByTimestampDesc(
            Long userId,
            String conversationId,
            Pageable pageable
    );

    /**
     * All turns for a user, newest first.
     * Used for a "conversation history" sidebar (future feature).
     */
    List<ChatHistory> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * All turns within a specific session ordered chronologically.
     * Useful for replaying or exporting a full conversation.
     */
    List<ChatHistory> findByUserIdAndConversationIdOrderByTimestampAsc(
            Long userId,
            String conversationId
    );
}
