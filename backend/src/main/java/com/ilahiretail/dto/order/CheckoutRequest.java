package com.ilahiretail.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotBlank(message = "Recipient name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String deliveryName;

    @NotBlank(message = "Phone number is required")
    @Size(min = 7, max = 20, message = "Valid phone number is required")
    private String deliveryPhone;

    @NotBlank(message = "Delivery address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    private String deliveryAddress;

    @NotBlank(message = "City is required")
    private String deliveryCity;

    @NotBlank(message = "Pincode is required")
    private String deliveryPincode;

    @NotBlank(message = "State is required")
    private String deliveryState;

    private String couponCode;
}
