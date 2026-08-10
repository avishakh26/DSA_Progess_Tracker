package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.ui.Theme;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;

/** Label, big number and a caption — the dashboard KPI tile. */
public class StatCard extends Card {

    public StatCard(String label, String value, String sub, Color accent) {
        super();
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setPreferredSize(new Dimension(180, 104));

        JLabel top = Theme.label(label.toUpperCase(), Theme.SMALL_BOLD, Theme.MUTED);
        top.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel number = Theme.label(value, Theme.NUMBER, Theme.FG);
        number.setAlignmentX(Component.LEFT_ALIGNMENT);
        number.setBorder(BorderFactory.createEmptyBorder(6, 0, 2, 0));

        JLabel caption = Theme.label(sub == null ? " " : sub, Theme.SMALL, accent);
        caption.setAlignmentX(Component.LEFT_ALIGNMENT);

        add(top);
        add(number);
        add(caption);
    }
}
