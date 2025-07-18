package com.example.jalai_backend.service;

import com.example.jalai_backend.dto.NotificationDTO;
import com.example.jalai_backend.model.*;
import com.example.jalai_backend.repository.NotificationRepository;
import com.example.jalai_backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ClientRepository clientRepository;

    // Basic CRUD operations
    public List<NotificationDTO> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAll();
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<Notification> getNotificationById(UUID id) {
        return notificationRepository.findById(id);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification updateNotification(UUID id, Notification notificationDetails) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        notification.setTitle(notificationDetails.getTitle());
        notification.setMessage(notificationDetails.getMessage());
        notification.setType(notificationDetails.getType());
        notification.setIsRead(notificationDetails.getIsRead());

        return notificationRepository.save(notification);
    }

    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }

    // Client-specific operations
    public List<Notification> getNotificationsByClient(UUID clientId) {
        return notificationRepository.findByClientId(clientId);
    }

    public List<NotificationDTO> getNotificationsByClientAsDTO(UUID clientId) {
        try {
            List<Notification> notifications = notificationRepository.findByClientIdWithEagerLoading(clientId);
            return notifications.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching notifications for client " + clientId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing exception
            return new ArrayList<>();
        }
    }

    public boolean clientExists(UUID clientId) {
        try {
            return clientRepository.existsById(clientId);
        } catch (Exception e) {
            System.err.println("Error checking if client exists: " + e.getMessage());
            return false;
        }
    }

    public List<Notification> getUnreadNotificationsByClient(UUID clientId) {
        return notificationRepository.findUnreadByClientId(clientId);
    }

    public long getUnreadCountByClient(UUID clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));
        return notificationRepository.countUnreadByClient(client);
    }

    public Page<Notification> getNotificationsByClientPaginated(UUID clientId, int page, int size) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByRecipientClientOrderByCreatedAtDesc(client, pageable);
    }

    // Mark notifications as read
    public Notification markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        notification.markAsRead();
        return notificationRepository.save(notification);
    }

    public int markAllAsReadForClient(UUID clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));
        return notificationRepository.markAllAsReadForClient(client, LocalDateTime.now());
    }

    // Product-related notifications
    public Notification notifyProductApproval(UUID clientId, Product product, Admin approver) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        Notification notification = Notification.createProductApprovalNotification(client, product, approver);
        return notificationRepository.save(notification);
    }

    public Notification notifyProductRejection(UUID clientId, Product product, Admin rejector, String reason) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        Notification notification = Notification.createProductRejectionNotification(client, product, rejector, reason);
        return notificationRepository.save(notification);
    }

    // Order-related notifications
    public Notification notifyOrderStatusChange(UUID clientId, Order order) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        Notification notification = Notification.createOrderStatusNotification(client, order);
        return notificationRepository.save(notification);
    }

    // Donation-related notifications
    public Notification notifyDonationConfirmation(UUID clientId, Donation donation) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        Notification notification = Notification.createDonationConfirmationNotification(client, donation);
        return notificationRepository.save(notification);
    }

    // Custom notification creation
    public Notification createCustomNotification(UUID clientId, String title, String message,
            Notification.NotificationType type) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipientClient(client);

        return notificationRepository.save(notification);
    }

    // Utility methods
    public List<Notification> getRecentNotifications(UUID clientId, int days) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return notificationRepository.findRecentByClient(client, since);
    }

    public List<Notification> getNotificationsByType(Notification.NotificationType type) {
        return notificationRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    public List<Notification> getNotificationsByTypeAndClient(UUID clientId, Notification.NotificationType type) {
        return notificationRepository.findByClientIdAndType(clientId, type);
    }

    // Cleanup operations
    public int deleteOldReadNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        return notificationRepository.deleteOldReadNotifications(cutoffDate);
    }

    // Get latest notifications with limit
    public List<Notification> getLatestNotifications(UUID clientId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return notificationRepository.findLatestByClientId(clientId, pageable);
    }

    // Business logic methods
    public void processProductApproval(Product product, Admin approver) {
        // Send notification to the product seller
        notifyProductApproval(product.getSeller().getId(), product, approver);

        // Additional business logic can be added here
        // e.g., send email, update analytics, etc.
    }

    public void processProductRejection(Product product, Admin rejector, String reason) {
        // Send notification to the product seller
        notifyProductRejection(product.getSeller().getId(), product, rejector, reason);

        // Additional business logic can be added here
    }

    public void processOrderUpdate(Order order) {
        // Send notification to the order client
        notifyOrderStatusChange(order.getClient().getId(), order);

        // Additional business logic can be added here
    }

    public void processDonationConfirmation(Donation donation) {
        // Send notification to the donor
        notifyDonationConfirmation(donation.getClient().getId(), donation);

        // Additional business logic can be added here
    }

    // Convert Notification entity to DTO
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();

        try {
            // Basic fields (these should always work)
            dto.setId(notification.getId());
            dto.setTitle(notification.getTitle());
            dto.setMessage(notification.getMessage());
            dto.setType(notification.getType() != null ? notification.getType().toString() : null);
            dto.setIsRead(notification.getIsRead() != null ? notification.getIsRead() : false);
            dto.setIsSent(notification.getIsSent() != null ? notification.getIsSent() : false);
            dto.setCreatedAt(notification.getCreatedAt());
            dto.setUpdatedAt(notification.getUpdatedAt());
            dto.setReadAt(notification.getReadAt());
            dto.setRelatedEntityId(notification.getRelatedEntityId());
            dto.setRelatedEntityType(notification.getRelatedEntityType());

            // Recipient information (safely handle lazy loading)
            try {
                if (notification.getRecipientClient() != null) {
                    dto.setRecipientClientId(notification.getRecipientClient().getId());
                    dto.setRecipientClientName(notification.getRecipientClient().getName());
                }
            } catch (Exception e) {
                System.err.println("Error loading recipient client: " + e.getMessage());
            }

            try {
                if (notification.getRecipientAdmin() != null) {
                    dto.setRecipientAdminId(notification.getRecipientAdmin().getId());
                    dto.setRecipientAdminName(notification.getRecipientAdmin().getName());
                }
            } catch (Exception e) {
                System.err.println("Error loading recipient admin: " + e.getMessage());
            }

            try {
                if (notification.getRecipientOrphanage() != null) {
                    dto.setRecipientOrphanageId(notification.getRecipientOrphanage().getId());
                    dto.setRecipientOrphanageName(notification.getRecipientOrphanage().getName());
                }
            } catch (Exception e) {
                System.err.println("Error loading recipient orphanage: " + e.getMessage());
            }

            // Sender information
            try {
                if (notification.getSenderAdmin() != null) {
                    dto.setSenderAdminId(notification.getSenderAdmin().getId());
                    dto.setSenderAdminName(notification.getSenderAdmin().getName());
                }
            } catch (Exception e) {
                System.err.println("Error loading sender admin: " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("Error converting notification to DTO: " + e.getMessage());
            e.printStackTrace();
        }

        return dto;
    }
}
