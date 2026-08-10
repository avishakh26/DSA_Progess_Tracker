package com.dsajourney.desktop.domain;

/** A single labelled bar: used for daily, monthly and per-platform charts. */
public class LabelledCount {
    public final String label;
    public final int easy;
    public final int medium;
    public final int hard;

    public LabelledCount(String label, int easy, int medium, int hard) {
        this.label = label;
        this.easy = easy;
        this.medium = medium;
        this.hard = hard;
    }

    public LabelledCount(String label, int total) {
        this(label, total, 0, 0);
    }

    public int total() {
        return easy + medium + hard;
    }
}
