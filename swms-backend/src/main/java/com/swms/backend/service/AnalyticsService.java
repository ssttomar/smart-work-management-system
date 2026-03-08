package com.swms.backend.service;

import com.swms.backend.dto.response.analytics.*;
import com.swms.backend.entity.Attendance;
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
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AnalyticsService - aggregates dashboard insights for each role.
 */
@Service
public class AnalyticsService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserService userService;

    public AnalyticsService(UserRepository userRepository,
                            TaskRepository taskRepository,
                            AttendanceRepository attendanceRepository,
                            UserService userService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.attendanceRepository = attendanceRepository;
        this.userService = userService;
    }

    public AdminAnalyticsResponse getAdminAnalytics(String callerEmail) {
        userService.findByEmail(callerEmail);

        List<User> users = userRepository.findAll();
        List<Task> tasks = taskRepository.findAll();

        List<KpiDto> kpis = List.of(
                KpiDto.builder().label("Active Users").value(String.valueOf(users.size())).helper("All roles").build(),
                KpiDto.builder().label("Open Tasks").value(String.valueOf(tasks.size())).helper("All departments").build(),
                KpiDto.builder().label("Attendance Records").value(String.valueOf(attendanceRepository.count())).helper("Total records").build(),
                KpiDto.builder().label("Departments Online").value(String.valueOf(countDepartments(users))).helper("Active departments").build()
        );

        List<LabelValueDto> usersByRole = new ArrayList<>();
        for (Role role : Role.values()) {
            usersByRole.add(LabelValueDto.builder()
                    .label(role.name().substring(0, 1) + role.name().substring(1).toLowerCase(Locale.ENGLISH))
                    .value(userRepository.countByRole(role))
                    .build());
        }

        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.minusMonths(5).withDayOfMonth(1);
        LocalDate monthEnd = today.plusDays(1);

        List<Task> recentTasks = taskRepository.findByCreatedAtBetween(
                monthStart.atStartOfDay(),
                monthEnd.atStartOfDay());
        List<Attendance> recentAttendance = attendanceRepository.findByDateBetween(monthStart, monthEnd);

        List<LabelValueDto> monthlyActivity = buildMonthlySeries(
                monthStart,
                6,
                recentTasks.stream()
                        .collect(Collectors.groupingBy(t -> YearMonth.from(t.getCreatedAt()), Collectors.counting())));

        List<LabelValueDto> attendanceRate = buildMonthlyRate(monthStart, 6, recentAttendance);

        List<LabelValueDto> deptHeadcount = users.stream()
                .collect(Collectors.groupingBy(u -> safeDepartment(u.getDepartment()), Collectors.counting()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> LabelValueDto.builder().label(entry.getKey()).value(entry.getValue()).build())
                .toList();

        List<LabelValueDto> taskStatus = new ArrayList<>();
        for (TaskStatus status : TaskStatus.values()) {
            taskStatus.add(LabelValueDto.builder()
                    .label(toTitle(status.name()))
                    .value(taskRepository.countByStatus(status))
                    .build());
        }

        List<LabelValueDto> deptCompletion = buildDepartmentCompletion(tasks);

        return AdminAnalyticsResponse.builder()
                .kpis(kpis)
                .usersByRole(usersByRole)
                .monthlyActivity(monthlyActivity)
                .deptHeadcount(deptHeadcount)
                .attendanceRate(attendanceRate)
                .taskStatus(taskStatus)
                .deptCompletion(deptCompletion)
                .build();
    }

    public ManagerAnalyticsResponse getManagerAnalytics(String callerEmail) {
        User caller = userService.findByEmail(callerEmail);

        List<Task> tasks = taskRepository.findByCreatedBy(caller);
        long completedTotal = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long cancelledTotal = tasks.stream().filter(t -> t.getStatus() == TaskStatus.CANCELLED).count();
        double completionRate = tasks.isEmpty() ? 0 : (completedTotal * 100.0 / tasks.size());

        long completedLast14 = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(LocalDateTime.now().minusDays(14)))
                .count();

        int teamSize = (int) tasks.stream()
                .map(Task::getAssignedTo)
                .filter(u -> u != null && u.getId() != null)
                .map(User::getId)
                .collect(Collectors.toSet())
                .size();

        List<KpiDto> kpis = List.of(
                KpiDto.builder().label("Sprint Velocity").value(String.valueOf(completedLast14)).helper("Completed last 14 days").build(),
                KpiDto.builder().label("Team Capacity").value(String.format(Locale.ENGLISH, "%d%%", Math.round(completionRate))).helper("Completion rate").build(),
                KpiDto.builder().label("Risks Mitigated").value(String.valueOf(cancelledTotal)).helper("Cancelled or closed items").build()
        );

        LocalDate weekStart = LocalDate.now().minusWeeks(5);
        List<LabelValueDto> sprintVelocity = buildWeeklySeries(weekStart, 6, tasks, true);
        List<RiskDto> riskFunnel = buildWeeklyRiskSeries(weekStart, 6, tasks);

        List<WorkloadDto> teamWorkload = tasks.stream()
                .filter(task -> task.getAssignedTo() != null)
                .collect(Collectors.groupingBy(task -> safeDepartment(task.getAssignedTo().getDepartment())))
                .entrySet()
                .stream()
                .map(entry -> {
                    long assigned = entry.getValue().size();
                    long completed = entry.getValue().stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
                    return WorkloadDto.builder()
                            .label(entry.getKey())
                            .assigned(assigned)
                            .completed(completed)
                            .build();
                })
                .sorted(Comparator.comparingLong(WorkloadDto::getAssigned).reversed())
                .toList();

        List<LabelValueDto> teamHealth = buildTeamHealthMetrics(completionRate, teamSize, completedTotal, cancelledTotal);

        return ManagerAnalyticsResponse.builder()
                .kpis(kpis)
                .sprintVelocity(sprintVelocity)
                .teamWorkload(teamWorkload)
                .riskFunnel(riskFunnel)
                .teamHealth(teamHealth)
                .build();
    }

    public EmployeeAnalyticsResponse getEmployeeAnalytics(String callerEmail) {
        User caller = userService.findByEmail(callerEmail);

        List<Task> tasks = taskRepository.findByAssignedTo(caller);
        LocalDateTime since30 = LocalDateTime.now().minusDays(30);

        long completedLast30 = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(since30))
                .count();

        LocalDate today = LocalDate.now();
        List<Attendance> attendanceLast30 = attendanceRepository.findByUserAndDateBetween(
                caller,
                today.minusDays(30),
                today);

        double attendanceRate = calculateAttendanceRate(attendanceLast30);
        int learningHours = (int) Math.min(40, Math.round(completedLast30 * 1.5 + 6));

        List<KpiDto> kpis = List.of(
                KpiDto.builder().label("Tasks Completed").value(String.valueOf(completedLast30)).helper("Past 30 days").build(),
                KpiDto.builder().label("Attendance").value(String.format(Locale.ENGLISH, "%d%%", Math.round(attendanceRate))).helper("30-day rate").build(),
                KpiDto.builder().label("Learning Hours").value(String.format(Locale.ENGLISH, "%dh", learningHours)).helper("Upskilling time").build()
        );

        LocalDate weekStart = LocalDate.now().minusWeeks(5);
        List<LabelValueDto> productivity = buildWeeklySeries(weekStart, 6, tasks, true);

        LocalDate monthStart = today.minusMonths(5).withDayOfMonth(1);
        List<Attendance> attendancePulse = attendanceRepository.findByUserAndDateBetween(
                caller,
                monthStart,
                today.plusDays(1));
        List<LabelValueDto> attendancePulseSeries = buildMonthlyRate(monthStart, 6, attendancePulse);

        List<LabelValueDto> taskMix = new ArrayList<>();
        for (TaskStatus status : TaskStatus.values()) {
            long count = tasks.stream().filter(task -> task.getStatus() == status).count();
            taskMix.add(LabelValueDto.builder().label(toTitle(status.name())).value(count).build());
        }

        List<LabelValueDto> skillFocus = buildSkillFocus(completedLast30, attendanceRate, tasks.size());

        return EmployeeAnalyticsResponse.builder()
                .kpis(kpis)
                .productivity(productivity)
                .attendancePulse(attendancePulseSeries)
                .skillFocus(skillFocus)
                .taskMix(taskMix)
                .build();
    }

    private static int countDepartments(List<User> users) {
        return (int) users.stream()
                .map(User::getDepartment)
                .filter(dept -> dept != null && !dept.isBlank())
                .collect(Collectors.toSet())
                .size();
    }

    private static String safeDepartment(String department) {
        return (department == null || department.isBlank()) ? "Unassigned" : department;
    }

    private static String toTitle(String value) {
        String lower = value.toLowerCase(Locale.ENGLISH).replace('_', ' ');
        return lower.substring(0, 1).toUpperCase(Locale.ENGLISH) + lower.substring(1);
    }

    private static double calculateAttendanceRate(List<Attendance> records) {
        if (records.isEmpty()) {
            return 0;
        }
        long attended = records.stream()
                .filter(record -> record.getStatus() == AttendanceStatus.PRESENT
                        || record.getStatus() == AttendanceStatus.LATE
                        || record.getStatus() == AttendanceStatus.HALF_DAY)
                .count();
        return (attended * 100.0 / records.size());
    }

    private static List<LabelValueDto> buildMonthlySeries(LocalDate startMonth,
                                                         int months,
                                                         Map<YearMonth, Long> counts) {
        List<LabelValueDto> output = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            YearMonth ym = YearMonth.from(startMonth).plusMonths(i);
            long value = counts.getOrDefault(ym, 0L);
            output.add(LabelValueDto.builder()
                    .label(ym.format(MONTH_FORMAT))
                    .value(value)
                    .build());
        }
        return output;
    }

    private static List<LabelValueDto> buildMonthlyRate(LocalDate startMonth,
                                                        int months,
                                                        List<Attendance> records) {
        Map<YearMonth, long[]> totals = new HashMap<>();
        for (Attendance record : records) {
            if (record.getDate() == null) {
                continue;
            }
            YearMonth ym = YearMonth.from(record.getDate());
            totals.computeIfAbsent(ym, key -> new long[2]);
            long[] counts = totals.get(ym);
            counts[0] += 1;
            if (record.getStatus() == AttendanceStatus.PRESENT
                    || record.getStatus() == AttendanceStatus.LATE
                    || record.getStatus() == AttendanceStatus.HALF_DAY) {
                counts[1] += 1;
            }
        }

        List<LabelValueDto> output = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            YearMonth ym = YearMonth.from(startMonth).plusMonths(i);
            long[] counts = totals.getOrDefault(ym, new long[2]);
            double rate = counts[0] == 0 ? 0 : Math.round((counts[1] * 100.0 / counts[0]));
            output.add(LabelValueDto.builder()
                    .label(ym.format(MONTH_FORMAT))
                    .value(rate)
                    .build());
        }
        return output;
    }

    private static List<LabelValueDto> buildWeeklySeries(LocalDate startWeek,
                                                         int weeks,
                                                         List<Task> tasks,
                                                         boolean completedOnly) {
        Map<Integer, Long> counts = new HashMap<>();
        LocalDate endWeek = startWeek.plusWeeks(weeks);
        for (Task task : tasks) {
            if (task.getCreatedAt() == null) {
                continue;
            }
            LocalDate date = task.getCreatedAt().toLocalDate();
            if (date.isBefore(startWeek) || !date.isBefore(endWeek)) {
                continue;
            }
            if (completedOnly && task.getStatus() != TaskStatus.COMPLETED) {
                continue;
            }
            long daysBetween = ChronoUnit.DAYS.between(startWeek, date);
            int index = (int) (daysBetween / 7);
            counts.put(index, counts.getOrDefault(index, 0L) + 1);
        }

        List<LabelValueDto> output = new ArrayList<>();
        for (int i = 0; i < weeks; i++) {
            output.add(LabelValueDto.builder()
                    .label("W" + (i + 1))
                    .value(counts.getOrDefault(i, 0L))
                    .build());
        }
        return output;
    }

    private static List<RiskDto> buildWeeklyRiskSeries(LocalDate startWeek, int weeks, List<Task> tasks) {
        Map<Integer, long[]> counts = new HashMap<>();
        LocalDate endWeek = startWeek.plusWeeks(weeks);
        for (Task task : tasks) {
            if (task.getCreatedAt() == null) {
                continue;
            }
            LocalDate date = task.getCreatedAt().toLocalDate();
            if (date.isBefore(startWeek) || !date.isBefore(endWeek)) {
                continue;
            }
            long daysBetween = ChronoUnit.DAYS.between(startWeek, date);
            int index = (int) (daysBetween / 7);
            counts.computeIfAbsent(index, key -> new long[2]);
            long[] bucket = counts.get(index);
            if (task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED) {
                bucket[1] += 1;
            } else {
                bucket[0] += 1;
            }
        }

        List<RiskDto> output = new ArrayList<>();
        for (int i = 0; i < weeks; i++) {
            long[] bucket = counts.getOrDefault(i, new long[2]);
            output.add(RiskDto.builder()
                    .label("W" + (i + 1))
                    .open(bucket[0])
                    .mitigated(bucket[1])
                    .build());
        }
        return output;
    }

    private static List<LabelValueDto> buildDepartmentCompletion(List<Task> tasks) {
        Map<String, long[]> totals = new HashMap<>();
        for (Task task : tasks) {
            if (task.getAssignedTo() == null) {
                continue;
            }
            String dept = safeDepartment(task.getAssignedTo().getDepartment());
            totals.computeIfAbsent(dept, key -> new long[2]);
            long[] counts = totals.get(dept);
            counts[0] += 1;
            if (task.getStatus() == TaskStatus.COMPLETED) {
                counts[1] += 1;
            }
        }

        return totals.entrySet().stream()
                .map(entry -> {
                    long total = entry.getValue()[0];
                    long completed = entry.getValue()[1];
                    double rate = total == 0 ? 0 : Math.round(completed * 100.0 / total);
                    return LabelValueDto.builder().label(entry.getKey()).value(rate).build();
                })
                .sorted(Comparator.comparingDouble(LabelValueDto::getValue).reversed())
                .toList();
    }

    private static List<LabelValueDto> buildTeamHealthMetrics(double completionRate,
                                                              int teamSize,
                                                              long completed,
                                                              long cancelled) {
        int planning = clamp((int) Math.round(55 + completionRate * 0.4));
        int delivery = clamp((int) Math.round(50 + completionRate * 0.5));
        int quality = clamp((int) Math.round(48 + (completed * 2.0) - (cancelled * 3.0)));
        int collaboration = clamp(50 + teamSize * 5);
        int upskilling = clamp(45 + (int) Math.min(25, completed));

        return List.of(
                LabelValueDto.builder().label("Planning").value(planning).build(),
                LabelValueDto.builder().label("Delivery").value(delivery).build(),
                LabelValueDto.builder().label("Quality").value(quality).build(),
                LabelValueDto.builder().label("Collaboration").value(collaboration).build(),
                LabelValueDto.builder().label("Upskilling").value(upskilling).build()
        );
    }

    private static List<LabelValueDto> buildSkillFocus(long completedLast30,
                                                       double attendanceRate,
                                                       int totalTasks) {
        int product = clamp((int) Math.round(55 + completedLast30 * 3));
        int compliance = clamp((int) Math.round(50 + attendanceRate * 0.4));
        int automation = clamp(40 + (int) Math.min(35, totalTasks * 2));
        int clients = clamp((int) Math.round(52 + completedLast30 * 2));

        return List.of(
                LabelValueDto.builder().label("Product").value(product).build(),
                LabelValueDto.builder().label("Compliance").value(compliance).build(),
                LabelValueDto.builder().label("Automation").value(automation).build(),
                LabelValueDto.builder().label("Clients").value(clients).build()
        );
    }

    private static int clamp(int value) {
        return Math.max(0, Math.min(100, value));
    }
}
