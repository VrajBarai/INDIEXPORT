package com.perfect.IndiExport.service;

import com.perfect.IndiExport.dto.BuyerProfileDto;
import com.perfect.IndiExport.entity.Buyer;
import com.perfect.IndiExport.entity.Role;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.BuyerRepository;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.util.CountryUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BuyerService {

    private final BuyerRepository buyerRepository;
    private final UserRepository userRepository;

    public Buyer getBuyerProfile(User user) {
        return buyerRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Create basic buyer profile if doesn't exist
                    Buyer buyer = Buyer.builder()
                            .user(user)
                            .fullName(user.getName())
                            .country("US") // Default country
                            .currency("USD") // Default currency
                            .build();
                    return buyerRepository.save(buyer);
                });
    }

    @Transactional
    public Buyer createOrUpdateBuyerProfile(User user, BuyerProfileDto dto) {
        Buyer buyer = buyerRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Buyer newBuyer = Buyer.builder()
                            .user(user)
                            .build();
                    return newBuyer;
                });

        // Update fields
        if (dto.getFullName() != null)
            buyer.setFullName(dto.getFullName());
        if (dto.getPhone() != null)
            buyer.setPhone(dto.getPhone());
        if (dto.getCountry() != null) {
            buyer.setCountry(dto.getCountry());
            // Set currency based on country ONLY if not explicitly provided
            if (dto.getCurrency() == null) {
                buyer.setCurrency(com.perfect.IndiExport.util.CurrencyUtil.getCurrencyFromCountry(dto.getCountry()));
            }
        }
        if (dto.getCurrency() != null) {
            buyer.setCurrency(dto.getCurrency());
        }
        if (dto.getAddress() != null)
            buyer.setAddress(dto.getAddress());
        if (dto.getCity() != null)
            buyer.setCity(dto.getCity());
        if (dto.getState() != null)
            buyer.setState(dto.getState());
        if (dto.getPincode() != null)
            buyer.setPincode(dto.getPincode());

        // Update user name if fullName is provided
        if (dto.getFullName() != null && !dto.getFullName().isEmpty()) {
            user.setName(dto.getFullName());
            userRepository.save(user);
        }

        return buyerRepository.save(buyer);
    }

}
