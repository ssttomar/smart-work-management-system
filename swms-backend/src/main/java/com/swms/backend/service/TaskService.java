package com.swms.backend.service;

import com.swms.backend.dto.request.TaskRequest;
import com.swms.backend.dto.response.TaskResponse;
import com.swms.backend.entity.Task;
import com.swms.backend.entity.User;
import com.swms.backend.enums.Role;
import com.swms.backend.enums.TaskStatus;
import com.swms.backend.exception.ResourceNotFoundException;
import com.swms.backend.repository.TaskRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * TaskService — business logic for Task CRUD.
 *
 * ROLE RULES enforced here (defence-in-depth on top of SecurityConfig):
 *  ADMIN   → full access to all tasks
 *  MANAGER → create tasks, view all tasks, update / delete own tasks
 *  EMPLOYEE → view only tasks assigned to them, update status of own tasks
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.userService    = userService;
    }

    // ----------------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------------

    /**
     * Create a new task.
     *
     * @param req         validated TaskRequest payload
     * @param creatorEmail email of the authenticated user (from JWT)
     */
    public TaskResponse create(TaskRequest req, String creatorEmail) {
        User creator    = userService.findByEmail(creatorEmail);
        User assignedTo = userService.findByEmail(
                userService.getById(req.getAssignedToId()).getEmail()
        );

        Task task = Task.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : TaskStatus.TODO)
                .assignedTo(assignedTo)
                .createdBy(creator)
                .deadline(req.getDeadline())
                .build();

        return toResponse(taskRepository.save(task));
    }

    // ----------------------------------------------------------------
    // READ
    // ----------------------------------------------------------------

    /**
     * Return tasks visible to the caller based on their role:
     *  ADMIN/MANAGER → all tasks
     *  EMPLOYEE      → only tasks assigned to them
     */
    public List<TaskResponse> getForUser(String callerEmail) {
        User caller = userService.findByEmail(callerEmail);

        if (caller.getRole() == Role.EMPLOYEE) {
            return taskRepository.findByAssignedTo(caller)
                    .stream().map(this::toResponse).toList();
        }
        return taskRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    /** Single task by id — any authenticated user may call, service filters below. */
    public TaskResponse getById(Long id, String callerEmail) {
        Task task   = findOrThrow(id);
        User caller = userService.findByEmail(callerEmail);

        // Employees can only see their own tasks
        if (caller.getRole() == Role.EMPLOYEE
                && !task.getAssignedTo().getId().equals(caller.getId())) {
            throw new AccessDeniedException("You do not have access to this task.");
        }

        return toResponse(task);
    }

    // ----------------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------------

    /**
     * Full task update.
     * EMPLOYEE can only update the STATUS field of tasks assigned to them.
     * MANAGER/ADMIN can update everything.
     */
    public TaskResponse update(Long id, TaskRequest req, String callerEmail) {
        Task task   = findOrThrow(id);
        User caller = userService.findByEmail(callerEmail);

        if (caller.getRole() == Role.EMPLOYEE) {
            // Employee can only change their own task's status
            if (!task.getAssignedTo().getId().equals(caller.getId())) {
                throw new AccessDeniedException("You can only update tasks assigned to you.");
            }
            if (req.getStatus() != null) task.setStatus(req.getStatus());
            return toResponse(taskRepository.save(task));
        }

        // MANAGER / ADMIN — full update
        if (req.getTitle()       != null) task.setTitle(req.getTitle());
        if (req.getDescription() != null) task.setDescription(req.getDescription());
        if (req.getStatus()      != null) task.setStatus(req.getStatus());
        if (req.getDeadline()    != null) task.setDeadline(req.getDeadline());

        if (req.getAssignedToId() != null) {
            User newAssignee = userService.findByEmail(
                    userService.getById(req.getAssignedToId()).getEmail()
            );
            task.setAssignedTo(newAssignee);
        }

        return toResponse(taskRepository.save(task));
    }

    // ----------------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------------

    /** Delete a task — ADMIN or the MANAGER who created it. */
    public void delete(Long id, String callerEmail) {
        Task task   = findOrThrow(id);
        User caller = userService.findByEmail(callerEmail);

        boolean isAdmin   = caller.getRole() == Role.ADMIN;
        boolean isCreator = task.getCreatedBy().getId().equals(caller.getId());

        if (!isAdmin && !isCreator) {
            throw new AccessDeniedException("Only the creator or an admin can delete this task.");
        }

        taskRepository.delete(task);
    }

    // ----------------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------------

    private Task findOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
    }

    /** Map Task entity → TaskResponse DTO (no circular references). */
    public TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getName() : null)
                .createdById(task.getCreatedBy() != null ? task.getCreatedBy().getId() : null)
                .createdByName(task.getCreatedBy() != null ? task.getCreatedBy().getName() : null)
                .deadline(task.getDeadline())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
