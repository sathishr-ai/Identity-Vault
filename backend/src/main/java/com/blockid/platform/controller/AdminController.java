package com.blockid.platform.controller;

import com.blockid.platform.model.*;
import com.blockid.platform.repository.*;
import com.blockid.platform.service.AuditLogService;
import com.blockid.platform.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")

public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IdentityRecordRepository identityRecordRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private BlockchainBlockRepository blockRepository;

    @Autowired
    private VerificationHistoryRepository verificationHistoryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private com.blockid.platform.service.CryptoService cryptoService;

    @Autowired
    private com.blockid.platform.service.EmailNotificationService emailNotificationService;

    private String getAdminName() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).map(User::getName).orElse("Admin User");
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getAdminNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        if (admin == null)
            return ResponseEntity.badRequest().build();

        List<Notification> notifs = notificationRepository.findByUserIdOrderByTimestampDesc(admin.getId());
        return ResponseEntity.ok(notifs.size() > 10 ? notifs.subList(0, 10) : notifs);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.countByRole(Role.USER);
        long totalVerified = verificationHistoryRepository.countByStatus("verified");
        long rejectedRequests = verificationHistoryRepository.countByStatus("rejected");

        long verifiedUsers = 0;
        long pendingVerification = 0;

        for (User u : userRepository.findAll()) {
            if (u.getRole() == Role.USER) {
                List<Document> docs = documentRepository.findByUserId(u.getId());

                // Group by type to ignore old rejected docs if a newer verified/pending one
                // exists
                Map<String, String> statusByType = new HashMap<>();
                for (Document d : docs) {
                    String t = d.getType() != null ? d.getType() : "unknown";
                    String s = d.getStatus() != null ? d.getStatus().toLowerCase() : "pending";
                    if (!statusByType.containsKey(t)) {
                        statusByType.put(t, s);
                    } else {
                        String current = statusByType.get(t);
                        if (s.equals("verified"))
                            statusByType.put(t, s);
                        else if (s.equals("pending") && !current.equals("verified"))
                            statusByType.put(t, s);
                    }
                }

                boolean hasPending = statusByType.values().stream().anyMatch(s -> s.equals("pending"));
                boolean allVerified = !statusByType.isEmpty()
                        && statusByType.values().stream().allMatch(s -> s.equals("verified"));

                if (hasPending) {
                    pendingVerification++;
                } else if (allVerified && "pending".equalsIgnoreCase(u.getStatus())) {
                    // Auto-heal stuck users
                    u.setStatus("verified");
                    if (u.getDid() == null || u.getDid().isEmpty()) {
                        userRepository.save(u); // Ensure ID is saved
                        String didSuffix = String.format("%06d", (int) (Math.random() * 1000000));
                        u.setDid("BID-2024-" + didSuffix);
                    }
                    userRepository.save(u);

                    try {
                        IdentityRecord r = identityRecordRepository.findByUserId(u.getId()).orElse(null);
                        if (r != null) {
                            r.setStatus("verified");
                            r.setVerifiedAt(LocalDateTime.now());
                            identityRecordRepository.save(r);
                            BlockchainBlock block = blockchainService.generateBlockForIdentity(u.getId());
                            r.setBlockNumber(block.getBlockNumber());
                            r.setBlockchainHash(block.getCurrentHash());
                            identityRecordRepository.save(r);
                            blockchainService.validateBlockchain();
                        }
                    } catch (Exception e) {
                    }

                    verifiedUsers++;
                } else if ("verified".equalsIgnoreCase(u.getStatus())) {
                    verifiedUsers++;
                }
            }
        }

        long totalBlocks = blockRepository.count();
        long todayVerifications = verificationHistoryRepository.countTodayVerifications();

        long activeSessions = 0;
        java.time.LocalDateTime activeThreshold = java.time.LocalDateTime.now().minusMinutes(30);
        for (User u : userRepository.findAll()) {
            if ((u.getRole() == Role.ADMIN || u.getRole() == Role.VERIFIER) &&
                    u.getLastLogin() != null && u.getLastLogin().isAfter(activeThreshold)) {
                activeSessions++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("verifiedUsers", verifiedUsers);
        stats.put("totalVerified", totalVerified);
        stats.put("pendingVerification", pendingVerification);
        stats.put("rejectedRequests", rejectedRequests);
        stats.put("blockchainBlocks", totalBlocks);
        stats.put("todayVerifications", todayVerifications);
        stats.put("activeSessions", activeSessions);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(value = "search", defaultValue = "") String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> usersPage;
        if (!search.trim().isEmpty()) {
            usersPage = userRepository.searchUsers(search, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        // Format user list for dashboard table
        List<Map<String, Object>> content = new ArrayList<>();
        for (User u : usersPage.getContent()) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", u.getId());
            uMap.put("name", u.getName());
            uMap.put("email", u.getEmail());
            uMap.put("phone", u.getPhone() != null ? u.getPhone() : "");
            uMap.put("country", u.getCountry() != null ? u.getCountry() : "");
            uMap.put("did", u.getDid() != null ? u.getDid() : "");
            uMap.put("status", u.getStatus());
            uMap.put("role", u.getRole().name());
            uMap.put("joinDate", u.getJoinDate());
            uMap.put("lastLogin", u.getLastLogin());

            // Count documents code segment
            long docsCount = documentRepository.findByUserId(u.getId()).size();
            uMap.put("documentsCount", docsCount);

            content.add(uMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("users", content);
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/identity")
    public ResponseEntity<?> getUserIdentity(@PathVariable("userId") Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return ResponseEntity.notFound().build();

        IdentityRecord record = identityRecordRepository.findByUserId(userId).orElse(null);
        List<Document> documents = documentRepository.findByUserId(userId);
        List<VerificationHistory> history = verificationHistoryRepository.findByUserId(userId);

        List<Map<String, Object>> docsList = new ArrayList<>();
        for (Document d : documents) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", d.getId());
            map.put("type", d.getType());
            map.put("url", d.getName());
            map.put("status", d.getStatus());
            map.put("uploadedAt", d.getUploadDate());
            docsList.add(map);
        }

        List<Map<String, Object>> histList = new ArrayList<>();
        for (VerificationHistory h : history) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", h.getId());
            map.put("verifierName", h.getVerifier() != null ? h.getVerifier().getName() : "System");
            map.put("purpose", h.getPurpose());
            map.put("verifiedAt", h.getVerificationDate());
            map.put("status", h.getStatus());
            histList.add(map);
        }

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role", user.getRole());
        userMap.put("did", user.getDid());
        userMap.put("status", user.getStatus());
        userMap.put("country", user.getCountry());
        userMap.put("joinDate", user.getJoinDate());

        Map<String, Object> recordMap = null;
        if (record != null) {
            recordMap = new HashMap<>();
            recordMap.put("id", record.getId());
            recordMap.put("status", record.getStatus());
            recordMap.put("blockNumber", record.getBlockNumber());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("user", userMap);
        response.put("record", recordMap);
        response.put("documents", docsList);
        response.put("history", histList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/pending-requests")
    public ResponseEntity<?> getPendingRequests(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
        Page<IdentityRecord> recordsPage = identityRecordRepository.findByStatus("PENDING", pageable);

        List<Map<String, Object>> content = new ArrayList<>();
        for (IdentityRecord r : recordsPage.getContent()) {
            List<Document> docs = documentRepository.findByUserId(r.getUser().getId());
            // Only include if there are actual pending documents
            boolean hasPendingDocs = docs.stream().anyMatch(d -> "pending".equalsIgnoreCase(d.getStatus()));
            if (!hasPendingDocs) {
                // Auto-fix: if all docs are verified but identity record is still PENDING,
                // update it
                boolean allVerified = docs.stream().allMatch(d -> "verified".equalsIgnoreCase(d.getStatus()));
                if (allVerified && !docs.isEmpty()) {
                    r.setStatus("verified");
                    r.setVerifiedAt(LocalDateTime.now());
                    identityRecordRepository.save(r);

                    User u = r.getUser();
                    if (!"verified".equalsIgnoreCase(u.getStatus())) {
                        u.setStatus("verified");
                        if (u.getDid() == null || u.getDid().isEmpty()) {
                            String didSuffix = String.format("%06d", (int) (Math.random() * 1000000));
                            u.setDid("BID-2024-" + didSuffix);
                        }
                        userRepository.save(u);
                        try {
                            BlockchainBlock block = blockchainService.generateBlockForIdentity(u.getId());
                            r.setBlockNumber(block.getBlockNumber());
                            r.setBlockchainHash(block.getCurrentHash());
                            identityRecordRepository.save(r);
                            blockchainService.validateBlockchain();
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    }
                }
                continue; // Skip this user from pending list
            }

            Map<String, Object> rMap = new HashMap<>();
            rMap.put("id", r.getId());
            rMap.put("userId", r.getUser().getId());
            rMap.put("name", r.getUser().getName());
            uRoleCheck(rMap, r);
            rMap.put("submittedAt", r.getSubmittedAt());
            rMap.put("documents", docs);

            content.add(rMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("requests", content);
        response.put("currentPage", recordsPage.getNumber());
        response.put("totalItems", content.size());
        response.put("totalPages", recordsPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    private void uRoleCheck(Map<String, Object> rMap, IdentityRecord r) {
        rMap.put("email", r.getUser().getEmail());
        rMap.put("did", r.getUser().getDid());
        rMap.put("aadhaar", r.getAadhaarNumber());
        rMap.put("pan", r.getPanNumber());
        rMap.put("passport", r.getPassportNumber());
        rMap.put("license", r.getDrivingLicenceNumber());
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approveIdentity(@PathVariable("userId") Long userId,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            IdentityRecord record = identityRecordRepository.findByUserId(userId)
                    .orElse(null);

            if (record == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "No identity documents uploaded to approve."));
            }

            // 1. Approve record
            record.setStatus("verified");
            record.setVerifiedAt(LocalDateTime.now());
            if (body != null && body.containsKey("validUntil")) {
                record.setValidUntil(body.get("validUntil"));
            }

            // Approve associated documents
            List<Document> documents = documentRepository.findByUserId(userId);
            List<Document> newlyActionedDocs = new ArrayList<>();
            for (Document d : documents) {
                if ("PENDING".equals(d.getStatus())) {
                    d.setStatus("verified");
                    if (body != null && body.containsKey("doc_" + d.getId())) {
                        d.setExpiryDate(body.get("doc_" + d.getId()));
                    }
                    documentRepository.save(d);
                    newlyActionedDocs.add(d);
                }
            }

            // 2. Generate Blockchain Block (linking sequence)
            BlockchainBlock block = blockchainService.generateBlockForIdentity(userId);

            record.setBlockNumber(block.getBlockNumber());
            record.setBlockchainHash(block.getCurrentHash());
            identityRecordRepository.save(record);

            // 3. Update User Status
            user.setStatus("verified");
            // Ensure did is assigned
            if (user.getDid() == null || user.getDid().isEmpty()) {
                String didSuffix = String.format("%06d", (int) (Math.random() * 1000000));
                user.setDid("BID-2024-" + didSuffix);
            }
            userRepository.save(user);

            // Log audit and notification
            auditLogService.log(
                    "Identity Approved",
                    getAdminName(),
                    user.getName() + " (" + user.getDid() + ")",
                    "info",
                    "Identity");

            notificationRepository.save(new Notification(
                    user,
                    "success",
                    "Identity Verified",
                    "Congratulations! Your digital identity has been verified and permanently anchored on block #"
                            + block.getBlockNumber() + "."));

            // Save Verification History Record for the end user to see
            VerificationHistory vHistory = new VerificationHistory();
            vHistory.setUser(user);
            User adminUser = userRepository
                    .findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElse(null);
            vHistory.setVerifier(adminUser);
            vHistory.setPurpose("Platform Verification");
            vHistory.setVerificationDate(LocalDateTime.now());
            vHistory.setStatus("verified");
            vHistory.setDuration(String.format("%.1fs", 1.2 + (Math.random() * 2)));

            // Extract document names for checked fields
            List<String> docNames = new ArrayList<>();
            for (Document d : newlyActionedDocs) {
                if (d.getName() != null && !d.getName().isEmpty()) {
                    docNames.add(d.getName().replace(" Document", ""));
                }
            }
            vHistory.setCheckedFields(docNames.isEmpty() ? "Identity Overview" : String.join(", ", docNames));

            vHistory.setReportUrl("/api/v1/documents");
            verificationHistoryRepository.save(vHistory);

            // Periodically run blockchain check to ensure consistency
            blockchainService.validateBlockchain();

            return ResponseEntity
                    .ok(Map.of("message", "User identity approved and anchored on block #" + block.getBlockNumber()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Approve Crash: " + e.getMessage(), "cause", String.valueOf(e.getCause())));
        }
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<?> rejectIdentity(@PathVariable("userId") Long userId,
            @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "Documents uploaded are invalid or blurry.");

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            IdentityRecord record = identityRecordRepository.findByUserId(userId)
                    .orElse(null);

            if (record == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "No identity documents found to reject."));
            }

            record.setStatus("rejected");
            record.setRejectedReason(reason);
            identityRecordRepository.save(record);

            // Reject documents
            List<Document> documents = documentRepository.findByUserId(userId);
            List<Document> newlyActionedDocs = new ArrayList<>();
            for (Document d : documents) {
                if ("PENDING".equals(d.getStatus())) {
                    d.setStatus("rejected");
                    documentRepository.save(d);
                    newlyActionedDocs.add(d);
                }
            }

            user.setStatus("rejected");
            userRepository.save(user);

            auditLogService.log(
                    "Identity Rejected",
                    getAdminName(),
                    user.getName(),
                    "warning",
                    "Identity");

            notificationRepository.save(new Notification(
                    user,
                    "error",
                    "Verification Failed",
                    "Your identity verification request was rejected. Reason: " + reason));

            VerificationHistory vHistory = new VerificationHistory();
            vHistory.setUser(user);
            User adminUser = userRepository
                    .findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElse(null);
            vHistory.setVerifier(adminUser);
            vHistory.setPurpose("Platform Verification");
            vHistory.setVerificationDate(LocalDateTime.now());
            vHistory.setStatus("rejected");
            vHistory.setDuration(String.format("%.1fs", 1.2 + (Math.random() * 2)));

            // Extract document names for checked fields
            List<String> docNames = new ArrayList<>();
            for (Document d : newlyActionedDocs) {
                if (d.getName() != null && !d.getName().isEmpty()) {
                    docNames.add(d.getName().replace(" Document", ""));
                }
            }
            vHistory.setCheckedFields(docNames.isEmpty() ? "Identity Overview" : String.join(", ", docNames));

            vHistory.setReportUrl("/api/v1/documents");
            verificationHistoryRepository.save(vHistory);

            return ResponseEntity.ok(Map.of("message", "User identity request rejected successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Reject Crash: " + e.getMessage(), "cause", String.valueOf(e.getCause())));
        }
    }

    // ── Per-Document Review (Method 1) ──────────────────────────────────────────
    @PostMapping("/review-documents/{userId}")
    public ResponseEntity<?> reviewDocuments(@PathVariable("userId") Long userId,
            @RequestBody List<Map<String, String>> decisions) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            User adminUser = userRepository
                    .findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElse(null);

            List<String> approvedNames = new ArrayList<>();
            List<String> rejectedNames = new ArrayList<>();
            List<String> rejectedReasons = new ArrayList<>();

            for (Map<String, String> dec : decisions) {
                Long docId = Long.parseLong(dec.get("docId"));
                String action = dec.get("decision"); // "approve" or "reject"

                Document doc = documentRepository.findById(docId).orElse(null);
                if (doc == null)
                    continue;

                if ("approve".equals(action)) {
                    doc.setStatus("verified");
                    if (dec.containsKey("validUntil")) {
                        doc.setExpiryDate(dec.get("validUntil"));
                    }
                    String docName = doc.getName() != null ? doc.getName() : "Document";
                    if (!docName.toLowerCase().contains("document") && !docName.toLowerCase().contains("card")
                            && !docName.toLowerCase().contains("passport")
                            && !docName.toLowerCase().contains("license")) {
                        docName += " Document";
                    }
                    // Capitalize first letter
                    docName = docName.substring(0, 1).toUpperCase() + docName.substring(1);
                    documentRepository.save(doc);
                    approvedNames.add(docName);
                } else if ("reject".equals(action)) {
                    doc.setStatus("rejected");
                    String docName = doc.getName() != null ? doc.getName() : "Document";
                    if (!docName.toLowerCase().contains("document") && !docName.toLowerCase().contains("card")
                            && !docName.toLowerCase().contains("passport")
                            && !docName.toLowerCase().contains("license")) {
                        docName += " Document";
                    }
                    docName = docName.substring(0, 1).toUpperCase() + docName.substring(1);

                    if (dec.containsKey("reason")) {
                        doc.setRejectedReason(dec.get("reason"));
                        rejectedReasons.add(docName + ": " + dec.get("reason"));
                    }
                    documentRepository.save(doc);
                    rejectedNames.add(docName);
                }
            }

            // Determine overall user status based on unique active document types
            List<Document> allDocs = documentRepository.findByUserId(userId);

            Map<String, String> statusByType = new HashMap<>();
            for (Document d : allDocs) {
                String t = d.getType() != null ? d.getType() : "unknown";
                String s = d.getStatus() != null ? d.getStatus().toLowerCase() : "pending";
                if (!statusByType.containsKey(t)) {
                    statusByType.put(t, s);
                } else {
                    String current = statusByType.get(t);
                    if (s.equals("verified"))
                        statusByType.put(t, s);
                    else if (s.equals("pending") && !current.equals("verified"))
                        statusByType.put(t, s);
                }
            }

            boolean hasPending = statusByType.values().stream().anyMatch(s -> s.equals("pending"));
            boolean allVerified = !statusByType.isEmpty()
                    && statusByType.values().stream().allMatch(s -> s.equals("verified"));
            boolean allRejected = !statusByType.isEmpty()
                    && statusByType.values().stream().allMatch(s -> s.equals("rejected"));

            IdentityRecord record = identityRecordRepository.findByUserId(userId).orElse(null);

            if (allVerified) {
                // All verified -> generate blockchain block
                if (record != null) {
                    record.setStatus("verified");
                    record.setVerifiedAt(LocalDateTime.now());
                    identityRecordRepository.save(record);
                }
                BlockchainBlock block = blockchainService.generateBlockForIdentity(userId);
                if (record != null) {
                    record.setBlockNumber(block.getBlockNumber());
                    record.setBlockchainHash(block.getCurrentHash());
                    identityRecordRepository.save(record);
                }
                user.setStatus("verified");
                if (user.getDid() == null || user.getDid().isEmpty()) {
                    String didSuffix = String.format("%06d", (int) (Math.random() * 1000000));
                    user.setDid("BID-2024-" + didSuffix);
                }
                userRepository.save(user);
                blockchainService.validateBlockchain();
            } else if (allRejected) {
                user.setStatus("rejected");
                userRepository.save(user);
                if (record != null) {
                    record.setStatus("rejected");
                    identityRecordRepository.save(record);
                }
            } else if (hasPending) {
                // Some docs still pending review
                user.setStatus("pending");
                userRepository.save(user);
            } else {
                // Mixed: some verified, some rejected, none pending
                // User needs to re-upload rejected docs, keep as pending
                user.setStatus("pending");
                userRepository.save(user);
            }

            // Create verification history for approved docs
            if (!approvedNames.isEmpty()) {
                VerificationHistory vh = new VerificationHistory();
                vh.setUser(user);
                vh.setVerifier(adminUser);
                vh.setPurpose("Platform Verification");
                vh.setVerificationDate(LocalDateTime.now());
                vh.setStatus("verified");
                vh.setDuration(String.format("%.1fs", 1.2 + (Math.random() * 2)));
                vh.setCheckedFields(String.join(", ", approvedNames));
                vh.setReportUrl("/api/v1/documents");

                // --- MODULE 3: Generate RSA Digital Signature ---
                try {
                    // We use the Admin's private key to sign the combination payload
                    String rsaSignature = cryptoService.generateDigitalSignature("ADMIN_MASTER",
                            user.getDid() + "-" + String.join(",", approvedNames));
                    // Store the cryptographic signature into the Verification record dynamically
                    // preventing tampering
                    vh.setReportUrl("/api/v1/documents?sig=" + rsaSignature);
                    System.out.println("RSA Engine: Admin generated Unforgeable Digital Signature -> " + rsaSignature);
                } catch (Exception e) {
                    System.err.println("RSA Signature failed to generate " + e.getMessage());
                }

                verificationHistoryRepository.save(vh);

                auditLogService.log("Documents Approved", getAdminName(),
                        user.getName() + " (" + String.join(", ", approvedNames) + ")", "info", "Identity");

                // Trigger Professional Email Notification
                emailNotificationService.sendApprovalEmail(user.getEmail(), user.getName(),
                        String.join(", ", approvedNames));
            }

            // Create verification history for rejected docs
            if (!rejectedNames.isEmpty()) {
                VerificationHistory vh = new VerificationHistory();
                vh.setUser(user);
                vh.setVerifier(adminUser);
                vh.setPurpose("Platform Verification");
                vh.setVerificationDate(LocalDateTime.now());
                vh.setStatus("rejected");
                vh.setDuration(String.format("%.1fs", 1.2 + (Math.random() * 2)));
                vh.setCheckedFields(String.join(", ", rejectedNames));
                vh.setReportUrl("/api/v1/documents");
                verificationHistoryRepository.save(vh);

                auditLogService.log("Documents Rejected", getAdminName(),
                        user.getName() + " (" + String.join(", ", rejectedNames) + ")", "warning", "Identity");

                // Trigger Professional Email Notification
                emailNotificationService.sendRejectionEmail(user.getEmail(), user.getName(),
                        String.join(", ", rejectedNames), String.join("; ", rejectedReasons));
            }

            // Send notification to user
            if (!approvedNames.isEmpty() && !rejectedNames.isEmpty()) {
                notificationRepository.save(new Notification(user, "info", "Partial Review Complete",
                        "Documents approved: " + String.join(", ", approvedNames) + ". Documents rejected: "
                                + String.join("; ", rejectedReasons)
                                + ". Please re-upload rejected documents."));
            } else if (!approvedNames.isEmpty()) {
                notificationRepository.save(new Notification(user, "success", "Documents Verified",
                        "Your documents (" + String.join(", ", approvedNames)
                                + ") have been verified successfully."));
            } else if (!rejectedNames.isEmpty()) {
                notificationRepository.save(new Notification(user, "error", "Documents Rejected",
                        "The following documents were rejected: "
                                + String.join("; ", rejectedReasons) + ". Please re-upload."));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Document review completed.",
                    "approved", approvedNames.size(),
                    "rejected", rejectedNames.size()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Review error: " + e.getMessage()));
        }
    }

    @GetMapping("/blockchain/blocks")
    public ResponseEntity<?> getBlockchainBlocks() {
        return ResponseEntity.ok(blockRepository.findAllBlocksSortedByNumberDesc());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "severity", required = false) String severity) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> logs;

        if (severity != null && !severity.trim().isEmpty() && !severity.equalsIgnoreCase("all")) {
            logs = auditLogRepository.findBySeverityOrderByTimestampDesc(severity, pageable);
        } else {
            logs = auditLogRepository.findAllByOrderByTimestampDesc(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("logs", logs.getContent());
        response.put("currentPage", logs.getNumber());
        response.put("totalItems", logs.getTotalElements());
        response.put("totalPages", logs.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/monthly")
    public ResponseEntity<?> getMonthlyAnalytics() {
        List<User> users = userRepository.findAll();
        List<VerificationHistory> history = verificationHistoryRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 6; i >= 0; i--) {
            LocalDateTime monthDate = LocalDateTime.now().minusMonths(i);
            String monthLabel = monthDate.format(formatter);

            long registrations = 0;
            long verifications = 0;
            long approved = 0;
            long rejected = 0;

            for (User u : users) {
                if (u.getRole() == Role.USER && u.getJoinDate() != null
                        && u.getJoinDate().getMonthValue() == monthDate.getMonthValue()
                        && u.getJoinDate().getYear() == monthDate.getYear()) {
                    registrations++;
                }
            }

            for (VerificationHistory h : history) {
                if (h.getVerificationDate() != null
                        && h.getVerificationDate().getMonthValue() == monthDate.getMonthValue()
                        && h.getVerificationDate().getYear() == monthDate.getYear()) {

                    String s = h.getStatus() == null ? "" : h.getStatus().toLowerCase();
                    if (s.equals("verified")) {
                        verifications++;
                        approved++;
                    } else if (s.equals("rejected")) {
                        rejected++;
                    }
                }
            }

            list.add(Map.of(
                    "month", monthLabel,
                    "registrations", registrations,
                    "verifications", verifications,
                    "approved", approved,
                    "rejected", rejected));
        }
        return ResponseEntity.ok(list);
    }

    @Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable("userId") Long userId) {
        return transactionTemplate.execute(status -> {
            try {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isEmpty()) {
                    return ResponseEntity.status(404).body(Map.of("error", "User not found"));
                }
                User user = userOpt.get();

                // 1. Clear verifier references
                List<VerificationHistory> actingAsVerifier = verificationHistoryRepository.findByVerifierId(userId);
                for (VerificationHistory vh : actingAsVerifier) {
                    vh.setVerifier(null);
                    verificationHistoryRepository.save(vh);
                }

                // 2. Delete related records
                documentRepository.deleteAll(documentRepository.findByUserId(userId));
                identityRecordRepository.findByUserId(userId).ifPresent(identityRecordRepository::delete);
                verificationHistoryRepository.deleteAll(verificationHistoryRepository.findByUserId(userId));
                notificationRepository.deleteAll(notificationRepository.findByUserIdOrderByTimestampDesc(userId));

                try {
                    blockRepository.findByIdentityId(userId).ifPresent(blockRepository::delete);
                } catch (Exception blockEx) {
                    System.out.println(
                            "Warning: Multiple blocks found for user " + userId + ". Skipping block deletion.");
                }

                // 3. Log audit
                auditLogService.log("User Deleted", getAdminName(),
                        "Admin permanently deleted user: " + user.getName() + " (" + user.getEmail() + ")", "critical",
                        "Users");

                // 4. Delete user securely
                userRepository.delete(user);

                return ResponseEntity.ok(Map.of("message", "User " + user.getName() + " permanently deleted."));
            } catch (Exception e) {
                status.setRollbackOnly();
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of("error",
                        "Failed to delete user due to a database constraint. Details: " + e.getMessage()));
            }
        });
    }

    @GetMapping("/users/{userId}/details")
    public ResponseEntity<?> getUserDetails(@PathVariable("userId") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        List<Document> documents = documentRepository.findByUserId(userId);
        List<VerificationHistory> history = verificationHistoryRepository.findByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("documents", documents);
        response.put("history", history);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable("userId") Long userId,
            @RequestBody Map<String, String> body) {
        String newRoleStr = body.get("role");
        if (newRoleStr == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        try {
            Role newRole = Role.valueOf(newRoleStr.toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);

            auditLogService.log("User Role Updated", getAdminName(),
                    "Updated role of " + user.getName() + " to " + newRole.name(), "warning", "Users");
            return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role specified"));
        }
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable("userId") Long userId,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        user.setStatus(newStatus.toLowerCase());
        userRepository.save(user);

        String logAction = "suspended".equalsIgnoreCase(newStatus) ? "Account Suspended" : "Account Activated";
        auditLogService.log(logAction, getAdminName(),
                "Updated status of " + user.getName() + " to " + newStatus, "warning", "Users");
        return ResponseEntity.ok(Map.of("message", "User status updated successfully", "status", newStatus));
    }

    @DeleteMapping("/audit-logs/{id}")
    public ResponseEntity<?> deleteAuditLog(@PathVariable("id") Long id) {
        if (auditLogRepository.existsById(id)) {
            auditLogRepository.deleteById(id);
            auditLogService.log("Deleted Audit Log", getAdminName(), "Log ID: " + id, "warning", "Admin");
            return ResponseEntity.ok(Map.of("message", "Log deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
