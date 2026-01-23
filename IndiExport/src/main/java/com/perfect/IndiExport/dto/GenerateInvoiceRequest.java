package com.perfect.IndiExport.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GenerateInvoiceRequest {
    private Long orderId;
    private BigDecimal shippingCost;
    private String shippingMethod;
    private String convertedCurrency; // Optional, for currency conversion
}
