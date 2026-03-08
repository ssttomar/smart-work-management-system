package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ManagerAnalyticsResponse - analytics payload for manager dashboards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerAnalyticsResponse {

    private List<KpiDto> kpis;
    private List<LabelValueDto> sprintVelocity;
    private List<WorkloadDto> teamWorkload;
    private List<RiskDto> riskFunnel;
    private List<LabelValueDto> teamHealth;
}
