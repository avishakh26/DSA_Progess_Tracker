package com.dsajourney.desktop.domain;

import java.time.Instant;

public class ProblemRow {
    public final String id;
    public final String topicId;
    public final String topicTitle;
    public final String title;
    public final Platform platform;
    public final String problemLink;
    public final String solutionLink;
    public final Difficulty difficulty;
    public final Instant solvedDate;
    public final ProblemStatus status;
    public final String notes;
    public final String tags;
    public final boolean favorite;

    public ProblemRow(String id, String topicId, String topicTitle, String title,
                      Platform platform, String problemLink, String solutionLink,
                      Difficulty difficulty, Instant solvedDate, ProblemStatus status,
                      String notes, String tags, boolean favorite) {
        this.id = id;
        this.topicId = topicId;
        this.topicTitle = topicTitle;
        this.title = title;
        this.platform = platform;
        this.problemLink = problemLink;
        this.solutionLink = solutionLink;
        this.difficulty = difficulty;
        this.solvedDate = solvedDate;
        this.status = status;
        this.notes = notes;
        this.tags = tags;
        this.favorite = favorite;
    }
}
