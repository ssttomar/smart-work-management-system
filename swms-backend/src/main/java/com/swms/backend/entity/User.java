package com.swms.backend.entity;

import com.swms.backend.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * User — the central identity entity.
 *
 * Relationships:
 *   One User  → Many Tasks  (as assignee)
 *   One User  → Many Tasks  (as creator)
 *   One User  → Many Attendance records
 *
 * The `role` column is stored as a VARCHAR (EnumType.STRING) so that
 * adding new roles never corrupts ordinal-based data.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Full display name of the employee. */
    @NotBlank
    @Column(nullable = false)
    private String name;

    /** Email used as the login username — must be unique across all users. */
    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    /** BCrypt-hashed password — NEVER store or return plain text. */
    @NotBlank
    @Column(nullable = false)
    private String password;

    /** Department or team the user belongs to (optional free-text). */
    private String department;

    /**
     * Role controls what the user can see and do.
     * Persisted as a string ("ADMIN", "MANAGER", "EMPLOYEE") for readability.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.EMPLOYEE;

    // ----------------------------------------------------------------
    // Relationships — mappedBy means this side does NOT own the FK column.
    // CascadeType.ALL: deleting a user cascades to their tasks/attendance.
    // orphanRemoval: removes child rows when removed from this collection.
    // ----------------------------------------------------------------

    /** Tasks assigned to this user. */
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> assignedTasks;

    /** Tasks created / delegated by this user (manager/admin). */
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> createdTasks;

    /** Daily attendance records for this user. */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attendance> attendanceRecords;

    // ----------------------------------------------------------------
    // Password reset fields
    // ----------------------------------------------------------------

    /**
     * One-time token generated on forgot-password request.
     * UUID string — stored plain (not sensitive enough to hash,
     * but expires quickly via resetTokenExpiry).
     */
    @Column(unique = true)
    private String resetToken;

    /**
     * Expiry timestamp — token is invalid after this point.
     * Set to now + 15 minutes on generation.
     */
    private LocalDateTime resetTokenExpiry;
}
