package com.ams.controller;

import com.ams.dto.request.ProjectionRequest;
import com.ams.dto.response.ApiResponse;
import com.ams.service.impl.ProjectionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/projections")
@RequiredArgsConstructor
public class ProjectionController extends BaseController {

    private final ProjectionService projectionService;

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<?>> calculate(
            @Valid @RequestBody ProjectionRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Projection calculated",
                projectionService.calculate(currentUser(), req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getSaved() {
        return ResponseEntity.ok(ApiResponse.ok(
                projectionService.getSaved(currentUser().getUserId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        projectionService.delete(currentUser().getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Projection deleted"));
    }

    @GetMapping("/retirement")
    public ResponseEntity<ApiResponse<?>> retirementPlan(
            @RequestParam @Min(18) @Max(80) int currentAge,
            @RequestParam @Min(19) @Max(100) int retirementAge,
            @RequestParam BigDecimal targetCorpus,
            @RequestParam BigDecimal annualReturn) {
        return ResponseEntity.ok(ApiResponse.ok(
                projectionService.retirementPlan(currentAge, retirementAge, targetCorpus, annualReturn)));
    }
}
