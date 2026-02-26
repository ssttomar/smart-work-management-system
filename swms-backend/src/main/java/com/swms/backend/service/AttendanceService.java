package com.swms.backend.service;

import com.swms.backend.dto.request.AttendanceRequest;
import com.swms.backend.dto.response.AttendanceResponse;
import com.swms.backend.entity.Attendance;
import com.swms.backend.entity.User;
import com.swms.backend.enums.AttendanceStatus;
import com.swms.backend.enums.Role;
import com.swms.backend.exception.ResourceNotFoundException;
import com.swms.backend.repository.AttendanceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * AttendanceService — business logic for attendance tracking.
 *
 * ROLE RULES:
 *  ADMIN   → create / update / delete any record, view all
 *  MANAGER → create / update records for their team, view all
 *  EMPLOYEE → create/update only their own record for today, view own history
 *
 * STATUS AUTO-CALCULATION (applied on create when status is not supplied):
 *  checkIn <= 09:00              → PRESENT
 *  checkIn between 09:01–10:00   → LATE
 *  no checkIn by end of day      → ABSENT
 *  checkOut before 13:00         → HALF_DAY
 */
@Service
public class AttendanceService {

    private static final LocalTime LATE_THRESHOLD     = LocalTime.of(9, 0);
    private static final LocalTime MAX_LATE_THRESHOLD = LocalTime.of(10, 0);
    private static final LocalTime HALF_DAY_CUTOFF    = LocalTime.of(13, 0);

    private final AttendanceRepository attendanceRepository;
    private final UserService userService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             UserService userService) {
        this.attendanceRepository = attendanceRepository;
        this.userService          = userService;
    }

    // ----------------------------------------------------------------
    // CREATE (check-in)
    // ----------------------------------------------------------------

    public AttendanceResponse create(AttendanceRequest req, String callerEmail) {
        User caller = userService.findByEmail(callerEmail);
        User target = userService.findByEmail(
                userService.getById(req.getUserId()).getEmail()
        );

        // Employees can only log their own attendance
        if (caller.getRole() == Role.EMPLOYEE
                && !caller.getId().equals(target.getId())) {
            throw new AccessDeniedException("You can only record your own attendance.");
        }

        // Enforce one record per user per day
        attendanceRepository.findByUserAndDate(target, req.getDate()).ifPresent(a -> {
            throw new IllegalArgumentException(
                    "Attendance already recorded for " + target.getName()
                    + " on " + req.getDate());
        });

        AttendanceStatus status = resolveStatus(req);

        Attendance record = Attendance.builder()
                .user(target)
                .date(req.getDate())
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .status(status)
                .notes(req.getNotes())
                .build();

        return toResponse(attendanceRepository.save(record));
    }

    // ----------------------------------------------------------------
    // READ
    // ----------------------------------------------------------------

    /**
     * Returns attendance records visible to the caller:
     *  ADMIN/MANAGER → all records
     *  EMPLOYEE      → only their own records
     */
    public List<AttendanceResponse> getForUser(String callerEmail) {
        User caller = userService.findByEmail(callerEmail);

        if (caller.getRole() == Role.EMPLOYEE) {
            return attendanceRepository.findByUser(caller)
                    .stream().map(this::toResponse).toList();
        }
        return attendanceRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    /** All records for a given date — used by managers for daily reports. */
    public List<AttendanceResponse> getByDate(LocalDate date) {
        return attendanceRepository.findByDate(date)
                .stream().map(this::toResponse).toList();
    }

    /** Range query — used for monthly/weekly reports. */
    public List<AttendanceResponse> getByUserAndDateRange(
            Long userId, LocalDate from, LocalDate to) {
        User user = userService.findByEmail(userService.getById(userId).getEmail());
        return attendanceRepository.findByUserAndDateBetween(user, from, to)
                .stream().map(this::toResponse).toList();
    }

    /** Single record by id. */
    public AttendanceResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    // ----------------------------------------------------------------
    // UPDATE (check-out or correction)
    // ----------------------------------------------------------------

    public AttendanceResponse update(Long id, AttendanceRequest req, String callerEmail) {
        Attendance record = findOrThrow(id);
        User caller = userService.findByEmail(callerEmail);

        // Employee can only update their own record
        if (caller.getRole() == Role.EMPLOYEE
                && !record.getUser().getId().equals(caller.getId())) {
            throw new AccessDeniedException("You can only update your own attendance.");
        }

        if (req.getCheckIn()  != null) record.setCheckIn(req.getCheckIn());
        if (req.getCheckOut() != null) record.setCheckOut(req.getCheckOut());
        if (req.getNotes()    != null) record.setNotes(req.getNotes());

        // Recalculate status after any time change
        record.setStatus(req.getStatus() != null ? req.getStatus() : resolveStatus(req));

        return toResponse(attendanceRepository.save(record));
    }

    // ----------------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------------

    /** Only ADMIN and MANAGER can delete records. */
    public void delete(Long id) {
        attendanceRepository.delete(findOrThrow(id));
    }

    // ----------------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------------

    private Attendance findOrThrow(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Attendance record not found: " + id));
    }

    /**
     * Derive status from checkIn / checkOut times when the client does not
     * supply an explicit status override.
     */
    private AttendanceStatus resolveStatus(AttendanceRequest req) {
        if (req.getStatus() != null) return req.getStatus();

        LocalTime checkIn  = req.getCheckIn();
        LocalTime checkOut = req.getCheckOut();

        if (checkIn == null) return AttendanceStatus.ABSENT;

        if (checkOut != null && checkOut.isBefore(HALF_DAY_CUTOFF)) {
            return AttendanceStatus.HALF_DAY;
        }
        if (checkIn.isAfter(LATE_THRESHOLD) && !checkIn.isAfter(MAX_LATE_THRESHOLD)) {
            return AttendanceStatus.LATE;
        }
        if (checkIn.isAfter(MAX_LATE_THRESHOLD)) {
            return AttendanceStatus.LATE;
        }
        return AttendanceStatus.PRESENT;
    }

    /** Entity → DTO mapping. */
    public AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .userId(a.getUser().getId())
                .userName(a.getUser().getName())
                .date(a.getDate())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .status(a.getStatus().name())
                .notes(a.getNotes())
                .build();
    }
}
