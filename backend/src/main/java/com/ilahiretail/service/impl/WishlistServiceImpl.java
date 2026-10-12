package com.ilahiretail.service.impl;

import com.ilahiretail.dto.category.CategoryDto;
import com.ilahiretail.dto.product.ProductDto;
import com.ilahiretail.entity.Category;
import com.ilahiretail.entity.Product;
import com.ilahiretail.entity.User;
import com.ilahiretail.entity.WishlistItem;
import com.ilahiretail.exception.ResourceNotFoundException;
import com.ilahiretail.repository.ProductRepository;
import com.ilahiretail.repository.UserRepository;
import com.ilahiretail.repository.WishlistRepository;
import com.ilahiretail.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(item -> mapToProductDto(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean toggleWishlistItem(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return false; // Removed
        } else {
            WishlistItem newItem = WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(newItem);
            return true; // Added
        }
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional
    public void clearWishlist(Long userId) {
        wishlistRepository.deleteByUserId(userId);
    }

    private ProductDto mapToProductDto(Product product) {
        CategoryDto categoryDto = null;
        if (product.getCategory() != null) {
            Category category = product.getCategory();
            categoryDto = CategoryDto.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .description(category.getDescription())
                    .active(category.isActive())
                    .createdAt(category.getCreatedAt())
                    .build();
        }

        Integer discountPercentage = null;
        if (product.getOriginalPrice() != null && product.getPrice() != null 
                && product.getOriginalPrice().compareTo(product.getPrice()) > 0) {
            BigDecimal diff = product.getOriginalPrice().subtract(product.getPrice());
            discountPercentage = diff.multiply(BigDecimal.valueOf(100))
                    .divide(product.getOriginalPrice(), 0, RoundingMode.HALF_UP).intValue();
        }

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discountPercentage(discountPercentage)
                .stock(product.getStock())
                .category(categoryDto)
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
