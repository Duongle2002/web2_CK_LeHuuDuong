package com.example.cafe_backend.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.cafe_backend.model.Role;
import com.example.cafe_backend.model.User;
import com.example.cafe_backend.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRoot(UserRepository userRepo, PasswordEncoder encoder) {
        return args -> {
            if (!userRepo.existsByUsername("root")) {
                User root = User.builder()
                        .username("root")
                        .password(encoder.encode("rootpassword"))
                        .roles(Set.of(Role.ROLE_ROOT, Role.ROLE_ADMIN))
                        .active(true)
                        .fullName("Root User")
                        .build();
                userRepo.save(root);
                System.out.println("Seeded root user (username=root, change password ASAP)");
            }
        };
    }
}