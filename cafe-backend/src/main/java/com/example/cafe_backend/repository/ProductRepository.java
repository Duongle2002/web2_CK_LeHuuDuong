package com.example.cafe_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.cafe_backend.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);

    // menu cho khách
    List<Product> findByAvailableTrueOrderByNameAsc();

    // search tên gần đúng
    List<Product> findByNameRegexIgnoreCase(String nameRegex);
}