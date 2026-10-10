package com.ilahiretail.controller;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.order.CheckoutRequest;
import com.ilahiretail.dto.order.OrderDto;
import com.ilahiretail.security.CustomUserDetails;
import com.ilahiretail.service.OrderService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Customer Orders", description = "Order placement (COD), tracking, and cancellation for customers")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Place order with COD and delivery address (creates order, deducts stock, clears cart)")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CheckoutRequest request) {
        OrderDto order = orderService.checkout(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully with Cash on Delivery", order));
    }

    @GetMapping
    @Operation(summary = "Get list of customer's past and current orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderDto> orders = orderService.getUserOrders(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved", orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get details of a specific order")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        OrderDto order = orderService.getUserOrderById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", order));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order if still in PLACED status (restores inventory)")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        OrderDto order = orderService.cancelOrder(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
}
