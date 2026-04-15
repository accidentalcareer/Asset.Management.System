package com.ams.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SIPS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Sip {

    @Id
    @Column(name = "SIP_ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sip_seq")
    @SequenceGenerator(name = "sip_seq", sequenceName = "SEQ_SIP", allocationSize = 1)
    private Long sipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "FUND_NAME", nullable = false, length = 255)
    private String fundName;

    @Column(name = "MONTHLY_AMOUNT", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyAmount;

    @Column(name = "EXPECTED_RETURN", nullable = false, precision = 5, scale = 2)
    private BigDecimal expectedReturn;

    @Column(name = "DURATION", nullable = false)
    private Integer duration;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Builder.Default
    @Column(name = "STATUS", nullable = false, length = 15)
    private String status = "ACTIVE";

    @Builder.Default
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
