package com.blockid.platform.controller;

import com.blockid.platform.model.*;
import com.blockid.platform.repository.*;
import com.blockid.platform.service.PdfReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reports")

public class ReportController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IdentityRecordRepository identityRecordRepository;

    @Autowired
    private VerificationHistoryRepository verificationHistoryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PdfReportService pdfReportService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/identity/{userId}")
    public ResponseEntity<byte[]> getIdentityReport(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        IdentityRecord record = identityRecordRepository.findByUserId(userId).orElse(null);

        byte[] pdfBytes = pdfReportService.generateIdentityReport(user, record);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=identity_report_" + userId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PreAuthorize("hasAnyRole('VERIFIER', 'ADMIN')")
    @GetMapping("/verification/{historyId}")
    public ResponseEntity<byte[]> getVerificationReport(@PathVariable Long historyId) {
        Optional<VerificationHistory> historyOpt = verificationHistoryRepository.findById(historyId);
        if (historyOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        VerificationHistory history = historyOpt.get();

        byte[] pdfBytes = pdfReportService.generateVerificationReport(history);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=verification_report_" + historyId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audit")
    public ResponseEntity<byte[]> getAuditLogReport() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        byte[] pdfBytes = pdfReportService.generateAuditLogReport(logs);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit_trail_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/monthly")
    public ResponseEntity<byte[]> getMonthlyReport() {
        List<VerificationHistory> verifications = verificationHistoryRepository.findAll();

        int approved = 0;
        int rejected = 0;
        int pending = 0;

        for (VerificationHistory v : verifications) {
            if ("approved".equalsIgnoreCase(v.getStatus()))
                approved++;
            else if ("rejected".equalsIgnoreCase(v.getStatus()))
                rejected++;
            else
                pending++;
        }

        byte[] pdfBytes = pdfReportService.generateMonthlyReport(verifications, approved, rejected, pending);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=monthly_performance_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
