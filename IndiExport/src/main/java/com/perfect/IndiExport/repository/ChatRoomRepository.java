package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByInquiryId(Long inquiryId);
    
    List<ChatRoom> findBySellerIdOrderByUpdatedAtDesc(Long sellerId);
    
    List<ChatRoom> findByBuyerIdOrderByUpdatedAtDesc(Long buyerId);
    
    Optional<ChatRoom> findByInquiryIdAndSellerId(Long inquiryId, Long sellerId);
    
    long countBySellerId(Long sellerId);
}



