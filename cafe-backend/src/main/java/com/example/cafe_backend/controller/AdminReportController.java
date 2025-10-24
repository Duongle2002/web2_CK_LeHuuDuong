package com.example.cafe_backend.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.cafe_backend.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','ROOT')")
public class AdminReportController {
    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ReportService.DailyReportResult> daily(@RequestParam String date,
                                                                 @RequestParam(required = false) String zone) {
        LocalDate d = LocalDate.parse(date); // format YYYY-MM-DD
        ZoneId z = zone == null ? ZoneId.systemDefault() : ZoneId.of(zone);
        return ResponseEntity.ok(reportService.daily(d, z));
    }

    @GetMapping("/range")
    public ResponseEntity<ReportService.SummaryReportResult> range(@RequestParam String start,
                                                                   @RequestParam String end,
                                                                   @RequestParam(required = false) String zone) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);
        ZoneId z = zone == null ? ZoneId.systemDefault() : ZoneId.of(zone);
        return ResponseEntity.ok(reportService.range(s, e, z));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ReportService.TopProductItem>> topProducts(@RequestParam String start,
                                                                          @RequestParam String end,
                                                                          @RequestParam(required = false, defaultValue = "10") int limit,
                                                                          @RequestParam(required = false) String zone) {
        LocalDate s = LocalDate.parse(start);
        LocalDate e = LocalDate.parse(end);
        ZoneId z = zone == null ? ZoneId.systemDefault() : ZoneId.of(zone);
        return ResponseEntity.ok(reportService.topProducts(s, e, z, limit));
    }

    // Admin maintenance: backfill missing paidAt for legacy paid orders
    @PostMapping("/maintenance/backfill-paidAt")
    public ResponseEntity<String> backfillPaidAt() {
        long fixed = reportService.backfillPaidAt();
        return ResponseEntity.ok("fixed=" + fixed);
    }
}