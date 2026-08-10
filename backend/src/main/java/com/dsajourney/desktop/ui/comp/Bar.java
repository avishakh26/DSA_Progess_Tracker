package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.ui.Theme;

import javax.swing.JComponent;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

/** A slim horizontal progress bar. */
public class Bar extends JComponent {

    private int percent;
    private Color color = Theme.PRIMARY;

    public Bar(int percent) {
        this.percent = clamp(percent);
        setPreferredSize(new Dimension(120, 8));
    }

    public void setPercent(int value) {
        this.percent = clamp(value);
        repaint();
    }

    public void setColor(Color value) {
        this.color = value;
        repaint();
    }

    private static int clamp(int v) {
        return Math.max(0, Math.min(100, v));
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        int h = getHeight();
        g2.setColor(Theme.RAISED);
        g2.fillRoundRect(0, 0, getWidth(), h, h, h);
        int w = (int) Math.round(getWidth() * (percent / 100.0));
        if (w > 0) {
            g2.setColor(color);
            g2.fillRoundRect(0, 0, w, h, h, h);
        }
        g2.dispose();
    }
}
