package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Invalid token exception
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidTokenException extends JalaiException {
    public InvalidTokenException(String message) {
        super(message, "INVALID_TOKEN", HttpStatus.UNAUTHORIZED);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, "INVALID_TOKEN", HttpStatus.UNAUTHORIZED, cause);
    }
}
