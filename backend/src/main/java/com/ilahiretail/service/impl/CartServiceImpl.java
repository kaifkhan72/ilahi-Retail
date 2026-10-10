package com.ilahiretail.service.impl;

import com.ilahiretail.dto.cart.AddToCartRequest;
import com.ilahiretail.dto.cart.CartDto;
import com.ilahiretail.dto.cart.CartItemDto;
import com.ilahiretail.entity.Cart;
import com.ilahiretail.entity.CartItem;
import com.ilahiretail.entity.Product;
import com.ilahiretail.entity.User;
import com.ilahiretail.exception.BadRequestException;
import com.ilahiretail.exception.ResourceNotFoundException;
import com.ilahiretail.repository.CartItemRepository;
import com.ilahiretail.repository.CartRepository;
import com.ilahiretail.repository.ProductRepository;
import com.ilahiretail.repository.UserRepository;
import com.ilahiretail.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CartDto getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartDto(cart);
    }

    @Override
    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findByIdAndActiveTrue(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Active product not found with ID: " + request.getProductId()));

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        int targetQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            targetQuantity += existingItemOpt.get().getQuantity();
        }

        if (product.getStock() < targetQuantity) {
            throw new BadRequestException("Requested quantity (" + targetQuantity + ") exceeds available stock (" + product.getStock() + ")");
        }

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(targetQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        Cart updatedCart = cartRepository.save(cart);
        return mapToCartDto(updatedCart);
    }

    @Override
    @Transactional
    public CartDto updateCartItemQuantity(Long userId, Long cartItemId, int quantity) {
        if (quantity < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }

        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found in user's cart: " + cartItemId));

        Product product = cartItem.getProduct();
        if (product.getStock() < quantity) {
            throw new BadRequestException("Requested quantity (" + quantity + ") exceeds available stock (" + product.getStock() + ")");
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return mapToCartDto(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartDto removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);

        return mapToCartDto(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            Cart newCart = Cart.builder()
                    .user(user)
                    .items(new ArrayList<>())
                    .build();
            return cartRepository.save(newCart);
        });
    }

    private CartDto mapToCartDto(Cart cart) {
        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int totalItemsCount = 0;

        for (CartItem item : cart.getItems()) {
            Product p = item.getProduct();
            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(subtotal);
            totalItemsCount += item.getQuantity();

            itemDtos.add(CartItemDto.builder()
                    .id(item.getId())
                    .productId(p.getId())
                    .productName(p.getName())
                    .productPrice(p.getPrice())
                    .productImageUrl(p.getImageUrl())
                    .availableStock(p.getStock())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build());
        }

        return CartDto.builder()
                .id(cart.getId())
                .items(itemDtos)
                .totalPrice(total)
                .totalItems(totalItemsCount)
                .build();
    }
}
