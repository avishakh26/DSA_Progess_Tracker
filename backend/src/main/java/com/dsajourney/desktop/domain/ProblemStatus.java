package com.dsajourney.desktop.domain;

import java.awt.Color;

public enum ProblemStatus {
    SOLVED("Solved", new Color(0x10, 0xB9, 0x81)),
    ATTEMPTED("Attempted", new Color(0xF5, 0x9E, 0x0B)),
    REVISION("Revision", new Color(0xF4, 0x3F, 0x5E));

    private final String label;
    private final Color color;

    ProblemStatus(String label, Color color) {
        this.label = label;
        this.color = color;
    }

    public String label() {
        return label;
    }

    public Color color() {
        return color;
    }

    public static ProblemStatus of(String raw) {
        if (raw != null) {
            for (ProblemStatus s : values()) {
                if (s.name().equalsIgnoreCase(raw)) {
                    return s;
                }
            }
        }
        return SOLVED;
    }
}
