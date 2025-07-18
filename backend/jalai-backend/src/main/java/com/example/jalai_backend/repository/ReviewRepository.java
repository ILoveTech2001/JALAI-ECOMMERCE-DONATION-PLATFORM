package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    // Find reviews by product
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<Review> findByProductId(@Param("productId") UUID productId);
    
    // Find reviews by client
    @Query("SELECT r FROM Review r WHERE r.client.id = :clientId ORDER BY r.createdAt DESC")
    List<Review> findByClientId(@Param("clientId") UUID clientId);
    
    // Find review by client and product
    @Query("SELECT r FROM Review r WHERE r.client.id = :clientId AND r.product.id = :productId")
    Optional<Review> findByClientIdAndProductId(@Param("clientId") UUID clientId, @Param("productId") UUID productId);
    
    // Find reviews by rating
    List<Review> findByRating(Integer rating);
    
    // Find reviews by rating range
    @Query("SELECT r FROM Review r WHERE r.rating BETWEEN :minRating AND :maxRating ORDER BY r.rating DESC")
    List<Review> findByRatingRange(@Param("minRating") Integer minRating, @Param("maxRating") Integer maxRating);
    
    // Calculate average rating for a product
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double calculateAverageRatingForProduct(@Param("productId") UUID productId);
    
    // Count reviews for a product
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    long countReviewsForProduct(@Param("productId") UUID productId);
    
    // Find reviews with comments
    @Query("SELECT r FROM Review r WHERE r.comment IS NOT NULL AND r.comment != '' ORDER BY r.createdAt DESC")
    List<Review> findReviewsWithComments();
    
    // Find reviews without comments
    @Query("SELECT r FROM Review r WHERE r.comment IS NULL OR r.comment = ''")
    List<Review> findReviewsWithoutComments();
    
    // Find recent reviews
    @Query("SELECT r FROM Review r ORDER BY r.createdAt DESC")
    List<Review> findRecentReviews();
    
    // Find top-rated reviews
    @Query("SELECT r FROM Review r WHERE r.rating >= 4 ORDER BY r.rating DESC, r.createdAt DESC")
    List<Review> findTopRatedReviews();
    
    // Find low-rated reviews
    @Query("SELECT r FROM Review r WHERE r.rating <= 2 ORDER BY r.rating ASC, r.createdAt DESC")
    List<Review> findLowRatedReviews();
    
    // Check if client has reviewed a product
    @Query("SELECT COUNT(r) > 0 FROM Review r WHERE r.client.id = :clientId AND r.product.id = :productId")
    boolean hasClientReviewedProduct(@Param("clientId") UUID clientId, @Param("productId") UUID productId);
    
    // Find reviews by comment containing keyword
    @Query("SELECT r FROM Review r WHERE LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Review> findByCommentContainingIgnoreCase(@Param("keyword") String keyword);
}
