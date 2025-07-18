package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Product not available exception
@ResponseStatus(HttpStatus.CONFLICT)
public class ProductNotAvailableException extends JalaiException {
    public ProductNotAvailableException(String message) {
        super(message, "PRODUCT_NOT_AVAILABLE", HttpStatus.CONFLICT);
    }
}
