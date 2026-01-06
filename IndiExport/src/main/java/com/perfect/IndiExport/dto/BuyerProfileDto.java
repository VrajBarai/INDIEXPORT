package com.perfect.IndiExport.dto;

import lombok.Data;

@Data
public class BuyerProfileDto {
    private String fullName;
    private String phone;
    private String country; // ISO country code (MANDATORY)
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String currency; // Auto-set based on country
}

