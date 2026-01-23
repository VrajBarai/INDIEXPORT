package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.RFQ;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RFQDto {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private String buyerCountry; // Partially visible
    private String productRequirement;
    private Integer quantity;
    private String description;
    private String deliveryCountry;
    private LocalDate expiryDate;
    private RFQ.RFQStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean hasResponded; // Whether current seller has responded
    private Long responseCount; // Number of responses
}




