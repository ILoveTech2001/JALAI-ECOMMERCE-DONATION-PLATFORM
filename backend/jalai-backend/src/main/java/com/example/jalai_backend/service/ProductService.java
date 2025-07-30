package com.example.jalai_backend.service;

import com.example.jalai_backend.dto.ProductSummaryDTO;
import com.example.jalai_backend.dto.ProductDetailDTO;
import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Category;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Product;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.repository.CategoryRepository;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AdminRepository adminRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getAllAvailableProducts() {
        return productRepository.findByIsAvailableTrue();
    }

    @Cacheable(value = "approvedProducts", unless = "#result.size() == 0")
    public List<Product> getAllApprovedProducts() {
        return productRepository.findByIsApprovedTrue();
    }

    public Page<Product> getAvailableProductsWithPagination(Pageable pageable) {
        return productRepository.findByIsAvailableTrue(pageable);
    }

    public Optional<Product> getProductById(UUID id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(UUID categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public Page<Product> getProductsByCategoryWithPagination(UUID categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdWithPagination(categoryId, pageable);
    }

    public List<Product> getProductsBySeller(UUID sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> searchProductsByKeyword(String keyword) {
        return productRepository.searchByKeyword(keyword);
    }

    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    @CacheEvict(value = {"clientProducts", "approvedProducts"}, key = "#sellerId")
    public Product createProduct(Product product, UUID sellerId, UUID categoryId) {
        // Validate seller
        Client seller = clientRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));

        // Validate category if provided
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            product.setCategory(category);
        }

        // Set seller and default values
        product.setSeller(seller);
        product.setIsAvailable(true);
        product.setIsApproved(false); // Requires admin approval
        product.setIsDonated(false);

        return productRepository.save(product);
    }

    public Product updateProduct(UUID id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Update fields
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setImageUrl(productDetails.getImageUrl());

        // Update category if provided
        if (productDetails.getCategory() != null) {
            Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        return productRepository.save(product);
    }

    public Product approveProduct(UUID productId, UUID adminId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + adminId));

        product.setIsApproved(true);
        product.setApprovedBy(admin);

        Product savedProduct = productRepository.save(product);

        // Send notification to the seller
        notificationService.processProductApproval(savedProduct, admin);

        return savedProduct;
    }

    public Product rejectProduct(UUID productId, UUID adminId, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + adminId));

        product.setIsApproved(false);
        product.setIsAvailable(false);

        Product savedProduct = productRepository.save(product);

        // Send notification to the seller
        notificationService.processProductRejection(savedProduct, admin, reason);

        return savedProduct;
    }

    public void markAsUnavailable(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setIsAvailable(false);
        productRepository.save(product);
    }

    public void markAsAvailable(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setIsAvailable(true);
        productRepository.save(product);
    }

    public void markAsDonated(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setIsDonated(true);
        product.setIsAvailable(false);
        productRepository.save(product);
    }

    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    public List<Product> getPendingApprovalProducts() {
        return productRepository.findByIsApprovedFalse();
    }

    public List<Product> getProductsApprovedByAdmin(UUID adminId) {
        return productRepository.findByApprovedByAdminId(adminId);
    }

    public List<Product> getTopRatedProducts() {
        return productRepository.findTopRatedProducts();
    }

    public List<Product> getRecentProducts() {
        return productRepository.findRecentProducts();
    }

    public long getProductCountByCategory(UUID categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }

    public List<Product> getDonatedProducts() {
        return productRepository.findByIsDonatedTrue();
    }

    // Business methods implementation
    public void addToCart(UUID productId) {
        Product product = getProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getIsAvailable() || !product.getIsApproved()) {
            throw new RuntimeException("Product is not available for purchase");
        }

        // Business logic for adding to cart would go here
    }

    public void sellProduct(UUID productId) {
        getProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Business logic for selling product would go here
        markAsUnavailable(productId);
    }

    public void buyProduct(UUID productId) {
        Product product = getProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getIsAvailable() || !product.getIsApproved()) {
            throw new RuntimeException("Product is not available for purchase");
        }

        // Business logic for buying product would go here
        markAsUnavailable(productId);
    }

    // Convert Product to ProductSummaryDTO to avoid large image data in list
    // responses
    private ProductSummaryDTO convertToSummaryDTO(Product product) {
        ProductSummaryDTO dto = new ProductSummaryDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setIsDonated(product.getIsDonated());
        dto.setIsApproved(product.getIsApproved());
        dto.setIsAvailable(product.getIsAvailable());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        // Set seller info
        if (product.getSeller() != null) {
            dto.setSellerId(product.getSeller().getId());
            dto.setSellerName(product.getSeller().getName());
        }

        // Set category info
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        // Set approved by admin info
        if (product.getApprovedBy() != null) {
            dto.setApprovedByAdminId(product.getApprovedBy().getId());
            dto.setApprovedByAdminName(product.getApprovedBy().getName());
        }

        // Set derived fields for admin dashboard
        if (product.getIsApproved() && product.getIsAvailable()) {
            dto.setStatus("active");
        } else if (!product.getIsApproved()) {
            dto.setStatus("pending");
        } else {
            dto.setStatus("inactive");
        }

        // Format date
        if (product.getCreatedAt() != null) {
            dto.setDateAdded(product.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        }

        // Include full image URL for admin dashboard (they need to see the actual
        // image)
        dto.setImageUrlThumbnail(product.getImageUrl());

        // Placeholder values for now
        dto.setSales(0);
        dto.setStock(1);

        return dto;
    }

    // Get products as summary DTOs for list views
    public Page<ProductSummaryDTO> getProductSummariesWithPagination(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        List<ProductSummaryDTO> summaries = products.getContent().stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(summaries, pageable, products.getTotalElements());
    }

    public Page<ProductSummaryDTO> getAvailableProductSummariesWithPagination(Pageable pageable) {
        Page<Product> products = productRepository.findByIsAvailableTrue(pageable);
        List<ProductSummaryDTO> summaries = products.getContent().stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(summaries, pageable, products.getTotalElements());
    }

    @Transactional
    public void approveProduct(UUID productId, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setIsApproved(true);
        product.setIsAvailable(true);

        // Set the admin who approved it (get from security context)
        // For now, we'll leave it as is since we don't have the admin context here

        productRepository.save(product);

        // Send notification to the seller about approval
        try {
            // Get the first admin for now (in a real app, get from security context)
            Admin approver = adminRepository.findAll().stream().findFirst()
                    .orElse(null);
            if (approver != null) {
                System.out.println("✅ Sending approval notification for product: " + product.getName() + " to seller: "
                        + product.getSeller().getName());
                notificationService.processProductApproval(product, approver);
                System.out.println("✅ Approval notification sent successfully");
            } else {
                System.err.println("❌ No admin found to send approval notification");
            }
        } catch (Exception e) {
            // Log the error but don't fail the approval process
            System.err.println("❌ Failed to send approval notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void rejectProduct(UUID productId, String reason) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setIsApproved(false);
        product.setIsAvailable(false);

        productRepository.save(product);

        // Send notification to the seller about rejection with reason
        try {
            // Get the first admin for now (in a real app, get from security context)
            Admin rejector = adminRepository.findAll().stream().findFirst()
                    .orElse(null);
            if (rejector != null) {
                System.out.println("✅ Sending rejection notification for product: " + product.getName() + " to seller: "
                        + product.getSeller().getName() + " with reason: " + reason);
                notificationService.processProductRejection(product, rejector, reason);
                System.out.println("✅ Rejection notification sent successfully");
            } else {
                System.err.println("❌ No admin found to send rejection notification");
            }
        } catch (Exception e) {
            // Log the error but don't fail the rejection process
            System.err.println("❌ Failed to send rejection notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public ProductDetailDTO getProductDetailById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDetailDTO(product);
    }

    private ProductDetailDTO convertToDetailDTO(Product product) {
        ProductDetailDTO dto = new ProductDetailDTO();

        // Basic product information
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsAvailable(product.getIsAvailable());
        dto.setIsApproved(product.getIsApproved());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        // Seller information
        if (product.getSeller() != null) {
            dto.setSellerId(product.getSeller().getId());
            dto.setSellerName(product.getSeller().getName());
            dto.setSellerEmail(product.getSeller().getEmail());
        }

        // Category information
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        // Admin approval information
        if (product.getApprovedBy() != null) {
            dto.setApprovedByAdminId(product.getApprovedBy().getId());
            dto.setApprovedByAdminName(product.getApprovedBy().getName());
        }

        // Set formatted dates and status
        dto.setFormattedDates();
        dto.setStatusFromFlags();

        return dto;
    }

    public Page<ProductSummaryDTO> getApprovedProductSummariesWithPagination(Pageable pageable) {
        Page<Product> products = productRepository.findByIsApprovedTrueAndIsAvailableTrue(pageable);
        List<ProductSummaryDTO> summaries = products.getContent().stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(summaries, pageable, products.getTotalElements());
    }

    public Page<ProductSummaryDTO> getApprovedProductsByCategoryWithPagination(String categoryName, Pageable pageable) {
        Page<Product> products = productRepository
                .findByIsApprovedTrueAndIsAvailableTrueAndCategoryNameIgnoreCase(categoryName, pageable);
        List<ProductSummaryDTO> summaries = products.getContent().stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(summaries, pageable, products.getTotalElements());
    }

    @Cacheable(value = "clientProducts", key = "#clientId", unless = "#result.size() == 0")
    public List<ProductSummaryDTO> getProductsByClient(UUID clientId) {
        List<Product> products = productRepository.findBySellerIdOrderByCreatedAtDesc(clientId);
        return products.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }
}
