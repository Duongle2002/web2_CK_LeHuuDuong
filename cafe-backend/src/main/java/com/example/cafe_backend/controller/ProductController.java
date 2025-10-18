package com.example.cafe_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cafe_backend.model.Product;
import com.example.cafe_backend.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // Public menu: list only available products, sorted by name asc
    @GetMapping
    public ResponseEntity<List<Product>> listAvailable() {
        return ResponseEntity.ok(productService.listAvailable());
    }
}
