package com.perfect.IndiExport.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatRoomDto {
    private Long id;
    private Long inquiryId;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerBusinessName;
    private Long productId;
    private String productName;
    private Boolean isActive;
    private Long unreadCount;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



