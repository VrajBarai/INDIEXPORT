package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long chatRoomId);
    
    long countByChatRoomIdAndIsReadFalseAndSenderType(Long chatRoomId, ChatMessage.MessageType senderType);
}




