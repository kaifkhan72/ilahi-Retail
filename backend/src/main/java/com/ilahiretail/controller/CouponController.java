package com.ilahiretail.controller;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.coupon.CouponDto;
import com.ilahiretail.dto.coupon.CouponValidateResponse;
import com.ilahiretail.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Public & customer coupon validation and active listing")
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @Operation(summary = "Get list of active public coupons")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getActiveCoupons() {
        List<CouponDto> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success("Active coupons retrieved", coupons));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate a coupon code against an order amount")
    public ResponseEntity<ApiResponse<CouponValidateResponse>> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal amount) {
        CouponValidateResponse response = couponService.validateCoupon(code, amount);
        return ResponseEntity.ok(ApiResponse.success("Coupon validation evaluated", response));
    }
}
