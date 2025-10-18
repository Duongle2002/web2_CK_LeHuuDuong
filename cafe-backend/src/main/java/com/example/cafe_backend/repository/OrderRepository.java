package com.example.cafe_backend.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.cafe_backend.model.Order;
import com.example.cafe_backend.model.OrderStatus;
import com.example.cafe_backend.model.PaymentStatus;

public interface OrderRepository extends MongoRepository<Order, String> {

    // order hiện tại của 1 bàn (nếu đang mở)
    Optional<Order> findFirstByTableIdAndStatusInOrderByCreatedAtDesc(
            String tableId, Collection<OrderStatus> statuses);

    List<Order> findByTableIdOrderByCreatedAtDesc(String tableId);

    List<Order> findByCreatedByUserIdOrderByCreatedAtDesc(String createdByUserId);

    List<Order> findByCreatedAtBetween(Instant startInclusive, Instant endExclusive);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByPaymentStatusNotOrderByCreatedAtDesc(PaymentStatus status);

    // Aggregation báo cáo doanh thu/ngày (đã thanh toán)
    @Aggregation(pipeline = {
        "{ '$match': { 'status': 'PAID', 'createdAt': { '$gte': ?0, '$lt': ?1 } } }",
        "{ '$group': { '_id': null, " +
            "'totalRevenue': { '$sum': { '$convert': { 'input': '$totalAmount', 'to': 'decimal', 'onError': 0, 'onNull': 0 } } }, " +
            "'ordersCount': { '$sum': 1 }, " +
            "'guests': { '$sum': '$guestCount' } } }"
    })
    List<DailyReport> aggregateDailyReport(Instant startInclusive, Instant endExclusive);

    interface DailyReport {
        java.math.BigDecimal getTotalRevenue();
        long getOrdersCount();
        long getGuests();
    }

    // Tổng hợp theo khoảng ngày (start/end) - có thể dùng chung với daily nhưng cho rõ ràng
    @Aggregation(pipeline = {
        "{ '$match': { 'status': 'PAID', 'createdAt': { '$gte': ?0, '$lt': ?1 } } }",
        "{ '$group': { '_id': null, " +
            "'totalRevenue': { '$sum': { '$convert': { 'input': '$totalAmount', 'to': 'decimal', 'onError': 0, 'onNull': 0 } } }, " +
            "'ordersCount': { '$sum': 1 }, " +
            "'guests': { '$sum': '$guestCount' } } }"
    })
    List<RangeReport> aggregateRangeReport(Instant startInclusive, Instant endExclusive);

    interface RangeReport {
        java.math.BigDecimal getTotalRevenue();
        long getOrdersCount();
        long getGuests();
    }

    // Top sản phẩm bán chạy trong khoảng thời gian theo số lượng và doanh thu
    @Aggregation(pipeline = {
        "{ '$match': { 'status': 'PAID', 'createdAt': { '$gte': ?0, '$lt': ?1 } } }",
        "{ '$unwind': '$items' }",
        "{ '$group': { _id: { productId: '$items.productId', name: '$items.name' }, " +
            "quantity: { $sum: { $convert: { input: '$items.quantity', to: 'int', onError: 0, onNull: 0 } } }, " +
            "revenue: { $sum: { $multiply: [ { $convert: { input: '$items.unitPrice', to: 'decimal', onError: 0, onNull: 0 } }, { $convert: { input: '$items.quantity', to: 'decimal', onError: 0, onNull: 0 } } ] } } } }",
        "{ '$project': { _id: 0, productId: '$_id.productId', name: '$_id.name', quantity: 1, revenue: 1 } }",
        "{ '$sort': { quantity: -1, revenue: -1 } }",
        "{ '$limit': ?2 }"
    })
    List<TopProduct> aggregateTopProducts(Instant startInclusive, Instant endExclusive, int limit);

    interface TopProduct {
        String getProductId();
        String getName();
        long getQuantity();
        java.math.BigDecimal getRevenue();
    }
}