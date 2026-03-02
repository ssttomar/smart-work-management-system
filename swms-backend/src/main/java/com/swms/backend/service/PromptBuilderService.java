package com.swms.backend.service;

import com.swms.backend.entity.Attendance;
import com.swms.backend.entity.ChatHistory;
import com.swms.backend.entity.Task;
import com.swms.backend.entity.User;
import com.swms.backend.enums.AttendanceStatus;
import com.swms.backend.enums.Role;
import com.swms.backend.enums.TaskStatus;
import com.swms.backend.repository.AttendanceRepository;
import com.swms.backend.repository.TaskRepository;
import com.swms.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * PromptBuilderService — constructs role-aware prompts for the AI.
 *
 * ARCHITECTURE:
 * ┌──────────────────────────────────────────────────────┐
 * │ 1. buildSystemPrompt(user, role)                     │
 * │      → fetch authorised DB data for the role         │
 * │      → format data as readable context text          │
 * │      → prepend role-specific system instruction      │
 * │      → return full system prompt string              │
 * │                                                      │
 * │ 2. buildHistory(chatHistory)                         │
 * │      → convert DB rows to OpenAI message list        │
 * │      → interleaved user / assistant messages         │
 * └──────────────────────────────────────────────────────┘
 *
 * SECURITY:
 *   Data is fetched using role-restricted repository calls.
 *   EMPLOYEE → only their own records.
 *   MANAGER  → their department's records.
 *   ADMIN    → aggregate statistics only (never raw PII dumps).
 */
@Service
public class PromptBuilderService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final TaskRepository       taskRepo;
    private final AttendanceRepository attendanceRepo;
    private final UserRepository       userRepo;

    public PromptBuilderService(TaskRepository taskRepo,
                                AttendanceRepository attendanceRepo,
                                UserRepository userRepo) {
        this.taskRepo       = taskRepo;
        this.attendanceRepo = attendanceRepo;
        this.userRepo       = userRepo;
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Build the full system prompt including:
     *   – role-specific AI persona & constraints
     *   – live database context for the caller's role
     *
     * @param user the authenticated caller
     * @param role the caller's role (derived from JWT, matches user.getRole())
     * @return system prompt string ready to send to the AI API
     */
    public String buildSystemPrompt(User user, Role role) {
        String persona  = buildPersona(role);
        String context  = buildDataContext(user, role);
        return persona + "\n\n" + context;
    }

    /**
     * Convert stored ChatHistory rows to the OpenAI messages format.
     * History is passed in newest-first order and reversed here so the
     * AI sees them chronologically (oldest first).
     *
     * @param history recent chat history (newest first)
     * @return list of { "role": "user"|"assistant", "content": "..." } maps
     */
    public List<Map<String, String>> buildHistory(List<ChatHistory> history) {
        // Reverse to chronological order
        List<ChatHistory> ordered = new ArrayList<>(history);
        java.util.Collections.reverse(ordered);

        List<Map<String, String>> messages = new ArrayList<>();
        for (ChatHistory h : ordered) {
            messages.add(Map.of("role", "user",      "content", h.getMessage()));
            messages.add(Map.of("role", "assistant", "content", h.getResponse()));
        }
        return messages;
    }

    // ─────────────────────────────────────────────────────────────────────
    // PRIVATE — Persona builders
    // ─────────────────────────────────────────────────────────────────────

    private String buildPersona(Role role) {
        return switch (role) {
            case EMPLOYEE -> """
                    You are SWMS AI — a personal workforce assistant helping an employee manage their daily work.

                    ROLE: EMPLOYEE
                    SCOPE: Answer ONLY using the employee's personal data provided in the CURRENT DATA section below.
                    CONSTRAINTS:
                    - NEVER reveal information about other employees, teams, or organisation-wide statistics.
                    - If asked about other employees or admin data, politely decline and explain you can only discuss personal data.
                    - Keep answers concise, friendly, and actionable.
                    - Today's date: %s""".formatted(LocalDate.now().format(DATE_FMT));

            case MANAGER -> """
                    You are SWMS AI — a team management assistant helping a manager supervise their department.

                    ROLE: MANAGER
                    SCOPE: Provide insights on team tasks, workload distribution, deadlines, and attendance.
                    CONSTRAINTS:
                    - Access is limited to your department only. Do NOT discuss other departments.
                    - Never share individual salary, ratings, or confidential HR data.
                    - Give actionable recommendations based on the CURRENT DATA section below.
                    - Today's date: %s""".formatted(LocalDate.now().format(DATE_FMT));

            case ADMIN -> """
                    You are SWMS AI — an organisational workforce intelligence assistant for a system administrator.

                    ROLE: ADMIN
                    SCOPE: Full access to organisation-wide workforce analytics and aggregate statistics.
                    CAPABILITIES:
                    - Analyse workforce trends, task throughput, attendance patterns.
                    - Identify potential bottlenecks or anomalies in the data.
                    - Provide strategic insights for workforce optimisation.
                    - Today's date: %s""".formatted(LocalDate.now().format(DATE_FMT));
        };
    }

    // ─────────────────────────────────────────────────────────────────────
    // PRIVATE — Data context builders (one per role)
    // ─────────────────────────────────────────────────────────────────────

    private String buildDataContext(User user, Role role) {
        return switch (role) {
            case EMPLOYEE -> buildEmployeeContext(user);
            case MANAGER  -> buildManagerContext(user);
            case ADMIN    -> buildAdminContext();
        };
    }

    /** EMPLOYEE: personal tasks + 30-day attendance + profile. */
    private String buildEmployeeContext(User user) {
        StringBuilder sb = new StringBuilder("=== CURRENT DATA ===\n\n");

        // Profile
        sb.append("YOUR PROFILE:\n");
        sb.append("  Name:       ").append(user.getName()).append("\n");
        sb.append("  Email:      ").append(user.getEmail()).append("\n");
        sb.append("  Department: ").append(nullSafe(user.getDepartment())).append("\n\n");

        // Tasks
        List<Task> tasks = taskRepo.findByAssignedTo(user);
        sb.append("YOUR TASKS (").append(tasks.size()).append(" total):\n");
        if (tasks.isEmpty()) {
            sb.append("  No tasks assigned.\n");
        } else {
            tasks.forEach(t -> {
                sb.append("  [").append(t.getStatus()).append("] ")
                  .append(t.getTitle());
                if (t.getDeadline() != null) {
                    sb.append("  (Deadline: ").append(t.getDeadline().format(DATE_FMT)).append(")");
                }
                sb.append("\n");
            });
        }

        // Attendance — last 30 days
        LocalDate today = LocalDate.now();
        List<Attendance> records = attendanceRepo
                .findByUserAndDateBetween(user, today.minusDays(30), today);
        long present = records.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long late    = records.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        long absent  = records.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();

        sb.append("\nYOUR ATTENDANCE (last 30 days):\n");
        sb.append("  Present: ").append(present).append(" | Late: ")
          .append(late).append(" | Absent: ").append(absent).append("\n");

        // Today's attendance
        attendanceRepo.findByUserAndDate(user, today).ifPresent(a -> {
            sb.append("  Today's status: ").append(a.getStatus());
            if (a.getCheckIn()  != null) sb.append("  Check-in: ").append(a.getCheckIn());
            if (a.getCheckOut() != null) sb.append("  Check-out: ").append(a.getCheckOut());
            sb.append("\n");
        });

        return sb.toString();
    }

    /** MANAGER: own profile + team members + tasks created + team attendance today. */
    private String buildManagerContext(User manager) {
        StringBuilder sb = new StringBuilder("=== CURRENT DATA ===\n\n");

        // Profile
        sb.append("YOUR PROFILE:\n");
        sb.append("  Name:       ").append(manager.getName()).append("\n");
        sb.append("  Email:      ").append(manager.getEmail()).append("\n");
        sb.append("  Department: ").append(nullSafe(manager.getDepartment())).append("\n\n");

        // Team members (same department, excluding manager themselves)
        List<User> team = List.of();
        if (manager.getDepartment() != null) {
            team = userRepo.findByDepartment(manager.getDepartment())
                           .stream()
                           .filter(u -> !u.getId().equals(manager.getId()))
                           .filter(u -> u.getRole() == Role.EMPLOYEE)
                           .toList();
        }
        sb.append("YOUR TEAM IN ").append(nullSafe(manager.getDepartment()))
          .append(" (").append(team.size()).append(" employees):\n");
        if (team.isEmpty()) {
            sb.append("  No employees found in this department.\n");
        } else {
            team.forEach(u -> sb.append("  - ").append(u.getName())
                                .append(" (").append(u.getEmail()).append(")\n"));
        }

        // Tasks created by this manager
        List<Task> created = taskRepo.findByCreatedBy(manager);
        long todo       = created.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = created.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done       = created.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();

        sb.append("\nTASKS YOU CREATED (").append(created.size()).append(" total):\n");
        sb.append("  TODO: ").append(todo)
          .append(" | IN_PROGRESS: ").append(inProgress)
          .append(" | COMPLETED: ").append(done).append("\n");

        // Overdue tasks
        LocalDate today = LocalDate.now();
        long overdue = created.stream()
                .filter(t -> t.getDeadline() != null && t.getDeadline().isBefore(today)
                             && t.getStatus() != TaskStatus.COMPLETED)
                .count();
        if (overdue > 0) sb.append("  ⚠ OVERDUE tasks: ").append(overdue).append("\n");

        // Team tasks overview (tasks assigned to team members)
        if (!team.isEmpty()) {
            List<Task> teamTasks = taskRepo.findByAssignedToIn(team);
            sb.append("\nTEAM TASK BREAKDOWN (").append(teamTasks.size()).append(" total assigned to team):\n");
            team.forEach(member -> {
                long memberTasks = teamTasks.stream()
                        .filter(t -> t.getAssignedTo() != null &&
                                     t.getAssignedTo().getId().equals(member.getId()))
                        .count();
                sb.append("  ").append(member.getName()).append(": ").append(memberTasks).append(" tasks\n");
            });
        }

        // Team attendance today
        List<Attendance> todayAttendance = team.isEmpty()
                ? List.of()
                : attendanceRepo.findByUserInAndDate(team, today);
        sb.append("\nTEAM ATTENDANCE TODAY (").append(today.format(DATE_FMT)).append("):\n");
        team.forEach(member -> {
            todayAttendance.stream()
                    .filter(a -> a.getUser() != null && a.getUser().getId().equals(member.getId()))
                    .findFirst()
                    .ifPresentOrElse(
                            a -> sb.append("  ").append(member.getName())
                                   .append(": ").append(a.getStatus())
                                   .append(a.getCheckIn() != null ? "  In: " + a.getCheckIn() : "")
                                   .append("\n"),
                            () -> sb.append("  ").append(member.getName()).append(": No record\n")
                    );
        });

        return sb.toString();
    }

    /** ADMIN: organisation-wide aggregate statistics (no individual PII). */
    private String buildAdminContext() {
        StringBuilder sb = new StringBuilder("=== CURRENT DATA ===\n\n");

        // User counts by role
        long totalUsers    = userRepo.count();
        long totalAdmins   = userRepo.countByRole(Role.ADMIN);
        long totalManagers = userRepo.countByRole(Role.MANAGER);
        long totalEmployees= userRepo.countByRole(Role.EMPLOYEE);

        sb.append("ORGANISATION SUMMARY:\n");
        sb.append("  Total Users:    ").append(totalUsers).append("\n");
        sb.append("  Admins:         ").append(totalAdmins).append("\n");
        sb.append("  Managers:       ").append(totalManagers).append("\n");
        sb.append("  Employees:      ").append(totalEmployees).append("\n\n");

        // Task statistics
        long totalTasks  = taskRepo.count();
        long taskTodo    = taskRepo.countByStatus(TaskStatus.TODO);
        long taskIn      = taskRepo.countByStatus(TaskStatus.IN_PROGRESS);
        long taskDone    = taskRepo.countByStatus(TaskStatus.COMPLETED);

        sb.append("TASK STATISTICS:\n");
        sb.append("  Total Tasks:    ").append(totalTasks).append("\n");
        sb.append("  TODO:           ").append(taskTodo).append("\n");
        sb.append("  IN_PROGRESS:    ").append(taskIn).append("\n");
        sb.append("  COMPLETED:      ").append(taskDone).append("\n");
        if (totalTasks > 0) {
            long pct = (taskDone * 100) / totalTasks;
            sb.append("  Completion %:   ").append(pct).append("%\n");
        }

        // Attendance today
        LocalDate today = LocalDate.now();
        long presentToday = attendanceRepo.countByStatus(AttendanceStatus.PRESENT);
        long absentToday  = attendanceRepo.countByStatus(AttendanceStatus.ABSENT);
        long lateToday    = attendanceRepo.countByStatus(AttendanceStatus.LATE);

        sb.append("\nATTENDANCE OVERVIEW (all-time totals):\n");
        sb.append("  PRESENT records: ").append(presentToday).append("\n");
        sb.append("  LATE    records: ").append(lateToday).append("\n");
        sb.append("  ABSENT  records: ").append(absentToday).append("\n");

        return sb.toString();
    }

    // ─────────────────────────────────────────────────────────────────────
    // UTILITY
    // ─────────────────────────────────────────────────────────────────────

    private String nullSafe(String value) {
        return value != null ? value : "N/A";
    }
}
