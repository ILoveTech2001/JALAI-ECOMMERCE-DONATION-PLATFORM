package com.example.jalai_backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidPassword.PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {
    String message() default "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    class PasswordValidator implements ConstraintValidator<ValidPassword, String> {
        
        @Override
        public void initialize(ValidPassword constraintAnnotation) {
            // Initialization if needed
        }

        @Override
        public boolean isValid(String password, ConstraintValidatorContext context) {
            if (password == null) {
                return false;
            }

            // Password must be at least 8 characters long
            if (password.length() < 8) {
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
            if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
                return false;
            }

            return true;
        }
    }
}
