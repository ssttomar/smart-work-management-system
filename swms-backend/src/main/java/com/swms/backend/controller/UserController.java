package com.swms.backend.controller;

import com.swms.backend.dto.request.RegisterRequest;
import com.swms.backend.dto.response.UserResponse;
import com.swms.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UserController — authenticated endpoints for user management.
 *
 * ENDPOINTS:
 *   GET    /users/me           → own profile  (any authenticated user)
 *   GET    /api/users          → all users    (ADMIN only)
 *   GET    /api/users/{id}     → single user  (ADMIN only)
 *   PUT    /api/users/{id}     → update user  (ADMIN, MANAGER)
 *   DELETE /api/users/{id}     → delete user  (ADMIN only)
 *
 * @PreAuthorize is a method-level guard layered on top of SecurityConfig's
 * URL-level rules — both layers must pass for access to be granted.
 */
@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ----------------------------------------------------------------
    // GET /users/me
    // ----------------------------------------------------------------

    /**
     * Returns the profile of the currently authenticated user.
     * Email is extracted from the JWT via Authentication.getName().
     */
    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(
                userService.toResponse(userService.findByEmail(auth.getName()))
        );
    }

    // ----------------------------------------------------------------
    // GET /api/users
    // ----------------------------------------------------------------

    @GetMapping("/api/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    // ----------------------------------------------------------------
    // GET /api/users/{id}
    // ----------------------------------------------------------------

    @GetMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    // ----------------------------------------------------------------
    // PUT /api/users/{id}
    // ----------------------------------------------------------------

    @PutMapping("/api/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(userService.update(id, req));
    }

    // ----------------------------------------------------------------
    // DELETE /api/users/{id}
    // ----------------------------------------------------------------

    @DeleteMapping("/api/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
