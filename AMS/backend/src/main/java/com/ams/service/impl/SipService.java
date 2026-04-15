package com.ams.service.impl;

import com.ams.dto.request.SipRequest;
import com.ams.dto.response.SipResponse;
import com.ams.entity.Sip;
import com.ams.entity.User;
import com.ams.exception.BadRequestException;
import com.ams.exception.ResourceNotFoundException;
import com.ams.repository.SipRepository;
import com.ams.util.FinanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SipService {

    private static final Set<String> VALID_STATUSES = Set.of("ACTIVE", "PAUSED", "COMPLETED");
    private final SipRepository sipRepository;

    public SipResponse create(User user, SipRequest.Create req) {
        Sip sip = Sip.builder()
                .user(user)
                .fundName(req.getFundName())
                .monthlyAmount(req.getMonthlyAmount())
                .expectedReturn(req.getExpectedReturn())
                .duration(req.getDuration())
                .startDate(req.getStartDate())
                .status("ACTIVE")
                .build();
        return toResponse(sipRepository.save(sip));
    }

    public List<SipResponse> getAll(Long userId) {
        return sipRepository.findByUserUserId(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public SipResponse getOne(Long userId, Long sipId) {
        return toResponse(findOwned(userId, sipId));
    }

    public SipResponse update(Long userId, Long sipId, SipRequest.Update req) {
        Sip sip = findOwned(userId, sipId);
        if (req.getFundName() != null)       sip.setFundName(req.getFundName());
        if (req.getMonthlyAmount() != null)  sip.setMonthlyAmount(req.getMonthlyAmount());
        if (req.getExpectedReturn() != null) sip.setExpectedReturn(req.getExpectedReturn());
        if (req.getDuration() != null)       sip.setDuration(req.getDuration());
        if (req.getStatus() != null) {
            if (!VALID_STATUSES.contains(req.getStatus().toUpperCase()))
                throw new BadRequestException("Invalid status");
            sip.setStatus(req.getStatus().toUpperCase());
        }
        return toResponse(sipRepository.save(sip));
    }

    public void delete(Long userId, Long sipId) {
        Sip sip = findOwned(userId, sipId);
        sipRepository.delete(sip);
    }

    private Sip findOwned(Long userId, Long sipId) {
        return sipRepository.findBySipIdAndUserUserId(sipId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SIP not found"));
    }

    public SipResponse toResponse(Sip s) {
        // months completed since start date
        int monthsCompleted = Math.max(0,
                Period.between(s.getStartDate(), LocalDate.now()).getYears() * 12
                + Period.between(s.getStartDate(), LocalDate.now()).getMonths());
        monthsCompleted = Math.min(monthsCompleted, s.getDuration());

        BigDecimal totalInvested = FinanceUtil.totalInvested(s.getMonthlyAmount(), monthsCompleted);
        BigDecimal estimatedValue = FinanceUtil.sipFutureValue(
                s.getMonthlyAmount(), s.getExpectedReturn(), monthsCompleted);
        BigDecimal returnsEarned = estimatedValue.subtract(totalInvested);
        double completionPct = s.getDuration() == 0 ? 0.0
                : Math.round((monthsCompleted * 100.0 / s.getDuration()) * 100.0) / 100.0;

        return SipResponse.builder()
                .sipId(s.getSipId())
                .fundName(s.getFundName())
                .monthlyAmount(s.getMonthlyAmount())
                .expectedReturn(s.getExpectedReturn())
                .duration(s.getDuration())
                .startDate(s.getStartDate())
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .monthsCompleted(monthsCompleted)
                .totalInvested(totalInvested)
                .estimatedValue(estimatedValue)
                .returnsEarned(returnsEarned)
                .completionPct(completionPct)
                .build();
    }
}
