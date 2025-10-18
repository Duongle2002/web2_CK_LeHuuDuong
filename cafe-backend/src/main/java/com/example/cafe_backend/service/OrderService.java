package com.example.cafe_backend.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.cafe_backend.dto.CreateOrderRequest;
import com.example.cafe_backend.dto.OrderItemRequest;
import com.example.cafe_backend.model.CafeTable;
import com.example.cafe_backend.model.Order;
import com.example.cafe_backend.model.OrderItem;
import com.example.cafe_backend.model.OrderStatus;
import com.example.cafe_backend.model.FulfillmentStatus;
import com.example.cafe_backend.model.PaymentStatus;
import com.example.cafe_backend.model.TableStatus;
import com.example.cafe_backend.model.Product;
import com.example.cafe_backend.repository.CafeTableRepository;
import com.example.cafe_backend.repository.OrderRepository;
import com.example.cafe_backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CafeTableRepository tableRepository;
    private final ProductRepository productRepository;

    public Order createOrder(CreateOrderRequest req, String createdByUserId) {
        CafeTable table = tableRepository.findById(req.getTableId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Table not found"));

        if (table.getStatus() == TableStatus.OCCUPIED) {
            throw new ResponseStatusException(BAD_REQUEST, "Table already occupied");
        }

        if (req.getGuestCount() < 1) {
            throw new ResponseStatusException(BAD_REQUEST, "Guest count must be >= 1");
        }
        if (req.getGuestCount() > table.getCapacity()) {
            throw new ResponseStatusException(BAD_REQUEST, "Guest count exceeds table capacity");
        }

        // map and validate items; unitPrice lấy từ Product
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest ir : req.getItems()) {
            Product p = productRepository.findById(ir.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found: " + ir.getProductId()));
            if (!p.isAvailable()) {
                throw new ResponseStatusException(BAD_REQUEST, "Product unavailable: " + p.getName());
            }
            BigDecimal unitPrice = p.getPrice();
            BigDecimal line = unitPrice.multiply(BigDecimal.valueOf(ir.getQuantity()));
            total = total.add(line);

            items.add(OrderItem.builder()
                    .productId(p.getId())
                    .name(p.getName())
                    .quantity(ir.getQuantity())
                    .unitPrice(unitPrice)
                    .build());
        }

        Order order = Order.builder()
                .tableId(table.getId())
                .createdByUserId(createdByUserId)
                .items(items)
                .guestCount(req.getGuestCount())
                .totalAmount(total)
                .status(OrderStatus.PENDING)
        .fulfillmentStatus(FulfillmentStatus.PENDING)
        .paymentStatus(PaymentStatus.UNPAID)
                .build();

        Order saved = orderRepository.save(order);

        // cập nhật trạng thái bàn
        table.setStatus(TableStatus.OCCUPIED);
        table.setCurrentOrderId(saved.getId());
        table.setUpdatedAt(Instant.now());
        tableRepository.save(table);

        return saved;
    }

    public Order getById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));
    }

    public Order markServed(String id) {
        Order o = getById(id);
        // allow serving when confirmed/preparing/ready
        o.setStatus(OrderStatus.SERVED);
        o.setFulfillmentStatus(FulfillmentStatus.SERVED);
        o.setServedAt(Instant.now());
        o.setUpdatedAt(Instant.now());
        return orderRepository.save(o);
    }

    public Order markPaid(String id) {
        Order o = getById(id);
        o.setStatus(OrderStatus.PAID);
        o.setPaymentStatus(PaymentStatus.PAID);
        o.setPaidAt(Instant.now());
        o.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(o);

        // giải phóng bàn nếu đang trỏ đến order này
        CafeTable t = tableRepository.findById(o.getTableId())
                .orElse(null);
        if (t != null && o.getId().equals(t.getCurrentOrderId())) {
            t.setStatus(TableStatus.AVAILABLE);
            t.setCurrentOrderId(null);
            t.setUpdatedAt(Instant.now());
            tableRepository.save(t);
        }
        return saved;
    }

    public Order markConfirmed(String id) {
        Order o = getById(id);
        o.setFulfillmentStatus(FulfillmentStatus.CONFIRMED);
        o.setUpdatedAt(Instant.now());
        o.setConfirmedAt(Instant.now());
        return orderRepository.save(o);
    }

    public Order markPreparing(String id) {
        Order o = getById(id);
        o.setFulfillmentStatus(FulfillmentStatus.PREPARING);
        o.setUpdatedAt(Instant.now());
        o.setPreparingAt(Instant.now());
        return orderRepository.save(o);
    }

    public Order markReady(String id) {
        Order o = getById(id);
        o.setFulfillmentStatus(FulfillmentStatus.READY);
        o.setUpdatedAt(Instant.now());
        o.setReadyAt(Instant.now());
        return orderRepository.save(o);
    }

    public Order cancel(String id) {
        Order o = getById(id);
        o.setFulfillmentStatus(FulfillmentStatus.CANCELLED);
        o.setStatus(OrderStatus.CANCELLED);
        o.setUpdatedAt(Instant.now());
        // free table if needed
        CafeTable t = tableRepository.findById(o.getTableId()).orElse(null);
        if (t != null && o.getId().equals(t.getCurrentOrderId())) {
            t.setStatus(TableStatus.AVAILABLE);
            t.setCurrentOrderId(null);
            t.setUpdatedAt(Instant.now());
            tableRepository.save(t);
        }
        return orderRepository.save(o);
    }

    public Order findCurrentByTable(String tableId) {
        return orderRepository
                .findFirstByTableIdAndStatusInOrderByCreatedAtDesc(
                        tableId, EnumSet.of(OrderStatus.PENDING, OrderStatus.SERVED))
                .orElse(null);
    }

    public List<Order> historyByTable(String tableId) {
        return orderRepository.findByTableIdOrderByCreatedAtDesc(tableId);
    }

    public List<Order> historyByUser(String userId) {
        return orderRepository.findByCreatedByUserIdOrderByCreatedAtDesc(userId);
    }

    // Admin listing
    public List<Order> listAll(boolean onlyOpen) {
        if (onlyOpen) {
            return orderRepository.findByPaymentStatusNotOrderByCreatedAtDesc(PaymentStatus.PAID);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}