package com.langbridge.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String phone;
    private String email;
    private String password;
    private String preferredLanguage;
    private String state;
    private String district;
}
