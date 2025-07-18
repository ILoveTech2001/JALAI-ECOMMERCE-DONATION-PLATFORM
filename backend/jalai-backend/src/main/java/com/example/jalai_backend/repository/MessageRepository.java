package com.example.jalai_backend.repository;

import com.example.jalai_backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

       // Find messages by sender (fromUser)
       List<Message> findByFromUserIdOrderByCreatedAtDesc(UUID fromUserId);

       // Find messages by orphanage (toOrphanage)
       List<Message> findByToOrphanageIdOrderByCreatedAtDesc(UUID toOrphanageId);

       // Find messages from a specific user to a specific orphanage
       @Query("SELECT m FROM Message m WHERE m.fromUser.id = :userId AND m.toOrphanage.id = :orphanageId ORDER BY m.createdAt ASC")
       List<Message> findMessagesBetweenUserAndOrphanage(@Param("userId") UUID userId,
                     @Param("orphanageId") UUID orphanageId);

       // Find messages sent after a specific date
       List<Message> findByCreatedAtAfterOrderByCreatedAtDesc(Date date);

       // Find messages by content containing keyword
       List<Message> findByContentContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);

       // Find messages by email
       List<Message> findByEmailOrderByCreatedAtDesc(String email);

       // Delete old messages (older than specified date)
       void deleteByCreatedAtBefore(Date date);

       // Find recent messages for a user
       @Query("SELECT m FROM Message m WHERE m.fromUser.id = :userId ORDER BY m.createdAt DESC")
       List<Message> findRecentMessagesForUser(@Param("userId") UUID userId);

       // Find all messages for an orphanage
       @Query("SELECT m FROM Message m WHERE m.toOrphanage.id = :orphanageId ORDER BY m.createdAt DESC")
       List<Message> findMessagesForOrphanage(@Param("orphanageId") UUID orphanageId);
}
