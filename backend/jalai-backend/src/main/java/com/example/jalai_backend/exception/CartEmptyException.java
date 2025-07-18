package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Cart empty exception
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class CartEmptyException extends JalaiException {
    public CartEmptyException(String message) {
        super(message, "CART_EMPTY", HttpStatus.BAD_REQUEST);
    }

    public CartEmptyException() {
        super("Cart is empty. Cannot proceed with checkout.", "CART_EMPTY", HttpStatus.BAD_REQUEST);
    }
}
