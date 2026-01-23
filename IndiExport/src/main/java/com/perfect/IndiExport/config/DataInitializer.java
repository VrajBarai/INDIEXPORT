package com.perfect.IndiExport.config;

import com.perfect.IndiExport.repository.InquiryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final InquiryRepository inquiryRepository;

    @PostConstruct
    @Transactional
    public void init() {
        log.info("Starting data migration: converting inquiries with invoices to CONVERTED status...");
        try {
            inquiryRepository.migrateInquiriesWithInvoices();
            log.info("Data migration completed successfully.");
        } catch (Exception e) {
            log.error("Error during data migration: ", e);
        }
    }
}
