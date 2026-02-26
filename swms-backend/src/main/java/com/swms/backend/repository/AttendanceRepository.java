package com.swms.backend.repository;

import com.swms.backend.entity.Attendance;
import com.swms.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * AttendanceRepository — Spring Data JPA repository for Attendance entities.
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /**
     * All attendance records for a specific employee, newest first is handled
     * by the service layer sorting. Used for the employee's own history view.
     */
    List<Attendance> findByUser(User user);

    /**
     * Single record for a user on a given date — enforces the one-record-per-day
     * business rule before attempting an insert.
     */
    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    /**
     * All records for a given date — used by managers to view team attendance.
     */
    List<Attendance> findByDate(LocalDate date);

    /**
     * Attendance history for an employee within a date range.
     * Spring derives: WHERE user = ? AND date BETWEEN ? AND ?
     */
    List<Attendance> findByUserAndDateBetween(User user, LocalDate from, LocalDate to);
}
