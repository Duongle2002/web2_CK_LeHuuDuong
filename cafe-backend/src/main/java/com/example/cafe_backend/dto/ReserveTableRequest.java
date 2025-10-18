package com.example.cafe_backend.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class ReserveTableRequest {
    @Min(1)
    private int guestCount;

    private String note;
}