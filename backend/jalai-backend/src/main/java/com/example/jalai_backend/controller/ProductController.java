package com.example.jalai_backend.controller;

import com.example.jalai_backend.dto.ProductSummaryDTO;
import com.example.jalai_backend.dto.ProductDetailDTO;
import com.example.jalai_backend.model.Product;
import com.example.jalai_backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            // Use summary DTO to avoid large image data in list responses
            Page<ProductSummaryDTO> products = productService.getProductSummariesWithPagination(pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable UUID id) {
        try {
            ProductDetailDTO product = productService.getProductDetailById(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        try {
            Product product = new Product();
            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setImageUrl(request.getImageUrl());

            Product createdProduct = productService.createProduct(
                    product, request.getSellerId(), request.getCategoryId());
            return ResponseEntity.ok(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable UUID id,
            @Valid @RequestBody Product productDetails) {
        try {
            Product updatedProduct = productService.updateProduct(id, productDetails);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable UUID id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Product> products = productService.getProductsByCategoryWithPagination(categoryId, pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getProductsBySeller(@PathVariable UUID sellerId) {
        try {
            List<Product> products = productService.getProductsBySeller(sellerId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String keyword) {
        try {
            List<Product> products = productService.searchProductsByKeyword(keyword);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/price-range")
    public ResponseEntity<?> getProductsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        try {
            List<Product> products = productService.getProductsByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveProduct(@PathVariable UUID id, @RequestParam UUID adminId) {
        try {
            Product approvedProduct = productService.approveProduct(id, adminId);
            return ResponseEntity.ok(approvedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectProduct(@PathVariable UUID id, @RequestParam UUID adminId,
            @RequestParam(defaultValue = "Product does not meet our standards") String reason) {
        try {
            Product rejectedProduct = productService.rejectProduct(id, adminId, reason);
            return ResponseEntity.ok(rejectedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/pending-approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingApprovalProducts() {
        try {
            List<Product> products = productService.getPendingApprovalProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedProducts() {
        try {
            List<Product> products = productService.getTopRatedProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentProducts() {
        try {
            List<Product> products = productService.getRecentProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/mark-unavailable")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsUnavailable(@PathVariable UUID id) {
        try {
            productService.markAsUnavailable(id);
            return ResponseEntity.ok(new MessageResponse("Product marked as unavailable"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/mark-available")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsAvailable(@PathVariable UUID id) {
        try {
            productService.markAsAvailable(id);
            return ResponseEntity.ok(new MessageResponse("Product marked as available"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/donate")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> markAsDonated(@PathVariable UUID id) {
        try {
            productService.markAsDonated(id);
            return ResponseEntity.ok(new MessageResponse("Product marked as donated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // DTOs
    public static class ProductCreateRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private UUID sellerId;
        private UUID categoryId;

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public UUID getSellerId() {
            return sellerId;
        }

        public void setSellerId(UUID sellerId) {
            this.sellerId = sellerId;
        }

        public UUID getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(UUID categoryId) {
            this.categoryId = categoryId;
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

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveProduct(@PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String reason = request != null ? request.get("reason") : "";
            productService.approveProduct(id, reason);
            return ResponseEntity.ok(new MessageResponse("Product approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectProduct(@PathVariable UUID id, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Error: Rejection reason is required"));
            }
            productService.rejectProduct(id, reason);
            return ResponseEntity.ok(new MessageResponse("Product rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProductSummaryDTO> products = productService.getApprovedProductSummariesWithPagination(pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/approved/category/{categoryName}")
    public ResponseEntity<?> getApprovedProductsByCategory(
            @PathVariable String categoryName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProductSummaryDTO> products = productService.getApprovedProductsByCategoryWithPagination(categoryName,
                    pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getProductsByClient(@PathVariable UUID clientId) {
        try {
            List<ProductSummaryDTO> products = productService.getProductsByClient(clientId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
