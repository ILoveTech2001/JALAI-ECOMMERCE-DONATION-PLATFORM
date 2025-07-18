package com.example.jalai_backend.controller;

import com.example.jalai_backend.dto.NotificationDTO;
import com.example.jalai_backend.model.Notification;
import com.example.jalai_backend.service.NotificationService;
import java.util.ArrayList;
import com.example.jalai_backend.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications for a client
    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsByClient(@PathVariable UUID clientId) {
        try {
            System.out.println("=== Fetching notifications for client: " + clientId + " ===");

            // Check if client exists first
            boolean clientExists = notificationService.clientExists(clientId);
            System.out.println("Client exists: " + clientExists);

            if (!clientExists) {
                System.out.println("Client not found, returning empty list");
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<NotificationDTO> notifications = notificationService.getNotificationsByClientAsDTO(clientId);
            System.out.println("Found " + notifications.size() + " notifications for client: " + clientId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching notifications for client " + clientId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching notifications: " + e.getMessage()));
        }
    }

    // Get unread notifications for a client
    @GetMapping("/client/{clientId}/unread")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadNotificationsByClient(@PathVariable UUID clientId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotificationsByClient(clientId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get unread count for a client
    @GetMapping("/client/{clientId}/unread/count")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnreadCountByClient(@PathVariable UUID clientId) {
        try {
            long count = notificationService.getUnreadCountByClient(clientId);
            return ResponseEntity.ok(new UnreadCountResponse(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get notifications with pagination
    @GetMapping("/client/{clientId}/paginated")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsByClientPaginated(
            @PathVariable UUID clientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Notification> notifications = notificationService.getNotificationsByClientPaginated(clientId, page,
                    size);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Mark a notification as read
    @PutMapping("/{notificationId}/read")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable UUID notificationId) {
        try {
            Notification notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Mark all notifications as read for a client
    @PutMapping("/client/{clientId}/read-all")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAllAsReadForClient(@PathVariable UUID clientId) {
        try {
            int updatedCount = notificationService.markAllAsReadForClient(clientId);
            return ResponseEntity.ok(new MessageResponse("Marked " + updatedCount + " notifications as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get recent notifications (last N days)
    @GetMapping("/client/{clientId}/recent")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getRecentNotifications(
            @PathVariable UUID clientId,
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<Notification> notifications = notificationService.getRecentNotifications(clientId, days);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get latest notifications with limit
    @GetMapping("/client/{clientId}/latest")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getLatestNotifications(
            @PathVariable UUID clientId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Notification> notifications = notificationService.getLatestNotifications(clientId, limit);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get notifications by type for a client
    @GetMapping("/client/{clientId}/type/{type}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsByTypeAndClient(
            @PathVariable UUID clientId,
            @PathVariable Notification.NotificationType type) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByTypeAndClient(clientId, type);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Create custom notification (Admin only)
    @PostMapping("/client/{clientId}/custom")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCustomNotification(
            @PathVariable UUID clientId,
            @RequestBody CustomNotificationRequest request) {
        try {
            Notification notification = notificationService.createCustomNotification(
                    clientId, request.getTitle(), request.getMessage(), request.getType());
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Delete notification
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable UUID notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok(new MessageResponse("Notification deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Admin endpoints
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNotifications() {
        try {
            List<NotificationDTO> notifications = notificationService.getAllNotifications();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNotificationsByType(@PathVariable Notification.NotificationType type) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByType(type);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Cleanup old notifications (Admin only)
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cleanupOldNotifications(@RequestParam(defaultValue = "30") int daysOld) {
        try {
            int deletedCount = notificationService.deleteOldReadNotifications(daysOld);
            return ResponseEntity.ok(new MessageResponse("Deleted " + deletedCount + " old notifications"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Response DTOs
    public static class UnreadCountResponse {
        private long count;

        public UnreadCountResponse(long count) {
            this.count = count;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    public static class CustomNotificationRequest {
        private String title;
        private String message;
        private Notification.NotificationType type;

        // Getters and setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Notification.NotificationType getType() {
            return type;
        }

        public void setType(Notification.NotificationType type) {
            this.type = type;
        }
    }
}
