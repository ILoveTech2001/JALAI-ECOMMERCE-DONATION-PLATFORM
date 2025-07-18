package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Authentication exception
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthenticationException extends JalaiException {
    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_FAILED", HttpStatus.UNAUTHORIZED);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, "AUTHENTICATION_FAILED", HttpStatus.UNAUTHORIZED, cause);
    }
}
