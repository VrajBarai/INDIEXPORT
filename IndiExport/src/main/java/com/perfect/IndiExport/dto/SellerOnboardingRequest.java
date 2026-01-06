package com.perfect.IndiExport.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SellerOnboardingRequest {
    private String businessName;
    private String gstNumber;
    private String businessType;
    private String address;
    private String city;
    private String state;
    private String pincode;
}
