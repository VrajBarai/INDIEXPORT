package com.perfect.IndiExport.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buyers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Buyer {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(nullable = false)
    private String fullName; // Full name or company name

    private String phone;

    @Column(nullable = false)
    private String country; // MANDATORY - ISO country code (e.g., "US", "GB", "IN")

    private String address;

    private String city;

    private String state;

    private String pincode;

    // Currency derived from country (e.g., "USD", "GBP", "EUR")
    private String currency; // Will be set based on country

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isVerified = false;
}

