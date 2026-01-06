package com.perfect.IndiExport.repository;

import com.perfect.IndiExport.entity.Buyer;
import com.perfect.IndiExport.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    Optional<Buyer> findByUserId(Long userId);
    Optional<Buyer> findByUser(User user);
}

