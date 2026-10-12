package com.ilahiretail.dto.coupon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDto {
    private Long id;
    private String code;
    private String discountType; // 'PERCENTAGE' or 'FLAT'
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private boolean active;
    private String description;
    private LocalDateTime createdAt;
}
