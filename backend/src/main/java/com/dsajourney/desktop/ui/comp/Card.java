package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.ui.Theme;

import javax.swing.BorderFactory;
import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.LayoutManager;
import java.awt.RenderingHints;

/** A rounded, bordered surface — the desktop equivalent of the web app's Card. */
public class Card extends JPanel {

    private static final int ARC = 16;

    public Card() {
        this(null);
    }

    public Card(LayoutManager layout) {
        if (layout != null) {
            setLayout(layout);
        }
        setOpaque(false);
        setBackground(Theme.SURFACE);
        setBorder(BorderFactory.createEmptyBorder(14, 16, 14, 16));
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(getBackground());
        g2.fillRoundRect(0, 0, getWidth() - 1, getHeight() - 1, ARC, ARC);
        g2.setColor(Theme.BORDER);
        g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, ARC, ARC);
        g2.dispose();
        super.paintComponent(g);
    }
}
