package com.swms.backend.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * WorkloadDto - grouped bar data for assigned vs completed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkloadDto {

    private String label;
    private long assigned;
    private long completed;
}
