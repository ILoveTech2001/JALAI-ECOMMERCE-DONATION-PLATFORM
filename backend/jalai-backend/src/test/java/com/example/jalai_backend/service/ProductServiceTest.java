package com.example.jalai_backend.service;

import com.example.jalai_backend.BaseTest;
import com.example.jalai_backend.model.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ProductServiceTest extends BaseTest {

    @Autowired
    private ProductService productService;

    @Test
    void getAllAvailableProducts_ShouldReturnOnlyAvailableProducts() {
        // Given
        createTestProduct("Unavailable Product", new BigDecimal("50.00"), testSeller, testCategory);
        Product unavailableProduct = productRepository.findAll().stream()
                .filter(p -> p.getName().equals("Unavailable Product"))
                .findFirst().orElse(null);
        assertNotNull(unavailableProduct);
        unavailableProduct.setIsAvailable(false);
        productRepository.save(unavailableProduct);

        // When
        List<Product> availableProducts = productService.getAllAvailableProducts();

        // Then
        assertFalse(availableProducts.isEmpty());
        assertTrue(availableProducts.stream().allMatch(Product::getIsAvailable));
        assertFalse(availableProducts.stream().anyMatch(p -> p.getName().equals("Unavailable Product")));
    }

    @Test
    void getAvailableProductsWithPagination_ShouldReturnPagedResults() {
        // Given
        for (int i = 1; i <= 15; i++) {
            createTestProduct("Product " + i, new BigDecimal("10.00"), testSeller, testCategory);
        }
        Pageable pageable = PageRequest.of(0, 10);

        // When
        Page<Product> productPage = productService.getAvailableProductsWithPagination(pageable);

        // Then
        assertNotNull(productPage);
        assertTrue(productPage.getContent().size() <= 10);
        assertTrue(productPage.getTotalElements() >= 15);
    }

    @Test
    void getProductById_WithExistingId_ShouldReturnProduct() {
        // When
        Optional<Product> foundProduct = productService.getProductById(testProduct.getId());

        // Then
        assertTrue(foundProduct.isPresent());
        assertEquals(testProduct.getId(), foundProduct.get().getId());
        assertEquals(testProduct.getName(), foundProduct.get().getName());
    }

    @Test
    void getProductById_WithNonExistingId_ShouldReturnEmpty() {
        // Given
        java.util.UUID nonExistentId = java.util.UUID.randomUUID();

        // When
        Optional<Product> foundProduct = productService.getProductById(nonExistentId);

        // Then
        assertFalse(foundProduct.isPresent());
    }

    @Test
    void createProduct_WithValidData_ShouldCreateProduct() {
        // Given
        Product newProduct = new Product();
        newProduct.setName("New Test Product");
        newProduct.setDescription("New product description");
        newProduct.setPrice(new BigDecimal("199.99"));
        newProduct.setImageUrl("http://test.com/newimage.jpg");

        // When
        Product createdProduct = productService.createProduct(newProduct, testSeller.getId(), testCategory.getId());

        // Then
        assertNotNull(createdProduct);
        assertNotNull(createdProduct.getId());
        assertEquals("New Test Product", createdProduct.getName());
        assertEquals(testSeller.getId(), createdProduct.getSeller().getId());
        assertEquals(testCategory.getId(), createdProduct.getCategory().getId());
        assertTrue(createdProduct.getIsAvailable());
        assertFalse(createdProduct.getIsApproved()); // Should require approval
        assertFalse(createdProduct.getIsDonated());
    }

    @Test
    void createProduct_WithInvalidSeller_ShouldThrowException() {
        // Given
        Product newProduct = new Product();
        newProduct.setName("Invalid Seller Product");
        newProduct.setPrice(new BigDecimal("99.99"));
        java.util.UUID invalidSellerId = java.util.UUID.randomUUID();

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            productService.createProduct(newProduct, invalidSellerId, testCategory.getId());
        });
    }

    @Test
    void updateProduct_WithValidData_ShouldUpdateProduct() {
        // Given
        Product updatedData = new Product();
        updatedData.setName("Updated Product Name");
        updatedData.setDescription("Updated description");
        updatedData.setPrice(new BigDecimal("299.99"));
        updatedData.setImageUrl("http://test.com/updatedimage.jpg");

        // When
        Product updatedProduct = productService.updateProduct(testProduct.getId(), updatedData);

        // Then
        assertNotNull(updatedProduct);
        assertEquals("Updated Product Name", updatedProduct.getName());
        assertEquals("Updated description", updatedProduct.getDescription());
        assertEquals(new BigDecimal("299.99"), updatedProduct.getPrice());
        assertEquals("http://test.com/updatedimage.jpg", updatedProduct.getImageUrl());
    }

    @Test
    void approveProduct_WithValidData_ShouldApproveProduct() {
        // Given
        testProduct.setIsApproved(false);
        productRepository.save(testProduct);

        // When
        Product approvedProduct = productService.approveProduct(testProduct.getId(), testAdmin.getId());

        // Then
        assertNotNull(approvedProduct);
        assertTrue(approvedProduct.getIsApproved());
        assertEquals(testAdmin.getId(), approvedProduct.getApprovedBy().getId());
    }

    @Test
    void rejectProduct_ShouldRejectAndMakeUnavailable() {
        // Given
        testProduct.setIsApproved(true);
        testProduct.setIsAvailable(true);
        productRepository.save(testProduct);

        // When
        Product rejectedProduct = productService.rejectProduct(testProduct.getId(), testAdmin.getId(),
                "Test rejection reason");

        // Then
        assertNotNull(rejectedProduct);
        assertFalse(rejectedProduct.getIsApproved());
        assertFalse(rejectedProduct.getIsAvailable());
    }

    @Test
    void markAsDonated_ShouldSetDonatedAndUnavailable() {
        // When
        productService.markAsDonated(testProduct.getId());

        // Then
        Product donatedProduct = productRepository.findById(testProduct.getId()).orElse(null);
        assertNotNull(donatedProduct);
        assertTrue(donatedProduct.getIsDonated());
        assertFalse(donatedProduct.getIsAvailable());
    }

    @Test
    void searchProductsByKeyword_ShouldReturnMatchingProducts() {
        // Given
        createTestProduct("Smartphone iPhone", new BigDecimal("800.00"), testSeller, testCategory);
        createTestProduct("Android Phone", new BigDecimal("600.00"), testSeller, testCategory);
        createTestProduct("Laptop Computer", new BigDecimal("1200.00"), testSeller, testCategory);

        // When
        List<Product> phoneProducts = productService.searchProductsByKeyword("phone");

        // Then
        assertFalse(phoneProducts.isEmpty());
        assertTrue(phoneProducts.stream().anyMatch(p -> p.getName().contains("iPhone")));
        assertTrue(phoneProducts.stream().anyMatch(p -> p.getName().contains("Phone")));
        assertFalse(phoneProducts.stream().anyMatch(p -> p.getName().contains("Laptop")));
    }

    @Test
    void getProductsByPriceRange_ShouldReturnProductsInRange() {
        // Given
        createTestProduct("Cheap Product", new BigDecimal("25.00"), testSeller, testCategory);
        createTestProduct("Mid Product", new BigDecimal("150.00"), testSeller, testCategory);
        createTestProduct("Expensive Product", new BigDecimal("500.00"), testSeller, testCategory);

        // When
        List<Product> midRangeProducts = productService.getProductsByPriceRange(
                new BigDecimal("50.00"), new BigDecimal("200.00"));

        // Then
        assertFalse(midRangeProducts.isEmpty());
        assertTrue(midRangeProducts.stream().allMatch(p -> p.getPrice().compareTo(new BigDecimal("50.00")) >= 0 &&
                p.getPrice().compareTo(new BigDecimal("200.00")) <= 0));
    }

    @Test
    void getProductsBySeller_ShouldReturnSellerProducts() {
        // Given
        createTestProduct("Seller Product 1", new BigDecimal("100.00"), testSeller, testCategory);
        createTestProduct("Seller Product 2", new BigDecimal("200.00"), testSeller, testCategory);
        createTestProduct("Other Product", new BigDecimal("300.00"), testClient, testCategory);

        // When
        List<Product> sellerProducts = productService.getProductsBySeller(testSeller.getId());

        // Then
        assertFalse(sellerProducts.isEmpty());
        assertTrue(sellerProducts.stream().allMatch(p -> p.getSeller().getId().equals(testSeller.getId())));
        assertTrue(sellerProducts.size() >= 3); // Including the original testProduct
    }

    @Test
    void getPendingApprovalProducts_ShouldReturnUnapprovedProducts() {
        // Given
        Product unapprovedProduct = createTestProduct("Unapproved Product", new BigDecimal("100.00"), testSeller,
                testCategory);
        unapprovedProduct.setIsApproved(false);
        productRepository.save(unapprovedProduct);

        // When
        List<Product> pendingProducts = productService.getPendingApprovalProducts();

        // Then
        assertFalse(pendingProducts.isEmpty());
        assertTrue(pendingProducts.stream().allMatch(p -> !p.getIsApproved()));
        assertTrue(pendingProducts.stream().anyMatch(p -> p.getName().equals("Unapproved Product")));
    }

    @Test
    void deleteProduct_WithExistingProduct_ShouldDeleteProduct() {
        // Given
        Product productToDelete = createTestProduct("Product to Delete", new BigDecimal("50.00"), testSeller,
                testCategory);
        java.util.UUID productId = productToDelete.getId();

        // When
        productService.deleteProduct(productId);

        // Then
        assertFalse(productRepository.existsById(productId));
    }

    @Test
    void deleteProduct_WithNonExistingProduct_ShouldThrowException() {
        // Given
        java.util.UUID nonExistentId = java.util.UUID.randomUUID();

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            productService.deleteProduct(nonExistentId);
        });
    }
}
