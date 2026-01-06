package com.perfect.IndiExport.dto;

import com.perfect.IndiExport.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private Role role;   // BUYER or SELLER_BASIC
}