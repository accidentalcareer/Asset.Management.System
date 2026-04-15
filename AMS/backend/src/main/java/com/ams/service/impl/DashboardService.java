package com.ams.service.impl;

import com.ams.dto.response.DashboardResponse;
import com.ams.dto.response.TransactionResponse;
import com.ams.entity.Transaction;
import com.ams.repository.AssetRepository;
import com.ams.repository.SipRepository;
import com.ams.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;
    private final SipRepository sipRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    public DashboardResponse getDashboard(Long userId) {

        // ── Summary Metrics ───────────────────────────────────────
        BigDecimal totalInvestment = assetRepository.sumInvestmentAmountByUserId(userId);
        BigDecimal currentValue    = assetRepository.sumCurrentValueByUserId(userId);
        Long totalAssets           = assetRepository.countActiveByUserId(userId);
        BigDecimal profitLoss      = currentValue.subtract(totalInvestment);

        double profitLossPct = totalInvestment.compareTo(BigDecimal.ZERO) == 0 ? 0.0
                : profitLoss.divide(totalInvestment, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue();

        BigDecimal monthlyInvestment = sipRepository.sumMonthlyAmountByUserId(userId);

        // ── Asset Allocation Pie Chart ────────────────────────────
        List<Object[]> allocationRaw = assetRepository.sumByAssetTypeForUser(userId);
        List<Map<String, Object>> assetAllocation = allocationRaw.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", row[0]);
            m.put("value", row[1]);
            return m;
        }).collect(Collectors.toList());

        // ── Monthly Investment Bar Chart ──────────────────────────
        List<Object[]> monthlyRaw = transactionRepository.monthlyInvestments(userId);
        List<Map<String, Object>> monthlyInvestments = monthlyRaw.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", row[0]);
            m.put("total", row[1]);
            return m;
        }).collect(Collectors.toList());

        // ── Credit vs Debit Line Chart ────────────────────────────
        List<Object[]> cdRaw = transactionRepository.monthlyCreditsDebits(userId);
        List<Map<String, Object>> creditVsDebit = cdRaw.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", row[0]);
            m.put("credits", row[1]);
            m.put("debits", row[2]);
            return m;
        }).collect(Collectors.toList());

        // ── Recent Transactions (last 5) ──────────────────────────
        List<TransactionResponse> recent = transactionRepository
                .findByUserUserIdOrderByTxnDateDesc(userId)
                .stream().limit(5)
                .map(transactionService::toResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalAssets(totalAssets)
                .totalInvestment(totalInvestment)
                .currentValue(currentValue)
                .profitLoss(profitLoss)
                .profitLossPct(Math.round(profitLossPct * 100.0) / 100.0)
                .monthlyInvestment(monthlyInvestment)
                .assetAllocation(assetAllocation)
                .monthlyInvestments(monthlyInvestments)
                .creditVsDebit(creditVsDebit)
                .recentTransactions(recent)
                .build();
    }
}
