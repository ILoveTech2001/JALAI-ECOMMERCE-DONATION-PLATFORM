package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Insufficient permissions exception
@ResponseStatus(HttpStatus.FORBIDDEN)
public class InsufficientPermissionsException extends JalaiException {
    public InsufficientPermissionsException(String message) {
        super(message, "INSUFFICIENT_PERMISSIONS", HttpStatus.FORBIDDEN);
    }

    public InsufficientPermissionsException(String message, Throwable cause) {
        super(message, "INSUFFICIENT_PERMISSIONS", HttpStatus.FORBIDDEN, cause);
    }
}
