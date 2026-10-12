package com.ilahiretail.controller.admin;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.coupon.CouponDto;
import com.ilahiretail.dto.coupon.CouponRequest;
import com.ilahiretail.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Coupons", description = "Admin endpoints for creating, editing, toggling, and deleting coupons")
@SecurityRequirement(name = "bearerAuth")
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    @Operation(summary = "Get all coupons (active & inactive)")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        List<CouponDto> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.success("All coupons retrieved", coupons));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get coupon by ID")
    public ResponseEntity<ApiResponse<CouponDto>> getCouponById(@PathVariable Long id) {
        CouponDto coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon retrieved", coupon));
    }

    @PostMapping
    @Operation(summary = "Create a new coupon")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponDto coupon = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", coupon));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing coupon")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        CouponDto coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", coupon));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle coupon active status")
    public ResponseEntity<ApiResponse<CouponDto>> toggleCoupon(@PathVariable Long id) {
        CouponDto coupon = couponService.toggleCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon status toggled successfully", coupon));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
