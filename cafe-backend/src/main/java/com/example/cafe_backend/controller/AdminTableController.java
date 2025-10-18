package com.example.cafe_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.cafe_backend.dto.CreateTableRequest;
import com.example.cafe_backend.model.CafeTable;
import com.example.cafe_backend.model.TableStatus;
import com.example.cafe_backend.service.TableService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','ROOT')")
public class AdminTableController {
    private final TableService tableService;

    @PostMapping
    public ResponseEntity<CafeTable> create(@Valid @RequestBody CreateTableRequest req) {
        return ResponseEntity.ok(tableService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<CafeTable>> list() {
        return ResponseEntity.ok(tableService.listAll());
    }

    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<CafeTable> updateStatus(@PathVariable String id, @PathVariable TableStatus status) {
        return ResponseEntity.ok(tableService.updateStatus(id, status));
    }

    // Force release table: clear reservation and mark AVAILABLE
    @PostMapping("/{id}/release")
    public ResponseEntity<Void> release(@PathVariable String id) {
        tableService.release(id);
        return ResponseEntity.ok().build();
    }
}