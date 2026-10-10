package com.ilahiretail.service;

import com.ilahiretail.dto.cart.AddToCartRequest;
import com.ilahiretail.dto.cart.CartDto;

public interface CartService {
    CartDto getCartByUserId(Long userId);
    CartDto addToCart(Long userId, AddToCartRequest request);
    CartDto updateCartItemQuantity(Long userId, Long cartItemId, int quantity);
    CartDto removeFromCart(Long userId, Long cartItemId);
    void clearCart(Long userId);
}
