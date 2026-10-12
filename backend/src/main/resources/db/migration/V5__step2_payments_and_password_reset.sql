-- =============================================================================
-- V5__step2_payments_and_password_reset.sql
-- Step 2: Payment details and Password Reset OTP
-- =============================================================================

-- 1. Extend Orders table with payment details
ALTER TABLE orders 
ADD COLUMN payment_method VARCHAR(30) DEFAULT 'COD',
ADD COLUMN payment_status VARCHAR(30) DEFAULT 'PENDING',
ADD COLUMN payment_id VARCHAR(100) DEFAULT NULL;

-- 2. Password Reset OTP Table
CREATE TABLE IF NOT EXISTS password_reset_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reset_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
