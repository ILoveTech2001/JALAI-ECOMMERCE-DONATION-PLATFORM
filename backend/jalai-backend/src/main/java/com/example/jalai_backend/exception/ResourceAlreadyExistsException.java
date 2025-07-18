package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Resource already exists exception
@ResponseStatus(HttpStatus.CONFLICT)
public class ResourceAlreadyExistsException extends JalaiException {
    public ResourceAlreadyExistsException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue),
              "RESOURCE_ALREADY_EXISTS", HttpStatus.CONFLICT);
    }

    public ResourceAlreadyExistsException(String message) {
        super(message, "RESOURCE_ALREADY_EXISTS", HttpStatus.CONFLICT);
    }
}
