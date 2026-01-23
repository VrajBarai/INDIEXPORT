package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.Order;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long inquiryId;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerBusinessName;
    private Long productId;
    private String productName;
    private Integer finalQuantity;
    private BigDecimal finalPrice;
    private String currency;
    private String shippingTerms;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
