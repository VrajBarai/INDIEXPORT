package com.perfect.IndiExport.service;

import com.perfect.IndiExport.dto.InquiryDto;
import com.perfect.IndiExport.dto.InquiryReplyRequest;
import com.perfect.IndiExport.dto.InquiryRequest;
import com.perfect.IndiExport.entity.Buyer;
import com.perfect.IndiExport.entity.Inquiry;
import com.perfect.IndiExport.entity.Product;
import com.perfect.IndiExport.entity.Seller;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.BuyerRepository;
import com.perfect.IndiExport.repository.InquiryRepository;
import com.perfect.IndiExport.repository.ProductRepository;
import com.perfect.IndiExport.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final BuyerRepository buyerRepository;

    public List<InquiryDto> getSellerInquiries(User user) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        List<Inquiry> inquiries = inquiryRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());
        return inquiries.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InquiryDto> getSellerInquiriesByStatus(User user, Inquiry.InquiryStatus status) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        List<Inquiry> inquiries = inquiryRepository.findBySellerIdAndStatusOrderByCreatedAtDesc(seller.getId(), status);
        return inquiries.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InquiryDto getInquiryDetails(User user, Long inquiryId) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Inquiry inquiry = inquiryRepository.findByIdAndSellerId(inquiryId, seller.getId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found or access denied"));

        return mapToDto(inquiry);
    }

    @Transactional
    public InquiryDto replyToInquiry(User user, Long inquiryId, InquiryReplyRequest request) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Inquiry inquiry = inquiryRepository.findByIdAndSellerId(inquiryId, seller.getId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found or access denied"));

        // Update inquiry with reply
        if (request.getReplyMessage() != null && !request.getReplyMessage().trim().isEmpty()) {
            String existingMessage = inquiry.getMessage() != null ? inquiry.getMessage() : "";
            String replyMessage = request.getReplyMessage();
            inquiry.setMessage(existingMessage + "\n\n--- Seller Reply ---\n" + replyMessage);
        }

        // Update status if provided
        if (request.getStatus() != null) {
            inquiry.setStatus(request.getStatus());
        } else if (inquiry.getStatus() == Inquiry.InquiryStatus.NEW) {
            // Auto-update to REPLIED if status not specified
            inquiry.setStatus(Inquiry.InquiryStatus.REPLIED);
        }

        Inquiry updated = inquiryRepository.save(inquiry);
        return mapToDto(updated);
    }

    @Transactional
    public InquiryDto updateInquiryStatus(User user, Long inquiryId, Inquiry.InquiryStatus status) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Inquiry inquiry = inquiryRepository.findByIdAndSellerId(inquiryId, seller.getId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found or access denied"));

        inquiry.setStatus(status);
        Inquiry updated = inquiryRepository.save(inquiry);
        return mapToDto(updated);
    }

    // Buyer methods
    public List<InquiryDto> getBuyerInquiries(User user) {
        List<Inquiry> inquiries = inquiryRepository.findByBuyerIdOrderByCreatedAtDesc(user.getId());
        return inquiries.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InquiryDto> getBuyerInquiriesByStatus(User user, Inquiry.InquiryStatus status) {
        List<Inquiry> inquiries = inquiryRepository.findByBuyerIdAndStatusOrderByCreatedAtDesc(user.getId(), status);
        return inquiries.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InquiryDto getBuyerInquiryDetails(User user, Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findByIdAndBuyerId(inquiryId, user.getId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found or access denied"));
        return mapToDto(inquiry);
    }

    @Transactional
    public InquiryDto createInquiry(User buyerUser, InquiryRequest request) {
        // Get buyer profile
        Buyer buyer = buyerRepository.findByUserId(buyerUser.getId())
                .orElseThrow(() -> new RuntimeException("Buyer profile not found. Please complete your profile."));

        // Get product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Get seller
        Seller seller = product.getSeller();

        // Validate stock
        int remainingStock = product.getRemainingStock();
        if (remainingStock < request.getRequestedQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + remainingStock + ", Requested: " + request.getRequestedQuantity());
        }

        // Validate minimum quantity
        if (request.getRequestedQuantity() < product.getMinQuantity()) {
            throw new RuntimeException("Minimum quantity required: " + product.getMinQuantity());
        }

        // Create inquiry
        Inquiry inquiry = Inquiry.builder()
                .buyer(buyerUser)
                .seller(seller)
                .product(product)
                .requestedQuantity(request.getRequestedQuantity())
                .message(request.getMessage())
                .shippingOption(request.getShippingOption())
                .buyerCountry(buyer.getCountry())
                .status(Inquiry.InquiryStatus.NEW)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);

        // Reserve stock
        product.setReservedStock(product.getReservedStock() + request.getRequestedQuantity());
        productRepository.save(product);

        return mapToDto(saved);
    }

    @Transactional
    public InquiryDto updateInquiry(User buyerUser, Long inquiryId, InquiryRequest request) {
        Inquiry inquiry = inquiryRepository.findByIdAndBuyerId(inquiryId, buyerUser.getId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found or access denied"));

        // Can only edit if seller hasn't replied
        if (inquiry.getStatus() != Inquiry.InquiryStatus.NEW) {
            throw new RuntimeException("Cannot edit inquiry. Seller has already replied.");
        }

        Product product = inquiry.getProduct();

        // Update quantity if changed
        if (request.getRequestedQuantity() != null && !request.getRequestedQuantity().equals(inquiry.getRequestedQuantity())) {
            // Release old reserved stock
            int oldQuantity = inquiry.getRequestedQuantity();
            product.setReservedStock(product.getReservedStock() - oldQuantity);

            // Validate new quantity
            int remainingStock = product.getRemainingStock();
            if (remainingStock < request.getRequestedQuantity()) {
                // Restore old reservation
                product.setReservedStock(product.getReservedStock() + oldQuantity);
                throw new RuntimeException("Insufficient stock. Available: " + remainingStock);
            }

            if (request.getRequestedQuantity() < product.getMinQuantity()) {
                // Restore old reservation
                product.setReservedStock(product.getReservedStock() + oldQuantity);
                throw new RuntimeException("Minimum quantity required: " + product.getMinQuantity());
            }

            // Reserve new quantity
            inquiry.setRequestedQuantity(request.getRequestedQuantity());
            product.setReservedStock(product.getReservedStock() + request.getRequestedQuantity());
        }

        // Update other fields
        if (request.getMessage() != null) inquiry.setMessage(request.getMessage());
        if (request.getShippingOption() != null) inquiry.setShippingOption(request.getShippingOption());

        productRepository.save(product);
        Inquiry updated = inquiryRepository.save(inquiry);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteInquiry(User buyerUser, Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findByIdAndBuyerId(inquiryId, buyerUser.getId())
                .orElseThrow(() -> new RuntimeException("Inquiry not found or access denied"));

        // Can only delete if seller hasn't replied
        if (inquiry.getStatus() != Inquiry.InquiryStatus.NEW) {
            throw new RuntimeException("Cannot delete inquiry. Seller has already replied.");
        }

        // Release reserved stock
        Product product = inquiry.getProduct();
        product.setReservedStock(product.getReservedStock() - inquiry.getRequestedQuantity());
        productRepository.save(product);

        inquiryRepository.delete(inquiry);
    }

    private InquiryDto mapToDto(Inquiry inquiry) {
        InquiryDto dto = new InquiryDto();
        dto.setId(inquiry.getId());
        
        // Buyer info
        dto.setBuyerId(inquiry.getBuyer().getId());
        dto.setBuyerName(inquiry.getBuyer().getName());
        dto.setBuyerEmail(inquiry.getBuyer().getEmail());
        dto.setBuyerCountry(inquiry.getBuyerCountry());
        
        // Seller info
        dto.setSellerId(inquiry.getSeller().getId());
        dto.setSellerBusinessName(inquiry.getSeller().getBusinessName());
        
        // Product info
        dto.setProductId(inquiry.getProduct().getId());
        dto.setProductName(inquiry.getProduct().getName());
        dto.setProductCategory(inquiry.getProduct().getCategory());
        
        // Inquiry details
        dto.setRequestedQuantity(inquiry.getRequestedQuantity());
        dto.setStatus(inquiry.getStatus());
        dto.setMessage(inquiry.getMessage());
        dto.setShippingOption(inquiry.getShippingOption());
        dto.setCreatedAt(inquiry.getCreatedAt());
        dto.setUpdatedAt(inquiry.getUpdatedAt());
        
        return dto;
    }
}



