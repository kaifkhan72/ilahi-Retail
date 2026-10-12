package com.ilahiretail.controller;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.review.ProductReviewDto;
import com.ilahiretail.dto.review.ProductReviewRequest;
import com.ilahiretail.security.CustomUserDetails;
import com.ilahiretail.service.ProductReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Product Reviews", description = "Public review viewing and authenticated customer review posting")
public class ProductReviewController {

    private final ProductReviewService reviewService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all customer reviews for a product (public)")
    public ResponseEntity<ApiResponse<List<ProductReviewDto>>> getProductReviews(@PathVariable Long productId) {
        List<ProductReviewDto> reviews = reviewService.getReviewsForProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved", reviews));
    }

    @PostMapping("/product/{productId}")
    @Operation(summary = "Submit a review and rating for a product (requires authentication)")
    public ResponseEntity<ApiResponse<ProductReviewDto>> addProductReview(
            @PathVariable Long productId,
            @Valid @RequestBody ProductReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ProductReviewDto review = reviewService.addReview(userDetails.getId(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review posted successfully", review));
    }
}
