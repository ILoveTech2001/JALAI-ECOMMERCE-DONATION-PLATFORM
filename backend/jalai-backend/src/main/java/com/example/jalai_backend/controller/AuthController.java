package com.example.jalai_backend.controller;

import com.example.jalai_backend.dto.AuthDTOs;
import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Orphanage;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.service.AuthService;
import com.example.jalai_backend.validation.ValidationGroups;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(
            @Validated(ValidationGroups.Login.class) @RequestBody AuthDTOs.LoginRequest loginRequest) {
        Map<String, Object> response = authService.authenticateUser(
                loginRequest.getEmail(),
                loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/client")
    public ResponseEntity<?> registerClient(@Valid @RequestBody Client client) {
        try {
            Map<String, Object> response = authService.registerClient(client);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/register/orphanage")
    public ResponseEntity<?> registerOrphanage(@Valid @RequestBody Orphanage orphanage) {
        try {
            System.out.println("=== ORPHANAGE REGISTRATION REQUEST RECEIVED ===");
            System.out.println("Orphanage Name: " + orphanage.getName());
            System.out.println("Orphanage Email: " + orphanage.getEmail());
            System.out.println("Orphanage Location: " + orphanage.getLocation());
            System.out.println("Orphanage Phone: " + orphanage.getPhoneNumber());

            Map<String, Object> response = authService.registerOrphanage(orphanage);

            System.out.println("Orphanage registration successful!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR in orphanage registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        try {
            Map<String, Object> response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok(new MessageResponse("User logged out successfully!"));
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        try {
            // Check if admin already exists
            if (adminRepository.existsByEmail("admin@jalai.com")) {
                // Delete existing admin
                adminRepository.deleteByEmail("admin@jalai.com");
            }

            // Create new admin
            Admin admin = new Admin();
            admin.setName("System Administrator");
            admin.setEmail("admin@jalai.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setIsActive(true);

            Admin savedAdmin = adminRepository.save(admin);

            Map<String, Object> response = Map.of(
                    "success", true,
                    "message", "Admin user created successfully",
                    "admin", Map.of(
                            "id", savedAdmin.getId(),
                            "name", savedAdmin.getName(),
                            "email", savedAdmin.getEmail(),
                            "isActive", savedAdmin.getIsActive()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Failed to create admin user: " + e.getMessage()));
        }
    }

    // Request/Response DTOs
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class TokenRefreshRequest {
        private String refreshToken;

        public String getRefreshToken() {
            return refreshToken;
        }

        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
