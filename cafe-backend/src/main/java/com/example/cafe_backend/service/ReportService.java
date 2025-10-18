package com.example.cafe_backend.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.example.cafe_backend.repository.OrderRepository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final OrderRepository orderRepository;

    @Cacheable(value = "reports", key = "T(java.util.Objects).hash('daily', #date, #zoneId)")
    public DailyReportResult daily(LocalDate date, ZoneId zoneId) {
        Instant start = date.atStartOfDay(zoneId).toInstant();
        Instant end = date.plusDays(1).atStartOfDay(zoneId).toInstant();

        var list = orderRepository.aggregateDailyReport(start, end);
        if (list.isEmpty()) {
            return new DailyReportResult(BigDecimal.ZERO, 0L, 0L);
        }
        var agg = list.get(0);
        return new DailyReportResult(agg.getTotalRevenue(), agg.getOrdersCount(), agg.getGuests());
    }

    @Cacheable(value = "reports", key = "T(java.util.Objects).hash('range', #start, #end, #zoneId)")
    public SummaryReportResult range(LocalDate start, LocalDate end, ZoneId zoneId) {
        Assert.notNull(start, "start date must not be null");
        Assert.notNull(end, "end date must not be null");
        Assert.isTrue(!end.isBefore(start), "end must be on/after start");

        Instant s = start.atStartOfDay(zoneId).toInstant();
        Instant e = end.plusDays(1).atStartOfDay(zoneId).toInstant();

        var list = orderRepository.aggregateRangeReport(s, e);
        if (list.isEmpty()) {
            return new SummaryReportResult(BigDecimal.ZERO, 0L, 0L);
        }
        var agg = list.get(0);
        return new SummaryReportResult(agg.getTotalRevenue(), agg.getOrdersCount(), agg.getGuests());
    }

    @Cacheable(value = "reports", key = "T(java.util.Objects).hash('top-products', #start, #end, #limit, #zoneId)")
    public List<TopProductItem> topProducts(LocalDate start, LocalDate end, ZoneId zoneId, int limit) {
        Assert.notNull(start, "start date must not be null");
        Assert.notNull(end, "end date must not be null");
        Assert.isTrue(!end.isBefore(start), "end must be on/after start");
        if (limit <= 0) limit = 10;

        Instant s = start.atStartOfDay(zoneId).toInstant();
        Instant e = end.plusDays(1).atStartOfDay(zoneId).toInstant();

        var list = orderRepository.aggregateTopProducts(s, e, limit);
        return list.stream()
            .map(p -> new TopProductItem(p.getProductId(), p.getName(), p.getQuantity(), p.getRevenue()))
            .toList();
    }

    @Data
    @AllArgsConstructor
    public static class DailyReportResult {
        private BigDecimal totalRevenue;
        private long ordersCount;
        private long guests;
    }

    @Data
    @AllArgsConstructor
    public static class SummaryReportResult {
        private BigDecimal totalRevenue;
        private long ordersCount;
        private long guests;
    }

    @Data
    @AllArgsConstructor
    public static class TopProductItem {
        private String productId;
        private String name;
        private long quantity;
        private BigDecimal revenue;
    }
}