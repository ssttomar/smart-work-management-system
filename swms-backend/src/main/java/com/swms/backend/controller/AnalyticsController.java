package com.swms.backend.controller;

import com.swms.backend.dto.response.analytics.AdminAnalyticsResponse;
import com.swms.backend.dto.response.analytics.EmployeeAnalyticsResponse;
import com.swms.backend.dto.response.analytics.ManagerAnalyticsResponse;
import com.swms.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AnalyticsController - dashboard data endpoints by role.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAnalyticsResponse> getAdminAnalytics(Authentication auth) {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics(auth.getName()));
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ManagerAnalyticsResponse> getManagerAnalytics(Authentication auth) {
        return ResponseEntity.ok(analyticsService.getManagerAnalytics(auth.getName()));
    }

    @GetMapping("/employee")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<EmployeeAnalyticsResponse> getEmployeeAnalytics(Authentication auth) {
        return ResponseEntity.ok(analyticsService.getEmployeeAnalytics(auth.getName()));
    }
}
