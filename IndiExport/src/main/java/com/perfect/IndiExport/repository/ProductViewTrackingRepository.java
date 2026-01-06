package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.ProductViewTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductViewTrackingRepository extends JpaRepository<ProductViewTracking, Long> {
    
    // Count views for a specific product
    long countByProductId(Long productId);
    
    // Count views for a seller's products
    @Query("SELECT COUNT(DISTINCT pvt.buyer.id) FROM ProductViewTracking pvt " +
           "WHERE pvt.product.seller.id = :sellerId")
    long countDistinctBuyersBySellerId(@Param("sellerId") Long sellerId);
    
    // Count views for a seller's products in date range
    @Query("SELECT COUNT(pvt) FROM ProductViewTracking pvt " +
           "WHERE pvt.product.seller.id = :sellerId " +
           "AND pvt.viewDate >= :startDate AND pvt.viewDate <= :endDate")
    long countBySellerIdAndDateRange(@Param("sellerId") Long sellerId, 
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);
    
    // Get daily view counts for a seller
    @Query("SELECT DATE(pvt.viewDate) as viewDate, COUNT(pvt) as count " +
           "FROM ProductViewTracking pvt " +
           "WHERE pvt.product.seller.id = :sellerId " +
           "AND pvt.viewDate >= :startDate " +
           "GROUP BY DATE(pvt.viewDate) " +
           "ORDER BY viewDate ASC")
    List<Object[]> getDailyViewCountsBySellerId(@Param("sellerId") Long sellerId, 
                                                  @Param("startDate") LocalDateTime startDate);
    
    // Check if buyer already viewed product today
    boolean existsByProductIdAndBuyerIdAndViewDateBetween(
        Long productId, 
        Long buyerId, 
        LocalDateTime startOfDay, 
        LocalDateTime endOfDay
    );
}

