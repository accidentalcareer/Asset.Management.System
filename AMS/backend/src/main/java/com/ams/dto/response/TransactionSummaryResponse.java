package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummaryResponse {
    private BigDecimal totalCredits;
    private BigDecimal totalDebits;
    private BigDecimal netBalance;
    private List<TransactionResponse> transactions;
}
