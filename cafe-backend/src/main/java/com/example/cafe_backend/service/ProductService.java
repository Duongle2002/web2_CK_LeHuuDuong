package com.example.cafe_backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.cafe_backend.dto.ProductRequest;
import com.example.cafe_backend.model.Product;
import com.example.cafe_backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public Product create(ProductRequest req) {
        if (productRepository.existsByNameIgnoreCase(req.getName())) {
            throw new ResponseStatusException(BAD_REQUEST, "Product name exists");
        }
        Product p = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .available(req.getAvailable() == null ? true : req.getAvailable())
                .build();
        return productRepository.save(p);
    }

    public List<Product> listAvailable() {
        return productRepository.findByAvailableTrueOrderByNameAsc();
    }

    public List<Product> listAll() {
        return productRepository.findAll();
    }

    public Product update(String id, ProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        if (req.getName() != null && !req.getName().isBlank() && !req.getName().equalsIgnoreCase(p.getName())) {
            if (productRepository.existsByNameIgnoreCase(req.getName())) {
                throw new ResponseStatusException(BAD_REQUEST, "Product name exists");
            }
            p.setName(req.getName());
        }
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getAvailable() != null) p.setAvailable(req.getAvailable());
        p.setUpdatedAt(Instant.now());
        return productRepository.save(p);
    }

    public void delete(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }
}