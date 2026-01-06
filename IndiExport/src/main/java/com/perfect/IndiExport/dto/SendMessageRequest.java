package com.perfect.IndiExport.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private String message;
    private String fileName; // Optional, for ADVANCED sellers
    private String fileUrl; // Optional, for ADVANCED sellers
}



