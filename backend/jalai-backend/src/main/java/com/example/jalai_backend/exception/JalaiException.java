package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;

// Base custom exception
public class JalaiException extends RuntimeException {
    private final String errorCode;
    private final HttpStatus httpStatus;

    public JalaiException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public JalaiException(String message, String errorCode, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
