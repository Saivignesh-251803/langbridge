package com.langbridge.service;

import com.langbridge.dto.AuthRequest;
import com.langbridge.dto.AuthResponse;
import com.langbridge.dto.RegisterRequest;
import com.langbridge.model.User;
import com.langbridge.repository.UserRepository;
import com.langbridge.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new RuntimeException("Phone number already registered.");
        }

        User user = User.builder()
            .name(req.getName())
            .phone(req.getPhone())
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .preferredLanguage(req.getPreferredLanguage() != null ? req.getPreferredLanguage() : "hi")
            .state(req.getState())
            .district(req.getDistrict())
            .build();

        user = userRepository.save(user);
        String token = jwtUtils.generateToken(user.getPhone(), user.getId());

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .preferredLanguage(user.getPreferredLanguage())
            .build();
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByPhone(req.getPhone())
            .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials.");
        }

        String token = jwtUtils.generateToken(user.getPhone(), user.getId());
        return AuthResponse.builder()
            .token(token)
            .userId(user.getId())
            .name(user.getName())
            .preferredLanguage(user.getPreferredLanguage())
            .build();
    }
}
