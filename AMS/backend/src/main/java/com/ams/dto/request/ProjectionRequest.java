package com.ams.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProjectionRequest {
    @NotBlank private String investmentType;
    @NotNull @Positive private BigDecimal monthlyAmount;
    @NotNull @Positive private BigDecimal expectedReturn;
    @NotNull @Min(1) @Max(40) private Integer years;
}
