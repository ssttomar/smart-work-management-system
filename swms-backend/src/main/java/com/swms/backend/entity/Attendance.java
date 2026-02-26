package com.swms.backend.entity;

import com.swms.backend.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Attendance — one record per employee per working day.
 *
 * The composite business key is (user, date) — a user can only have
 * one attendance record per calendar day. Enforced via @UniqueConstraint.
 *
 * Relationship:
 *   ManyToOne → user  (the Employee this record belongs to)
 */
@Entity
@Table(
    name = "attendance",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_user_date",
        columnNames = {"user_id", "date"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The employee this attendance record belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Calendar date of this attendance record (no time component). */
    @Column(nullable = false)
    private LocalDate date;

    /** Time the employee checked in (null if absent). */
    private LocalTime checkIn;

    /** Time the employee checked out (null if not yet checked out or absent). */
    private LocalTime checkOut;

    /**
     * Status determined after check-in or end-of-day processing.
     * Default is ABSENT until a check-in event is recorded.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.ABSENT;

    /** Free-text notes: reason for absence, tardiness explanation, etc. */
    private String notes;
}
