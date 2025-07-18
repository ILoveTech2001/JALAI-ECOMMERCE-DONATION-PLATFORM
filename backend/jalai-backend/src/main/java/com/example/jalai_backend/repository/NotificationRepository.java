package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Notification;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Orphanage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Find notifications by recipient client
    List<Notification> findByRecipientClientOrderByCreatedAtDesc(Client client);

    // Find notifications by recipient client with pagination
    Page<Notification> findByRecipientClientOrderByCreatedAtDesc(Client client, Pageable pageable);

    // Find unread notifications by recipient client
    List<Notification> findByRecipientClientAndIsReadFalseOrderByCreatedAtDesc(Client client);

    // Find notifications by recipient admin
    List<Notification> findByRecipientAdminOrderByCreatedAtDesc(Admin admin);

    // Find notifications by recipient orphanage
    List<Notification> findByRecipientOrphanageOrderByCreatedAtDesc(Orphanage orphanage);

    // Find notifications by type
    List<Notification> findByTypeOrderByCreatedAtDesc(Notification.NotificationType type);

    // Find notifications by type and recipient client
    List<Notification> findByTypeAndRecipientClientOrderByCreatedAtDesc(
            Notification.NotificationType type, Client client);

    // Count unread notifications for client
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientClient = :client AND n.isRead = false")
    long countUnreadByClient(@Param("client") Client client);

    // Count unread notifications for admin
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientAdmin = :admin AND n.isRead = false")
    long countUnreadByAdmin(@Param("admin") Admin admin);

    // Find notifications created within date range
    @Query("SELECT n FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    List<Notification> findByCreatedAtBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find notifications related to specific entity
    @Query("SELECT n FROM Notification n WHERE n.relatedEntityId = :entityId AND n.relatedEntityType = :entityType ORDER BY n.createdAt DESC")
    List<Notification> findByRelatedEntity(
            @Param("entityId") UUID entityId,
            @Param("entityType") String entityType);

    // Find unsent notifications
    List<Notification> findByIsSentFalseOrderByCreatedAtAsc();

    // Find recent notifications for client (last 30 days)
    @Query("SELECT n FROM Notification n WHERE n.recipientClient = :client AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentByClient(
            @Param("client") Client client,
            @Param("since") LocalDateTime since);

    // Mark all notifications as read for a client
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipientClient = :client AND n.isRead = false")
    int markAllAsReadForClient(@Param("client") Client client, @Param("readAt") LocalDateTime readAt);

    // Delete old read notifications (cleanup)
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.createdAt < :cutoffDate")
    int deleteOldReadNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Find notifications by client ID
    @Query("SELECT n FROM Notification n WHERE n.recipientClient.id = :clientId ORDER BY n.createdAt DESC")
    List<Notification> findByClientId(@Param("clientId") UUID clientId);

    // Find notifications by client ID with eager loading to avoid lazy loading
    // issues
    @Query("SELECT n FROM Notification n " +
            "LEFT JOIN FETCH n.recipientClient " +
            "LEFT JOIN FETCH n.recipientAdmin " +
            "LEFT JOIN FETCH n.recipientOrphanage " +
            "LEFT JOIN FETCH n.senderAdmin " +
            "WHERE n.recipientClient.id = :clientId ORDER BY n.createdAt DESC")
    List<Notification> findByClientIdWithEagerLoading(@Param("clientId") UUID clientId);

    // Find unread notifications by client ID
    @Query("SELECT n FROM Notification n WHERE n.recipientClient.id = :clientId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByClientId(@Param("clientId") UUID clientId);

    // Count total notifications for client
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientClient.id = :clientId")
    long countByClientId(@Param("clientId") UUID clientId);

    // Find notifications by type and client ID
    @Query("SELECT n FROM Notification n WHERE n.recipientClient.id = :clientId AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByClientIdAndType(@Param("clientId") UUID clientId,
            @Param("type") Notification.NotificationType type);

    // Find latest notifications for client (limit)
    @Query(value = "SELECT n FROM Notification n WHERE n.recipientClient.id = :clientId ORDER BY n.createdAt DESC")
    List<Notification> findLatestByClientId(@Param("clientId") UUID clientId, Pageable pageable);
}
