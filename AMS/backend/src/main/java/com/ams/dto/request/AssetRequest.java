package com.ams.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

public class AssetRequest {

    @Data
    public static class Create {
        @NotBlank private String assetName;
        @NotBlank private String assetType;
        @NotNull @Positive private BigDecimal investmentAmount;
        @NotNull @PositiveOrZero private BigDecimal currentValue;
        @NotNull private LocalDate purchaseDate;
    }

    @Data
    public static class Update {
        private String assetName;
        private String assetType;
        @PositiveOrZero private BigDecimal currentValue;
        private LocalDate purchaseDate;
    }
}
