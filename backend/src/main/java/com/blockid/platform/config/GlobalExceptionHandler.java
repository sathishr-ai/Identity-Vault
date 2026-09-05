package com.blockid.platform.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(org.springframework.security.authentication.LockedException.class)
    public ResponseEntity<?> handleLocked(Exception e) {
        return ResponseEntity.status(403).body(Map.of("message",
                "Your account has been temporarily blocked due to security concerns or fraudulent documentation."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("message", "Server Error: " + e.getMessage() + " | Cause: "
                + (e.getCause() != null ? e.getCause().getMessage() : "none")));
    }
}
