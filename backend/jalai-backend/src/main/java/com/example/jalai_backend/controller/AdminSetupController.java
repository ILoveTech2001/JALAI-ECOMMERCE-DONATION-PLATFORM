package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "*")
public class AdminSetupController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, Object>> createAdmin() {
        Map<String, Object> response = new HashMap<>();
        
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
            
            response.put("success", true);
            response.put("message", "Admin user created successfully");
            response.put("admin", Map.of(
                "id", savedAdmin.getId(),
                "name", savedAdmin.getName(),
                "email", savedAdmin.getEmail(),
                "isActive", savedAdmin.getIsActive()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create admin user: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/check-admin")
    public ResponseEntity<Map<String, Object>> checkAdmin() {
        Map<String, Object> response = new HashMap<>();
        
        boolean adminExists = adminRepository.existsByEmail("admin@jalai.com");
        response.put("adminExists", adminExists);
        
        if (adminExists) {
            Admin admin = adminRepository.findByEmail("admin@jalai.com").orElse(null);
            if (admin != null) {
                response.put("admin", Map.of(
                    "id", admin.getId(),
                    "name", admin.getName(),
                    "email", admin.getEmail(),
                    "isActive", admin.getIsActive()
                ));
            }
        }
        
        return ResponseEntity.ok(response);
    }
}
