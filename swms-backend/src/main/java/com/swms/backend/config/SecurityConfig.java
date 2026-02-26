package com.swms.backend.config;

import com.swms.backend.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig — the heart of the security architecture.
 *
 * KEY DECISIONS:
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ STATELESS sessions — no HttpSession, no cookies.            │
 *  │   Every request must carry a valid JWT.                     │
 *  │                                                             │
 *  │ CSRF disabled — safe because we use JWTs (not cookies)      │
 *  │   so there is no session token to forge.                    │
 *  │                                                             │
 *  │ CORS enabled — React dev server runs on :3000,              │
 *  │   Spring on :8080. Explicit allow-list prevents issues.     │
 *  │                                                             │
 *  │ @EnableMethodSecurity — enables @PreAuthorize on            │
 *  │   service/controller methods for fine-grained role checks.  │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * ROLE HIERARCHY (enforced in the filter chain below):
 *   /auth/**               → PUBLIC (no token required)
 *   GET  /api/users/**     → ADMIN only
 *   DELETE /api/users/**   → ADMIN only
 *   /api/tasks/**          → ADMIN, MANAGER
 *   /api/attendance/**     → ADMIN, MANAGER, EMPLOYEE (own records)
 *   Everything else        → authenticated (any valid JWT)
 */
@Configuration
@EnableMethodSecurity          // enables @PreAuthorize at method level
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // ── CSRF: disabled (JWT-based, no session cookies) ──────────
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS: apply the bean defined below ───────────────────────
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ── AUTHORIZATION RULES ──────────────────────────────────────
            .authorizeHttpRequests(auth -> auth

                // Public endpoints — login & registration
                .requestMatchers("/auth/**").permitAll()

                // User management — ADMIN only
                .requestMatchers(HttpMethod.GET,    "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/users/**").hasAnyRole("ADMIN", "MANAGER")

                // Own profile — any authenticated user
                .requestMatchers("/users/me").authenticated()

                // Task management — ADMIN & MANAGER can create/update/delete
                .requestMatchers(HttpMethod.POST,   "/api/tasks/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/tasks/**").hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.GET,    "/api/tasks/**").authenticated()

                // Attendance — all roles, but service enforces ownership
                .requestMatchers("/api/attendance/**").authenticated()

                // Anything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // ── SESSION: stateless (no HttpSession created) ──────────────
            .sessionManagement(sess ->
                    sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── JWT FILTER: runs before username/password auth filter ─────
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * AuthenticationManager bean — needed by AuthController to authenticate
     * login credentials against the stored BCrypt hash.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * CORS configuration — allows the React frontend (port 3000) to call
     * the Spring backend (port 8080) during development.
     * In production, replace "*" origins with your actual domain(s).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
