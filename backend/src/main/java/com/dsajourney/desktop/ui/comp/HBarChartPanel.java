package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.domain.LabelledCount;
import com.dsajourney.desktop.ui.Theme;

import javax.swing.JComponent;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.util.ArrayList;
import java.util.List;

/** Horizontal magnitude bars — used for the per-platform breakdown. */
public class HBarChartPanel extends JComponent {

    private List<LabelledCount> data = new ArrayList<>();

    public HBarChartPanel(List<LabelledCount> data) {
        setData(data);
        setPreferredSize(new Dimension(420, 190));
    }

    public void setData(List<LabelledCount> value) {
        this.data = value == null ? new ArrayList<>() : value;
        setPreferredSize(new Dimension(420, Math.max(90, this.data.size() * 30 + 10)));
        revalidate();
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setFont(Theme.SMALL);

        if (data.isEmpty()) {
            g2.setColor(Theme.SUBTLE);
            g2.drawString("No data yet", 8, 24);
            g2.dispose();
            return;
        }

        int labelWidth = 108;
        int max = 1;
        for (LabelledCount d : data) {
            max = Math.max(max, d.total());
        }
        int available = Math.max(40, getWidth() - labelWidth - 46);

        for (int i = 0; i < data.size(); i++) {
            LabelledCount d = data.get(i);
            int y = 8 + i * 30;
            g2.setColor(Theme.MUTED);
            g2.drawString(Theme.ellipsis(d.label, 16), 0, y + 13);

            int barWidth = (int) Math.round(available * (d.total() / (double) max));
            g2.setColor(Theme.RAISED);
            g2.fillRoundRect(labelWidth, y, available, 16, 6, 6);
            g2.setColor(Theme.PRIMARY);
            if (barWidth > 0) {
                g2.fillRoundRect(labelWidth, y, barWidth, 16, 6, 6);
            }
            g2.setColor(Theme.FG);
            String n = String.valueOf(d.total());
            g2.drawString(n, labelWidth + available + 8, y + 13);
        }
        g2.dispose();
    }
}
