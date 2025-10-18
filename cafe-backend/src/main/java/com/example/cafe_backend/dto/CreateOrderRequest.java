package com.example.cafe_backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotBlank
    private String tableId;

    @Min(1)
    private int guestCount;

    @Valid
    private List<OrderItemRequest> items;
}