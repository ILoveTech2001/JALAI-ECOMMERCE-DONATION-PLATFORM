package com.example.jalai_backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generate hash for Admin123!
        String adminPassword = "Admin123!";
        String adminHash = encoder.encode(adminPassword);
        System.out.println("Admin password hash for 'Admin123!': " + adminHash);
        
        // Generate hash for Client123!
        String clientPassword = "Client123!";
        String clientHash = encoder.encode(clientPassword);
        System.out.println("Client password hash for 'Client123!': " + clientHash);
        
        // Generate hash for Orphan123!
        String orphanPassword = "Orphan123!";
        String orphanHash = encoder.encode(orphanPassword);
        System.out.println("Orphan password hash for 'Orphan123!': " + orphanHash);
        
        // Test the admin hash
        boolean adminMatches = encoder.matches(adminPassword, adminHash);
        System.out.println("Admin password verification: " + adminMatches);
    }
}
