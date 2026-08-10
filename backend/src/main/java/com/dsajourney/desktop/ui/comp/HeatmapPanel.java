package com.dsajourney.desktop.ui.comp;

import com.dsajourney.desktop.domain.DayCount;
import com.dsajourney.desktop.ui.Theme;

import javax.swing.JComponent;
import javax.swing.ToolTipManager;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.MouseEvent;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** GitHub-style contribution grid: one column per week, one row per weekday. */
public class HeatmapPanel extends JComponent {

    private static final int CELL = 12;
    private static final int GAP = 3;
    private static final int WEEKS = 53;
    private static final int LEFT = 26;
    private static final int TOP = 16;

    private final Map<LocalDate, Integer> counts = new HashMap<>();
    private LocalDate start;

    public HeatmapPanel(List<DayCount> activity) {
        setData(activity);
        setPreferredSize(new Dimension(LEFT + WEEKS * (CELL + GAP), TOP + 7 * (CELL + GAP) + 6));
        ToolTipManager.sharedInstance().registerComponent(this);
    }

    public void setData(List<DayCount> activity) {
        counts.clear();
        if (activity != null) {
            for (DayCount d : activity) {
                if (d.date != null) {
                    counts.merge(d.date, d.count, Integer::sum);
                }
            }
        }
        // Grid ends today and starts on the Sunday 52 weeks back.
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate begin = today.minusWeeks(WEEKS - 1L);
        int shift = begin.getDayOfWeek().getValue() % 7; // Sunday == 0
        this.start = begin.minusDays(shift);
        repaint();
    }

    private static Color colorFor(int count) {
        if (count <= 0) {
            return Theme.RAISED;
        }
        if (count == 1) {
            return new Color(0x1E, 0x40, 0x6E);
        }
        if (count <= 3) {
            return new Color(0x2A, 0x5F, 0xA8);
        }
        if (count <= 6) {
            return new Color(0x3B, 0x82, 0xF6);
        }
        return new Color(0x93, 0xC5, 0xFD);
    }

    private LocalDate dateAt(int px, int py) {
        int col = (px - LEFT) / (CELL + GAP);
        int row = (py - TOP) / (CELL + GAP);
        if (col < 0 || col >= WEEKS || row < 0 || row > 6) {
            return null;
        }
        return start.plusDays(col * 7L + row);
    }

    @Override
    public String getToolTipText(MouseEvent event) {
        LocalDate d = dateAt(event.getX(), event.getY());
        if (d == null || d.isAfter(LocalDate.now(ZoneOffset.UTC))) {
            return null;
        }
        Integer n = counts.get(d);
        int c = n == null ? 0 : n.intValue();
        return d.format(DateTimeFormatter.ofPattern("d MMM yyyy")) + " — "
            + c + (c == 1 ? " problem" : " problems");
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        LocalDate today = LocalDate.now(ZoneOffset.UTC);

        g2.setFont(Theme.SMALL);
        g2.setColor(Theme.SUBTLE);
        String[] rowLabels = {"", "Mon", "", "Wed", "", "Fri", ""};
        for (int r = 0; r < 7; r++) {
            if (!rowLabels[r].isEmpty()) {
                g2.drawString(rowLabels[r], 0, TOP + r * (CELL + GAP) + CELL - 1);
            }
        }

        int lastMonth = -1;
        for (int col = 0; col < WEEKS; col++) {
            for (int row = 0; row < 7; row++) {
                LocalDate day = start.plusDays(col * 7L + row);
                if (day.isAfter(today)) {
                    continue;
                }
                Integer n = counts.get(day);
                g2.setColor(colorFor(n == null ? 0 : n.intValue()));
                int x = LEFT + col * (CELL + GAP);
                int y = TOP + row * (CELL + GAP);
                g2.fillRoundRect(x, y, CELL, CELL, 3, 3);
            }
            LocalDate first = start.plusDays(col * 7L);
            if (first.getMonthValue() != lastMonth && first.getDayOfMonth() <= 7) {
                lastMonth = first.getMonthValue();
                g2.setColor(Theme.SUBTLE);
                g2.setFont(Theme.SMALL);
                g2.drawString(first.format(DateTimeFormatter.ofPattern("MMM")),
                    LEFT + col * (CELL + GAP), 11);
            }
        }
        g2.dispose();
    }
}
