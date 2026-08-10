package com.dsajourney.desktop.domain;

public class GoalRow {
    public final String id;
    public final int month;
    public final String title;
    public final String focus;
    public final String description;
    public final int target;
    public final int progress;
    public final boolean completed;

    public GoalRow(String id, int month, String title, String focus, String description,
                   int target, int progress, boolean completed) {
        this.id = id;
        this.month = month;
        this.title = title;
        this.focus = focus;
        this.description = description;
        this.target = target;
        this.progress = progress;
        this.completed = completed;
    }

    public int percent() {
        return target <= 0 ? 0 : Math.min(100, progress * 100 / target);
    }
}
