package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.OrderDto;
import com.perfect.IndiExport.dto.OrderRequest;
import com.perfect.IndiExport.dto.UpdateOrderStatusRequest;
import com.perfect.IndiExport.entity.Seller;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.SellerRepository;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin
public class OrderController {

        private final OrderService orderService;
        private final UserRepository userRepository;
        private final SellerRepository sellerRepository;

        @PostMapping("/buyer")
        public ResponseEntity<OrderDto> createDirectOrder(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody OrderRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(orderService.createOrder(user, request));
        }

        @PostMapping("/seller/from-inquiry/{inquiryId}")
        public ResponseEntity<OrderDto> createOrderFromInquiry(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long inquiryId,
                        @RequestBody OrderRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (user.getId() == null) {
                        throw new RuntimeException("User ID is null");
                }
                long userId = user.getId();
                Seller seller = sellerRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
                return ResponseEntity.ok(orderService.createOrderFromInquiry(seller, inquiryId, request));
        }

        @GetMapping("/buyer")
        public ResponseEntity<List<OrderDto>> getBuyerOrders(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(orderService.getBuyerOrders(user));
        }

        @GetMapping("/seller")
        public ResponseEntity<List<OrderDto>> getSellerOrders(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (user.getId() == null) {
                        throw new RuntimeException("User ID is null");
                }
                long userId = user.getId();
                Seller seller = sellerRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
                return ResponseEntity.ok(orderService.getSellerOrders(seller));
        }

        @GetMapping("/{id}")
        public ResponseEntity<OrderDto> getOrder(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long id) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(orderService.getOrder(id, user));
        }

        @PutMapping("/{id}/status")
        public ResponseEntity<OrderDto> updateOrderStatus(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable Long id,
                        @RequestBody UpdateOrderStatusRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus(), user));
        }
}
