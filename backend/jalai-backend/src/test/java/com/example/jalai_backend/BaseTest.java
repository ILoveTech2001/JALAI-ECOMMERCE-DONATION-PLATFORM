package com.example.jalai_backend;

import com.example.jalai_backend.model.*;
import com.example.jalai_backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected AdminRepository adminRepository;

    @Autowired
    protected ClientRepository clientRepository;

    @Autowired
    protected OrphanageRepository orphanageRepository;

    @Autowired
    protected CategoryRepository categoryRepository;

    @Autowired
    protected ProductRepository productRepository;

    @Autowired
    protected CartRepository cartRepository;

    @Autowired
    protected OrderRepository orderRepository;

    @Autowired
    protected PaymentRepository paymentRepository;

    @Autowired
    protected ReviewRepository reviewRepository;

    @Autowired
    protected DonationRepository donationRepository;

    // Test data
    protected Admin testAdmin;
    protected Client testClient;
    protected Client testSeller;
    protected Orphanage testOrphanage;
    protected Category testCategory;
    protected Product testProduct;

    @BeforeEach
    void setUp() {
        createTestData();
    }

    protected void createTestData() {
        // Create test admin
        testAdmin = new Admin();
        testAdmin.setName("Test Admin");
        testAdmin.setEmail("testadmin@test.com");
        testAdmin.setPassword(passwordEncoder.encode("TestPass123!"));
        testAdmin.setIsActive(true);
        testAdmin = adminRepository.save(testAdmin);

        // Create test client
        testClient = new Client();
        testClient.setName("Test Client");
        testClient.setEmail("testclient@test.com");
        testClient.setPassword(passwordEncoder.encode("TestPass123!"));
        testClient.setPhone("+1234567890");
        testClient.setLocation("Test City");
        testClient.setIsActive(true);
        testClient = clientRepository.save(testClient);

        // Create test seller
        testSeller = new Client();
        testSeller.setName("Test Seller");
        testSeller.setEmail("testseller@test.com");
        testSeller.setPassword(passwordEncoder.encode("TestPass123!"));
        testSeller.setPhone("+1234567891");
        testSeller.setLocation("Test City");
        testSeller.setIsActive(true);
        testSeller = clientRepository.save(testSeller);

        // Create test orphanage
        testOrphanage = new Orphanage();
        testOrphanage.setName("Test Orphanage");
        testOrphanage.setEmail("testorphanage@test.com");
        testOrphanage.setPassword(passwordEncoder.encode("TestPass123!"));
        testOrphanage.setPhoneNumber("+1234567892");
        testOrphanage.setLocation("Test City");
        testOrphanage.setIsActive(true);
        testOrphanage = orphanageRepository.save(testOrphanage);

        // Create test category
        testCategory = new Category();
        testCategory.setName("Test Category");
        testCategory.setDescription("Test category description");
        testCategory.setIsActive(true);
        testCategory.setManagedBy(testAdmin);
        testCategory = categoryRepository.save(testCategory);

        // Create test product
        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setDescription("Test product description");
        testProduct.setPrice(new BigDecimal("99.99"));
        testProduct.setImageUrl("http://test.com/image.jpg");
        testProduct.setSeller(testSeller);
        testProduct.setCategory(testCategory);
        testProduct.setIsApproved(true);
        testProduct.setIsAvailable(true);
        testProduct.setIsDonated(false);
        testProduct = productRepository.save(testProduct);
    }

    protected String asJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected <T> T fromJsonString(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // Helper methods for creating test entities
    protected Client createTestClient(String name, String email) {
        Client client = new Client();
        client.setName(name);
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode("TestPass123!"));
        client.setIsActive(true);
        return clientRepository.save(client);
    }

    protected Product createTestProduct(String name, BigDecimal price, Client seller, Category category) {
        Product product = new Product();
        product.setName(name);
        product.setDescription("Test product: " + name);
        product.setPrice(price);
        product.setSeller(seller);
        product.setCategory(category);
        product.setIsApproved(true);
        product.setIsAvailable(true);
        product.setIsDonated(false);
        return productRepository.save(product);
    }

    protected Order createTestOrder(Client client, Client seller, BigDecimal totalAmount) {
        Order order = new Order();
        order.setClient(client);
        order.setSeller(seller);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryDate(LocalDateTime.now().plusDays(7));
        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    protected Donation createTestDonation(Client client, Orphanage orphanage, 
                                        Donation.DonationType type, BigDecimal amount) {
        Donation donation = new Donation();
        donation.setClient(client);
        donation.setOrphanage(orphanage);
        donation.setUserId(client.getId());
        donation.setOrphanageId(orphanage.getId());
        donation.setDonationType(type);
        donation.setStatus(Donation.DonationStatus.PENDING);
        donation.setAppointmentDate(LocalDateTime.now().plusDays(3));
        donation.setCashAmount(amount);
        donation.setIsConfirmed(false);
        return donationRepository.save(donation);
    }

    protected Cart createTestCartItem(Client client, Product product, Integer quantity) {
        Cart cart = new Cart();
        cart.setClient(client);
        cart.setProduct(product);
        cart.setQuantity(quantity);
        cart.setProductPrice(product.getPrice());
        return cartRepository.save(cart);
    }

    protected Review createTestReview(Client client, Product product, Integer rating, String comment) {
        Review review = new Review();
        review.setClient(client);
        review.setProduct(product);
        review.setClientId(client.getId());
        review.setProductId(product.getId());
        review.setRating(rating);
        review.setComment(comment);
        review.setDate(new java.util.Date());
        return reviewRepository.save(review);
    }

    // Utility methods for assertions
    protected void assertEntityExists(UUID id, String entityType) {
        switch (entityType.toLowerCase()) {
            case "client":
                assert clientRepository.existsById(id) : "Client should exist";
                break;
            case "product":
                assert productRepository.existsById(id) : "Product should exist";
                break;
            case "order":
                assert orderRepository.existsById(id) : "Order should exist";
                break;
            case "donation":
                assert donationRepository.existsById(id) : "Donation should exist";
                break;
            default:
                throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    protected void assertEntityNotExists(UUID id, String entityType) {
        switch (entityType.toLowerCase()) {
            case "client":
                assert !clientRepository.existsById(id) : "Client should not exist";
                break;
            case "product":
                assert !productRepository.existsById(id) : "Product should not exist";
                break;
            case "order":
                assert !orderRepository.existsById(id) : "Order should not exist";
                break;
            case "donation":
                assert !donationRepository.existsById(id) : "Donation should not exist";
                break;
            default:
                throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }
}
