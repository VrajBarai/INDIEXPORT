package com.perfect.IndiExport.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RFQRequest {
    private String productRequirement;
    private Integer quantity;
    private String description;
    private String deliveryCountry;
    private LocalDate expiryDate;
}

