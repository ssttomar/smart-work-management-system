package com.swms.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse — returned by POST /auth/login and POST /auth/register.
 *
 * The frontend stores the token in localStorage / memory and attaches it
 * as "Authorization: Bearer <token>" on every subsequent request.
 * The role field lets the React app redirect to the correct dashboard
 * without making a second /users/me call.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** Signed JWT — valid for 24 hours (configurable in application.properties). */
    private String token;

    /** Logged-in user's role: ADMIN | MANAGER | EMPLOYEE */
    private String role;

    /** Logged-in user's display name — useful for the navbar greeting. */
    private String name;

    /** Logged-in user's email — doubles as the username. */
    private String email;

    /** Database id of the logged-in user. */
    private Long userId;
}
