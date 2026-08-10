package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.domain.Difficulty;
import com.dsajourney.desktop.domain.LabelledCount;
import com.dsajourney.desktop.ui.Theme;

import javax.swing.JComponent;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.util.ArrayList;
import java.util.List;

/**
 * Vertical bars, optionally stacked by difficulty. Drawn by hand rather than
 * pulled from a charting library so the module keeps a single dependency.
 */
public class BarChartPanel extends JComponent {

    private List<LabelledCount> data = new ArrayList<>();
    private final boolean stacked;

    public BarChartPanel(List<LabelledCount> data, boolean stacked) {
        this.stacked = stacked;
        setData(data);
        setPreferredSize(new Dimension(520, 200));
    }

    public void setData(List<LabelledCount> value) {
        this.data = value == null ? new ArrayList<>() : value;
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();
        int axis = 22;
        int plot = h - axis - 6;

        int max = 1;
        for (LabelledCount d : data) {
            max = Math.max(max, d.total());
        }

        g2.setColor(Theme.BORDER);
        for (int i = 0; i <= 4; i++) {
            int y = 6 + (int) (plot * (i / 4.0));
            g2.drawLine(0, y, w, y);
        }

        if (data.isEmpty()) {
            g2.setColor(Theme.SUBTLE);
            g2.setFont(Theme.SMALL);
            g2.drawString("No data yet", 8, h / 2);
            g2.dispose();
            return;
        }

        int slot = Math.max(1, w / data.size());
        int barWidth = Math.max(4, Math.min(30, slot - 8));

        g2.setFont(Theme.SMALL);
        FontMetrics fm = g2.getFontMetrics();

        for (int i = 0; i < data.size(); i++) {
            LabelledCount d = data.get(i);
            int cx = i * slot + slot / 2;
            int x = cx - barWidth / 2;
            int bottom = 6 + plot;

            if (stacked) {
                int y = bottom;
                int[] values = {d.easy, d.medium, d.hard};
                Color[] colors = {
                    Difficulty.EASY.color(), Difficulty.MEDIUM.color(), Difficulty.HARD.color()
                };
                for (int s = 0; s < 3; s++) {
                    int segment = (int) Math.round(plot * (values[s] / (double) max));
                    if (segment > 0) {
                        y -= segment;
                        g2.setColor(colors[s]);
                        g2.fillRect(x, y, barWidth, segment);
                    }
                }
            } else {
                int barHeight = (int) Math.round(plot * (d.total() / (double) max));
                g2.setColor(Theme.PRIMARY);
                if (barHeight > 0) {
                    g2.fillRoundRect(x, bottom - barHeight, barWidth, barHeight, 4, 4);
                }
            }

            // Thin out labels when the bars get crowded.
            boolean showLabel = data.size() <= 14 || i % 2 == 0;
            if (showLabel) {
                g2.setColor(Theme.SUBTLE);
                String label = d.label;
                g2.drawString(label, cx - fm.stringWidth(label) / 2, h - 6);
            }
        }
        g2.dispose();
    }
}
