package com.dsajourney.desktop.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "rating_node")
public class RatingNode {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    private int rating;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String focus;

    private String skills = "";
    private boolean completed = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "\"order\"")
    private int order = 0;

    public RatingNode() {}

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getFocus() { return focus; }
    public void setFocus(String focus) { this.focus = focus; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }
}
