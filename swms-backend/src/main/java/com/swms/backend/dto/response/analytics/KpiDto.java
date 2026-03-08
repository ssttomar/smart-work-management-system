package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * KpiDto - compact KPI value for dashboards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiDto {

    private String label;
    private String value;
    private String helper;
}
