package com.swms.backend.dto.request;

import com.swms.backend.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * TaskRequest — payload for creating or updating a Task.
 *
 * Used by:
 *   POST /api/tasks        (create)
 *   PUT  /api/tasks/{id}   (full update)
 */
@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    /**
     * Status of the task.
     * On creation, this is optional — defaults to TaskStatus.TODO in TaskService.
     */
    private TaskStatus status;

    /**
     * ID of the User this task is assigned to.
     * Manager/Admin must provide a valid employee id.
     */
    @NotNull(message = "Assigned user id is required")
    private Long assignedToId;

    /** Optional deadline date (ISO 8601 format from the client: "2025-12-31"). */
    private LocalDate deadline;
}
