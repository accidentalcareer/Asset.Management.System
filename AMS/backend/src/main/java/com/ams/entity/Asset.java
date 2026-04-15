package com.ams.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ASSETS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Asset {

    @Id
    @Column(name = "ASSET_ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "asset_seq")
    @SequenceGenerator(name = "asset_seq", sequenceName = "SEQ_ASSET", allocationSize = 1)
    private Long assetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "ASSET_NAME", nullable = false, length = 255)
    private String assetName;

    @Column(name = "ASSET_TYPE", nullable = false, length = 20)
    private String assetType;

    @Column(name = "INVESTMENT_AMOUNT", nullable = false, precision = 12, scale = 2)
    private BigDecimal investmentAmount;

    @Column(name = "CURRENT_VALUE", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "PURCHASE_DATE", nullable = false)
    private LocalDate purchaseDate;

    @Builder.Default
    @Column(name = "IS_ACTIVE", nullable = false)
    private boolean isActive = true;

    @Builder.Default
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
