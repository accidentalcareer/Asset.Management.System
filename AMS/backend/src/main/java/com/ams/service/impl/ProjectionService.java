package com.ams.service.impl;

import com.ams.dto.request.ProjectionRequest;
import com.ams.dto.response.ProjectionResponse;
import com.ams.dto.response.RetirementResponse;
import com.ams.entity.Projection;
import com.ams.entity.User;
import com.ams.exception.ResourceNotFoundException;
import com.ams.repository.ProjectionRepository;
import com.ams.util.FinanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectionService {

    private final ProjectionRepository projectionRepository;

    // ── Calculate & Save ──────────────────────────────────────────
    public ProjectionResponse calculate(User user, ProjectionRequest req) {
        int totalMonths = req.getYears() * 12;
        BigDecimal fv = FinanceUtil.sipFutureValue(
                req.getMonthlyAmount(), req.getExpectedReturn(), totalMonths);

        Projection proj = Projection.builder()
                .user(user)
                .investmentType(req.getInvestmentType())
                .monthlyAmount(req.getMonthlyAmount())
                .expectedReturn(req.getExpectedReturn())
                .futureValue(fv)
                .years(req.getYears())
                .build();
        proj = projectionRepository.save(proj);

        return buildResponse(proj);
    }

    // ── List Saved ────────────────────────────────────────────────
    public List<ProjectionResponse> getSaved(Long userId) {
        return projectionRepository.findByUserUserIdOrderByCalculatedDateDesc(userId)
                .stream().map(this::buildResponse).collect(Collectors.toList());
    }

    // ── Delete Saved ──────────────────────────────────────────────
    public void delete(Long userId, Long projId) {
        Projection p = projectionRepository.findByProjectionIdAndUserUserId(projId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Projection not found"));
        projectionRepository.delete(p);
    }

    // ── Retirement Planner ────────────────────────────────────────
    public RetirementResponse retirementPlan(int currentAge, int retirementAge,
                                              BigDecimal targetCorpus, BigDecimal annualReturn) {
        int months = (retirementAge - currentAge) * 12;
        if (months <= 0) throw new IllegalArgumentException("Retirement age must be greater than current age");

        BigDecimal required = FinanceUtil.requiredMonthlySip(targetCorpus, annualReturn, months);

        String explanation = String.format(
                "To retire at %d with a corpus of ₹%s, you need to invest ₹%s/month at %.1f%% annual return.",
                retirementAge,
                formatAmount(targetCorpus),
                formatAmount(required),
                annualReturn.doubleValue()
        );

        return RetirementResponse.builder()
                .currentAge(currentAge)
                .retirementAge(retirementAge)
                .targetCorpus(targetCorpus)
                .requiredMonthlySip(required)
                .explanation(explanation)
                .build();
    }

    // ── Internal Helpers ──────────────────────────────────────────
    private ProjectionResponse buildResponse(Projection p) {
        // Standard milestones: 3, 5, 10, 20 years (only up to p.getYears())
        int[] milestoneYears = {3, 5, 10, 20};
        List<Map<String, Object>> milestones = new ArrayList<>();
        for (int y : milestoneYears) {
            if (y > p.getYears()) break;
            int months = y * 12;
            BigDecimal fv = FinanceUtil.sipFutureValue(p.getMonthlyAmount(), p.getExpectedReturn(), months);
            BigDecimal invested = FinanceUtil.totalInvested(p.getMonthlyAmount(), months);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("years", y);
            m.put("futureValue", fv);
            m.put("totalInvested", invested);
            m.put("profit", fv.subtract(invested));
            milestones.add(m);
        }

        // Growth chart: yearly data points from year 0 to p.getYears()
        List<Map<String, Object>> growthChart = new ArrayList<>();
        for (int y = 0; y <= p.getYears(); y++) {
            BigDecimal fv = FinanceUtil.sipFutureValue(p.getMonthlyAmount(), p.getExpectedReturn(), y * 12);
            BigDecimal invested = FinanceUtil.totalInvested(p.getMonthlyAmount(), y * 12);
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("year", y);
            point.put("invested", invested);
            point.put("value", fv);
            growthChart.add(point);
        }

        return ProjectionResponse.builder()
                .projectionId(p.getProjectionId())
                .investmentType(p.getInvestmentType())
                .monthlyAmount(p.getMonthlyAmount())
                .expectedReturn(p.getExpectedReturn())
                .futureValue(p.getFutureValue())
                .years(p.getYears())
                .calculatedDate(p.getCalculatedDate())
                .milestones(milestones)
                .growthChart(growthChart)
                .build();
    }

    private String formatAmount(BigDecimal amount) {
        double val = amount.doubleValue();
        if (val >= 10_000_000) return String.format("%.2f Cr", val / 10_000_000);
        if (val >= 100_000)    return String.format("%.2f L", val / 100_000);
        return amount.setScale(0, RoundingMode.HALF_UP).toPlainString();
    }
}
