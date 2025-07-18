package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Donation validation exception
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DonationValidationException extends JalaiException {
    public DonationValidationException(String message) {
        super(message, "DONATION_VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
    }

    public DonationValidationException(String message, Throwable cause) {
        super(message, "DONATION_VALIDATION_ERROR", HttpStatus.BAD_REQUEST, cause);
    }
}
