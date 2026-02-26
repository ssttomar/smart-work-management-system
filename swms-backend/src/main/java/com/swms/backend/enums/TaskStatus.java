package com.swms.backend.enums;

/**
 * TaskStatus — lifecycle stages of a Task.
 *
 *  TODO        → created, not started yet
 *  IN_PROGRESS → actively being worked on
 *  COMPLETED   → finished successfully
 *  CANCELLED   → discontinued by a manager/admin
 */
public enum TaskStatus {
    TODO,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
