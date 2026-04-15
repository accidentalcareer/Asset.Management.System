package com.ams.repository;

import com.ams.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByUserUserIdAndIsActiveTrue(Long userId);

    List<Asset> findByUserUserIdAndAssetTypeAndIsActiveTrue(Long userId, String assetType);

    Optional<Asset> findByAssetIdAndUserUserId(Long assetId, Long userId);

    @Query("SELECT COALESCE(SUM(a.currentValue), 0) FROM Asset a WHERE a.user.userId = :uid AND a.isActive = true")
    BigDecimal sumCurrentValueByUserId(@Param("uid") Long userId);

    @Query("SELECT COALESCE(SUM(a.investmentAmount), 0) FROM Asset a WHERE a.user.userId = :uid AND a.isActive = true")
    BigDecimal sumInvestmentAmountByUserId(@Param("uid") Long userId);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.user.userId = :uid AND a.isActive = true")
    Long countActiveByUserId(@Param("uid") Long userId);

    @Query("SELECT a.assetType, COALESCE(SUM(a.currentValue), 0) FROM Asset a " +
           "WHERE a.user.userId = :uid AND a.isActive = true GROUP BY a.assetType")
    List<Object[]> sumByAssetTypeForUser(@Param("uid") Long userId);
}
