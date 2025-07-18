package com.example.jalai_backend;

import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Category;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.repository.CategoryRepository;
import com.example.jalai_backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class JalaiBackendApplication implements CommandLineRunner {

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(JalaiBackendApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		try {
			System.out.println("=== ADMIN USER SETUP ===");

			// Check if admin already exists
			boolean adminExists = adminRepository.existsByEmail("admin@jalai.com");
			System.out.println("Admin exists check: " + adminExists);

			// Force create admin user (delete existing if any)
			if (adminExists) {
				System.out.println("Deleting existing admin user...");
				adminRepository.deleteByEmail("admin@jalai.com");
			}

			// Always create admin user
			System.out.println("Creating new admin user...");

			Admin admin = new Admin();
			admin.setName("System Administrator");
			admin.setEmail("admin@jalai.com");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setIsActive(true);

			Admin savedAdmin = adminRepository.save(admin);
			System.out.println("✅ Default admin user created successfully!");
			System.out.println("   Email: admin@jalai.com");
			System.out.println("   Password: admin123");
			System.out.println("   ID: " + savedAdmin.getId());
			System.out.println("   Password Hash: " + savedAdmin.getPassword());

			System.out.println("=== ADMIN SETUP COMPLETE ===");

		} catch (Exception e) {
			System.err.println("❌ Error during admin user setup: " + e.getMessage());
			e.printStackTrace();
		}

		// Create test client user
		try {
			System.out.println("=== TEST CLIENT SETUP ===");

			// Check if test client already exists
			if (clientRepository.existsByEmail("test@jalai.com")) {
				System.out.println("Test client already exists, deleting...");
				clientRepository.findByEmail("test@jalai.com").ifPresent(clientRepository::delete);
			}

			// Create test client
			System.out.println("Creating test client user...");

			Client testClient = new Client();
			testClient.setName("Test User");
			testClient.setEmail("test@jalai.com");
			testClient.setPassword(passwordEncoder.encode("test123"));
			testClient.setPhone("123456789");
			testClient.setLocation("Yaoundé");
			testClient.setIsActive(true);

			Client savedClient = clientRepository.save(testClient);
			System.out.println("✅ Test client user created successfully!");
			System.out.println("   Email: test@jalai.com");
			System.out.println("   Password: test123");
			System.out.println("   ID: " + savedClient.getId());

			System.out.println("=== TEST CLIENT SETUP COMPLETE ===");

		} catch (Exception e) {
			System.err.println("❌ Error during test client setup: " + e.getMessage());
			e.printStackTrace();
		}

		// Create default categories
		try {
			System.out.println("=== CATEGORY SETUP ===");

			if (categoryRepository.count() == 0) {
				System.out.println("Creating default categories...");

				String[] categoryNames = {
						"Electronics", "Clothing", "Books", "Toys",
						"Furniture", "Sports", "Kitchen", "Beauty",
						"Automotive", "Home & Garden"
				};

				String[] categoryDescriptions = {
						"Electronic devices and gadgets",
						"Clothes and fashion items",
						"Books and educational materials",
						"Toys and games for children",
						"Home and office furniture",
						"Sports equipment and accessories",
						"Kitchen appliances and utensils",
						"Beauty and personal care products",
						"Automotive parts and accessories",
						"Home and garden supplies"
				};

				for (int i = 0; i < categoryNames.length; i++) {
					Category category = new Category();
					category.setName(categoryNames[i]);
					category.setDescription(categoryDescriptions[i]);
					category.setIsActive(true);
					categoryRepository.save(category);
				}

				System.out.println("✅ Default categories created successfully!");
			} else {
				System.out.println("Categories already exist, skipping creation.");
			}

			System.out.println("=== CATEGORY SETUP COMPLETE ===");

		} catch (Exception e) {
			System.err.println("❌ Error during category setup: " + e.getMessage());
			e.printStackTrace();
		}
	}

}
