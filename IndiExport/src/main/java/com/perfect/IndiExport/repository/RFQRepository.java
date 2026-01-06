package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.RFQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RFQRepository extends JpaRepository<RFQ, Long> {
    List<RFQ> findByStatusAndExpiryDateAfterOrderByCreatedAtDesc(
        RFQ.RFQStatus status, 
        LocalDate expiryDate
    );
    
    List<RFQ> findByStatusOrderByCreatedAtDesc(RFQ.RFQStatus status);
    
    // Buyer methods
    List<RFQ> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    List<RFQ> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, RFQ.RFQStatus status);
    
    Optional<RFQ> findByIdAndBuyerId(Long id, Long buyerId);
    
    long countByBuyerId(Long buyerId);
}



