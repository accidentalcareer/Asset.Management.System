package com.ams.controller;

import com.ams.dto.request.TransactionRequest;
import com.ams.dto.response.ApiResponse;
import com.ams.service.impl.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController extends BaseController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String keyword) {

        TransactionRequest.Filter filter = new TransactionRequest.Filter();
        filter.setType(type);
        filter.setCategory(category);
        filter.setFrom(from != null ? LocalDate.parse(from) : null);
        filter.setTo(to   != null ? LocalDate.parse(to)   : null);
        filter.setKeyword(keyword);

        return ResponseEntity.ok(ApiResponse.ok(
                transactionService.getFiltered(currentUser().getUserId(), filter)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(
            @Valid @RequestBody TransactionRequest.Create req) {
        return ResponseEntity.ok(ApiResponse.ok("Transaction recorded",
                transactionService.create(currentUser(), req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest.Update req) {
        return ResponseEntity.ok(ApiResponse.ok("Transaction updated",
                transactionService.update(currentUser().getUserId(), id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        transactionService.delete(currentUser().getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Transaction deleted"));
    }

    // ── Export CSV ────────────────────────────────────────────────
    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() throws Exception {
        byte[] data = transactionService.exportCsv(currentUser().getUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    // ── Export PDF ────────────────────────────────────────────────
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() throws Exception {
        byte[] data = transactionService.exportPdf(currentUser().getUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
