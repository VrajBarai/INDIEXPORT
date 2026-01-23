package com.perfect.IndiExport.service;

import com.perfect.IndiExport.dto.GenerateInvoiceRequest;
import com.perfect.IndiExport.dto.InvoiceDto;
import com.perfect.IndiExport.entity.*;
import com.perfect.IndiExport.repository.*;
import com.perfect.IndiExport.util.InvoicePdfGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final SellerRepository sellerRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final InvoicePdfGenerator pdfGenerator;

    @Transactional
    public InvoiceDto generateInvoice(User user, GenerateInvoiceRequest request) {
        Long userId = java.util.Objects.requireNonNull(user.getId());
        Seller seller = sellerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        if (request.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }
        long orderId = request.getOrderId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify order belongs to seller
        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Check if invoice already exists
        if (invoiceRepository.findByOrderId(order.getId()).isPresent()) {
            throw new RuntimeException("Invoice already exists for this order");
        }

        Product product = order.getProduct();

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();

        // Use order data directly to ensure consistency
        BigDecimal unitPrice = order.getFinalPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(order.getFinalQuantity()));
        BigDecimal shippingCost = order.getShippingCost();
        BigDecimal totalAmount = order.getTotalAmount(); // Use order's total amount

        // Currency conversion
        BigDecimal convertedAmount = null;
        String convertedCurrency = request.getConvertedCurrency();
        if (convertedCurrency != null && !convertedCurrency.equals("INR")) {
            convertedAmount = convertCurrency(totalAmount, "INR", convertedCurrency);
        }

        // Create invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .order(order)
                .inquiry(order.getInquiry())
                .seller(seller)
                .buyer(order.getBuyer())
                .product(product)
                .quantity(order.getFinalQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .shippingMethod(
                        request.getShippingMethod() != null ? request.getShippingMethod() : order.getShippingTerms())
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .currency(order.getCurrency())
                .convertedAmount(convertedAmount)
                .convertedCurrency(convertedCurrency)
                .status(Invoice.InvoiceStatus.DRAFT)
                .build();

        Invoice saved = java.util.Objects.requireNonNull(invoiceRepository.save(invoice));
        return mapToDto(saved);
    }

    @Transactional
    public InvoiceDto generateInvoiceFromOrder(User user, GenerateInvoiceRequest request) {
        // This method is specifically for auto-generation during order confirmation
        // It strictly uses Order data to ensure invoice amounts match order amounts
        Long userId = java.util.Objects.requireNonNull(user.getId());
        Seller seller = sellerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        if (request.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }
        long orderId = request.getOrderId();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify order belongs to seller
        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Check if invoice already exists
        if (invoiceRepository.findByOrderId(order.getId()).isPresent()) {
            throw new RuntimeException("Invoice already exists for this order");
        }

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber();

        // Strictly use Order data - NO request parameters for amounts
        BigDecimal unitPrice = order.getFinalPrice();
        BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(order.getFinalQuantity()));
        BigDecimal shippingCost = order.getShippingCost();
        BigDecimal totalAmount = order.getTotalAmount();

        // Create invoice matching order exactly
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .order(order)
                .inquiry(order.getInquiry())
                .seller(seller)
                .buyer(order.getBuyer())
                .product(order.getProduct())
                .quantity(order.getFinalQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .shippingMethod(order.getShippingTerms())
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .currency(order.getCurrency())
                .convertedAmount(null)
                .convertedCurrency(null)
                .status(Invoice.InvoiceStatus.DRAFT)
                .build();

        Invoice saved = java.util.Objects.requireNonNull(invoiceRepository.save(invoice));
        return mapToDto(saved);
    }

    @Transactional
    public InvoiceDto confirmInvoice(User user, Long invoiceId) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify invoice belongs to seller
        if (!invoice.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (invoice.getStatus() != Invoice.InvoiceStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT invoices can be confirmed");
        }

        // Deduct stock permanently
        productService.deductStock(invoice.getProduct().getId(), invoice.getQuantity());

        // Update invoice status
        invoice.setStatus(Invoice.InvoiceStatus.CONFIRMED);
        Invoice updated = invoiceRepository.save(invoice);

        return mapToDto(updated);
    }

    @Transactional
    public InvoiceDto cancelInvoice(User user, Long invoiceId) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify invoice belongs to seller
        if (!invoice.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (invoice.getStatus() == Invoice.InvoiceStatus.CANCELLED) {
            throw new RuntimeException("Invoice is already cancelled");
        }

        // If confirmed, release stock
        if (invoice.getStatus() == Invoice.InvoiceStatus.CONFIRMED) {
            productService.releaseStock(invoice.getProduct().getId(), invoice.getQuantity());
        }

        // Update invoice status
        invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
        Invoice updated = invoiceRepository.save(invoice);

        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoice(User user, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        boolean isSeller = invoice.getSeller().getId().equals(user.getId());
        boolean isBuyer = invoice.getBuyer().getId().equals(user.getId());

        if (!isSeller && !isBuyer) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(invoice);
    }

    public List<InvoiceDto> getSellerInvoices(User user) {
        Seller seller = sellerRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        List<Invoice> invoices = invoiceRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());
        return invoices.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> getBuyerInvoices(User buyer) {
        List<Invoice> invoices = invoiceRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());
        return invoices.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceDto getBuyerInvoice(User buyer, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify invoice belongs to buyer
        if (!invoice.getBuyer().getId().equals(buyer.getId())) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(invoice);
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(User user, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        boolean isSeller = invoice.getSeller().getId().equals(user.getId());
        boolean isBuyer = invoice.getBuyer().getId().equals(user.getId());

        if (!isSeller && !isBuyer) {
            throw new RuntimeException("Access denied");
        }

        String buyerCountry = resolveBuyerCountry(invoice);
        return pdfGenerator.generatePdf(invoice, buyerCountry);
    }

    private String resolveBuyerCountry(Invoice invoice) {
        if (invoice.getInquiry() != null) {
            return invoice.getInquiry().getBuyerCountry();
        } else if (invoice.getOrder() != null && invoice.getOrder().getInquiry() != null) {
            return invoice.getOrder().getInquiry().getBuyerCountry();
        } else {
            // Fallback to Buyer profile country
            return buyerRepository.findByUserId(invoice.getBuyer().getId())
                    .map(Buyer::getCountry)
                    .orElse(null);
        }
    }

    private String generateInvoiceNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.count() + 1;
        return "INV-" + datePrefix + "-" + String.format("%04d", count);
    }

    private BigDecimal convertCurrency(BigDecimal amount, String from, String to) {
        // Simplified currency conversion - in production, use real API like
        // ExchangeRate-API
        // For now, return a mock conversion
        if ("USD".equals(to)) {
            return amount.divide(BigDecimal.valueOf(83), 2, RoundingMode.HALF_UP); // Approximate 1 USD = 83 INR
        } else if ("EUR".equals(to)) {
            return amount.divide(BigDecimal.valueOf(90), 2, RoundingMode.HALF_UP); // Approximate 1 EUR = 90 INR
        }
        return amount;
    }

    private InvoiceDto mapToDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setOrderId(invoice.getOrder() != null ? invoice.getOrder().getId() : null);
        dto.setOrderNumber(invoice.getOrder() != null ? invoice.getOrder().getOrderNumber() : null);
        dto.setInquiryId(invoice.getInquiry() != null ? invoice.getInquiry().getId() : null);
        dto.setSellerId(invoice.getSeller().getId());
        dto.setSellerBusinessName(invoice.getSeller().getBusinessName());
        dto.setSellerGstNumber(invoice.getSeller().getGstNumber());
        dto.setSellerAddress(invoice.getSeller().getAddress() + ", " + invoice.getSeller().getCity() + ", "
                + invoice.getSeller().getState());
        dto.setBuyerId(invoice.getBuyer().getId());
        dto.setBuyerName(invoice.getBuyer().getName());
        dto.setBuyerEmail(invoice.getBuyer().getEmail());
        dto.setBuyerCountry(resolveBuyerCountry(invoice));

        dto.setProductId(invoice.getProduct().getId());
        dto.setProductName(invoice.getProduct().getName());
        dto.setProductCategory(invoice.getProduct().getCategory());
        dto.setQuantity(invoice.getQuantity());
        dto.setUnitPrice(invoice.getUnitPrice());
        dto.setTotalPrice(invoice.getTotalPrice());
        dto.setShippingMethod(invoice.getShippingMethod());
        dto.setShippingCost(invoice.getShippingCost());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setCurrency(invoice.getCurrency());
        dto.setConvertedAmount(invoice.getConvertedAmount());
        dto.setConvertedCurrency(invoice.getConvertedCurrency());
        dto.setStatus(invoice.getStatus());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());
        return dto;
    }
}
