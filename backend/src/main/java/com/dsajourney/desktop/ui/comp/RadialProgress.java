package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.ui.Theme;

import javax.swing.JComponent;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

/** Today's-goal ring: an arc plus the raw "solved / target" figure. */
public class RadialProgress extends JComponent {

    private int value;
    private int max;

    public RadialProgress(int value, int max) {
        this.value = value;
        this.max = Math.max(1, max);
        setPreferredSize(new Dimension(150, 150));
    }

    public void setValues(int value, int max) {
        this.value = value;
        this.max = Math.max(1, max);
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int size = Math.min(getWidth(), getHeight()) - 16;
        int x = (getWidth() - size) / 2;
        int y = (getHeight() - size) / 2;
        double ratio = Math.min(1.0, value / (double) max);

        g2.setStroke(new BasicStroke(12f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.setColor(Theme.RAISED);
        g2.drawArc(x, y, size, size, 90, -360);

        Color accent = ratio >= 1.0 ? Theme.SUCCESS : Theme.PRIMARY;
        g2.setColor(accent);
        g2.drawArc(x, y, size, size, 90, -(int) Math.round(360 * ratio));

        g2.setFont(Theme.NUMBER);
        g2.setColor(Theme.FG);
        String main = String.valueOf(value);
        FontMetrics fm = g2.getFontMetrics();
        g2.drawString(main, getWidth() / 2 - fm.stringWidth(main) / 2, getHeight() / 2 + 2);

        g2.setFont(Theme.SMALL);
        g2.setColor(Theme.MUTED);
        String sub = "/ " + max + " today";
        FontMetrics fm2 = g2.getFontMetrics();
        g2.drawString(sub, getWidth() / 2 - fm2.stringWidth(sub) / 2, getHeight() / 2 + 20);

        g2.dispose();
    }
}
