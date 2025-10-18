package com.example.cafe_backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank
    private String name;
    private String description;

    @Min(0)
    private BigDecimal price;

    private Boolean available; // optional on update
}