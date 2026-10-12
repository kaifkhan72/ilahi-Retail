package com.ilahiretail.controller.admin;

import com.ilahiretail.dto.ApiResponse;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.order.OrderDto;
import com.ilahiretail.dto.order.OrderStatusUpdateRequest;
import com.ilahiretail.entity.OrderStatus;
import com.ilahiretail.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Orders", description = "Admin endpoints for viewing and managing customer orders")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get all orders across all customers with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderDto> orders = orderService.getAllOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin orders retrieved", orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order detail by ID (admin)")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long id) {
        OrderDto order = orderService.getAdminOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved", order));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status (PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderDto order = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", order));
    }

    @PatchMapping("/{id}/tracking")
    @Operation(summary = "Update courier name, AWB tracking number and notes")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderTracking(
            @PathVariable Long id,
            @RequestBody com.ilahiretail.dto.order.OrderTrackingUpdateRequest request) {
        OrderDto order = orderService.updateOrderTracking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order tracking details updated successfully", order));
    }
}
