package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// File upload exception
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class FileUploadException extends JalaiException {
    public FileUploadException(String message) {
        super(message, "FILE_UPLOAD_ERROR", HttpStatus.BAD_REQUEST);
    }

    public FileUploadException(String message, Throwable cause) {
        super(message, "FILE_UPLOAD_ERROR", HttpStatus.BAD_REQUEST, cause);
    }
}
