package com.ams.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SipRequest {

    @Data
    public static class Create {
        @NotBlank private String fundName;
        @NotNull @Positive private BigDecimal monthlyAmount;
        @NotNull @Positive private BigDecimal expectedReturn;
        @NotNull @Min(1) private Integer duration;
        @NotNull private LocalDate startDate;
    }

    @Data
    public static class Update {
        private String fundName;
        @Positive private BigDecimal monthlyAmount;
        @Positive private BigDecimal expectedReturn;
        @Min(1) private Integer duration;
        private String status; // ACTIVE | PAUSED | COMPLETED
    }
}
