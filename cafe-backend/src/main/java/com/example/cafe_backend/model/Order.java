package com.example.cafe_backend.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("orders")
@CompoundIndexes({
    // Optimize reporting queries (match by status + date ranges)
    @CompoundIndex(name = "status_createdAt_idx", def = "{status: 1, createdAt: 1}"),
    @CompoundIndex(name = "status_paidAt_idx", def = "{status: 1, paidAt: 1}"),
    // Optimize top-products report (unwind items then match productId)
    @CompoundIndex(name = "status_createdAt_items_product_idx", def = "{status: 1, createdAt: 1, 'items.productId': 1}")
})
public class Order {
    @Id
    private String id;

    @NotBlank
    @Indexed
    private String tableId;

    @Indexed
    private String createdByUserId;

    @Valid
    private List<OrderItem> items;

    @Min(0)
    private BigDecimal totalAmount;

    // Backward-compat primary status (still maintained to not break reports/features)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // New statuses
    @Builder.Default
    private FulfillmentStatus fulfillmentStatus = FulfillmentStatus.PENDING;
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    // số lượng khách để báo cáo
    @Min(1)
    private int guestCount;

    @Indexed
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Indexed
    private Instant paidAt;   // set khi thanh toán

    // timeline for fulfillment
    private Instant confirmedAt;
    private Instant preparingAt;
    private Instant readyAt;
    private Instant servedAt;
}