package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.Invoice;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private String orderNumber;
    private Long inquiryId;
    private Long sellerId;
    private String sellerBusinessName;
    private String sellerGstNumber;
    private String sellerAddress;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerCountry;
    private Long productId;
    private String productName;
    private String productCategory;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String shippingMethod;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String currency;
    private BigDecimal convertedAmount;
    private String convertedCurrency;
    private Invoice.InvoiceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
