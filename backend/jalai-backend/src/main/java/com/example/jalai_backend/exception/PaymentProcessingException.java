package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Payment processing exception
@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
public class PaymentProcessingException extends JalaiException {
    public PaymentProcessingException(String message) {
        super(message, "PAYMENT_PROCESSING_ERROR", HttpStatus.PAYMENT_REQUIRED);
    }

    public PaymentProcessingException(String message, Throwable cause) {
        super(message, "PAYMENT_PROCESSING_ERROR", HttpStatus.PAYMENT_REQUIRED, cause);
    }
}
