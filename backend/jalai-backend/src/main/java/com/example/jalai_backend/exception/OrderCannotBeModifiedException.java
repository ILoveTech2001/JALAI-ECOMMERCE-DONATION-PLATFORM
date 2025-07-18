package com.example.jalai_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Order cannot be modified exception
@ResponseStatus(HttpStatus.CONFLICT)
public class OrderCannotBeModifiedException extends JalaiException {
    public OrderCannotBeModifiedException(String message) {
        super(message, "ORDER_CANNOT_BE_MODIFIED", HttpStatus.CONFLICT);
    }

    public OrderCannotBeModifiedException(String orderId, String currentStatus) {
        super(String.format("Order '%s' cannot be modified. Current status: %s", orderId, currentStatus),
              "ORDER_CANNOT_BE_MODIFIED", HttpStatus.CONFLICT);
    }
}
