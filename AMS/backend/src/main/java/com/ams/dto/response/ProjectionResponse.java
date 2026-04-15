package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectionResponse {
    private Long projectionId;
    private String investmentType;
    private BigDecimal monthlyAmount;
    private BigDecimal expectedReturn;
    private BigDecimal futureValue;
    private Integer years;
    private LocalDateTime calculatedDate;
    private List<Map<String, Object>> milestones;
    private List<Map<String, Object>> growthChart;
}
