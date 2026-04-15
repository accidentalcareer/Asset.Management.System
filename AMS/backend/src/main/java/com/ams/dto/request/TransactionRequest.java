package com.ams.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequest {

    @Data
    public static class Create {
        @NotBlank @Pattern(regexp = "CREDIT|DEBIT") private String type;
        @NotNull @Positive private BigDecimal amount;
        @NotBlank private String category;
        @NotNull private LocalDate txnDate;
        private String description;
    }

    @Data
    public static class Update {
        @Positive private BigDecimal amount;
        private String category;
        private LocalDate txnDate;
        private String description;
    }

    @Data
    public static class Filter {
        private String type;
        private String category;
        private LocalDate from;
        private LocalDate to;
        private String keyword;
    }
}
