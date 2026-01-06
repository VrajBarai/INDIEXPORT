package com.perfect.IndiExport.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String businessName;

    private String gstNumber;

    private String businessType;

    private String address;

    private String city;

    private String state;

    private String pincode;

    @Column(nullable = false)
    @Builder.Default
    private final String country = "INDIA";

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isVerified = false;

    // We can store tier here, or rely on User Role.
    // Given the requirement "Seller can upgrade to ADVANCED", storing explicit tier
    // might be useful later,
    // but User Role SELLER_BASIC vs SELLER_ADVANCED is the primary source of truth
    // for now.
    // Let's add a redundancy or just rely on Role.
    // The plan said "tier" string. Let's add it for clarity.
    @Builder.Default
    private String sellerMode = "BASIC";
}
