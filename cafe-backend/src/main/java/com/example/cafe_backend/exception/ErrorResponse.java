package com.example.cafe_backend.exception;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;   // reason phrase
    private String message; // human-readable message
    private String path;    // request path
    private List<FieldErrorItem> errors; // optional validation details

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldErrorItem {
        private String field;
        private String message;
    }
}
