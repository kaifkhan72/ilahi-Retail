package com.ilahiretail.service;

import com.ilahiretail.dto.review.ProductReviewDto;
import com.ilahiretail.dto.review.ProductReviewRequest;

import java.util.List;

public interface ProductReviewService {
    List<ProductReviewDto> getReviewsForProduct(Long productId);
    ProductReviewDto addReview(Long userId, Long productId, ProductReviewRequest request);
}
