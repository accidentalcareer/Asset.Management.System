package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Long totalAssets;
    private BigDecimal totalInvestment;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private Double profitLossPct;
    private BigDecimal monthlyInvestment;
    private List<Map<String, Object>> assetAllocation;
    private List<Map<String, Object>> monthlyInvestments;
    private List<Map<String, Object>> creditVsDebit;
    private List<TransactionResponse> recentTransactions;
}
