package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Category;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultCategories();
        initializeDefaultAdmin();
    }

    private void initializeDefaultCategories() {
        // Check if categories already exist
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = Arrays.asList(
                "Clothing",
                "Footwear", 
                "Utensils",
                "Electronics",
                "Furniture"
            );

            for (String categoryName : defaultCategories) {
                Category category = new Category();
                category.setName(categoryName);
                category.setDescription("Default " + categoryName.toLowerCase() + " category");
                category.setIsActive(true);
                categoryRepository.save(category);
            }

            System.out.println("✅ Default categories initialized: " + defaultCategories);
        } else {
            System.out.println("📋 Categories already exist, skipping initialization");
        }
    }

    private void initializeDefaultAdmin() {
        // Check if admin already exists
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setName("System Admin");
            admin.setEmail("admin@jalai.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setIsActive(true);
            adminRepository.save(admin);

            System.out.println("✅ Default admin created: admin@jalai.com / admin123");
        } else {
            System.out.println("👤 Admin already exists, skipping initialization");
        }
    }
}
