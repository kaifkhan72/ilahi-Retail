package com.ilahiretail.service;

import com.ilahiretail.entity.Order;

public interface NotificationService {
    void sendOrderConfirmationNotification(Order order);
    void sendPasswordResetOtpNotification(String email, String otpCode);
}
