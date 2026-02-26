package com.swms.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * TaskResponse — outbound representation of a Task.
 *
 * Instead of nesting full User objects (which could trigger lazy-load
 * issues and expose passwords), we include only the id + name of the
 * assigned employee and the creator.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;

    /** ID of the employee the task is assigned to. */
    private Long assignedToId;

    /** Display name of the assigned employee (for the UI table). */
    private String assignedToName;

    /** ID of the manager/admin who created the task. */
    private Long createdById;

    /** Display name of the creator. */
    private String createdByName;

    private LocalDate deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
