package com.perfect.IndiExport.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_selling_countries", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "country_code"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSellingCountry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode; // ISO 3166-1 alpha-2 (e.g., "US", "IN", "GB")

    @Column(name = "country_name", nullable = false)
    private String countryName; // Full country name (e.g., "United States", "India")
}

