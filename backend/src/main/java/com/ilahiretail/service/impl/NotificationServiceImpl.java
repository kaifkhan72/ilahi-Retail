package com.ilahiretail.service.impl;

import com.ilahiretail.entity.Order;
import com.ilahiretail.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    @Override
    public void sendOrderConfirmationNotification(Order order) {
        log.info("==================================================================");
        log.info("📩 ORDER CONFIRMATION DISPATCHED FOR ORDER #{}", order.getId());
        log.info("Recipient: {} | Phone: {}", order.getDeliveryName(), order.getDeliveryPhone());
        log.info("Delivery Address: {}, {}, {} - {}", 
                order.getDeliveryAddress(), order.getDeliveryCity(), order.getDeliveryState(), order.getDeliveryPincode());
        log.info("Total Amount: ₹{} | Payment Method: {} | Payment Status: {}", 
                order.getTotalAmount(), order.getPaymentMethod(), order.getPaymentStatus());
        log.info("Items Count: {}", order.getItems() != null ? order.getItems().size() : 0);
        log.info("==================================================================");
    }

    @Override
    public void sendPasswordResetOtpNotification(String email, String otpCode) {
        log.info("==================================================================");
        log.info("🔐 PASSWORD RESET OTP GENERATED FOR: {}", email);
        log.info("🔑 Verification Code (valid for 15 mins): {}", otpCode);
        log.info("==================================================================");
    }
}
