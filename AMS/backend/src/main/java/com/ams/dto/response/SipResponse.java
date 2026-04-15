package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SipResponse {
    private Long sipId;
    private String fundName;
    private BigDecimal monthlyAmount;
    private BigDecimal expectedReturn;
    private Integer duration;
    private LocalDate startDate;
    private String status;
    private LocalDateTime createdAt;
    private Integer monthsCompleted;
    private BigDecimal totalInvested;
    private BigDecimal estimatedValue;
    private BigDecimal returnsEarned;
    private Double completionPct;
}
