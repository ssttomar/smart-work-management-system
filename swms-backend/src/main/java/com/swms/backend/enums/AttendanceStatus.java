package com.swms.backend.enums;

/**
 * AttendanceStatus — daily attendance state for an employee.
 *
 *  PRESENT  → on time check-in
 *  ABSENT   → no check-in recorded for the day
 *  LATE     → check-in after the grace window
 *  HALF_DAY → checked out before minimum required hours
 */
public enum AttendanceStatus {
    PRESENT,
    ABSENT,
    LATE,
    HALF_DAY
}
