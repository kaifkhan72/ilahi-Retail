package com.ilahiretail.service;

import com.ilahiretail.dto.product.ProductDto;

import java.util.List;

public interface WishlistService {
    List<ProductDto> getUserWishlist(Long userId);
    boolean toggleWishlistItem(Long userId, Long productId);
    void removeFromWishlist(Long userId, Long productId);
    void clearWishlist(Long userId);
}
