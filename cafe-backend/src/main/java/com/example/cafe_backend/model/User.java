package com.example.cafe_backend.model;

import java.time.Instant;
import java.util.Set;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private String password;
    private Set<Role> roles;
    private String email;
    private String phone;
    private String address;
    private String fullName;
    private boolean active;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

}
