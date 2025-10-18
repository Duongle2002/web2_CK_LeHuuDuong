package com.example.cafe_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    @NotBlank
    private String productId;

    @Min(1)
    private int quantity;

    // Cho phép client gửi, nhưng Service sẽ áp lại unitPrice theo Product hiện tại để đảm bảo tính đúng.
    private BigDecimal expectedUnitPrice; 
}