package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Business logic exception
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class BusinessLogicException extends JalaiException {
    public BusinessLogicException(String message) {
        super(message, "BUSINESS_LOGIC_ERROR", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public BusinessLogicException(String message, Throwable cause) {
        super(message, "BUSINESS_LOGIC_ERROR", HttpStatus.UNPROCESSABLE_ENTITY, cause);
    }
}
