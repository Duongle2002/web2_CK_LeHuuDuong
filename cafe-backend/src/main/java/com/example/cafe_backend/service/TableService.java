package com.example.cafe_backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.cafe_backend.dto.CreateTableRequest;
import com.example.cafe_backend.dto.ReserveTableRequest;
import com.example.cafe_backend.model.CafeTable;
import com.example.cafe_backend.model.TableStatus;
import com.example.cafe_backend.repository.CafeTableRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class TableService {
    private final CafeTableRepository tableRepository;

    public CafeTable create(CreateTableRequest req) {
        if (tableRepository.existsByTableNumber(req.getTableNumber())) {
            throw new ResponseStatusException(CONFLICT, "Table number already exists");
        }
        CafeTable t = CafeTable.builder()
                .tableNumber(req.getTableNumber())
                .capacity(req.getCapacity())
                .note(req.getNote())
                .status(TableStatus.AVAILABLE)
                .build();
        return tableRepository.save(t);
    }

    public List<CafeTable> listAll() {
        return tableRepository.findAll();
    }

    public List<CafeTable> listByReservedUser(String userId) {
        // tạm thời filter ở memory (Mongo repo chưa có method); dataset thường nhỏ
        return tableRepository.findAll().stream()
                .filter(t -> userId != null && userId.equals(t.getReservedByUserId()))
                .toList();
    }

    public CafeTable getById(String id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Table not found"));
    }

    public CafeTable updateStatus(String id, TableStatus status) {
        CafeTable t = getById(id);
        t.setStatus(status);
        t.setUpdatedAt(Instant.now());
        if (status != TableStatus.OCCUPIED) {
            t.setCurrentOrderId(null);
        }
        return tableRepository.save(t);
    }

    public CafeTable reserve(String id, ReserveTableRequest req) {
        CafeTable t = getById(id);
        if (t.getStatus() != TableStatus.AVAILABLE) {
            throw new ResponseStatusException(BAD_REQUEST, "Table is not available");
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String reservedBy = auth != null ? auth.getName() : null;
        t.setStatus(TableStatus.RESERVED);
        t.setNote(req.getNote());
        t.setReservedByUserId(reservedBy);
        t.setReservedAt(Instant.now());
        t.setUpdatedAt(Instant.now());
        return tableRepository.save(t);
    }

    public void release(String id) {
        CafeTable t = getById(id);
        t.setStatus(TableStatus.AVAILABLE);
        t.setCurrentOrderId(null);
        t.setReservedByUserId(null);
        t.setReservedAt(null);
        t.setUpdatedAt(Instant.now());
        tableRepository.save(t);
    }
}