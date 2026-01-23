package com.perfect.IndiExport.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RFQResponseRequest {
    private BigDecimal offeredPrice;
    private String estimatedDeliveryTime;
    private String message;
}




