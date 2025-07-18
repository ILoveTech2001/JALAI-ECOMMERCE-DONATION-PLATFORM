package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Bad request exception
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends JalaiException {
    public BadRequestException(String message) {
        super(message, "BAD_REQUEST", HttpStatus.BAD_REQUEST);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, "BAD_REQUEST", HttpStatus.BAD_REQUEST, cause);
    }
}
