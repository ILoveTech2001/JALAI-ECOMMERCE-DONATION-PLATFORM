package com.example.jalai_backend.dto;

import com.example.jalai_backend.validation.ValidPassword;
import com.example.jalai_backend.validation.ValidPhoneNumber;
import com.example.jalai_backend.validation.ValidationGroups;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs for authentication endpoints
 */
public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank(message = "Email is required", groups = ValidationGroups.Login.class)
        @Email(message = "Email should be valid", groups = ValidationGroups.Login.class)
        private String email;

        @NotBlank(message = "Password is required", groups = ValidationGroups.Login.class)
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ClientRegistrationRequest {
        @NotBlank(message = "Name is required", groups = ValidationGroups.Registration.class)
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters", groups = ValidationGroups.Registration.class)
        private String name;

        @NotBlank(message = "Email is required", groups = ValidationGroups.Registration.class)
        @Email(message = "Email should be valid", groups = ValidationGroups.Registration.class)
        private String email;

        @NotBlank(message = "Password is required", groups = ValidationGroups.Registration.class)
        @ValidPassword(groups = ValidationGroups.Registration.class)
        private String password;

        @ValidPhoneNumber(groups = ValidationGroups.Registration.class)
        private String phone;

        @Size(max = 255, message = "Location must not exceed 255 characters", groups = ValidationGroups.Registration.class)
        private String location;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }

    public static class OrphanageRegistrationRequest {
        @NotBlank(message = "Orphanage name is required", groups = ValidationGroups.Registration.class)
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters", groups = ValidationGroups.Registration.class)
        private String name;

        @NotBlank(message = "Email is required", groups = ValidationGroups.Registration.class)
        @Email(message = "Email should be valid", groups = ValidationGroups.Registration.class)
        private String email;

        @NotBlank(message = "Password is required", groups = ValidationGroups.Registration.class)
        @ValidPassword(groups = ValidationGroups.Registration.class)
        private String password;

        @ValidPhoneNumber(groups = ValidationGroups.Registration.class)
        private String phoneNumber;

        @Size(max = 500, message = "Location must not exceed 500 characters", groups = ValidationGroups.Registration.class)
        private String location;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }

    public static class TokenRefreshRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class PasswordChangeRequest {
        @NotBlank(message = "Current password is required", groups = ValidationGroups.Password.class)
        private String currentPassword;

        @NotBlank(message = "New password is required", groups = ValidationGroups.Password.class)
        @ValidPassword(groups = ValidationGroups.Password.class)
        private String newPassword;

        @NotBlank(message = "Confirm password is required", groups = ValidationGroups.Password.class)
        private String confirmPassword;

        // Getters and setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

        // Custom validation method
        public boolean isPasswordMatching() {
            return newPassword != null && newPassword.equals(confirmPassword);
        }
    }

    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long expiresIn;
        private UserInfo user;

        // Getters and setters
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }
        public Long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }
        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }
    }

    public static class UserInfo {
        private String id;
        private String name;
        private String email;
        private String userType;
        private Boolean isActive;

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUserType() { return userType; }
        public void setUserType(String userType) { this.userType = userType; }
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }
}
