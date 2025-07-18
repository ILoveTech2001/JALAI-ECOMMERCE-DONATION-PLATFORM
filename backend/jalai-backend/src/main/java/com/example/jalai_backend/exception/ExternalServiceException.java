package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// External service exception
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ExternalServiceException extends JalaiException {
    public ExternalServiceException(String message) {
        super(message, "EXTERNAL_SERVICE_ERROR", HttpStatus.SERVICE_UNAVAILABLE);
    }

    public ExternalServiceException(String message, Throwable cause) {
        super(message, "EXTERNAL_SERVICE_ERROR", HttpStatus.SERVICE_UNAVAILABLE, cause);
    }

    public ExternalServiceException(String serviceName, String operation) {
        super(String.format("External service '%s' failed during operation: %s", serviceName, operation),
              "EXTERNAL_SERVICE_ERROR", HttpStatus.SERVICE_UNAVAILABLE);
    }
}
