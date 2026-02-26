package com.swms.backend.controller;

import com.swms.backend.dto.request.ForgotPasswordRequest;
import com.swms.backend.dto.request.LoginRequest;
import com.swms.backend.dto.request.RegisterRequest;
import com.swms.backend.dto.request.ResetPasswordRequest;
import com.swms.backend.dto.response.AuthResponse;
import com.swms.backend.dto.response.UserResponse;
import com.swms.backend.entity.User;
import com.swms.backend.security.JwtUtil;
import com.swms.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — public endpoints that do NOT require a JWT.
 *
 * ENDPOINTS:
 *   POST /auth/register  → create account, return JWT immediately
 *   POST /auth/login     → authenticate, return JWT
 *
 * FLOW (login):
 *   1. Client sends { email, password }
 *   2. AuthenticationManager delegates to CustomUserDetailsService
 *      which loads the user from DB and verifies the BCrypt hash.
 *   3. On success, JwtUtil generates a signed token containing
 *      the user's email and role.
 *   4. Client stores the token and uses it as "Authorization: Bearer <token>"
 *      on every subsequent request.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService           userService;
    private final AuthenticationManager authManager;
    private final JwtUtil               jwtUtil;

    public AuthController(UserService userService,
                          AuthenticationManager authManager,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.authManager = authManager;
        this.jwtUtil     = jwtUtil;
    }

    // ----------------------------------------------------------------
    // POST /auth/register
    // ----------------------------------------------------------------

    /**
     * Register a new user account.
     *
     * Request body (application/json):
     * {
     *   "name":       "Alice Smith",
     *   "email":      "alice@example.com",
     *   "password":   "secret123",
     *   "department": "Engineering",
     *   "role":       "EMPLOYEE"
     * }
     *
     * Response 201 — includes JWT so the user is logged in immediately.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        UserResponse saved = userService.register(req);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .role(saved.getRole())
                .name(saved.getName())
                .email(saved.getEmail())
                .userId(saved.getId())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ----------------------------------------------------------------
    // POST /auth/login
    // ----------------------------------------------------------------

    /**
     * Authenticate an existing user.
     *
     * Request body:
     * { "email": "alice@example.com", "password": "secret123" }
     *
     * Response 200:
     * { "token": "...", "role": "EMPLOYEE", "name": "Alice", "email": "...", "userId": 7 }
     *
     * On bad credentials Spring Security throws 401 automatically.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user  = userService.findByEmail(req.getEmail());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .userId(user.getId())
                .build();

        return ResponseEntity.ok(response);
    }

    // ----------------------------------------------------------------
    // POST /auth/forgot-password
    // ----------------------------------------------------------------

    /**
     * Request a password reset token.
     *
     * Request body: { "email": "alice@example.com" }
     *
     * Response 200:
     * {
     *   "message": "Reset token generated.",
     *   "token":   "550e8400-e29b-41d4-a716-446655440000"
     * }
     *
     * NOTE: In production the token would be emailed to the user and NOT
     * returned in the response. It is returned here for development/demo
     * purposes so you can test the reset flow without an email server.
     * Token expires in 15 minutes.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest req) {
        String token = userService.forgotPassword(req);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Reset token generated. Use it within 15 minutes.",
                "token",   token
        ));
    }

    // ----------------------------------------------------------------
    // POST /auth/reset-password
    // ----------------------------------------------------------------

    /**
     * Set a new password using a valid reset token.
     *
     * Request body:
     * {
     *   "token":       "550e8400-e29b-41d4-a716-446655440000",
     *   "newPassword": "newSecret123"
     * }
     *
     * Response 200: { "message": "Password reset successfully." }
     * Response 400: token invalid or expired
     */
    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        userService.resetPassword(req);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "Password reset successfully. You can now log in."
        ));
    }
}
