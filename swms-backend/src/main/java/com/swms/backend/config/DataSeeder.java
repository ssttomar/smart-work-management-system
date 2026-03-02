package com.swms.backend.config;

import com.swms.backend.entity.User;
import com.swms.backend.enums.Role;
import com.swms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DataSeeder — seeds the database with demo users on first startup.
 * Skips insertion for any email that already exists to stay idempotent.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository   userRepo;
    private final PasswordEncoder  passwordEncoder;

    @Override
    public void run(String... args) {
        List<SeedUser> seeds = List.of(

            /* ── ADMINS (2) ─────────────────────────────────────── */
            new SeedUser("Super Admin",    "admin1@swms.com",    "admin123",   "Administration", Role.ADMIN),
            new SeedUser("System Admin",   "admin2@swms.com",    "admin123",   "IT",             Role.ADMIN),

            /* ── MANAGERS (4) ───────────────────────────────────── */
            new SeedUser("Alice Manager",  "manager1@swms.com",  "manager123", "Engineering",    Role.MANAGER),
            new SeedUser("Bob Manager",    "manager2@swms.com",  "manager123", "Sales",          Role.MANAGER),
            new SeedUser("Carol Manager",  "manager3@swms.com",  "manager123", "HR",             Role.MANAGER),
            new SeedUser("David Manager",  "manager4@swms.com",  "manager123", "Finance",        Role.MANAGER),

            /* ── EMPLOYEES (4) ──────────────────────────────────── */
            new SeedUser("Eve Employee",   "emp1@swms.com",      "emp123",     "Engineering",    Role.EMPLOYEE),
            new SeedUser("Frank Employee", "emp2@swms.com",      "emp123",     "Sales",          Role.EMPLOYEE),
            new SeedUser("Grace Employee", "emp3@swms.com",      "emp123",     "HR",             Role.EMPLOYEE),
            new SeedUser("Henry Employee", "emp4@swms.com",      "emp123",     "Finance",        Role.EMPLOYEE)
        );

        int created = 0;
        for (SeedUser s : seeds) {
            if (userRepo.findByEmail(s.email()).isPresent()) {
                log.debug("DataSeeder: user {} already exists, skipping.", s.email());
                continue;
            }
            userRepo.save(
                User.builder()
                    .name(s.name())
                    .email(s.email())
                    .password(passwordEncoder.encode(s.password()))
                    .department(s.department())
                    .role(s.role())
                    .build()
            );
            log.info("DataSeeder: created {} [{}]", s.email(), s.role());
            created++;
        }

        if (created > 0) {
            log.info("DataSeeder: inserted {} demo user(s).", created);
        }
    }

    /** Simple value record to hold seed data. */
    private record SeedUser(String name, String email, String password, String department, Role role) {}
}
