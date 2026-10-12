package com.ilahiretail.service.impl;

import com.ilahiretail.dto.coupon.CouponDto;
import com.ilahiretail.dto.coupon.CouponRequest;
import com.ilahiretail.dto.coupon.CouponValidateResponse;
import com.ilahiretail.entity.Coupon;
import com.ilahiretail.exception.BadRequestException;
import com.ilahiretail.exception.ResourceNotFoundException;
import com.ilahiretail.repository.CouponRepository;
import com.ilahiretail.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CouponDto> getActiveCoupons() {
        return couponRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CouponDto getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
        return mapToDto(coupon);
    }

    @Override
    @Transactional
    public CouponDto createCoupon(CouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Coupon with code '" + code + "' already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(request.getDiscountType().toUpperCase())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .active(request.getActive() != null ? request.getActive() : true)
                .description(request.getDescription())
                .build();

        return mapToDto(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponDto updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));

        String code = request.getCode().trim().toUpperCase();
        if (!coupon.getCode().equalsIgnoreCase(code) && couponRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("Coupon with code '" + code + "' already exists");
        }

        coupon.setCode(code);
        coupon.setDiscountType(request.getDiscountType().toUpperCase());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }
        coupon.setDescription(request.getDescription());

        return mapToDto(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponDto toggleCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
        coupon.setActive(!coupon.isActive());
        return mapToDto(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + id));
        couponRepository.delete(coupon);
    }

    @Override
    public CouponValidateResponse validateCoupon(String code, BigDecimal orderAmount) {
        if (code == null || code.trim().isEmpty()) {
            return CouponValidateResponse.builder()
                    .valid(false)
                    .message("Coupon code cannot be empty")
                    .build();
        }

        String normalizedCode = code.trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElse(null);

        if (coupon == null || !coupon.isActive()) {
            return CouponValidateResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .message("Invalid or inactive coupon code")
                    .build();
        }

        BigDecimal minOrder = coupon.getMinOrderAmount() != null ? coupon.getMinOrderAmount() : BigDecimal.ZERO;
        if (orderAmount.compareTo(minOrder) < 0) {
            return CouponValidateResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .message("Minimum order of ₹" + minOrder + " required to use this coupon")
                    .build();
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }

        // Ensure discount does not exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        BigDecimal finalAmount = orderAmount.subtract(discount).setScale(2, RoundingMode.HALF_UP);

        return CouponValidateResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discount(discount)
                .finalAmount(finalAmount)
                .message("Coupon applied successfully!")
                .build();
    }

    private CouponDto mapToDto(Coupon coupon) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .active(coupon.isActive())
                .description(coupon.getDescription())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
