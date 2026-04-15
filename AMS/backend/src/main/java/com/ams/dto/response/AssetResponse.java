package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetResponse {
    private Long assetId;
    private String assetName;
    private String assetType;
    private BigDecimal investmentAmount;
    private BigDecimal currentValue;
    private BigDecimal gainLoss;
    private Double gainLossPct;
    private LocalDate purchaseDate;
    private boolean active;
    private LocalDateTime createdAt;
}
