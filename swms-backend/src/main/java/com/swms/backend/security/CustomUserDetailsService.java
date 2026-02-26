package com.swms.backend.security;

import com.swms.backend.entity.User;
import com.swms.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CustomUserDetailsService — loads a User from the DB by email and wraps it
 * in Spring Security's UserDetails contract.
 *
 * This is called by Spring's AuthenticationManager during the login flow
 * (inside AuthController when we call authenticationManager.authenticate()).
 * After that, JwtFilter uses the role directly from the JWT claim instead of
 * calling this service on every request (saves one DB hit per request).
 *
 * The "ROLE_" prefix is the Spring Security convention required by
 * hasRole('ADMIN') in @PreAuthorize expressions and SecurityConfig rules.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("No user found with email: " + email));

        // Build a Spring Security UserDetails using the stored BCrypt hash.
        // The authority name follows the "ROLE_<ENUM_NAME>" convention.
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())        // already BCrypt-hashed
                .authorities(List.of(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                ))
                .build();
    }
}
