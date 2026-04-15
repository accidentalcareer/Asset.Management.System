package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetirementResponse {
    private Integer currentAge;
    private Integer retirementAge;
    private BigDecimal targetCorpus;
    private BigDecimal requiredMonthlySip;
    private String explanation;
}
