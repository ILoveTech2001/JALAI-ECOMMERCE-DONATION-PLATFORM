package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    
    // Find category by name
    Optional<Category> findByName(String name);
    
    // Find all active categories
    List<Category> findByIsActiveTrue();
    
    // Find all inactive categories
    List<Category> findByIsActiveFalse();
    
    // Check if category name exists
    boolean existsByName(String name);
    
    // Find categories by name containing (case insensitive)
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Category> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Find categories managed by specific admin
    @Query("SELECT c FROM Category c WHERE c.managedBy.id = :adminId")
    List<Category> findByManagedByAdminId(@Param("adminId") UUID adminId);
    
    // Find categories with products
    @Query("SELECT DISTINCT c FROM Category c JOIN c.products p WHERE p.isAvailable = true")
    List<Category> findCategoriesWithAvailableProducts();
    
    // Count products in category
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.isAvailable = true")
    long countProductsInCategory(@Param("categoryId") UUID categoryId);
    
    // Find categories ordered by product count
    @Query("SELECT c FROM Category c LEFT JOIN c.products p GROUP BY c ORDER BY COUNT(p) DESC")
    List<Category> findCategoriesOrderedByProductCount();
    
    // Find categories with description containing keyword
    @Query("SELECT c FROM Category c WHERE LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> findByDescriptionContainingIgnoreCase(@Param("keyword") String keyword);
}
