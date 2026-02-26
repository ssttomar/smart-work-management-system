package com.swms.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ForgotPasswordRequest — payload for POST /auth/forgot-password.
 * User supplies only their email; the backend generates and returns a token.
 */
@Data
public class ForgotPasswordRequest {

    @Email(message = "Provide a valid email")
    @NotBlank(message = "Email is required")
    private String email;
}
