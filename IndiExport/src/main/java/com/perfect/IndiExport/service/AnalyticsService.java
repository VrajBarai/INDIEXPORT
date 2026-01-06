package com.perfect.IndiExport.service;

import com.perfect.IndiExport.dto.SellerAnalyticsDto;
import com.perfect.IndiExport.entity.*;
import com.perfect.IndiExport.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final InquiryRepository inquiryRepository;
    private final RFQResponseRepository rfqResponseRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public SellerAnalyticsDto getSellerAnalytics(User user) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Long sellerId = seller.getId();
        boolean isAdvanced = "ADVANCED".equals(seller.getSellerMode());

        // Basic metrics (available to all sellers)
        Long totalInquiries = inquiryRepository.countBySellerId(sellerId);
        Long totalRFQsParticipated = rfqResponseRepository.countBySellerId(sellerId);
        Long totalChatsInitiated = chatRoomRepository.countBySellerId(sellerId);
        Long totalInvoicesGenerated = invoiceRepository.countBySellerId(sellerId);
        
        // For product views: use count of unique products with inquiries as proxy
        Long totalProductViews = inquiryRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(inquiry -> inquiry.getProduct().getId())
                .distinct()
                .count();

        SellerAnalyticsDto.SellerAnalyticsDtoBuilder builder = SellerAnalyticsDto.builder()
                .totalProductViews(totalProductViews)
                .totalInquiries(totalInquiries)
                .totalRFQsParticipated(totalRFQsParticipated)
                .totalChatsInitiated(totalChatsInitiated)
                .totalInvoicesGenerated(totalInvoicesGenerated);

        // Advanced metrics (only for ADVANCED sellers)
        if (isAdvanced) {
            builder.inquiryGrowth(calculateInquiryGrowth(sellerId))
                   .topProducts(calculateTopProducts(sellerId))
                   .conversionFunnel(calculateConversionFunnel(sellerId, totalProductViews, totalInquiries, totalChatsInitiated, totalInvoicesGenerated))
                   .suggestions(generateSuggestions(sellerId, totalInquiries, totalChatsInitiated, totalInvoicesGenerated));
        }

        return builder.build();
    }

    private List<SellerAnalyticsDto.MonthlyData> calculateInquiryGrowth(Long sellerId) {
        List<Inquiry> inquiries = inquiryRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        
        Map<String, Long> monthlyCounts = inquiries.stream()
                .collect(Collectors.groupingBy(
                    inquiry -> inquiry.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                    Collectors.counting()
                ));

        List<SellerAnalyticsDto.MonthlyData> monthlyData = monthlyCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> SellerAnalyticsDto.MonthlyData.builder()
                        .month(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        return monthlyData.isEmpty() ? new ArrayList<>() : monthlyData;
    }

    private List<SellerAnalyticsDto.ProductPerformance> calculateTopProducts(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        List<Inquiry> inquiries = inquiryRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        List<ChatRoom> chatRooms = chatRoomRepository.findBySellerIdOrderByUpdatedAtDesc(sellerId);
        List<Invoice> invoices = invoiceRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);

        Map<Long, SellerAnalyticsDto.ProductPerformance> productPerformanceMap = new HashMap<>();

        // Initialize all products
        for (Product product : products) {
            productPerformanceMap.put(product.getId(), SellerAnalyticsDto.ProductPerformance.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .inquiryCount(0L)
                    .chatCount(0L)
                    .invoiceCount(0L)
                    .build());
        }

        // Count inquiries per product
        inquiries.forEach(inquiry -> {
            Long productId = inquiry.getProduct().getId();
            if (productPerformanceMap.containsKey(productId)) {
                SellerAnalyticsDto.ProductPerformance perf = productPerformanceMap.get(productId);
                perf.setInquiryCount(perf.getInquiryCount() + 1);
            }
        });

        // Count chats per product
        chatRooms.forEach(chatRoom -> {
            Long productId = chatRoom.getInquiry().getProduct().getId();
            if (productPerformanceMap.containsKey(productId)) {
                SellerAnalyticsDto.ProductPerformance perf = productPerformanceMap.get(productId);
                perf.setChatCount(perf.getChatCount() + 1);
            }
        });

        // Count invoices per product
        invoices.forEach(invoice -> {
            Long productId = invoice.getProduct().getId();
            if (productPerformanceMap.containsKey(productId)) {
                SellerAnalyticsDto.ProductPerformance perf = productPerformanceMap.get(productId);
                perf.setInvoiceCount(perf.getInvoiceCount() + 1);
            }
        });

        return productPerformanceMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getInquiryCount(), a.getInquiryCount()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private SellerAnalyticsDto.ConversionFunnel calculateConversionFunnel(
            Long sellerId, Long views, Long inquiries, Long chats, Long invoices) {
        
        double viewToInquiryRate = views > 0 ? (inquiries.doubleValue() / views.doubleValue()) * 100 : 0.0;
        double inquiryToChatRate = inquiries > 0 ? (chats.doubleValue() / inquiries.doubleValue()) * 100 : 0.0;
        double chatToInvoiceRate = chats > 0 ? (invoices.doubleValue() / chats.doubleValue()) * 100 : 0.0;

        return SellerAnalyticsDto.ConversionFunnel.builder()
                .productViews(views)
                .inquiries(inquiries)
                .chats(chats)
                .invoices(invoices)
                .viewToInquiryRate(Math.round(viewToInquiryRate * 100.0) / 100.0)
                .inquiryToChatRate(Math.round(inquiryToChatRate * 100.0) / 100.0)
                .chatToInvoiceRate(Math.round(chatToInvoiceRate * 100.0) / 100.0)
                .build();
    }

    private List<String> generateSuggestions(Long sellerId, Long inquiries, Long chats, Long invoices) {
        List<String> suggestions = new ArrayList<>();

        if (inquiries == 0) {
            suggestions.add("Try optimizing your product descriptions and images to attract more buyers.");
            suggestions.add("Consider adding more products to increase visibility.");
        } else if (inquiries > 0 && chats == 0) {
            suggestions.add("Respond quickly to inquiries to convert them into active chats.");
            suggestions.add("Make sure your product descriptions are clear and complete.");
        } else if (chats > 0 && invoices == 0) {
            suggestions.add("Focus on closing deals in chats by providing competitive pricing.");
            suggestions.add("Ensure you respond promptly to buyer questions.");
        } else if (invoices > 0) {
            suggestions.add("Great job! Continue maintaining high-quality products and quick responses.");
        }

        List<Product> products = productRepository.findBySellerId(sellerId);
        if (products.size() < 5) {
            suggestions.add("Add more products to increase your marketplace presence.");
        }

        return suggestions;
    }
}

