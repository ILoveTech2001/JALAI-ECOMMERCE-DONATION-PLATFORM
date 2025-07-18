package com.example.jalai_backend.util;

import com.example.jalai_backend.exception.BadRequestException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ValidationUtil {

    @Autowired
    private Validator validator;

    /**
     * Validates an object and throws BadRequestException if validation fails
     */
    public <T> void validateAndThrow(T object, Class<?>... groups) {
        Set<ConstraintViolation<T>> violations = validator.validate(object, groups);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            throw new BadRequestException("Validation failed: " + errorMessage);
        }
    }

    /**
     * Validates an object and returns validation errors
     */
    public <T> Set<ConstraintViolation<T>> validate(T object, Class<?>... groups) {
        return validator.validate(object, groups);
    }

    /**
     * Checks if an object is valid
     */
    public <T> boolean isValid(T object, Class<?>... groups) {
        return validator.validate(object, groups).isEmpty();
    }

    /**
     * Validates a property of an object
     */
    public <T> Set<ConstraintViolation<T>> validateProperty(T object, String propertyName, Class<?>... groups) {
        return validator.validateProperty(object, propertyName, groups);
    }

    /**
     * Validates a property value
     */
    public <T> Set<ConstraintViolation<T>> validateValue(Class<T> beanType, String propertyName, Object value,
            Class<?>... groups) {
        return validator.validateValue(beanType, propertyName, value, groups);
    }

    /**
     * Formats validation errors into a readable string
     */
    public <T> String formatValidationErrors(Set<ConstraintViolation<T>> violations) {
        return violations.stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining(", "));
    }

    /**
     * Validates email format
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    /**
     * Validates UUID format
     */
    public boolean isValidUUID(String uuid) {
        if (uuid == null || uuid.trim().isEmpty()) {
            return false;
        }
        try {
            java.util.UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Validates phone number format
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        String cleanedNumber = phoneNumber.replaceAll("[\\s-]", "");
        return cleanedNumber.matches("^(\\+\\d{1,3}[- ]?)?\\d{10}$");
    }

    /**
     * Validates password strength
     */
    public boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        // Check for at least one uppercase letter
        if (!password.matches(".*[A-Z].*")) {
            return false;
        }

        // Check for at least one lowercase letter
        if (!password.matches(".*[a-z].*")) {
            return false;
        }

        // Check for at least one digit
        if (!password.matches(".*\\d.*")) {
            return false;
        }

        // Check for at least one special character
        return password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");
    }

    /**
     * Validates that a string is not null, empty, or just whitespace
     */
    public boolean isNotBlank(String str) {
        return str != null && !str.trim().isEmpty();
    }

    /**
     * Validates that a number is positive
     */
    public boolean isPositive(Number number) {
        return number != null && number.doubleValue() > 0;
    }

    /**
     * Validates that a number is non-negative
     */
    public boolean isNonNegative(Number number) {
        return number != null && number.doubleValue() >= 0;
    }
}
