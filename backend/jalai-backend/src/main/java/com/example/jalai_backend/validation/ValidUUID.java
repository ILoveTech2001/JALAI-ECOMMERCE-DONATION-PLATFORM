package com.example.jalai_backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;
import java.util.UUID;

@Documented
@Constraint(validatedBy = ValidUUID.UUIDValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidUUID {
    String message() default "Invalid UUID format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    class UUIDValidator implements ConstraintValidator<ValidUUID, String> {
        
        @Override
        public void initialize(ValidUUID constraintAnnotation) {
            // Initialization if needed
        }

        @Override
        public boolean isValid(String uuid, ConstraintValidatorContext context) {
            if (uuid == null || uuid.trim().isEmpty()) {
                return true; // Let @NotBlank handle null/empty validation
            }

            try {
                UUID.fromString(uuid);
                return true;
            } catch (IllegalArgumentException e) {
                return false;
            }
        }
    }
}
