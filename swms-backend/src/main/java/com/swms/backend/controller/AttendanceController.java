package com.swms.backend.controller;

import com.swms.backend.dto.request.AttendanceRequest;
import com.swms.backend.dto.response.AttendanceResponse;
import com.swms.backend.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * AttendanceController — REST API for attendance record management.
 *
 * ENDPOINTS:
 *   POST   /api/attendance               → check-in / create record
 *   GET    /api/attendance               → list (role-filtered in service)
 *   GET    /api/attendance/date/{date}   → records for a specific date (ADMIN/MANAGER)
 *   GET    /api/attendance/range         → date-range query (ADMIN/MANAGER)
 *   GET    /api/attendance/{id}          → single record
 *   PUT    /api/attendance/{id}          → update (check-out / correction)
 *   DELETE /api/attendance/{id}          → delete (ADMIN/MANAGER only)
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ----------------------------------------------------------------
    // POST /api/attendance  — check-in / create
    // ----------------------------------------------------------------

    /**
     * Record attendance (check-in).
     *
     * Request body:
     * {
     *   "userId":   5,
     *   "date":     "2025-11-01",
     *   "checkIn":  "08:45:00",
     *   "checkOut": null,
     *   "status":   null,     // auto-calculated if omitted
     *   "notes":    ""
     * }
     */
    @PostMapping
    public ResponseEntity<AttendanceResponse> create(
            @Valid @RequestBody AttendanceRequest req,
            Authentication auth) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(attendanceService.create(req, auth.getName()));
    }

    // ----------------------------------------------------------------
    // GET /api/attendance  — list
    // ----------------------------------------------------------------

    /** Returns records visible to the caller (role-filtered in service). */
    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(attendanceService.getForUser(auth.getName()));
    }

    // ----------------------------------------------------------------
    // GET /api/attendance/date/{date}  — by date
    // ----------------------------------------------------------------

    /**
     * All attendance records for a specific calendar date.
     * Date param format: yyyy-MM-dd  (e.g. /api/attendance/date/2025-11-01)
     */
    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<AttendanceResponse>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getByDate(date));
    }

    // ----------------------------------------------------------------
    // GET /api/attendance/range?userId=5&from=2025-11-01&to=2025-11-30
    // ----------------------------------------------------------------

    /**
     * Date-range query for a specific employee — used for monthly reports.
     */
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<AttendanceResponse>> getByRange(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                attendanceService.getByUserAndDateRange(userId, from, to));
    }

    // ----------------------------------------------------------------
    // GET /api/attendance/{id}
    // ----------------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getById(id));
    }

    // ----------------------------------------------------------------
    // PUT /api/attendance/{id}  — check-out / correction
    // ----------------------------------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest req,
            Authentication auth) {
        return ResponseEntity.ok(attendanceService.update(id, req, auth.getName()));
    }

    // ----------------------------------------------------------------
    // DELETE /api/attendance/{id}
    // ----------------------------------------------------------------

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
