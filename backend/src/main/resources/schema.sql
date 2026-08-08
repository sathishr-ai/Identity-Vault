-- PostgreSQL Supabase Database Schema for BlockID Platform
-- Drag and drop this script into the Supabase SQL Editor to install target tables.

-- 1. Users Table (Accommodates Users, Admins, and Verifiers)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'ADMIN', 'VERIFIER')),
    status VARCHAR(50) NOT NULL DEFAULT 'NONE',
    did VARCHAR(100) UNIQUE,
    join_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index user queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_did ON users(did);

-- 2. Identity Records Table
CREATE TABLE IF NOT EXISTS identity_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_number VARCHAR(100),
    pan_number VARCHAR(100),
    passport_number VARCHAR(100),
    driving_licence_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    block_number BIGINT,
    blockchain_hash VARCHAR(255),
    submitted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITHOUT TIME ZONE,
    rejected_reason VARCHAR(1000)
);

-- Index records by status
CREATE INDEX IF NOT EXISTS idx_identity_status ON identity_records(status);

-- 3. Documents Table (For uploaded identity attachments)
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    upload_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    doc_hash VARCHAR(255),
    size VARCHAR(50),
    storage_url VARCHAR(500)
);

-- 4. Blockchain Blocks Table
CREATE TABLE IF NOT EXISTS blockchain_blocks (
    id BIGSERIAL PRIMARY KEY,
    block_number BIGINT UNIQUE NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    identity_id BIGINT NOT NULL,
    previous_hash VARCHAR(255) NOT NULL,
    current_hash VARCHAR(255) NOT NULL,
    sha256_hash VARCHAR(255) NOT NULL,
    validation_status VARCHAR(50) NOT NULL DEFAULT 'VALID'
);

-- Index blockchain block numbers
CREATE INDEX IF NOT EXISTS idx_blocks_num ON blockchain_blocks(block_number);

-- 5. Verification History Table
CREATE TABLE IF NOT EXISTS verification_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verifier_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    purpose VARCHAR(255) NOT NULL,
    verification_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    duration VARCHAR(50),
    checked_fields VARCHAR(255),
    report_url VARCHAR(500)
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    severity VARCHAR(50) NOT NULL,
    module VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
