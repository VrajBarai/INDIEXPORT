package com.perfect.IndiExport.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.perfect.IndiExport.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}