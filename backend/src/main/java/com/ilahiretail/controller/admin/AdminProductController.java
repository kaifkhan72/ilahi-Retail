package com.ilahiretail.controller.admin;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.product.ProductCreateRequest;
import com.ilahiretail.dto.product.ProductDto;
import com.ilahiretail.dto.product.ProductUpdateRequest;
import com.ilahiretail.dto.product.StockUpdateRequest;
import com.ilahiretail.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Products", description = "Admin CRUD endpoints for products")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products with pagination and filters (admin view)")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getAdminProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ProductDto> products = productService.getAdminProducts(search, categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin products retrieved", products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID (admin view)")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getAdminProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved", product));
    }

    @PostMapping
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        ProductDto product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductDto product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a product (set active = false)")
    public ResponseEntity<ApiResponse<Void>> softDeleteProduct(@PathVariable Long id) {
        productService.softDeleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product marked inactive successfully"));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update inventory stock for a product")
    public ResponseEntity<ApiResponse<ProductDto>> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        ProductDto product = productService.updateStock(id, request.getStock());
        return ResponseEntity.ok(ApiResponse.success("Product stock updated successfully", product));
    }

    @PatchMapping("/{id}/image")
    @Operation(summary = "Update product image URL")
    public ResponseEntity<ApiResponse<ProductDto>> updateImage(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        ProductDto product = productService.updateImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Product image updated successfully", product));
    }
}
