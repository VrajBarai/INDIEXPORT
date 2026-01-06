package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.RFQDto;
import com.perfect.IndiExport.dto.RFQRequest;
import com.perfect.IndiExport.dto.RFQResponseDto;
import com.perfect.IndiExport.dto.RFQResponseRequest;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.service.RFQService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rfqs")
@RequiredArgsConstructor
@CrossOrigin
public class RFQController {

    private final RFQService rfqService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<RFQDto>> getAvailableRFQs(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<RFQDto> rfqs;
        boolean isSeller = user.getRole().name().contains("SELLER");
        
        if (isSeller) {
            rfqs = rfqService.getAvailableRFQs(user);
        } else {
            // Buyer - get their own RFQs
            rfqs = rfqService.getBuyerRFQs(user);
        }
        
        return ResponseEntity.ok(rfqs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RFQDto> getRFQDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RFQDto rfq;
        boolean isSeller = user.getRole().name().contains("SELLER");
        
        if (isSeller) {
            rfq = rfqService.getRFQDetails(user, id);
        } else {
            rfq = rfqService.getBuyerRFQDetails(user, id);
        }
        
        return ResponseEntity.ok(rfq);
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<RFQResponseDto> respondToRFQ(
            @PathVariable Long id,
            @RequestBody RFQResponseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RFQResponseDto response = rfqService.respondToRFQ(user, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/responses")
    public ResponseEntity<List<RFQResponseDto>> getRFQResponses(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify access - buyer can only see responses to their own RFQs
        boolean isSeller = user.getRole().name().contains("SELLER");
        if (!isSeller) {
            // For buyers, verify they own the RFQ
            RFQDto rfq = rfqService.getBuyerRFQDetails(user, id);
            if (rfq == null) {
                throw new RuntimeException("Access denied");
            }
        }
        
        List<RFQResponseDto> responses = rfqService.getRFQResponses(id);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my-responses")
    public ResponseEntity<List<RFQResponseDto>> getMyRFQResponses(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<RFQResponseDto> responses = rfqService.getMyRFQResponses(user);
        return ResponseEntity.ok(responses);
    }

    // Buyer endpoints
    @PostMapping
    public ResponseEntity<RFQDto> createRFQ(
            @RequestBody RFQRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RFQDto rfq = rfqService.createRFQ(user, request);
        return ResponseEntity.ok(rfq);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RFQDto> updateRFQ(
            @PathVariable Long id,
            @RequestBody RFQRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RFQDto rfq = rfqService.updateRFQ(user, id, request);
        return ResponseEntity.ok(rfq);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRFQ(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        rfqService.deleteRFQ(user, id);
        return ResponseEntity.ok("RFQ deleted successfully");
    }
}



