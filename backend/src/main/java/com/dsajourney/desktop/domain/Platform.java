package com.dsajourney.desktop.domain;

public enum Platform {
    LEETCODE("LeetCode"),
    CODEFORCES("Codeforces"),
    CODECHEF("CodeChef"),
    ATCODER("AtCoder"),
    GFG("GeeksforGeeks"),
    OTHER("Other");

    private final String label;

    Platform(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    public static Platform of(String raw) {
        if (raw != null) {
            for (Platform p : values()) {
                if (p.name().equalsIgnoreCase(raw)) {
                    return p;
                }
            }
        }
        return OTHER;
    }
}
