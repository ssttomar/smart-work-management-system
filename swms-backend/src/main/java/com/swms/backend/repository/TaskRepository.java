package com.swms.backend.repository;

import com.swms.backend.entity.Task;
import com.swms.backend.entity.User;
import com.swms.backend.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TaskRepository - Spring Data JPA repository for Task entities.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(User assignedTo);

    List<Task> findByCreatedBy(User createdBy);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByAssignedToAndStatus(User assignedTo, TaskStatus status);

    List<Task> findByAssignedToIn(List<User> teamMembers);

    long countByStatus(TaskStatus status);

    long countByCreatedByAndStatus(User createdBy, TaskStatus status);

    long countByAssignedToAndStatus(User assignedTo, TaskStatus status);

    List<Task> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<Task> findByCreatedByAndCreatedAtBetween(User createdBy, LocalDateTime from, LocalDateTime to);

    List<Task> findByAssignedToAndCreatedAtBetween(User assignedTo, LocalDateTime from, LocalDateTime to);

    boolean existsByTitle(String title);
}
