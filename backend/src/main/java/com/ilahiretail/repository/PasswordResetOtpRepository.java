package com.ilahiretail.repository;

import com.ilahiretail.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    Optional<PasswordResetOtp> findTopByEmailAndOtpCodeAndUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
            String email, String otpCode, LocalDateTime now);
}
