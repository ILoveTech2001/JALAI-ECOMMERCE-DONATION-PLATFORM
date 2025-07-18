package com.example.jalai_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.util.Date;
import java.util.UUID;


@Entity
public class Message {
    @Id
    @GeneratedValue
    private UUID id;

    private String email;
    private String content;
    private Date createdAt;

    @ManyToOne
    private User fromUser;

    @ManyToOne
    private Orphanage toOrphanage;

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public User getFromUser() {
        return fromUser;
    }

    public void setFromUser(User fromUser) {
        this.fromUser = fromUser;
    }

    public Orphanage getToOrphanage() {
        return toOrphanage;
    }

    public void setToOrphanage(Orphanage toOrphanage) {
        this.toOrphanage = toOrphanage;
    }
}

