package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Product;
import com.example.jalai_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class ImageService {

    @Autowired
    private ProductRepository productRepository;

    private static final int MAX_WIDTH = 800;
    private static final int MAX_HEIGHT = 600;
    private static final float COMPRESSION_QUALITY = 0.8f;

    /**
     * Save uploaded image file
     */
    public UUID saveImage(MultipartFile file) throws IOException {
        // Compress and resize image
        byte[] compressedImageData = compressImage(file.getBytes(), file.getContentType());
        
        // Create a temporary product entry to store image
        Product product = new Product();
        product.setImageData(compressedImageData);
        product.setImageFilename(file.getOriginalFilename());
        product.setImageContentType(file.getContentType());
        product.setImageSize((long) compressedImageData.length);
        
        // Save and return ID (this will be used later when creating the actual product)
        Product savedProduct = productRepository.save(product);
        return savedProduct.getId();
    }

    /**
     * Save base64 image data (fallback for existing frontend)
     */
    public UUID saveBase64Image(String base64Data, String filename, String contentType) throws IOException {
        // Remove data URL prefix if present
        String imageData = base64Data;
        if (imageData.contains(",")) {
            imageData = imageData.split(",")[1];
        }
        
        // Decode base64
        byte[] decodedBytes = Base64.getDecoder().decode(imageData);
        
        // Compress and resize
        byte[] compressedImageData = compressImage(decodedBytes, contentType);
        
        // Create temporary product entry
        Product product = new Product();
        product.setImageData(compressedImageData);
        product.setImageFilename(filename != null ? filename : "image.jpg");
        product.setImageContentType(contentType != null ? contentType : "image/jpeg");
        product.setImageSize((long) compressedImageData.length);
        
        Product savedProduct = productRepository.save(product);
        return savedProduct.getId();
    }

    /**
     * Get image data by ID
     */
    public ImageData getImage(UUID imageId) {
        Optional<Product> productOpt = productRepository.findById(imageId);
        if (productOpt.isPresent() && productOpt.get().getImageData() != null) {
            Product product = productOpt.get();
            return new ImageData(
                product.getImageData(),
                product.getImageContentType(),
                product.getImageFilename()
            );
        }
        return null;
    }

    /**
     * Get image metadata
     */
    public ImageInfo getImageInfo(UUID imageId) {
        Optional<Product> productOpt = productRepository.findById(imageId);
        if (productOpt.isPresent() && productOpt.get().getImageData() != null) {
            Product product = productOpt.get();
            return new ImageInfo(
                imageId,
                product.getImageFilename(),
                product.getImageContentType(),
                product.getImageSize(),
                product.getCreatedAt()
            );
        }
        return null;
    }

    /**
     * Delete image by ID
     */
    public boolean deleteImage(UUID imageId) {
        Optional<Product> productOpt = productRepository.findById(imageId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            // Only delete if this is just an image (no other product data)
            if (product.getName() == null && product.getPrice() == null) {
                productRepository.delete(product);
                return true;
            }
        }
        return false;
    }

    /**
     * Compress and resize image
     */
    private byte[] compressImage(byte[] originalImageData, String contentType) throws IOException {
        // Read the original image
        ByteArrayInputStream inputStream = new ByteArrayInputStream(originalImageData);
        BufferedImage originalImage = ImageIO.read(inputStream);
        
        if (originalImage == null) {
            throw new IOException("Invalid image data");
        }

        // Calculate new dimensions while maintaining aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        int newWidth = originalWidth;
        int newHeight = originalHeight;
        
        if (originalWidth > MAX_WIDTH || originalHeight > MAX_HEIGHT) {
            double widthRatio = (double) MAX_WIDTH / originalWidth;
            double heightRatio = (double) MAX_HEIGHT / originalHeight;
            double ratio = Math.min(widthRatio, heightRatio);
            
            newWidth = (int) (originalWidth * ratio);
            newHeight = (int) (originalHeight * ratio);
        }

        // Create resized image
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resizedImage.createGraphics();
        
        // Set rendering hints for better quality
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g2d.dispose();

        // Convert to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String format = getImageFormat(contentType);
        ImageIO.write(resizedImage, format, outputStream);
        
        return outputStream.toByteArray();
    }

    /**
     * Get image format from content type
     */
    private String getImageFormat(String contentType) {
        if (contentType == null) return "jpeg";
        
        switch (contentType.toLowerCase()) {
            case "image/png":
                return "png";
            case "image/gif":
                return "gif";
            case "image/webp":
                return "webp";
            default:
                return "jpeg";
        }
    }

    // Data classes
    public static class ImageData {
        private final byte[] data;
        private final String contentType;
        private final String filename;

        public ImageData(byte[] data, String contentType, String filename) {
            this.data = data;
            this.contentType = contentType;
            this.filename = filename;
        }

        public byte[] getData() { return data; }
        public String getContentType() { return contentType; }
        public String getFilename() { return filename; }
    }

    public static class ImageInfo {
        private final UUID id;
        private final String filename;
        private final String contentType;
        private final Long size;
        private final java.time.LocalDateTime createdAt;

        public ImageInfo(UUID id, String filename, String contentType, Long size, java.time.LocalDateTime createdAt) {
            this.id = id;
            this.filename = filename;
            this.contentType = contentType;
            this.size = size;
            this.createdAt = createdAt;
        }

        public UUID getId() { return id; }
        public String getFilename() { return filename; }
        public String getContentType() { return contentType; }
        public Long getSize() { return size; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    }
}
