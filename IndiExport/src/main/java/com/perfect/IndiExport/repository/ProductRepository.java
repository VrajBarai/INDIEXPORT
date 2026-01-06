package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);

    long countBySellerId(Long sellerId);
}
