package com.perfect.IndiExport.controller;

import com.perfect.IndiExport.dto.GenerateInvoiceRequest;
import com.perfect.IndiExport.dto.InvoiceDto;
import com.perfect.IndiExport.entity.User;
import com.perfect.IndiExport.repository.UserRepository;
import com.perfect.IndiExport.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<InvoiceDto> generateInvoice(
            @RequestBody GenerateInvoiceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvoiceDto invoice = invoiceService.generateInvoice(user, request);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping
    public ResponseEntity<List<InvoiceDto>> getMyInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<InvoiceDto> invoices = invoiceService.getSellerInvoices(user);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvoiceDto invoice = invoiceService.getInvoice(user, id);
        return ResponseEntity.ok(invoice);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<InvoiceDto> confirmInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvoiceDto invoice = invoiceService.confirmInvoice(user, id);
        return ResponseEntity.ok(invoice);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<InvoiceDto> cancelInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvoiceDto invoice = invoiceService.cancelInvoice(user, id);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        byte[] pdfBytes = invoiceService.generatePdf(user, id);
        InvoiceDto invoice = invoiceService.getInvoice(user, id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", invoice.getInvoiceNumber() + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}



