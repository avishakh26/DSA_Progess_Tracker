package com.dsajourney.desktop.domain;

import java.awt.Color;

public enum TopicStatus {
    PENDING("Pending", new Color(0x94, 0xA3, 0xB8)),
    DONE("Done", new Color(0x10, 0xB9, 0x81)),
    SKIP("Skipped", new Color(0x64, 0x74, 0x8B));

    private final String label;
    private final Color color;

    TopicStatus(String label, Color color) {
        this.label = label;
        this.color = color;
    }

    public String label() {
        return label;
    }

    public Color color() {
        return color;
    }

    public static TopicStatus of(String raw) {
        if (raw != null) {
            for (TopicStatus s : values()) {
                if (s.name().equalsIgnoreCase(raw)) {
                    return s;
                }
            }
        }
        return PENDING;
    }
}
