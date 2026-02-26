package com.swms.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * UserResponse — safe outbound representation of a User.
 *
 * Never includes the hashed password. This is the DTO returned by
 * GET /api/users, GET /api/users/{id}, GET /users/me, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String department;

    /** Role as a plain string so the frontend does simple string comparisons. */
    private String role;
}
