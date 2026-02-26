package com.swms.backend.enums;

/**
 * Role — defines the three authority levels in SWMS.
 *
 *  ADMIN    → full system access (user management, reports, everything)
 *  MANAGER  → team management, task assignment, attendance oversight
 *  EMPLOYEE → own profile, own tasks, own attendance
 *
 * Stored as a VARCHAR in the DB via @Enumerated(EnumType.STRING)
 * so migrations never break when enum order changes.
 */
public enum Role {
    ADMIN,
    MANAGER,
    EMPLOYEE
}
