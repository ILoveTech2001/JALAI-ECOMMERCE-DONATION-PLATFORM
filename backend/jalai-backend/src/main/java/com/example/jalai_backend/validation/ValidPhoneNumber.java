package com.example.jalai_backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;
import java.util.regex.Pattern;

@Documented
@Constraint(validatedBy = ValidPhoneNumber.PhoneNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {
    String message() default "Phone number must be valid (e.g., +1234567890 or 1234567890)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
        
        private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^(\\+\\d{1,3}[- ]?)?\\d{10}$"
        );

        @Override
        public void initialize(ValidPhoneNumber constraintAnnotation) {
            // Initialization if needed
        }

        @Override
        public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return true; // Let @NotBlank handle null/empty validation
            }

            // Remove spaces and dashes for validation
            String cleanedNumber = phoneNumber.replaceAll("[\\s-]", "");
            
            return PHONE_PATTERN.matcher(cleanedNumber).matches();
        }
    }
}
