package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.InquiryDto;
import com.perfect.IndiExport.dto.InquiryReplyRequest;
import com.perfect.IndiExport.dto.InquiryRequest;
import com.perfect.IndiExport.entity.Inquiry;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@CrossOrigin
public class InquiryController {

    private final InquiryService inquiryService;
    private final UserRepository userRepository;

    @GetMapping("/buyer")
    public ResponseEntity<List<InquiryDto>> getBuyerInquiries(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Inquiry.InquiryStatus status) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<InquiryDto> inquiries;
        if (status != null) {
            inquiries = inquiryService.getBuyerInquiriesByStatus(user, status);
        } else {
            inquiries = inquiryService.getBuyerInquiries(user);
        }
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/seller")
    public ResponseEntity<List<InquiryDto>> getSellerInquiries(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Inquiry.InquiryStatus status) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<InquiryDto> inquiries;
        if (status != null) {
            inquiries = inquiryService.getSellerInquiriesByStatus(user, status);
        } else {
            inquiries = inquiryService.getSellerInquiries(user);
        }
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryDto> getInquiryDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InquiryDto inquiry;
        boolean isSeller = user.getRole().name().contains("SELLER");

        if (isSeller) {
            inquiry = inquiryService.getInquiryDetails(user, id);
        } else {
            inquiry = inquiryService.getBuyerInquiryDetails(user, id);
        }

        return ResponseEntity.ok(inquiry);
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<InquiryDto> replyToInquiry(
            @PathVariable Long id,
            @RequestBody InquiryReplyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InquiryDto inquiry;
        if (user.getRole().name().contains("SELLER")) {
            inquiry = inquiryService.replyToInquiry(user, id, request);
        } else {
            inquiry = inquiryService.replyToInquiryByBuyer(user, id, request);
        }

        return ResponseEntity.ok(inquiry);
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<InquiryDto> closeInquiry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InquiryDto inquiry = inquiryService.updateInquiryStatus(user, id, Inquiry.InquiryStatus.CLOSED);
        return ResponseEntity.ok(inquiry);
    }

    // Buyer endpoints
    @PostMapping("/buyer")
    public ResponseEntity<InquiryDto> createInquiry(
            @RequestBody InquiryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InquiryDto inquiry = inquiryService.createInquiry(user, request);
        return ResponseEntity.ok(inquiry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InquiryDto> updateInquiry(
            @PathVariable Long id,
            @RequestBody InquiryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InquiryDto inquiry = inquiryService.updateInquiry(user, id, request);
        return ResponseEntity.ok(inquiry);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInquiry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        inquiryService.deleteInquiry(user, id);
        return ResponseEntity.ok("Inquiry deleted successfully");
    }
}
