package com.example.cafe_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.cafe_backend.model.CafeTable;
import com.example.cafe_backend.model.TableStatus;

public interface CafeTableRepository extends MongoRepository<CafeTable, String> {
    Optional<CafeTable> findByTableNumber(int tableNumber);
    boolean existsByTableNumber(int tableNumber);

    List<CafeTable> findAllByStatusOrderByTableNumberAsc(TableStatus status);
    List<CafeTable> findAllByStatusInOrderByTableNumberAsc(List<TableStatus> statuses);
}