package com.example.cafe_backend.controller;

import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.cafe_backend.dto.*;
import com.example.cafe_backend.model.Role;
import com.example.cafe_backend.model.User;
import com.example.cafe_backend.repository.UserRepository;
import com.example.cafe_backend.security.JwtUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User u = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .roles(Set.of(Role.ROLE_USER))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .active(true)
                .build();
        userRepo.save(u);
        return ResponseEntity.ok("Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        var user = userRepo.findByUsername(req.getUsername()).orElseThrow();
        String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.User) auth.getPrincipal());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRoles()));
    }
}