package com.example.jalai_backend.controller;

import com.example.jalai_backend.dto.MessageResponse;
import com.example.jalai_backend.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ImageController {

    @Autowired
    private ImageService imageService;

    /**
     * Upload image file and return image ID for product creation
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Please select a file to upload"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Only image files are allowed"));
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: File size must be less than 5MB"));
            }

            // Save image and get ID
            UUID imageId = imageService.saveImage(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("imageId", imageId);
            response.put("filename", file.getOriginalFilename());
            response.put("size", file.getSize());
            response.put("contentType", contentType);
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error uploading image: " + e.getMessage()));
        }
    }

    /**
     * Get image by ID
     */
    @GetMapping("/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable UUID imageId) {
        try {
            ImageService.ImageData imageData = imageService.getImage(imageId);
            
            if (imageData == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(imageData.getContentType()));
            headers.setContentLength(imageData.getData().length);
            headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
            
            return new ResponseEntity<>(imageData.getData(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Upload image from base64 data (fallback for existing frontend)
     */
    @PostMapping("/upload-base64")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> uploadBase64Image(@RequestBody Base64ImageRequest request) {
        try {
            if (request.getImageData() == null || request.getImageData().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Image data is required"));
            }

            UUID imageId = imageService.saveBase64Image(
                request.getImageData(), 
                request.getFilename(), 
                request.getContentType()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("imageId", imageId);
            response.put("filename", request.getFilename());
            response.put("message", "Image uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error uploading image: " + e.getMessage()));
        }
    }

    /**
     * Delete image by ID
     */
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteImage(@PathVariable UUID imageId) {
        try {
            boolean deleted = imageService.deleteImage(imageId);
            if (deleted) {
                return ResponseEntity.ok(new MessageResponse("Image deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error deleting image: " + e.getMessage()));
        }
    }

    /**
     * Get image metadata
     */
    @GetMapping("/{imageId}/info")
    public ResponseEntity<?> getImageInfo(@PathVariable UUID imageId) {
        try {
            ImageService.ImageInfo info = imageService.getImageInfo(imageId);
            if (info == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error getting image info: " + e.getMessage()));
        }
    }

    // DTOs
    public static class Base64ImageRequest {
        private String imageData;
        private String filename;
        private String contentType;

        // Getters and setters
        public String getImageData() { return imageData; }
        public void setImageData(String imageData) { this.imageData = imageData; }
        
        public String getFilename() { return filename; }
        public void setFilename(String filename) { this.filename = filename; }
        
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
