package com.swms.backend.dto.request;

import com.swms.backend.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * AttendanceRequest — payload for creating or updating an attendance record.
 *
 * Used by:
 *   POST /api/attendance          (create / check-in)
 *   PUT  /api/attendance/{id}     (update check-out, status, notes)
 */
@Data
public class AttendanceRequest {

    /**
     * ID of the employee this record belongs to.
     * Admins and Managers can supply any valid user id.
     * Employees can only supply their own id (enforced in service).
     */
    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    /** Time the employee clocked in (null = not yet checked in). */
    private LocalTime checkIn;

    /** Time the employee clocked out (null = not yet checked out). */
    private LocalTime checkOut;

    /** Optional status override — computed automatically if omitted. */
    private AttendanceStatus status;

    /** Optional manager note or employee excuse text. */
    private String notes;
}
