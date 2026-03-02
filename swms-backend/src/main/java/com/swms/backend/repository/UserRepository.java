package com.swms.backend.repository;

import com.swms.backend.entity.User;
import com.swms.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    /** Used by the password reset flow to look up a user by their one-time token. */
    Optional<User> findByResetToken(String resetToken);

    /**
     * Find all employees in a specific department.
     * Used by MANAGER AI context to list team members.
     */
    List<User> findByDepartment(String department);

    /**
     * Count users by role — used by ADMIN AI context for statistics.
     */
    long countByRole(Role role);
}
