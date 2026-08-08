package com.blockid.platform.config;

import com.blockid.platform.model.*;
import com.blockid.platform.repository.*;
import com.blockid.platform.service.BlockchainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

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
        private NotificationRepository notificationRepository;

        @Autowired
        private AuditLogRepository auditLogRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private BlockchainService blockchainService;

        @Override
        public void run(String... args) throws Exception {
                System.out.println("Database seeding is disabled.");
                if (true)
                        return;

                System.out.println("Seeding database with BlockID enterprise demo data...");

                // 1. Seed users
                // Admins
                User admin = new User("sarah.kim@corp.net", passwordEncoder.encode("demo1234"), "Sarah Kim",
                                "+1 (234) 567-8901", "South Korea", Role.ADMIN);
                admin.setStatus("verified");
                admin.setDid("BID-2024-001236");
                userRepository.save(admin);

                // Verifiers
                User verifier = new User("m.torres@global.co", passwordEncoder.encode("demo1234"), "Michael Torres",
                                "+1 (345) 678-9012", "Spain", Role.VERIFIER);
                verifier.setStatus("verified");
                verifier.setDid("BID-2024-001237");
                userRepository.save(verifier);

                User verifier2 = new User("liu.wei@digital.cn", passwordEncoder.encode("demo1234"), "Liu Wei",
                                "+86 10 1234 5678", "China", Role.VERIFIER);
                verifier2.setStatus("verified");
                verifier2.setDid("BID-2024-001241");
                userRepository.save(verifier2);

                // Users
                User user1 = new User("alex.chen@enterprise.io", passwordEncoder.encode("demo1234"), "Alexandra Chen",
                                "+1 (415) 555-0182", "United States", Role.USER);
                user1.setStatus("verified");
                user1.setDid("BID-2024-001234");
                userRepository.save(user1);

                User user2 = new User("j.wilson@company.com", passwordEncoder.encode("demo1234"), "James Wilson",
                                "+44 20 7946 0958", "United Kingdom", Role.USER);
                user2.setStatus("pending");
                user2.setDid("BID-2024-001235");
                userRepository.save(user2);

                User user3 = new User("p.sharma@tech.in", passwordEncoder.encode("demo1234"), "Priya Sharma",
                                "+91 22 2778 0122", "India", Role.USER);
                user3.setStatus("rejected");
                user3.setDid("BID-2024-001238");
                userRepository.save(user3);

                User user4 = new User("d.muller@fintech.de", passwordEncoder.encode("demo1234"), "David Müller",
                                "+49 30 901820", "Germany", Role.USER);
                user4.setStatus("verified");
                user4.setDid("BID-2024-001239");
                userRepository.save(user4);

                User user5 = new User("a.okafor@banking.ng", passwordEncoder.encode("demo1234"), "Amara Okafor",
                                "+234 1 270 0482", "Nigeria", Role.USER);
                user5.setStatus("pending");
                user5.setDid("BID-2024-001240");
                userRepository.save(user5);

                // 2. Seed Identity Records
                // Alexandra Chen
                IdentityRecord record1 = new IdentityRecord();
                record1.setUser(user1);
                record1.setAadhaarNumber("3648-9122-3849");
                record1.setPanNumber("ABCDE1234F");
                record1.setPassportNumber("Z1234567");
                record1.setDrivingLicenceNumber("DL-9847234");
                record1.setStatus("verified");
                record1.setVerifiedAt(LocalDateTime.now().minusDays(5));
                identityRecordRepository.save(record1);

                // David Müller
                IdentityRecord record4 = new IdentityRecord();
                record4.setUser(user4);
                record4.setAadhaarNumber("5542-8822-1249");
                record4.setPanNumber("FGHIJ5678K");
                record4.setPassportNumber("Y9876543");
                record4.setDrivingLicenceNumber("DL-1092834");
                record4.setStatus("verified");
                record4.setVerifiedAt(LocalDateTime.now().minusDays(2));
                identityRecordRepository.save(record4);

                // James Wilson (Pending)
                IdentityRecord record2 = new IdentityRecord();
                record2.setUser(user2);
                record2.setPassportNumber("X5542898");
                record2.setStatus("pending");
                identityRecordRepository.save(record2);

                // Priya Sharma (Rejected)
                IdentityRecord record3 = new IdentityRecord();
                record3.setUser(user3);
                record3.setAadhaarNumber("9948-2231-1002");
                record3.setStatus("rejected");
                record3.setRejectedReason("Income document mismatch and address proof invalid.");
                identityRecordRepository.save(record3);

                // 3. Seed Documents
                // Alexandra Documents
                saveDoc(user1, "National Passport", "passport", "verified", "0x3f8a7b2c9d1e4f6a", "2.4 MB",
                                "https://placeholder-project.supabase.co/storage/v1/object/public/identity-documents/alex_passport.pdf");
                saveDoc(user1, "Driver's License", "license", "verified", "0x8b2c9d1e4f6a3f8a", "1.8 MB",
                                "https://placeholder-project.supabase.co/storage/v1/object/public/identity-documents/alex_licence.png");
                saveDoc(user1, "PAN Card", "pan", "verified", "0xd1e4f6a8b2c93f8a", "1.2 MB",
                                "https://placeholder-project.supabase.co/storage/v1/object/public/identity-documents/alex_pan.jpg");

                // James Documents
                saveDoc(user2, "National Passport", "passport", "pending", "0x4f6a8b2c9d1e3f8a", "0.9 MB",
                                "https://placeholder-project.supabase.co/storage/v1/object/public/identity-documents/james_passport.pdf");

                // Priya Documents
                saveDoc(user3, "Aadhaar Card", "aadhaar", "rejected", null, "3.1 MB",
                                "https://placeholder-project.supabase.co/storage/v1/object/public/identity-documents/priya_aadhaar.pdf");

                // David Documents
                saveDoc(user4, "National Passport", "passport", "verified", "0x7a3f8b2c9d1e4f6a", "2.1 MB",
                                "https://placeholder-project.supabase.co/storage/v1/object/public/identity-documents/david_passport.pdf");

                // 4. Seed custom blockchain blocks sequentially
                BlockchainBlock b1 = blockchainService.generateBlockForIdentity(user1.getId());
                BlockchainBlock b2 = blockchainService.generateBlockForIdentity(user4.getId());

                // Update Identity Record with Block reference
                record1.setBlockNumber(b1.getBlockNumber());
                record1.setBlockchainHash(b1.getCurrentHash());
                identityRecordRepository.save(record1);

                record4.setBlockNumber(b2.getBlockNumber());
                record4.setBlockchainHash(b2.getCurrentHash());
                identityRecordRepository.save(record4);

                // 5. Seed Verification History
                VerificationHistory v1 = new VerificationHistory();
                v1.setUser(user1);
                v1.setVerifier(verifier);
                v1.setPurpose("KYC Verification");
                v1.setVerificationDate(LocalDateTime.now().minusDays(1));
                v1.setStatus("approved");
                v1.setDuration("2.3s");
                v1.setCheckedFields("Name, DOB, Address");
                v1.setReportUrl("/api/v1/reports/verification/1");
                verificationHistoryRepository.save(v1);

                VerificationHistory v2 = new VerificationHistory();
                v2.setUser(user1);
                v2.setVerifier(verifier2);
                v2.setPurpose("Employment Background Check");
                v2.setVerificationDate(LocalDateTime.now().minusDays(3));
                v2.setStatus("approved");
                v2.setDuration("1.8s");
                v2.setCheckedFields("Name, Passport, Tax ID");
                v2.setReportUrl("/api/v1/reports/verification/2");
                verificationHistoryRepository.save(v2);

                // 6. Seed Notifications
                notificationRepository.save(new Notification(user1, "success", "Identity Verified",
                                "Your passport document has been successfully verified on the block #"
                                                + b1.getBlockNumber() + "."));
                notificationRepository.save(new Notification(user1, "info", "Verification Request",
                                "First National Bank is requesting access to your identity data for KYC purposes."));
                notificationRepository.save(new Notification(user1, "warning", "Document Expiring",
                                "Your Driver's License will expire in 30 days. Please upload a renewed document."));

                // 7. Seed Audit Logs
                auditLogRepository
                                .save(new AuditLog("Identity Verified", "Sarah Kim (Admin)", "Alexandra Chen (USR-001)",
                                                "192.168.1.45", "info", "Identity"));
                auditLogRepository.save(new AuditLog("Document Rejected", "Sarah Kim (Admin)", "Priya Sharma (USR-003)",
                                "192.168.1.45", "warning", "Documents"));
                auditLogRepository
                                .save(new AuditLog("User Login", "Michael Torres (Verifier)", "System", "10.0.0.12",
                                                "info", "Auth"));
                auditLogRepository.save(
                                new AuditLog("Block Mined Successfully", "System", "Block #" + b1.getBlockNumber(),
                                                "127.0.0.1", "info", "Blockchain"));

                System.out.println("BlockID enterprise seeder completed successfully!");
        }

        private void saveDoc(User u, String name, String type, String status, String hash, String size, String url) {
                Document doc = new Document();
                doc.setUser(u);
                doc.setName(name);
                doc.setType(type);
                doc.setStatus(status);
                doc.setDocHash(hash);
                doc.setSize(size);
                doc.setStorageUrl(url);
                documentRepository.save(doc);
        }
}
