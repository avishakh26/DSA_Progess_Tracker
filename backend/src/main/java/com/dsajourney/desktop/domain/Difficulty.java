package com.dsajourney.desktop.domain;

import java.awt.Color;

public enum Difficulty {
    EASY("Easy", new Color(0x9E, 0xC5, 0xF4)),
    MEDIUM("Medium", new Color(0x39, 0x87, 0xE5)),
    HARD("Hard", new Color(0x18, 0x4F, 0x95));

    private final String label;
    private final Color color;

    Difficulty(String label, Color color) {
        this.label = label;
        this.color = color;
    }

    public String label() {
        return label;
    }

    public Color color() {
        return color;
    }

    public static Difficulty of(String raw) {
        if (raw != null) {
            for (Difficulty d : values()) {
                if (d.name().equalsIgnoreCase(raw)) {
                    return d;
                }
            }
        }
        return EASY;
    }
}
