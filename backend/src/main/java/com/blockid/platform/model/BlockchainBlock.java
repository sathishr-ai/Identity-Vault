package com.blockid.platform.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_blocks")
public class BlockchainBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long blockNumber;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(nullable = false)
    private Long identityId; // Reference to the verified User's ID or IdentityRecord ID

    @Column(nullable = false)
    private String previousHash;

    @Column(nullable = false)
    private String currentHash; // Recomputed or stored hash of the block contents

    @Column(name = "sha256_hash", nullable = false)
    private String sha256Hash; // Double check / reference hash

    @Column(nullable = false)
    private String validationStatus = "VALID"; // VALID, TEMPERED

    public BlockchainBlock() {
    }

    public BlockchainBlock(Long blockNumber, Long identityId, String previousHash, String currentHash,
            String sha256Hash, String validationStatus) {
        this.blockNumber = blockNumber;
        this.identityId = identityId;
        this.previousHash = previousHash;
        this.currentHash = currentHash;
        this.sha256Hash = sha256Hash;
        this.validationStatus = validationStatus;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBlockNumber() {
        return blockNumber;
    }

    public void setBlockNumber(Long blockNumber) {
        this.blockNumber = blockNumber;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getIdentityId() {
        return identityId;
    }

    public void setIdentityId(Long identityId) {
        this.identityId = identityId;
    }

    public String getPreviousHash() {
        return previousHash;
    }

    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
    }

    public String getCurrentHash() {
        return currentHash;
    }

    public void setCurrentHash(String currentHash) {
        this.currentHash = currentHash;
    }

    public String getSha256Hash() {
        return sha256Hash;
    }

    public void setSha256Hash(String sha256Hash) {
        this.sha256Hash = sha256Hash;
    }

    public String getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(String validationStatus) {
        this.validationStatus = validationStatus;
    }
}
