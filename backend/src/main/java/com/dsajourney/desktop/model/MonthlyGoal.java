package com.dsajourney.desktop.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "monthly_goal")
public class MonthlyGoal {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    private int month;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String focus;

    @Column(columnDefinition = "TEXT")
    private String description;

    private int target = 0;
    private int progress = 0;
    private boolean completed = false;

    public MonthlyGoal() {}

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
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getFocus() { return focus; }
    public void setFocus(String focus) { this.focus = focus; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getTarget() { return target; }
    public void setTarget(int target) { this.target = target; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}
