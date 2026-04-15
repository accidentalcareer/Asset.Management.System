package com.ams.repository;

import com.ams.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserUserIdOrderByTxnDateDesc(Long userId);

    Optional<Transaction> findByTransactionIdAndUserUserId(Long txnId, Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.userId = :uid " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:from IS NULL OR t.txnDate >= :from) " +
           "AND (:to IS NULL OR t.txnDate <= :to) " +
           "ORDER BY t.txnDate DESC")
    List<Transaction> findFiltered(@Param("uid") Long userId,
                                   @Param("type") String type,
                                   @Param("category") String category,
                                   @Param("from") LocalDate from,
                                   @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.userId = :uid AND t.type = 'CREDIT' " +
           "AND t.txnDate BETWEEN :from AND :to")
    BigDecimal sumCredits(@Param("uid") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.userId = :uid AND t.type = 'DEBIT' " +
           "AND t.txnDate BETWEEN :from AND :to")
    BigDecimal sumDebits(@Param("uid") Long userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    // Monthly credits for last 12 months (for dashboard chart)
    @Query(value = "SELECT TO_CHAR(t.TXN_DATE, 'YYYY-MM') AS month, " +
                   "SUM(CASE WHEN t.TYPE = 'CREDIT' THEN t.AMOUNT ELSE 0 END) AS credits, " +
                   "SUM(CASE WHEN t.TYPE = 'DEBIT'  THEN t.AMOUNT ELSE 0 END) AS debits " +
                   "FROM TRANSACTIONS t WHERE t.USER_ID = :uid " +
                   "AND t.TXN_DATE >= ADD_MONTHS(SYSDATE, -12) " +
                   "GROUP BY TO_CHAR(t.TXN_DATE, 'YYYY-MM') ORDER BY month",
           nativeQuery = true)
    List<Object[]> monthlyCreditsDebits(@Param("uid") Long userId);

    // Monthly investment amounts (SIP + FD contributions) for bar chart
    @Query(value = "SELECT TO_CHAR(t.TXN_DATE, 'YYYY-MM') AS month, SUM(t.AMOUNT) AS total " +
                   "FROM TRANSACTIONS t WHERE t.USER_ID = :uid AND t.TYPE = 'DEBIT' " +
                   "AND t.CATEGORY IN ('SIP', 'Investment', 'Fixed Deposit') " +
                   "AND t.TXN_DATE >= ADD_MONTHS(SYSDATE, -12) " +
                   "GROUP BY TO_CHAR(t.TXN_DATE, 'YYYY-MM') ORDER BY month",
           nativeQuery = true)
    List<Object[]> monthlyInvestments(@Param("uid") Long userId);
}
