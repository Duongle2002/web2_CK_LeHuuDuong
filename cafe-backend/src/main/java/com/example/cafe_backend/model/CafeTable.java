package com.example.cafe_backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("tables")
public class CafeTable {
    @Id
    private String id;

    @Indexed(unique = true)
    private int tableNumber;

    @Min(1)
    private int capacity;

    @Builder.Default
    private TableStatus status = TableStatus.AVAILABLE;

    // order hiện tại (nếu có)
    private String currentOrderId;

    private String note;

    // user đã đặt bàn (nếu trạng thái RESERVED)
    private String reservedByUserId;
    private Instant reservedAt;

    // optimistic lock để tránh double-reserve
    @Version
    private Long version;

    // timestamps
    @Builder.Default
    private Instant createdAt = Instant.now();
    @Builder.Default
    private Instant updatedAt = Instant.now();
}