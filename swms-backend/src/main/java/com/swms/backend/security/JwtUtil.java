package com.swms.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JwtUtil — central JWT operations: generate, validate, extract claims.
 *
 * HOW JWT WORKS IN SWMS:
 * ┌──────────────────────────────────────────────────────────┐
 * │ 1. Client POSTs credentials to /auth/login               │
 * │ 2. JwtUtil.generateToken() creates a signed JWT          │
 * │ 3. Client stores token and sends it as:                  │
 * │       Authorization: Bearer <token>                      │
 * │ 4. JwtFilter intercepts every request and calls          │
 * │    JwtUtil.isTokenValid() before Spring Security acts.   │
 * │ 5. extractEmail() + extractRole() pull the claims so     │
 * │    Spring Security knows WHO is making the request.      │
 * └──────────────────────────────────────────────────────────┘
 *
 * The secret key is loaded from application.properties so it can be
 * rotated via environment variables without a code change.
 */
@Component
public class JwtUtil {

    /**
     * HMAC-SHA256 secret — minimum 256 bits (32 bytes).
     * Injected from app.jwt.secret in application.properties.
     */
    private final SecretKey key;

    /** Token lifetime in milliseconds — default 24 h (86_400_000 ms). */
    private final long expirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        // Keys.hmacShaKeyFor() validates key length and creates the SecretKey.
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    // ----------------------------------------------------------------
    // TOKEN GENERATION
    // ----------------------------------------------------------------

    /**
     * Build a signed JWT containing the user's email (subject) and role.
     *
     * Token anatomy:
     *   Header  : {"alg":"HS256","typ":"JWT"}
     *   Payload : {"sub":"user@example.com","role":"EMPLOYEE",
     *              "iat":..., "exp":...}
     *   Signature: HMAC-SHA256(base64(header) + "." + base64(payload), key)
     *
     * @param email the user's unique login identifier
     * @param role  the user's role string ("ADMIN" / "MANAGER" / "EMPLOYEE")
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)           // custom claim — read in JwtFilter
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    // ----------------------------------------------------------------
    // CLAIM EXTRACTION
    // ----------------------------------------------------------------

    /** Extract the email address stored in the "sub" (subject) claim. */
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Extract the custom "role" claim added during generation.
     * Used in JwtFilter to attach the correct GrantedAuthority.
     */
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // ----------------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------------

    /**
     * Returns true only when the token has a valid signature AND is not expired.
     * Any JwtException (expired, malformed, tampered) returns false.
     */
    public boolean isTokenValid(String token) {
        try {
            getClaims(token);   // throws if invalid or expired
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ----------------------------------------------------------------
    // PRIVATE HELPERS
    // ----------------------------------------------------------------

    /**
     * Parse and verify the token signature; return the payload Claims.
     * The verifyWith(key) call ensures the signature was made with OUR key.
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
