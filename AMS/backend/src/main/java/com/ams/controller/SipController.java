package com.ams.controller;

import com.ams.dto.request.SipRequest;
import com.ams.dto.response.ApiResponse;
import com.ams.service.impl.SipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sips")
@RequiredArgsConstructor
public class SipController extends BaseController {

    private final SipService sipService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(
                sipService.getAll(currentUser().getUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                sipService.getOne(currentUser().getUserId(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(
            @Valid @RequestBody SipRequest.Create req) {
        return ResponseEntity.ok(ApiResponse.ok("SIP created",
                sipService.create(currentUser(), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id,
            @Valid @RequestBody SipRequest.Update req) {
        return ResponseEntity.ok(ApiResponse.ok("SIP updated",
                sipService.update(currentUser().getUserId(), id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        sipService.delete(currentUser().getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok("SIP deleted"));
    }
}
