package com.perfect.IndiExport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerAnalyticsDto {
    // Basic Metrics (available to all sellers)
    private Long totalProductViews; // Simplified: count of unique products with inquiries
    private Long totalInquiries;
    private Long totalRFQsParticipated;
    private Long totalChatsInitiated;
    private Long totalInvoicesGenerated;

    // Advanced Metrics (only for ADVANCED sellers)
    private List<MonthlyData> inquiryGrowth; // Monthly inquiry counts
    private List<ProductPerformance> topProducts; // Top performing products
    private ConversionFunnel conversionFunnel;
    private List<String> suggestions; // Actionable suggestions

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month; // Format: "YYYY-MM"
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPerformance {
        private Long productId;
        private String productName;
        private Long inquiryCount;
        private Long chatCount;
        private Long invoiceCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversionFunnel {
        private Long productViews;
        private Long inquiries;
        private Long chats;
        private Long invoices;
        private Double viewToInquiryRate; // Percentage
        private Double inquiryToChatRate; // Percentage
        private Double chatToInvoiceRate; // Percentage
    }
}
