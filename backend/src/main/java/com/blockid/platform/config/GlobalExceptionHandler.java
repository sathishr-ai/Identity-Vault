package com.blockid.platform.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("message", "Server Error: " + e.getMessage() + " | Cause: "
                + (e.getCause() != null ? e.getCause().getMessage() : "none")));
    }
}
