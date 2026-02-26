package com.swms.backend.entity;

import com.swms.backend.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Task — a unit of work assigned to an Employee by a Manager or Admin.
 *
 * Relationships:
 *   ManyToOne → assignedTo  (the Employee who must complete this task)
 *   ManyToOne → createdBy   (the Manager/Admin who created the task)
 *
 * The FK columns (assigned_to_id, created_by_id) live in the `tasks` table.
 */
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Short title of the task shown in list views. */
    @Column(nullable = false)
    private String title;

    /** Detailed description / instructions for the task. */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Current lifecycle state.
     * Stored as VARCHAR so ordinal changes never break existing rows.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    /** The Employee this task is assigned to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    /** The Manager or Admin who created / delegated this task. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    /** Optional deadline — null means no hard due date. */
    private LocalDate deadline;

    /** Auto-set when the task row is first inserted. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Auto-updated every time the task row is saved. */
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
