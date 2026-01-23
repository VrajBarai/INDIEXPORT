package com.perfect.IndiExport.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderRequest {
    private Long inquiryId; // Optional
    private Long productId;
    private Integer finalQuantity;
    private BigDecimal finalPrice;
    private String currency;
    private String shippingTerms;
    private BigDecimal shippingCost;
}
