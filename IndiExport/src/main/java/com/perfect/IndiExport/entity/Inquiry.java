package com.perfect.IndiExport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer requestedQuantity;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.NEW;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String shippingOption; // e.g., "Courier", "Air Freight", "Sea Freight", "Pickup"

    private String buyerCountry;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum InquiryStatus {
        NEW,
        REPLIED,
        CLOSED
    }
}



