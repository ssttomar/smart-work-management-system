package com.swms.backend.controller;

import com.swms.backend.dto.request.TaskRequest;
import com.swms.backend.dto.response.TaskResponse;
import com.swms.backend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TaskController — REST API for Task CRUD operations.
 *
 * ENDPOINTS:
 *   POST   /api/tasks          → create task   (ADMIN, MANAGER)
 *   GET    /api/tasks          → list tasks    (role-filtered in service)
 *   GET    /api/tasks/{id}     → single task   (role-filtered in service)
 *   PUT    /api/tasks/{id}     → update task   (ADMIN, MANAGER, EMPLOYEE-own)
 *   DELETE /api/tasks/{id}     → delete task   (ADMIN, MANAGER-own)
 *
 * The Authentication object injected by Spring Security contains the email
 * (set as principal in JwtFilter) which is passed to the service for
 * ownership and role checks.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ----------------------------------------------------------------
    // POST /api/tasks
    // ----------------------------------------------------------------

    /**
     * Create a new task.
     *
     * Request body:
     * {
     *   "title":        "Fix login bug",
     *   "description":  "Session expires too early",
     *   "assignedToId": 5,
     *   "deadline":     "2025-12-31",
     *   "status":       "IN_PROGRESS"   // optional, defaults to TODO
     * }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody TaskRequest req,
            Authentication auth) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(taskService.create(req, auth.getName()));
    }

    // ----------------------------------------------------------------
    // GET /api/tasks
    // ----------------------------------------------------------------

    /**
     * List tasks visible to the caller (role-filtered in TaskService):
     *   ADMIN/MANAGER → all tasks
     *   EMPLOYEE      → only their own assigned tasks
     */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(taskService.getForUser(auth.getName()));
    }

    // ----------------------------------------------------------------
    // GET /api/tasks/{id}
    // ----------------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getById(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(taskService.getById(id, auth.getName()));
    }

    // ----------------------------------------------------------------
    // PUT /api/tasks/{id}
    // ----------------------------------------------------------------

    /**
     * Update a task.
     * - ADMIN/MANAGER: full update
     * - EMPLOYEE: status-only update on their own task
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest req,
            Authentication auth) {
        return ResponseEntity.ok(taskService.update(id, req, auth.getName()));
    }

    // ----------------------------------------------------------------
    // DELETE /api/tasks/{id}
    // ----------------------------------------------------------------

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication auth) {
        taskService.delete(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
