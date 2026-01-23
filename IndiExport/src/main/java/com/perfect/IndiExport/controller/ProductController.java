package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.CountryDto;
import com.perfect.IndiExport.dto.ProductDto;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.service.ProductService;
import com.perfect.IndiExport.util.CountryUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ProductDto> addProduct(@RequestBody ProductDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(productService.addProduct(user, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProductDto>> getMyProducts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(productService.getSellerProducts(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(productService.updateProduct(user, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        productService.deleteProduct(user, id);
        return ResponseEntity.ok(Map.of("message", "Product deactivated successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ProductDto> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(productService.toggleProductStatus(user, id, active));
    }

    @GetMapping("/countries")
    public ResponseEntity<List<CountryDto>> getCountries() {
        Map<String, String> countries = CountryUtil.getAllCountries();
        List<CountryDto> countryList = countries.entrySet().stream()
                .map(entry -> new CountryDto(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(countryList);
    }

    // Buyer endpoints
    @GetMapping("/browse")
    public ResponseEntity<List<ProductDto>> browseProducts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ProductDto> products = productService.getProductsForBuyer(user, category, search);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is buyer or seller
        boolean isSeller = user.getRole().name().contains("SELLER");

        if (isSeller) {
            // Seller view - return basic DTO
            ProductDto dto = productService.getSellerProducts(user).stream()
                    .filter(p -> p.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            return ResponseEntity.ok(dto);
        } else {
            // Buyer view - return with currency conversion
            ProductDto dto = productService.getProductDetailsForBuyer(user, id);
            return ResponseEntity.ok(dto);
        }
    }
}
