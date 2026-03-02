package com.swms.backend.repository;

import com.swms.backend.entity.Task;
import com.swms.backend.entity.User;
import com.swms.backend.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * TaskRepository — Spring Data JPA repository for Task entities.
 *
 * Spring auto-generates SQL for all methods derived from their names.
 * No manual @Query needed for simple lookups.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Fetch all tasks assigned to a specific employee.
     * Used by EMPLOYEE role to view their own task list.
     */
    List<Task> findByAssignedTo(User assignedTo);

    /**
     * Fetch all tasks created by a specific manager/admin.
     * Used by MANAGER to view tasks they delegated.
     */
    List<Task> findByCreatedBy(User createdBy);

    /**
     * Filter tasks by status — useful for board-view (Kanban) on the frontend.
     */
    List<Task> findByStatus(TaskStatus status);

    /**
     * Filter by assigned employee AND status — used by employee's filtered view.
     */
    List<Task> findByAssignedToAndStatus(User assignedTo, TaskStatus status);

    /**
     * Fetch tasks assigned to any of the given users.
     * Used by MANAGER AI context to see team workload.
     */
    List<Task> findByAssignedToIn(List<User> teamMembers);

    /**
     * Count tasks by status — used by ADMIN AI context for statistics.
     */
    long countByStatus(TaskStatus status);
}
