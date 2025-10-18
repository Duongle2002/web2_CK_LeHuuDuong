package com.example.cafe_backend.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class CreateTableRequest {
    @Min(1)
    private int tableNumber;

    @Min(1)
    private int capacity;

    private String note;
}