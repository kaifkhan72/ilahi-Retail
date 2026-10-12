package com.ilahiretail.service;

import com.ilahiretail.dto.coupon.CouponDto;
import com.ilahiretail.dto.coupon.CouponRequest;
import com.ilahiretail.dto.coupon.CouponValidateResponse;

import java.math.BigDecimal;
import java.util.List;

public interface CouponService {
    List<CouponDto> getAllCoupons();
    List<CouponDto> getActiveCoupons();
    CouponDto getCouponById(Long id);
    CouponDto createCoupon(CouponRequest request);
    CouponDto updateCoupon(Long id, CouponRequest request);
    CouponDto toggleCoupon(Long id);
    void deleteCoupon(Long id);
    CouponValidateResponse validateCoupon(String code, BigDecimal orderAmount);
}
