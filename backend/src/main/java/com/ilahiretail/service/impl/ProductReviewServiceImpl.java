package com.ilahiretail.service.impl;

import com.ilahiretail.dto.review.ProductReviewDto;
import com.ilahiretail.dto.review.ProductReviewRequest;
import com.ilahiretail.entity.Product;
import com.ilahiretail.entity.ProductReview;
import com.ilahiretail.entity.User;
import com.ilahiretail.exception.ResourceNotFoundException;
import com.ilahiretail.repository.ProductRepository;
import com.ilahiretail.repository.ProductReviewRepository;
import com.ilahiretail.repository.UserRepository;
import com.ilahiretail.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductReviewServiceImpl implements ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductReviewDto> getReviewsForProduct(Long productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductReviewDto addReview(Long userId, Long productId, ProductReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        ProductReview review = ProductReview.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();

        return mapToDto(productReviewRepository.save(review));
    }

    private ProductReviewDto mapToDto(ProductReview review) {
        return ProductReviewDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
