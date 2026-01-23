package com.perfect.IndiExport.service;

import com.perfect.IndiExport.dto.OrderDto;
import com.perfect.IndiExport.dto.OrderRequest;
import com.perfect.IndiExport.dto.GenerateInvoiceRequest;
import com.perfect.IndiExport.entity.*;
import com.perfect.IndiExport.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InquiryRepository inquiryRepository;
    private final ProductRepository productRepository;
    private final InvoiceService invoiceService;

    @Transactional
    public OrderDto createOrder(User buyer, OrderRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        java.math.BigDecimal shippingCost = request.getShippingCost() != null ? request.getShippingCost()
                : java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalAmount = request.getFinalPrice()
                .multiply(java.math.BigDecimal.valueOf(request.getFinalQuantity())).add(shippingCost);

        String orderNumber = "ORD-" + System.currentTimeMillis();

        Order order = Order.builder()
                .buyer(buyer)
                .seller(product.getSeller())
                .product(product)
                .orderNumber(orderNumber)
                .finalQuantity(request.getFinalQuantity())
                .finalPrice(request.getFinalPrice())
                .currency(request.getCurrency())
                .shippingTerms(request.getShippingTerms())
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.CREATED)
                .build();

        if (request.getInquiryId() != null) {
            Inquiry inquiry = inquiryRepository.findById(request.getInquiryId())
                    .orElseThrow(() -> new RuntimeException("Inquiry not found"));

            Long inquiryId = inquiry.getId();
            if (inquiryId == null) {
                throw new RuntimeException("Inquiry ID is null");
            }
            if (orderRepository.existsByInquiryId(inquiryId)) {
                throw new RuntimeException("Order already exists for this inquiry");
            }

            order.setInquiry(inquiry);
            inquiry.setStatus(Inquiry.InquiryStatus.CONVERTED);
            inquiryRepository.save(inquiry);
        }

        Order saved = java.util.Objects.requireNonNull(orderRepository.save(order));
        return mapToDto(saved);
    }

    @Transactional
    public OrderDto createOrderFromInquiry(Seller seller, Long inquiryId, OrderRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        Long sellerId = inquiry.getSeller().getId();
        if (sellerId == null || !sellerId.equals(seller.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (orderRepository.existsByInquiryId(inquiryId)) {
            throw new RuntimeException("Order already exists for this inquiry");
        }

        java.math.BigDecimal shippingCost = request.getShippingCost() != null ? request.getShippingCost()
                : java.math.BigDecimal.ZERO;
        java.math.BigDecimal totalAmount = request.getFinalPrice()
                .multiply(java.math.BigDecimal.valueOf(request.getFinalQuantity())).add(shippingCost);

        String orderNumber = "ORD-" + System.currentTimeMillis();

        Order order = Order.builder()
                .inquiry(inquiry)
                .buyer(inquiry.getBuyer())
                .seller(seller)
                .product(inquiry.getProduct())
                .orderNumber(orderNumber)
                .finalQuantity(request.getFinalQuantity())
                .finalPrice(request.getFinalPrice())
                .currency(request.getCurrency())
                .shippingTerms(request.getShippingTerms())
                .shippingCost(shippingCost)
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.CREATED)
                .build();

        inquiry.setStatus(Inquiry.InquiryStatus.CONVERTED);
        inquiryRepository.save(inquiry);

        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }

    public List<OrderDto> getBuyerOrders(User buyer) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getSellerOrders(Seller seller) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, Order.OrderStatus newStatus, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Authorization check
        Long buyerId = order.getBuyer().getId();
        Long sellerId = order.getSeller().getId();
        Long currentUserId = user.getId();
        if (buyerId == null || sellerId == null || currentUserId == null ||
                (!buyerId.equals(currentUserId) && !sellerId.equals(currentUserId))) {
            throw new RuntimeException("Access denied");
        }

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        // Update status
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        // Auto-generate invoice when order is confirmed
        if (oldStatus == Order.OrderStatus.CREATED && newStatus == Order.OrderStatus.CONFIRMED) {
            try {
                GenerateInvoiceRequest invoiceRequest = new GenerateInvoiceRequest();
                invoiceRequest.setOrderId(order.getId());
                invoiceRequest.setShippingMethod(order.getShippingTerms());
                invoiceRequest.setShippingCost(order.getShippingCost());
                invoiceService.generateInvoiceFromOrder(user, invoiceRequest);
            } catch (Exception e) {
                // Log error but don't fail the order status update
                System.err.println("Failed to auto-generate invoice: " + e.getMessage());
            }
        }

        return mapToDto(updated);
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            throw new RuntimeException("Order is already in " + newStatus + " status");
        }

        // Define valid transitions
        switch (currentStatus) {
            case CREATED:
                if (newStatus != Order.OrderStatus.CONFIRMED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new RuntimeException("Can only transition from CREATED to CONFIRMED or CANCELLED");
                }
                break;
            case CONFIRMED:
                if (newStatus != Order.OrderStatus.SHIPPED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new RuntimeException("Can only transition from CONFIRMED to SHIPPED or CANCELLED");
                }
                break;
            case SHIPPED:
                if (newStatus != Order.OrderStatus.COMPLETED && newStatus != Order.OrderStatus.CANCELLED) {
                    throw new RuntimeException("Can only transition from SHIPPED to COMPLETED or CANCELLED");
                }
                break;
            case COMPLETED:
                throw new RuntimeException("Cannot change status of a COMPLETED order");
            case CANCELLED:
                throw new RuntimeException("Cannot change status of a CANCELLED order");
        }
    }

    public OrderDto getOrder(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Long buyerId = order.getBuyer().getId();
        Long sellerId = order.getSeller().getId();
        Long currentUserId = user.getId();
        if (buyerId == null || sellerId == null || currentUserId == null ||
                (!buyerId.equals(currentUserId) && !sellerId.equals(currentUserId))) {
            throw new RuntimeException("Access denied");
        }

        return mapToDto(order);
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setInquiryId(order.getInquiry() != null ? order.getInquiry().getId() : null);
        dto.setBuyerId(order.getBuyer().getId());
        dto.setBuyerName(order.getBuyer().getName());
        dto.setSellerId(order.getSeller().getId());
        dto.setSellerBusinessName(order.getSeller().getBusinessName());
        dto.setProductId(order.getProduct().getId());
        dto.setProductName(order.getProduct().getName());
        dto.setFinalQuantity(order.getFinalQuantity());
        dto.setFinalPrice(order.getFinalPrice());
        dto.setCurrency(order.getCurrency());
        dto.setShippingTerms(order.getShippingTerms());
        dto.setShippingCost(order.getShippingCost());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }
}
