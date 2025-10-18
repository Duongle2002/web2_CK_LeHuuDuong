package com.example.cafe_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.cafe_backend.dto.CreateOrderRequest;
import com.example.cafe_backend.model.Order;
import com.example.cafe_backend.model.PaymentStatus;
import com.example.cafe_backend.repository.UserRepository;
import com.example.cafe_backend.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final UserRepository userRepository;
    // createdByUserId: tạm thời truyền qua header X-User-Id; khi tích hợp JWT sẽ lấy từ SecurityContext
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> create(@Valid @RequestBody CreateOrderRequest req,
                                        Authentication authentication) {
        String createdBy = authentication.getName();
        String userId = userRepository.findByUsername(createdBy).map(u -> u.getId()).orElse(createdBy);
        return ResponseEntity.ok(orderService.createOrder(req, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> get(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    // Admin/Root: list all orders or only unpaid/open ones
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','ROOT')")
    public ResponseEntity<java.util.List<Order>> all(@RequestParam(name = "onlyOpen", required = false) Boolean onlyOpen) {
        boolean open = Boolean.TRUE.equals(onlyOpen);
        return ResponseEntity.ok(orderService.listAll(open));
    }

    // lịch sử order của chính user
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.List<Order>> myOrders(Authentication authentication) {
        String username = authentication.getName();
        String userId = userRepository.findByUsername(username).map(u -> u.getId()).orElse(username);
        return ResponseEntity.ok(orderService.historyByUser(userId));
    }

    @PutMapping("/{id}/serve")
    public ResponseEntity<Order> serve(@PathVariable String id) {
        return ResponseEntity.ok(orderService.markServed(id));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Order> pay(@PathVariable String id) {
        return ResponseEntity.ok(orderService.markPaid(id));
    }

    // New flow endpoints
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Order> confirm(@PathVariable String id) {
        return ResponseEntity.ok(orderService.markConfirmed(id));
    }
    @PutMapping("/{id}/preparing")
    public ResponseEntity<Order> preparing(@PathVariable String id) {
        return ResponseEntity.ok(orderService.markPreparing(id));
    }
    @PutMapping("/{id}/ready")
    public ResponseEntity<Order> ready(@PathVariable String id) {
        return ResponseEntity.ok(orderService.markReady(id));
    }
    @PutMapping("/{id}/served")
    public ResponseEntity<Order> served(@PathVariable String id) {
        return ResponseEntity.ok(orderService.markServed(id));
    }
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancel(@PathVariable String id) {
        return ResponseEntity.ok(orderService.cancel(id));
    }
}