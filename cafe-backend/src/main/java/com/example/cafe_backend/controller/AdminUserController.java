package com.example.cafe_backend.controller;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.cafe_backend.model.Role;
import com.example.cafe_backend.model.User;
import com.example.cafe_backend.repository.UserRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROOT')")
public class AdminUserController {
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> list() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<User> updateRoles(@PathVariable String id, @RequestBody UpdateRolesRequest req) {
        User u = userRepository.findById(id).orElseThrow();
        Set<Role> roles = (req.roles == null ? List.<String>of() : req.roles)
                .stream().map(Role::valueOf).collect(Collectors.toSet());
        u.setRoles(roles);
        return ResponseEntity.ok(userRepository.save(u));
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<User> updateActive(@PathVariable String id, @RequestBody ActiveRequest req) {
        User u = userRepository.findById(id).orElseThrow();
        u.setActive(req.active);
        return ResponseEntity.ok(userRepository.save(u));
    }

    @Data
    public static class UpdateRolesRequest { private List<String> roles; }
    @Data
    public static class ActiveRequest { private boolean active; }
}
