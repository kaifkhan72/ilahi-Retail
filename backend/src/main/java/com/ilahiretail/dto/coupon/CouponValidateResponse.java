package com.ilahiretail.dto.coupon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidateResponse {
    private boolean valid;
    private String code;
    private BigDecimal discount;
    private BigDecimal finalAmount;
    private String message;
}
