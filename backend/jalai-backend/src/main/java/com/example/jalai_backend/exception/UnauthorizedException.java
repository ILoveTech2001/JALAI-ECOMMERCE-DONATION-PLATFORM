package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Unauthorized exception
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends JalaiException {
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED, cause);
    }
}
