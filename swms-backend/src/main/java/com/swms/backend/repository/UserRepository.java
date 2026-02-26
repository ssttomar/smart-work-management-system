package com.swms.backend.repository;

import com.swms.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    /** Used by the password reset flow to look up a user by their one-time token. */
    Optional<User> findByResetToken(String resetToken);
}
