package com.ilahiretail.dto.order;

import com.ilahiretail.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private Long customerId;
    private String customerEmail;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentId;

    private String deliveryName;
    private String deliveryPhone;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPincode;
    private String deliveryState;

    private String couponCode;
    private BigDecimal discountAmount;
    private String courierName;
    private String trackingNumber;
    private String orderNotes;

    @Builder.Default
    private List<OrderItemDto> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
