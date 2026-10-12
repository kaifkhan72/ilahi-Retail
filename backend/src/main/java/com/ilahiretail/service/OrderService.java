package com.ilahiretail.service;

import com.ilahiretail.dto.admin.AdminDashboardDto;
import com.ilahiretail.dto.admin.CustomerSummaryDto;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.order.CheckoutRequest;
import com.ilahiretail.dto.order.OrderDto;
import com.ilahiretail.entity.OrderStatus;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDto checkout(Long userId, CheckoutRequest request);
    PageResponse<OrderDto> getUserOrders(Long userId, Pageable pageable);
    OrderDto getUserOrderById(Long userId, Long orderId);
    OrderDto cancelOrder(Long userId, Long orderId);

    // Admin endpoints
    PageResponse<OrderDto> getAllOrders(OrderStatus status, Pageable pageable);
    OrderDto getAdminOrderById(Long orderId);
    OrderDto updateOrderStatus(Long orderId, OrderStatus status);
    OrderDto updateOrderTracking(Long orderId, com.ilahiretail.dto.order.OrderTrackingUpdateRequest request);
    AdminDashboardDto getDashboardStats();
    PageResponse<CustomerSummaryDto> getAllCustomers(Pageable pageable);
}
