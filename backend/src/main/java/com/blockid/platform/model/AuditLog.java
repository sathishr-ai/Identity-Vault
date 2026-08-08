package com.blockid.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // e.g. "Identity Verified", "Document Rejected"

    @Column(nullable = false)
    private String actor; // e.g. Name of Admin, email or System

    @Column(nullable = false)
    private String target; // e.g. Name of User, Target System

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    private String ipAddress;

    @Column(nullable = false)
    private String severity; // info, warning, critical

    @Column(nullable = false)
    private String module; // Auth, Identity, Documents, Blockchain, Security, Users

    public AuditLog() {
    }

    public AuditLog(String action, String actor, String target, String ipAddress, String severity, String module) {
        this.action = action;
        this.actor = actor;
        this.target = target;
        this.ipAddress = ipAddress;
        this.severity = severity;
        this.module = module;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }
}
