package com.perfect.IndiExport.service;

import com.perfect.IndiExport.dto.SellerOnboardingRequest;
import com.perfect.IndiExport.entity.Role;
import com.perfect.IndiExport.entity.Seller;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.SellerRepository;
import com.perfect.IndiExport.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;

    @Transactional
    public Seller onboardSeller(User user, SellerOnboardingRequest request) {
        if (sellerRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("User is already a seller");
        }

        // Update User Role
        user.setRole(Role.SELLER);
        userRepository.save(user);

        // Create Seller Profile
        Seller seller = Seller.builder()
                .user(user)
                .businessName(request.getBusinessName())
                .gstNumber(request.getGstNumber())
                .businessType(request.getBusinessType())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .sellerMode("BASIC") // Updated from tier
                .isVerified(false)
                .build();

        // Country is hardcoded in Entity specific field initialization or we can set it
        // here if the final field usage allows.
        // The Entity has `private final String country = "INDIA";` so we don't set it
        // in builder.

        return sellerRepository.save(seller);
    }

    public Seller getSellerProfile(User user) {
        return sellerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
    }

    @Transactional
    public Seller updateSellerProfile(User user, SellerOnboardingRequest request) {
        
        Seller seller = sellerRepository.findByUser(user)
                .orElseGet(() -> {
                    Seller newSeller = new Seller();
                    newSeller.setUser(user);          // FK relation
                    return newSeller;
                });

        // Update allowed fields
        seller.setBusinessName(request.getBusinessName());
        seller.setGstNumber(request.getGstNumber());
        seller.setBusinessType(request.getBusinessType());
        seller.setAddress(request.getAddress());
        seller.setCity(request.getCity());
        seller.setState(request.getState());
        seller.setPincode(request.getPincode());

        // Ignored fields: country, tier, isVerified (System controlled)

        return sellerRepository.save(seller);
    }
}
