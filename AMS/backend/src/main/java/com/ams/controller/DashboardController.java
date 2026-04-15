package com.ams.controller;

import com.ams.dto.response.ApiResponse;
import com.ams.service.impl.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController extends BaseController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.getDashboard(currentUser().getUserId())));
    }
}
