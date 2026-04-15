package com.ams.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long transactionId;
    private String type;
    private BigDecimal amount;
    private String category;
    private LocalDate txnDate;
    private String description;
    private LocalDateTime createdAt;
}
