package com.ams.controller;

import com.ams.dto.request.AuthRequest;
import com.ams.dto.response.ApiResponse;
import com.ams.service.impl.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody AuthRequest.Register req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.register(req)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(
            @Valid @RequestBody AuthRequest.Login req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(req)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody AuthRequest.ForgotPassword req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.forgotPassword(req)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody AuthRequest.VerifyOtp req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.verifyOtpAndReset(req)));
    }
}
