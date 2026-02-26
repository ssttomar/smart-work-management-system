package com.swms.backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtFilter — intercepts every HTTP request exactly ONCE and validates the JWT.
 *
 * FILTER FLOW:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ Incoming Request                                                 │
 * │   → JwtFilter.doFilterInternal()                                │
 * │       1. Read "Authorization" header                            │
 * │       2. If missing / not Bearer → skip (Spring Security        │
 * │          will reject unauthenticated calls to protected routes) │
 * │       3. Validate token signature + expiry via JwtUtil           │
 * │       4. Extract email + role from token claims                 │
 * │       5. Create UsernamePasswordAuthenticationToken with role   │
 * │          and set it on SecurityContextHolder                    │
 * │       6. chain.doFilter() → request proceeds to controller      │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * We do NOT call UserDetailsService here — role is already in the token,
 * avoiding an extra DB round-trip on every authenticated API call.
 * If you need always-fresh DB state (e.g., account suspension), swap to
 * loading UserDetails from CustomUserDetailsService instead.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // ── 1. No header or wrong prefix → pass through unauthenticated ──
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        // ── 2. Extract raw token ──
        String token = header.substring(7);

        // ── 3. Validate signature + expiry ──
        if (!jwtUtil.isTokenValid(token)) {
            chain.doFilter(request, response);
            return;
        }

        // ── 4. Extract claims ──
        String email = jwtUtil.extractEmail(token);
        String role  = jwtUtil.extractRole(token);   // e.g. "ADMIN"

        // ── 5. Build authority with "ROLE_" prefix (Spring Security convention) ──
        //       @PreAuthorize("hasRole('ADMIN')") checks for "ROLE_ADMIN"
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + role);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        email,          // principal (used in controllers via Authentication.getName())
                        null,           // credentials — not needed post-authentication
                        List.of(authority)
                );

        // ── 6. Register authentication with Spring Security ──
        SecurityContextHolder.getContext().setAuthentication(auth);

        chain.doFilter(request, response);
    }
}
