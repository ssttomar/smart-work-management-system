package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * EmployeeAnalyticsResponse - analytics payload for employee dashboards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAnalyticsResponse {

    private List<KpiDto> kpis;
    private List<LabelValueDto> productivity;
    private List<LabelValueDto> attendancePulse;
    private List<LabelValueDto> skillFocus;
    private List<LabelValueDto> taskMix;
}
