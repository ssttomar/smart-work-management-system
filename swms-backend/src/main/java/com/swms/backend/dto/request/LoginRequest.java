package com.swms.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * LoginRequest — payload the client sends to POST /auth/login.
 * Replaces the old AuthRequest DTO.
 */
@Data
public class LoginRequest {

    @Email(message = "Provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
