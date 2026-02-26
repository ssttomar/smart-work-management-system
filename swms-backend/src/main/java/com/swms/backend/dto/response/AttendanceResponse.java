package com.swms.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * AttendanceResponse — outbound representation of an Attendance record.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

    private Long id;

    /** ID of the employee this record belongs to. */
    private Long userId;

    /** Display name of the employee (avoids a separate lookup on the frontend). */
    private String userName;

    private LocalDate date;
    private LocalTime checkIn;
    private LocalTime checkOut;

    /** Status string: PRESENT | ABSENT | LATE | HALF_DAY */
    private String status;

    private String notes;
}
