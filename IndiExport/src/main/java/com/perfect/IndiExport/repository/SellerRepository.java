package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.Seller;
import com.perfect.IndiExport.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUserId(Long userId);
    Optional<Seller> findByUser(User user);
}
