package com.example.jalai_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private UUID id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private Boolean isSent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime readAt;
    
    // Related entity information
    private UUID relatedEntityId;
    private String relatedEntityType;
    
    // Recipient information (flattened)
    private UUID recipientClientId;
    private String recipientClientName;
    private UUID recipientAdminId;
    private String recipientAdminName;
    private UUID recipientOrphanageId;
    private String recipientOrphanageName;
    
    // Sender information (flattened)
    private UUID senderAdminId;
    private String senderAdminName;
}
