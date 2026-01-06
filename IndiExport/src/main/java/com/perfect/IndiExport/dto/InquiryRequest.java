package com.perfect.IndiExport.dto;

import lombok.Data;

@Data
public class InquiryRequest {
    private Long productId;
    private Integer requestedQuantity;
    private String message;
    private String shippingOption; // e.g., "Courier", "Air Freight", "Sea Freight", "Pickup"
}

