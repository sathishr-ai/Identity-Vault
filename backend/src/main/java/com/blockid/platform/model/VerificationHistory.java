package com.blockid.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_history")
public class VerificationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user; // The user whose identity is verified

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "verifier_id", referencedColumnName = "id")
    private User verifier; // The verifier (if system, can be null or special user)

    @Column(nullable = false)
    private String purpose; // e.g. "KYC Verification", "Visa Application"

    @Column(nullable = false)
    private LocalDateTime verificationDate = LocalDateTime.now();

    @Column(nullable = false)
    private String status; // approved, rejected, pending, tampered

    private String duration; // e.g. "1.8s"
    private String checkedFields; // Comma separated values: "Name, Passport, Aadhaar"
    private String reportUrl; // Storage URL of verification report

    public VerificationHistory() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getVerifier() {
        return verifier;
    }

    public void setVerifier(User verifier) {
        this.verifier = verifier;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LocalDateTime getVerificationDate() {
        return verificationDate;
    }

    public void setVerificationDate(LocalDateTime verificationDate) {
        this.verificationDate = verificationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getCheckedFields() {
        return checkedFields;
    }

    public void setCheckedFields(String checkedFields) {
        this.checkedFields = checkedFields;
    }

    public String getReportUrl() {
        return reportUrl;
    }

    public void setReportUrl(String reportUrl) {
        this.reportUrl = reportUrl;
    }
}
