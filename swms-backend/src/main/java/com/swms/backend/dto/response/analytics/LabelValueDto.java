package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LabelValueDto - basic label/value pair for charts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelValueDto {

    private String label;
    private double value;
}
