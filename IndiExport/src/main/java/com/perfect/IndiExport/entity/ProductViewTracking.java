package com.perfect.IndiExport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_view_tracking", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "buyer_id", "view_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductViewTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer; // Buyer who viewed the product

    @Column(nullable = false)
    private LocalDateTime viewDate; // Date of view (for daily aggregation)

    @CreationTimestamp
    private LocalDateTime createdAt;
}

