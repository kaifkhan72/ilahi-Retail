package com.ilahiretail.controller;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.product.ProductDto;
import com.ilahiretail.security.CustomUserDetails;
import com.ilahiretail.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "User wishlist endpoints for saving and managing favorite items")
@SecurityRequirement(name = "bearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user's wishlist items")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ProductDto> items = wishlistService.getUserWishlist(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved", items));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Toggle product in wishlist (adds if not present, removes if present)")
    public ResponseEntity<ApiResponse<Boolean>> toggleWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean added = wishlistService.toggleWishlistItem(userDetails.getId(), productId);
        String message = added ? "Product saved to wishlist" : "Product removed from wishlist";
        return ResponseEntity.ok(ApiResponse.success(message, added));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove a product from wishlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wishlistService.removeFromWishlist(userDetails.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from wishlist", null));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items in user's wishlist")
    public ResponseEntity<ApiResponse<Void>> clearWishlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        wishlistService.clearWishlist(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist cleared", null));
    }
}
