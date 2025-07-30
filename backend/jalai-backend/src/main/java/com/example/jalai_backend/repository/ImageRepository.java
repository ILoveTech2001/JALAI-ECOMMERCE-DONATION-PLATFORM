package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImageRepository extends JpaRepository<Image, UUID> {

    /**
     * Find image by filename
     */
    Optional<Image> findByFilename(String filename);

    /**
     * Find images by content type
     */
    List<Image> findByContentType(String contentType);

    /**
     * Find images created after a specific date
     */
    List<Image> findByCreatedAtAfter(LocalDateTime date);

    /**
     * Find images by size range
     */
    @Query("SELECT i FROM Image i WHERE i.size BETWEEN :minSize AND :maxSize")
    List<Image> findBySizeRange(@Param("minSize") Long minSize, @Param("maxSize") Long maxSize);

    /**
     * Count images by content type
     */
    long countByContentType(String contentType);

    /**
     * Delete images older than specified date
     */
    void deleteByCreatedAtBefore(LocalDateTime date);

    /**
     * Find images larger than specified size
     */
    List<Image> findBySizeGreaterThan(Long size);

    /**
     * Check if image exists by filename
     */
    boolean existsByFilename(String filename);
}
