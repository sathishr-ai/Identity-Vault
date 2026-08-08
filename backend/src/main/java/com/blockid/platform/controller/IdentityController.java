package com.blockid.platform.controller;

import com.blockid.platform.model.*;
import com.blockid.platform.repository.*;
import com.blockid.platform.service.AuditLogService;
import com.blockid.platform.service.BlockchainService;
import com.blockid.platform.service.SupabaseStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/identity")
@PreAuthorize("hasRole('USER')")

public class IdentityController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IdentityRecordRepository identityRecordRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private VerificationHistoryRepository verificationHistoryRepository;

    @Autowired
    private SupabaseStorageService storageService;

    @Autowired
    private AuditLogService auditLogService;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    private String getFileHash(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fileBytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return "0x" + hexString.toString();
        } catch (Exception e) {
            return "0x" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getIdentityStatus() {
        User user = getAuthenticatedUser();
        Optional<IdentityRecord> recordOpt = identityRecordRepository.findByUserId(user.getId());
        List<Document> documents = documentRepository.findByUserId(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("userStatus", user.getStatus());
        response.put("did", user.getDid());

        if (recordOpt.isPresent()) {
            IdentityRecord record = recordOpt.get();
            response.put("aadhaar", record.getAadhaarNumber());
            response.put("pan", record.getPanNumber());
            response.put("passport", record.getPassportNumber());
            response.put("license", record.getDrivingLicenceNumber());
            response.put("submittedAt", record.getSubmittedAt());
            response.put("verifiedAt", record.getVerifiedAt());
            response.put("blockNumber", record.getBlockNumber());
            response.put("blockchainHash", record.getBlockchainHash());
            response.put("rejectedReason", record.getRejectedReason());
        }

        response.put("documents", documents);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {

        User user = getAuthenticatedUser();
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File cannot be empty."));
        }

        try {
            // Upload to storage (Supabase or local folder fallback)
            String storageUrl = storageService.uploadDocument(file, user.getId().toString());

            // Compute SHA-256 for integrity
            String docHash = getFileHash(file.getBytes());

            // Format size
            long bytes = file.getSize();
            String sizeStr = bytes < 1024 * 1024
                    ? String.format("%.1f KB", (double) bytes / 1024)
                    : String.format("%.1f MB", (double) bytes / (1024 * 1024));

            // Create or update Document record
            Document doc = new Document();
            doc.setUser(user);
            doc.setType(type.toLowerCase());

            String label = type.substring(0, 1).toUpperCase() + type.substring(1);
            doc.setName(label + " Document");
            doc.setStatus("PENDING");
            doc.setDocHash(docHash);
            doc.setSize(sizeStr);
            doc.setStorageUrl(storageUrl);

            documentRepository.save(doc);

            // Fetch or create IdentityRecord corresponding container mapping
            IdentityRecord record = identityRecordRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        IdentityRecord r = new IdentityRecord();
                        r.setUser(user);
                        r.setStatus("PENDING");
                        return r;
                    });

            // Map values dummy mapping to trigger review
            String rawVal = "UPLOADED-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            if (type.equalsIgnoreCase("aadhaar"))
                record.setAadhaarNumber(rawVal);
            else if (type.equalsIgnoreCase("pan"))
                record.setPanNumber(rawVal);
            else if (type.equalsIgnoreCase("passport"))
                record.setPassportNumber(rawVal);
            else if (type.equalsIgnoreCase("license"))
                record.setDrivingLicenceNumber(rawVal);

            record.setStatus("PENDING");
            identityRecordRepository.save(record);

            // Set user status to pending verification
            user.setStatus("pending");
            userRepository.save(user);

            // Create audit log and notification
            auditLogService.log(
                    "Document Uploaded",
                    user.getName(),
                    label + " Document",
                    "info",
                    "Documents");

            notificationRepository.save(new Notification(
                    user,
                    "info",
                    "Document Uploaded",
                    "Your " + label + " has been uploaded and is pending review."));

            return ResponseEntity.ok(Map.of(
                    "message", "Document uploaded successfully",
                    "document", doc));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error reading file contents: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        User user = getAuthenticatedUser();
        String name = request.get("name");
        String phone = request.get("phone");
        String country = request.get("country");

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (country != null) {
            user.setCountry(country);
        }

        userRepository.save(user);

        auditLogService.log(
                "Profile Updated",
                user.getName(),
                "User Account Settings",
                "info",
                "Security");

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully.",
                "user", Map.of(
                        "name", user.getName(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "country", user.getCountry() != null ? user.getCountry() : "")));
    }

    @GetMapping("/documents")
    public ResponseEntity<?> getMyDocuments() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(documentRepository.findByUserId(user.getId()));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getVerificationHistory() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(verificationHistoryRepository.findByUserId(user.getId()));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByTimestampDesc(user.getId()));
    }

    @PostMapping("/notifications/read")
    public ResponseEntity<?> markNotificationsRead() {
        User user = getAuthenticatedUser();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadOrderByTimestampDesc(user.getId(),
                false);
        for (Notification n : unread) {
            n.setRead(true);
            notificationRepository.save(n);
        }
        return ResponseEntity.ok(Map.of("message", "Notifications marked as read."));
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable("documentId") Long documentId) {
        User user = getAuthenticatedUser();

        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Document not found."));
        }

        Document doc = docOpt.get();

        // Ensure user actually owns the document
        if (!doc.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "You do not have permission to delete this document."));
        }

        // Delete from Database physically
        documentRepository.delete(doc);

        return ResponseEntity.ok(Map.of("message", "Document permanently deleted."));
    }
}
