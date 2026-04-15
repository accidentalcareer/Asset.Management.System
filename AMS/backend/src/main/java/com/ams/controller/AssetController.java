package com.ams.controller;

import com.ams.dto.request.AssetRequest;
import com.ams.dto.response.ApiResponse;
import com.ams.service.impl.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController extends BaseController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(ApiResponse.ok(
                assetService.getAll(currentUser().getUserId(), type)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                assetService.getOne(currentUser().getUserId(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(
            @Valid @RequestBody AssetRequest.Create req) {
        return ResponseEntity.ok(ApiResponse.ok("Asset created",
                assetService.create(currentUser(), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest.Update req) {
        return ResponseEntity.ok(ApiResponse.ok("Asset updated",
                assetService.update(currentUser().getUserId(), id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        assetService.delete(currentUser().getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Asset deleted"));
    }
}
