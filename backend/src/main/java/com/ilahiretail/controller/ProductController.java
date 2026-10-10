package com.ilahiretail.controller;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.product.ProductDto;
import com.ilahiretail.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Customer Products", description = "Public endpoints for browsing, searching, and filtering products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get paginated, filtered active products list (search, category, sort by price)")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ProductDto> products = productService.getCustomerProducts(categoryId, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product detail by ID")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getCustomerProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product detail retrieved successfully", product));
    }
}
