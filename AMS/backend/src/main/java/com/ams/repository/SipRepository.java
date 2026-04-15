package com.ams.repository;

import com.ams.entity.Sip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SipRepository extends JpaRepository<Sip, Long> {
    List<Sip> findByUserUserId(Long userId);
    Optional<Sip> findBySipIdAndUserUserId(Long sipId, Long userId);

    @Query("SELECT COALESCE(SUM(s.monthlyAmount), 0) FROM Sip s WHERE s.user.userId = :uid AND s.status = 'ACTIVE'")
    BigDecimal sumMonthlyAmountByUserId(@Param("uid") Long userId);
}
