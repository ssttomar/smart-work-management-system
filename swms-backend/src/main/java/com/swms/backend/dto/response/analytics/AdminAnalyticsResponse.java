package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AdminAnalyticsResponse - analytics payload for admin dashboards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {

    private List<KpiDto> kpis;
    private List<LabelValueDto> usersByRole;
    private List<LabelValueDto> monthlyActivity;
    private List<LabelValueDto> deptHeadcount;
    private List<LabelValueDto> attendanceRate;
    private List<LabelValueDto> taskStatus;
    private List<LabelValueDto> deptCompletion;
}
