package com.langbridge.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String phone;
    private String password;
}
