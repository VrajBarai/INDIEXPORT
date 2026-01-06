package com.perfect.IndiExport.dto;
import com.perfect.IndiExport.entity.Inquiry;

import lombok.Data;

@Data
public class InquiryReplyRequest {
    private String replyMessage;
    private Inquiry.InquiryStatus status; // Optional: to change status while replying
}



