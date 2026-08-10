package com.dsajourney.desktop.domain;

import java.util.List;

public class DashboardStats {
    public int totalTopics;
    public int doneTopics;
    public int pendingTopics;
    public int skippedTopics;

    public int totalProblems;
    public int solvedProblems;
    public int attemptedProblems;
    public int revisionProblems;

    public int easy;
    public int medium;
    public int hard;

    public int streak;
    public int longestStreak;
    public int solvedToday;
    public int dailyGoal = 3;

    public List<DayCount> activity = List.of();

    /** Percentage of non-skipped topics that are done — mirrors the web app. */
    public int completion() {
        int denominator = totalTopics - skippedTopics;
        return denominator <= 0 ? 0 : doneTopics * 100 / denominator;
    }

    public int goalPercent() {
        return dailyGoal <= 0 ? 0 : Math.min(100, solvedToday * 100 / dailyGoal);
    }
}
