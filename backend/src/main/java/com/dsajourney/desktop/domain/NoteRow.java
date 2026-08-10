package com.dsajourney.desktop.domain;

import java.time.Instant;

public class NoteRow {
    public final String id;
    public final String title;
    public final String content;
    public final boolean pinned;
    public final Instant updatedAt;

    public NoteRow(String id, String title, String content, boolean pinned, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.pinned = pinned;
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return (pinned ? "* " : "") + title;
    }
}
