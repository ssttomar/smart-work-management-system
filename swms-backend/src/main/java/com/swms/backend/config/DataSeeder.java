package com.swms.backend.config;

import com.swms.backend.entity.Attendance;
import com.swms.backend.entity.Task;
import com.swms.backend.entity.User;
import com.swms.backend.enums.AttendanceStatus;
import com.swms.backend.enums.Role;
import com.swms.backend.enums.TaskStatus;
import com.swms.backend.repository.AttendanceRepository;
import com.swms.backend.repository.TaskRepository;
import com.swms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * DataSeeder - seeds demo users plus historical tasks and attendance.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final List<String> WORKSTREAMS = List.of(
            "Backlog Cleanup",
            "Payroll Review",
            "Attendance Audit",
            "Policy Refresh",
            "Release Planning",
            "Vendor Follow-up",
            "Client Reporting",
            "Compliance Check"
    );

    private static final List<String> OUTCOMES = List.of(
            "handoff readiness",
            "quality tracking",
            "manager approvals",
            "cross-team visibility",
            "documentation coverage",
            "deadline recovery"
    );

    private final UserRepository userRepo;
    private final TaskRepository taskRepo;
    private final AttendanceRepository attendanceRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();

        Map<String, User> usersByEmail = userRepo.findAll().stream()
                .collect(Collectors.toMap(User::getEmail, Function.identity(), (left, right) -> left));

        seedTasks(usersByEmail);
        seedAttendance(usersByEmail);
    }

    private void seedUsers() {
        List<SeedUser> seeds = List.of(
                new SeedUser("Super Admin", "admin1@swms.com", "admin123", "Administration", Role.ADMIN),
                new SeedUser("System Admin", "admin2@swms.com", "admin123", "IT", Role.ADMIN),
                new SeedUser("Alice Manager", "manager1@swms.com", "manager123", "Engineering", Role.MANAGER),
                new SeedUser("Bob Manager", "manager2@swms.com", "manager123", "Sales", Role.MANAGER),
                new SeedUser("Carol Manager", "manager3@swms.com", "manager123", "HR", Role.MANAGER),
                new SeedUser("David Manager", "manager4@swms.com", "manager123", "Finance", Role.MANAGER),
                new SeedUser("Eve Employee", "emp1@swms.com", "emp123", "Engineering", Role.EMPLOYEE),
                new SeedUser("Frank Employee", "emp2@swms.com", "emp123", "Sales", Role.EMPLOYEE),
                new SeedUser("Grace Employee", "emp3@swms.com", "emp123", "HR", Role.EMPLOYEE),
                new SeedUser("Henry Employee", "emp4@swms.com", "emp123", "Finance", Role.EMPLOYEE),
                new SeedUser("Iris Employee", "emp5@swms.com", "emp123", "Engineering", Role.EMPLOYEE),
                new SeedUser("Jason Employee", "emp6@swms.com", "emp123", "Sales", Role.EMPLOYEE),
                new SeedUser("Kelly Employee", "emp7@swms.com", "emp123", "HR", Role.EMPLOYEE),
                new SeedUser("Liam Employee", "emp8@swms.com", "emp123", "Finance", Role.EMPLOYEE)
        );

        int created = 0;
        for (SeedUser seed : seeds) {
            if (userRepo.findByEmail(seed.email()).isPresent()) {
                continue;
            }

            userRepo.save(User.builder()
                    .name(seed.name())
                    .email(seed.email())
                    .password(passwordEncoder.encode(seed.password()))
                    .department(seed.department())
                    .role(seed.role())
                    .build());
            created++;
        }

        if (created > 0) {
            log.info("DataSeeder: inserted {} demo user(s).", created);
        }
    }

    private void seedTasks(Map<String, User> usersByEmail) {
        List<User> managers = Stream.of(
                        "manager1@swms.com",
                        "manager2@swms.com",
                        "manager3@swms.com",
                        "manager4@swms.com")
                .map(usersByEmail::get)
                .filter(Objects::nonNull)
                .toList();

        List<User> admins = Stream.of("admin1@swms.com", "admin2@swms.com")
                .map(usersByEmail::get)
                .filter(Objects::nonNull)
                .toList();

        List<User> employees = Stream.of(
                        "emp1@swms.com",
                        "emp2@swms.com",
                        "emp3@swms.com",
                        "emp4@swms.com",
                        "emp5@swms.com",
                        "emp6@swms.com",
                        "emp7@swms.com",
                        "emp8@swms.com")
                .map(usersByEmail::get)
                .filter(Objects::nonNull)
                .toList();

        if (managers.isEmpty() || employees.isEmpty()) {
            return;
        }

        LocalDateTime start = LocalDate.now().minusMonths(5).withDayOfMonth(2).atTime(9, 0);
        int created = 0;

        for (int i = 0; i < 48; i++) {
            User assignee = employees.get(i % employees.size());
            User creator = i % 6 == 0 && !admins.isEmpty()
                    ? admins.get(i % admins.size())
                    : managers.get(i % managers.size());
            TaskStatus status = statusForIndex(i);
            LocalDateTime createdAt = start.plusDays(i * 4L).withHour(9 + (i % 3));
            String title = String.format("%s %s %02d", assignee.getDepartment(), WORKSTREAMS.get(i % WORKSTREAMS.size()), i + 1);

            if (taskRepo.existsByTitle(title)) {
                continue;
            }

            taskRepo.save(Task.builder()
                    .title(title)
                    .description(String.format(
                            "Drive %s for %s and close the loop on %s.",
                            WORKSTREAMS.get(i % WORKSTREAMS.size()).toLowerCase(),
                            assignee.getDepartment(),
                            OUTCOMES.get(i % OUTCOMES.size())))
                    .status(status)
                    .assignedTo(assignee)
                    .createdBy(creator)
                    .deadline(createdAt.toLocalDate().plusDays(6 + (i % 10)))
                    .createdAt(createdAt)
                    .updatedAt(createdAt.plusDays(status == TaskStatus.COMPLETED || status == TaskStatus.CANCELLED ? 2 : 1))
                    .build());
            created++;
        }

        if (created > 0) {
            log.info("DataSeeder: inserted {} demo task(s).", created);
        }
    }

    private void seedAttendance(Map<String, User> usersByEmail) {
        List<User> trackedUsers = usersByEmail.values().stream()
                .filter(user -> user.getRole() != Role.ADMIN)
                .toList();

        if (trackedUsers.isEmpty()) {
            return;
        }

        LocalDate start = LocalDate.now().minusDays(120);
        LocalDate today = LocalDate.now();
        int created = 0;

        for (LocalDate date = start; !date.isAfter(today); date = date.plusDays(1)) {
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }

            for (int index = 0; index < trackedUsers.size(); index++) {
                User user = trackedUsers.get(index);
                if (attendanceRepo.findByUserAndDate(user, date).isPresent()) {
                    continue;
                }

                int signal = Math.floorMod(date.getDayOfYear() + index * 5, 17);
                AttendanceStatus status = attendanceStatusForSignal(signal);

                attendanceRepo.save(Attendance.builder()
                        .user(user)
                        .date(date)
                        .status(status)
                        .checkIn(checkInFor(status, signal))
                        .checkOut(checkOutFor(status, signal))
                        .notes(noteFor(status))
                        .build());
                created++;
            }
        }

        if (created > 0) {
            log.info("DataSeeder: inserted {} attendance record(s).", created);
        }
    }

    private static TaskStatus statusForIndex(int index) {
        return switch (index % 8) {
            case 0, 1 -> TaskStatus.TODO;
            case 2, 3, 4 -> TaskStatus.IN_PROGRESS;
            case 5, 6 -> TaskStatus.COMPLETED;
            default -> TaskStatus.CANCELLED;
        };
    }

    private static AttendanceStatus attendanceStatusForSignal(int signal) {
        if (signal == 0) {
            return AttendanceStatus.ABSENT;
        }
        if (signal <= 2) {
            return AttendanceStatus.LATE;
        }
        if (signal == 3) {
            return AttendanceStatus.HALF_DAY;
        }
        return AttendanceStatus.PRESENT;
    }

    private static LocalTime checkInFor(AttendanceStatus status, int signal) {
        return switch (status) {
            case PRESENT -> LocalTime.of(8, 40).plusMinutes(signal % 12);
            case LATE -> LocalTime.of(9, 8).plusMinutes(signal % 18);
            case HALF_DAY -> LocalTime.of(8, 55).plusMinutes(signal % 8);
            case ABSENT -> null;
        };
    }

    private static LocalTime checkOutFor(AttendanceStatus status, int signal) {
        return switch (status) {
            case PRESENT -> LocalTime.of(17, 30).plusMinutes(signal % 20);
            case LATE -> LocalTime.of(18, 0).plusMinutes(signal % 12);
            case HALF_DAY -> LocalTime.of(12, 20).plusMinutes(signal % 15);
            case ABSENT -> null;
        };
    }

    private static String noteFor(AttendanceStatus status) {
        return switch (status) {
            case PRESENT -> "Shift completed as planned";
            case LATE -> "Late arrival logged";
            case HALF_DAY -> "Partial shift completed";
            case ABSENT -> "Unavailable for the day";
        };
    }

    private record SeedUser(String name, String email, String password, String department, Role role) {}
}
