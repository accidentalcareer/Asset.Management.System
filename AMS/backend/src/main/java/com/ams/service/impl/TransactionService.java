package com.ams.service.impl;

import com.ams.dto.request.TransactionRequest;
import com.ams.dto.response.TransactionResponse;
import com.ams.dto.response.TransactionSummaryResponse;
import com.ams.entity.Transaction;
import com.ams.entity.User;
import com.ams.exception.BadRequestException;
import com.ams.exception.ResourceNotFoundException;
import com.ams.repository.TransactionRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionResponse create(User user, TransactionRequest.Create req) {
        Transaction txn = Transaction.builder()
                .user(user)
                .type(req.getType().toUpperCase())
                .amount(req.getAmount())
                .category(req.getCategory())
                .txnDate(req.getTxnDate())
                .description(req.getDescription())
                .build();
        return toResponse(transactionRepository.save(txn));
    }

    public TransactionSummaryResponse getFiltered(Long userId, TransactionRequest.Filter filter) {
        List<Transaction> txns = transactionRepository.findFiltered(
                userId,
                filter.getType() != null ? filter.getType().toUpperCase() : null,
                filter.getCategory(),
                filter.getFrom(),
                filter.getTo()
        );

        // keyword filter (in-memory — description search)
        if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
            String kw = filter.getKeyword().toLowerCase();
            txns = txns.stream()
                    .filter(t -> t.getDescription() != null && t.getDescription().toLowerCase().contains(kw))
                    .collect(Collectors.toList());
        }

        LocalDate from = filter.getFrom() != null ? filter.getFrom() : LocalDate.now().withDayOfMonth(1);
        LocalDate to   = filter.getTo()   != null ? filter.getTo()   : LocalDate.now();

        BigDecimal credits = transactionRepository.sumCredits(userId, from, to);
        BigDecimal debits  = transactionRepository.sumDebits(userId, from, to);

        return TransactionSummaryResponse.builder()
                .totalCredits(credits)
                .totalDebits(debits)
                .netBalance(credits.subtract(debits))
                .transactions(txns.stream().map(this::toResponse).collect(Collectors.toList()))
                .build();
    }

    public TransactionResponse update(Long userId, Long txnId, TransactionRequest.Update req) {
        Transaction txn = findOwned(userId, txnId);
        // Allow edit only within 7 days
        if (txn.getCreatedAt().isBefore(LocalDateTime.now().minusDays(7)))
            throw new BadRequestException("Transactions older than 7 days cannot be edited");
        if (req.getAmount() != null)      txn.setAmount(req.getAmount());
        if (req.getCategory() != null)    txn.setCategory(req.getCategory());
        if (req.getTxnDate() != null)     txn.setTxnDate(req.getTxnDate());
        if (req.getDescription() != null) txn.setDescription(req.getDescription());
        return toResponse(transactionRepository.save(txn));
    }

    public void delete(Long userId, Long txnId) {
        transactionRepository.delete(findOwned(userId, txnId));
    }

    // ── Export CSV ────────────────────────────────────────────────
    public byte[] exportCsv(Long userId) throws Exception {
        List<Transaction> txns = transactionRepository.findByUserUserIdOrderByTxnDateDesc(userId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos))) {
            writer.writeNext(new String[]{"Date", "Type", "Category", "Amount", "Description"});
            for (Transaction t : txns) {
                writer.writeNext(new String[]{
                        t.getTxnDate().toString(),
                        t.getType(),
                        t.getCategory(),
                        t.getAmount().toPlainString(),
                        t.getDescription() != null ? t.getDescription() : ""
                });
            }
        }
        return baos.toByteArray();
    }

    // ── Export PDF ────────────────────────────────────────────────
    public byte[] exportPdf(Long userId) throws Exception {
        List<Transaction> txns = transactionRepository.findByUserUserIdOrderByTxnDateDesc(userId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document doc = new Document(pdfDoc);

        doc.add(new Paragraph("Transaction History")
                .setBold().setFontSize(18).setMarginBottom(10));

        Table table = new Table(UnitValue.createPercentArray(new float[]{15, 10, 20, 15, 40}))
                .useAllAvailableWidth();

        String[] headers = {"Date", "Type", "Category", "Amount (₹)", "Description"};
        for (String h : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(h).setBold())
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY));
        }

        for (Transaction t : txns) {
            table.addCell(t.getTxnDate().toString());
            table.addCell(t.getType());
            table.addCell(t.getCategory());
            table.addCell(t.getAmount().toPlainString());
            table.addCell(t.getDescription() != null ? t.getDescription() : "");
        }

        doc.add(table);
        doc.close();
        return baos.toByteArray();
    }

    private Transaction findOwned(Long userId, Long txnId) {
        return transactionRepository.findByTransactionIdAndUserUserId(txnId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    public TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .transactionId(t.getTransactionId())
                .type(t.getType())
                .amount(t.getAmount())
                .category(t.getCategory())
                .txnDate(t.getTxnDate())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
