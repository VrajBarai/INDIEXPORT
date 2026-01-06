package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.SellerAnalyticsDto;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    @GetMapping("/seller")
    public ResponseEntity<SellerAnalyticsDto> getSellerAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SellerAnalyticsDto analytics = analyticsService.getSellerAnalytics(user);
        return ResponseEntity.ok(analytics);
    }
}

