package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.Inquiry;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InquiryDto {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerCountry;
    private Long sellerId;
    private String sellerBusinessName;
    private Long productId;
    private String productName;
    private String productCategory;
    private Integer requestedQuantity;
    private Inquiry.InquiryStatus status;
    private String message;
    private String shippingOption;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



