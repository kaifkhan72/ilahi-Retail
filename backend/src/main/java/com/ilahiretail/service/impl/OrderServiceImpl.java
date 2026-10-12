package com.ilahiretail.service.impl;

import com.ilahiretail.dto.admin.AdminDashboardDto;
import com.ilahiretail.dto.admin.CustomerSummaryDto;
import com.ilahiretail.dto.common.PageResponse;
import com.ilahiretail.dto.order.CheckoutRequest;
import com.ilahiretail.dto.order.OrderDto;
import com.ilahiretail.dto.order.OrderItemDto;
import com.ilahiretail.entity.*;
import com.ilahiretail.exception.BadRequestException;
import com.ilahiretail.exception.ResourceNotFoundException;
import com.ilahiretail.repository.*;
import com.ilahiretail.service.CartService;
import com.ilahiretail.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final com.ilahiretail.service.CouponService couponService;

    @Override
    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PLACED)
                .deliveryName(request.getDeliveryName().trim())
                .deliveryPhone(request.getDeliveryPhone().trim())
                .deliveryAddress(request.getDeliveryAddress().trim())
                .deliveryCity(request.getDeliveryCity().trim())
                .deliveryPincode(request.getDeliveryPincode().trim())
                .deliveryState(request.getDeliveryState().trim())
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Re-fetch product to ensure real-time inventory consistency
            Product freshProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product no longer available: " + product.getId()));

            if (!freshProduct.isActive()) {
                throw new BadRequestException("Product '" + freshProduct.getName() + "' is no longer active");
            }

            if (freshProduct.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + freshProduct.getName()
                        + "'. Available: " + freshProduct.getStock() + ", in cart: " + cartItem.getQuantity());
            }

            // Deduct inventory
            freshProduct.setStock(freshProduct.getStock() - cartItem.getQuantity());
            productRepository.save(freshProduct);

            // Price snapshot and subtotal
            BigDecimal itemPrice = freshProduct.getPrice();
            BigDecimal subtotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            calculatedTotal = calculatedTotal.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(freshProduct)
                    .productName(freshProduct.getName())
                    .productPrice(itemPrice)
                    .quantity(cartItem.getQuantity())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
        }

        BigDecimal discount = BigDecimal.ZERO;
        String couponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            com.ilahiretail.dto.coupon.CouponValidateResponse val = couponService.validateCoupon(request.getCouponCode(), calculatedTotal);
            if (val.isValid() && val.getDiscount() != null) {
                discount = val.getDiscount();
                couponCode = val.getCode();
            }
        }

        BigDecimal finalTotal = calculatedTotal.subtract(discount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        order.setCouponCode(couponCode);
        order.setDiscountAmount(discount);
        order.setTotalAmount(finalTotal);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // Clear cart in same transaction
        cartService.clearCart(userId);

        return mapToOrderDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        Page<OrderDto> page = orderRepository.findByUserId(userId, pageable)
                .map(this::mapToOrderDto);
        return PageResponse.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getUserOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return mapToOrderDto(order);
    }

    @Override
    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new BadRequestException("Order cannot be cancelled. Current status is " + order.getStatus() + ". Only PLACED orders can be cancelled.");
        }

        // Restore stock
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToOrderDto(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getAllOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orderPage = (status != null)
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);

        return PageResponse.of(orderPage.map(this::mapToOrderDto));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getAdminOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return mapToOrderDto(order);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus currentStatus = order.getStatus();

        // If newly cancelled by admin, restore inventory
        if (newStatus == OrderStatus.CANCELLED && currentStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setStock(product.getStock() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order.setStatus(newStatus);
        return mapToOrderDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderDto updateOrderTracking(Long orderId, com.ilahiretail.dto.order.OrderTrackingUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (request.getCourierName() != null) {
            order.setCourierName(request.getCourierName().trim());
        }
        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber().trim());
        }
        if (request.getOrderNotes() != null) {
            order.setOrderNotes(request.getOrderNotes().trim());
        }

        return mapToOrderDto(orderRepository.save(order));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardStats() {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long totalProducts = productRepository.countByActiveTrue();
        long totalCustomers = userRepository.count();

        return AdminDashboardDto.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerSummaryDto> getAllCustomers(Pageable pageable) {
        Page<CustomerSummaryDto> page = userRepository.findAll(pageable).map(user -> {
            long userOrderCount = orderRepository.countByUser(user);
            return CustomerSummaryDto.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .createdAt(user.getCreatedAt())
                    .totalOrders(userOrderCount)
                    .build();
        });

        return PageResponse.of(page);
    }

    private OrderDto mapToOrderDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productPrice(item.getProductPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build()).toList();

        return OrderDto.builder()
                .id(order.getId())
                .customerId(order.getUser() != null ? order.getUser().getId() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod("COD")
                .deliveryName(order.getDeliveryName())
                .deliveryPhone(order.getDeliveryPhone())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryCity(order.getDeliveryCity())
                .deliveryPincode(order.getDeliveryPincode())
                .deliveryState(order.getDeliveryState())
                .couponCode(order.getCouponCode())
                .discountAmount(order.getDiscountAmount())
                .courierName(order.getCourierName())
                .trackingNumber(order.getTrackingNumber())
                .orderNotes(order.getOrderNotes())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
