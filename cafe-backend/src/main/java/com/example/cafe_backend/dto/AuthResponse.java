package com.example.cafe_backend.dto;

import java.util.Set;

import com.example.cafe_backend.model.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private Set<Role> roles;
}