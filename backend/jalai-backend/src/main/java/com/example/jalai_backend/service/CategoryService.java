package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Category;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AdminRepository adminRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    public Optional<Category> getCategoryById(UUID id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    public Category createCategory(Category category, UUID adminId) {
        // Check if category name already exists
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category name already exists");
        }

        // Validate admin if provided
        if (adminId != null) {
            Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found with id: " + adminId));
            category.setManagedBy(admin);
        }

        // Set default values
        category.setIsActive(true);

        return categoryRepository.save(category);
    }

    public Category updateCategory(UUID id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Update fields
        category.setDescription(categoryDetails.getDescription());

        // Only update name if it's different and doesn't exist
        if (!category.getName().equals(categoryDetails.getName())) {
            if (categoryRepository.existsByName(categoryDetails.getName())) {
                throw new RuntimeException("Category name already exists");
            }
            category.setName(categoryDetails.getName());
        }

        return categoryRepository.save(category);
    }

    public void deactivateCategory(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    public void activateCategory(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        category.setIsActive(true);
        categoryRepository.save(category);
    }

    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Check if category has products
        if (!category.getProducts().isEmpty()) {
            throw new RuntimeException("Cannot delete category with existing products");
        }

        categoryRepository.deleteById(id);
    }

    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Category> getCategoriesManagedByAdmin(UUID adminId) {
        return categoryRepository.findByManagedByAdminId(adminId);
    }

    public List<Category> getCategoriesWithAvailableProducts() {
        return categoryRepository.findCategoriesWithAvailableProducts();
    }

    public long getProductCountInCategory(UUID categoryId) {
        return categoryRepository.countProductsInCategory(categoryId);
    }

    public List<Category> getCategoriesOrderedByProductCount() {
        return categoryRepository.findCategoriesOrderedByProductCount();
    }

    public List<Category> searchCategoriesByDescription(String keyword) {
        return categoryRepository.findByDescriptionContainingIgnoreCase(keyword);
    }

    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }

    public Category assignAdminToCategory(UUID categoryId, UUID adminId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found with id: " + adminId));

        category.setManagedBy(admin);
        return categoryRepository.save(category);
    }

    public Category removeAdminFromCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        category.setManagedBy(null);
        return categoryRepository.save(category);
    }

    // Business methods implementation
    public Category addCategory(Category category, UUID adminId) {
        return createCategory(category, adminId);
    }

    public Category modifyCategory(UUID categoryId, Category categoryDetails) {
        return updateCategory(categoryId, categoryDetails);
    }

    public List<Category> getPopularCategories() {
        return getCategoriesOrderedByProductCount();
    }

    public List<Category> getActiveCategories() {
        return getAllActiveCategories();
    }

    public Category getCategoryDetails(UUID categoryId) {
        return getCategoryById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public boolean isCategoryEmpty(UUID categoryId) {
        return getProductCountInCategory(categoryId) == 0;
    }

    public void validateCategoryForDeletion(UUID categoryId) {
        Category category = getCategoryById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getProducts().isEmpty()) {
            throw new RuntimeException("Cannot delete category with existing products. Please move or delete all products first.");
        }
    }

    public List<Category> getCategoriesForPublicDisplay() {
        return getCategoriesWithAvailableProducts();
    }
}
