package com.example.cafe_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.cafe_backend.dto.ReserveTableRequest;
import com.example.cafe_backend.model.CafeTable;
import com.example.cafe_backend.service.TableService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {
    private final TableService tableService;

    @GetMapping
    public ResponseEntity<List<CafeTable>> list() {
        return ResponseEntity.ok(tableService.listAll());
    }

    // trả về các bàn đã đặt bởi user hiện tại (status=RESERVED)
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CafeTable>> myReserved(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(tableService.listByReservedUser(username));
    }

    @PostMapping("/{id}/reserve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CafeTable> reserve(@PathVariable String id, @Valid @RequestBody ReserveTableRequest req) {
        return ResponseEntity.ok(tableService.reserve(id, req));
    }
}