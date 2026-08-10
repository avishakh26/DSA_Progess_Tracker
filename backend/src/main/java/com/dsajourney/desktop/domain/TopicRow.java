package com.dsajourney.desktop.domain;

public class TopicRow {
    public final String id;
    public final String slug;
    public final String title;
    public final int phase;
    public final String description;
    public final String resources;
    public final TopicStatus status;
    public final int progress;
    public final String notes;
    public final boolean favorite;
    public final int order;
    public final int problemCount;

    public TopicRow(String id, String slug, String title, int phase, String description,
                    String resources, TopicStatus status, int progress, String notes,
                    boolean favorite, int order, int problemCount) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.phase = phase;
        this.description = description;
        this.resources = resources;
        this.status = status;
        this.progress = progress;
        this.notes = notes;
        this.favorite = favorite;
        this.order = order;
        this.problemCount = problemCount;
    }

    @Override
    public String toString() {
        return title;
    }
}
