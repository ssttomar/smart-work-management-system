package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RiskDto - open vs mitigated series for risk funnel.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskDto {

    private String label;
    private long open;
    private long mitigated;
}
