package com.ilahiretail.service;

import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.product.ProductCreateRequest;
import com.ilahiretail.dto.product.ProductDto;
import com.ilahiretail.dto.product.ProductUpdateRequest;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    PageResponse<ProductDto> getCustomerProducts(Long categoryId, String search, Pageable pageable);
    ProductDto getCustomerProductById(Long id);
    PageResponse<ProductDto> getAdminProducts(String search, Long categoryId, Pageable pageable);
    ProductDto getAdminProductById(Long id);
    ProductDto createProduct(ProductCreateRequest request);
    ProductDto updateProduct(Long id, ProductUpdateRequest request);
    void softDeleteProduct(Long id);
    ProductDto updateStock(Long id, Integer stock);
    ProductDto updateImage(Long id, String imageUrl);
}
