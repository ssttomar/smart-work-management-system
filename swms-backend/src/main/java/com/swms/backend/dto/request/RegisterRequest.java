package com.swms.backend.dto.request;

import com.swms.backend.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * RegisterRequest — payload the client sends to POST /auth/register.
 *
 * Validation annotations fire before the controller body executes
 * (via @Valid on the parameter), so the service always receives clean data.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /** Optional — defaults to EMPLOYEE when null. */
    private String department;

    /**
     * Role the new account should have.
     * Clients that omit this field get EMPLOYEE by default
     * (enforced in UserService, not here, so the API can be flexible).
     */
    private Role role;
}
