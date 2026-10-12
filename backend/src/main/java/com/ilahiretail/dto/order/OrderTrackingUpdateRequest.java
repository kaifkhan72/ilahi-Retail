package com.ilahiretail.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingUpdateRequest {
    private String courierName;
    private String trackingNumber;
    private String orderNotes;
}
