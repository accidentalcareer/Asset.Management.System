package com.ams.util;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * SIP Future Value formula:
 * FV = P × ((1 + r)^n − 1) / r × (1 + r)
 *
 * where r = annualRate / 12 / 100  (monthly rate)
 *       n = total months
 */
public class FinanceUtil {

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);

    public static BigDecimal sipFutureValue(BigDecimal monthlyAmount,
                                            BigDecimal annualReturnPct,
                                            int months) {
        if (months <= 0) return BigDecimal.ZERO;
        double P = monthlyAmount.doubleValue();
        double r = annualReturnPct.doubleValue() / 12.0 / 100.0;
        double n = months;
        double fv = P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
        return BigDecimal.valueOf(fv).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Required monthly SIP to reach target corpus in given months at given annual rate.
     * P = FV × r / (((1+r)^n − 1) × (1+r))
     */
    public static BigDecimal requiredMonthlySip(BigDecimal targetCorpus,
                                                 BigDecimal annualReturnPct,
                                                 int months) {
        double FV = targetCorpus.doubleValue();
        double r  = annualReturnPct.doubleValue() / 12.0 / 100.0;
        double n  = months;
        double P  = FV * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
        return BigDecimal.valueOf(P).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal totalInvested(BigDecimal monthlyAmount, int months) {
        return monthlyAmount.multiply(BigDecimal.valueOf(months)).setScale(2, RoundingMode.HALF_UP);
    }
}
