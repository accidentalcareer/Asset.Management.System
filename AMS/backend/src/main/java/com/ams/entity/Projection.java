package com.ams.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PROJECTIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Projection {

    @Id
    @Column(name = "PROJECTION_ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "proj_seq")
    @SequenceGenerator(name = "proj_seq", sequenceName = "SEQ_PROJECTION", allocationSize = 1)
    private Long projectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "INVESTMENT_TYPE", nullable = false, length = 100)
    private String investmentType;

    @Column(name = "MONTHLY_AMOUNT", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyAmount;

    @Column(name = "EXPECTED_RETURN", nullable = false, precision = 5, scale = 2)
    private BigDecimal expectedReturn;

    @Column(name = "FUTURE_VALUE", nullable = false, precision = 15, scale = 2)
    private BigDecimal futureValue;

    @Column(name = "YEARS", nullable = false)
    private Integer years;

    @Builder.Default
    @Column(name = "CALCULATED_DATE", nullable = false)
    private LocalDateTime calculatedDate = LocalDateTime.now();
}
