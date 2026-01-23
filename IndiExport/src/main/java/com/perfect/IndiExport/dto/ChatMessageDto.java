package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.ChatMessage;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageDto {
    private Long id;
    private Long chatRoomId;
    private Long senderId;
    private String senderName;
    private ChatMessage.MessageType senderType;
    private String message;
    private String fileName;
    private String fileUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}




