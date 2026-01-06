package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.ProductSellingCountry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSellingCountryRepository extends JpaRepository<ProductSellingCountry, Long> {
    List<ProductSellingCountry> findByProductId(Long productId);
    
    void deleteByProductId(Long productId);
    
    boolean existsByProductIdAndCountryCode(Long productId, String countryCode);
}

