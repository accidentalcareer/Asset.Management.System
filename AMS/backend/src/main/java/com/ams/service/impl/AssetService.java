package com.ams.service.impl;

import com.ams.dto.request.AssetRequest;
import com.ams.dto.response.AssetResponse;
import com.ams.entity.Asset;
import com.ams.entity.User;
import com.ams.exception.BadRequestException;
import com.ams.exception.ResourceNotFoundException;
import com.ams.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private static final Set<String> VALID_TYPES =
            Set.of("MUTUAL_FUND", "SIP", "FIXED_DEPOSIT", "SAVINGS", "OTHER");

    private final AssetRepository assetRepository;

    // ── Create ────────────────────────────────────────────────────
    public AssetResponse create(User user, AssetRequest.Create req) {
        validateType(req.getAssetType());
        Asset asset = Asset.builder()
                .user(user)
                .assetName(req.getAssetName())
                .assetType(req.getAssetType().toUpperCase())
                .investmentAmount(req.getInvestmentAmount())
                .currentValue(req.getCurrentValue())
                .purchaseDate(req.getPurchaseDate())
                .isActive(true)
                .build();
        return toResponse(assetRepository.save(asset));
    }

    // ── Read All ──────────────────────────────────────────────────
    public List<AssetResponse> getAll(Long userId, String type) {
        List<Asset> assets = (type != null && !type.isBlank())
                ? assetRepository.findByUserUserIdAndAssetTypeAndIsActiveTrue(userId, type.toUpperCase())
                : assetRepository.findByUserUserIdAndIsActiveTrue(userId);
        return assets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Read One ──────────────────────────────────────────────────
    public AssetResponse getOne(Long userId, Long assetId) {
        return toResponse(findOwned(userId, assetId));
    }

    // ── Update ────────────────────────────────────────────────────
    public AssetResponse update(Long userId, Long assetId, AssetRequest.Update req) {
        Asset asset = findOwned(userId, assetId);
        if (req.getAssetName() != null)    asset.setAssetName(req.getAssetName());
        if (req.getAssetType() != null)    { validateType(req.getAssetType()); asset.setAssetType(req.getAssetType().toUpperCase()); }
        if (req.getCurrentValue() != null) asset.setCurrentValue(req.getCurrentValue());
        if (req.getPurchaseDate() != null) asset.setPurchaseDate(req.getPurchaseDate());
        return toResponse(assetRepository.save(asset));
    }

    // ── Soft Delete ───────────────────────────────────────────────
    public void delete(Long userId, Long assetId) {
        Asset asset = findOwned(userId, assetId);
        asset.setActive(false);
        assetRepository.save(asset);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private Asset findOwned(Long userId, Long assetId) {
        return assetRepository.findByAssetIdAndUserUserId(assetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    }

    private void validateType(String type) {
        if (!VALID_TYPES.contains(type.toUpperCase()))
            throw new BadRequestException("Invalid asset type: " + type);
    }

    public AssetResponse toResponse(Asset a) {
        BigDecimal gain = a.getCurrentValue().subtract(a.getInvestmentAmount());
        double pct = a.getInvestmentAmount().compareTo(BigDecimal.ZERO) == 0 ? 0.0
                : gain.divide(a.getInvestmentAmount(), 4, RoundingMode.HALF_UP)
                      .multiply(BigDecimal.valueOf(100)).doubleValue();
        return AssetResponse.builder()
                .assetId(a.getAssetId())
                .assetName(a.getAssetName())
                .assetType(a.getAssetType())
                .investmentAmount(a.getInvestmentAmount())
                .currentValue(a.getCurrentValue())
                .gainLoss(gain)
                .gainLossPct(Math.round(pct * 100.0) / 100.0)
                .purchaseDate(a.getPurchaseDate())
                .active(a.isActive())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
