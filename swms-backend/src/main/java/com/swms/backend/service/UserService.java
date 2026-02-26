package com.swms.backend.service;

import com.swms.backend.dto.request.ForgotPasswordRequest;
import com.swms.backend.dto.request.RegisterRequest;
import com.swms.backend.dto.request.ResetPasswordRequest;
import com.swms.backend.dto.response.UserResponse;
import com.swms.backend.entity.User;
import com.swms.backend.enums.Role;
import com.swms.backend.exception.ResourceNotFoundException;
import com.swms.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * UserService — business logic for User management.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ----------------------------------------------------------------
    // REGISTER
    // ----------------------------------------------------------------

    public UserResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .department(req.getDepartment())
                .role(req.getRole() != null ? req.getRole() : Role.EMPLOYEE)
                .build();

        return toResponse(userRepository.save(user));
    }

    // ----------------------------------------------------------------
    // READ
    // ----------------------------------------------------------------

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    // ----------------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------------

    public UserResponse update(Long id, RegisterRequest req) {
        User user = findOrThrow(id);
        if (req.getName()       != null) user.setName(req.getName());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getRole()       != null) user.setRole(req.getRole());
        return toResponse(userRepository.save(user));
    }

    // ----------------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------------

    public void delete(Long id) {
        userRepository.delete(findOrThrow(id));
    }

    // ----------------------------------------------------------------
    // FORGOT / RESET PASSWORD
    // ----------------------------------------------------------------

    /**
     * Generate a one-time reset token for the given email.
     *
     * Token is a random UUID, expires in 15 minutes.
     * In production this token would be emailed to the user.
     * For development it is returned directly in the API response.
     *
     * @return the generated reset token (so the frontend can redirect to reset page)
     */
    public String forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email: " + req.getEmail()));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // In production: emailService.sendResetLink(user.getEmail(), token);
        return token;
    }

    /**
     * Validate the reset token and update the user's password.
     *
     * Checks:
     *  1. Token exists in DB
     *  2. Token has not expired (15-minute window)
     * On success: BCrypt-hashes the new password, clears the token fields.
     */
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByResetToken(req.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token."));

        if (user.getResetTokenExpiry() == null
                || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            throw new IllegalArgumentException(
                    "Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setResetToken(null);           // invalidate token after use
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    // ----------------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------------

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(user.getRole().name())
                .build();
    }
}
