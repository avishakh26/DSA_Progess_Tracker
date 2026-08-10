package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.StatsDao;
import com.dsajourney.desktop.dao.TopicDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.DashboardStats;
import com.dsajourney.desktop.domain.Difficulty;
import com.dsajourney.desktop.domain.PhaseProgress;
import com.dsajourney.desktop.ui.comp.Bar;
import com.dsajourney.desktop.ui.comp.BarChartPanel;
import com.dsajourney.desktop.ui.comp.Card;
import com.dsajourney.desktop.ui.comp.HBarChartPanel;
import com.dsajourney.desktop.ui.comp.StatCard;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.ScrollPaneConstants;
import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.util.List;

/** Deeper cuts: platform mix, difficulty mix and per-phase completion. */
public class StatisticsPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final StatsDao stats = new StatsDao();
    private final TopicDao topics = new TopicDao();
    private final JPanel body = new JPanel();

    public StatisticsPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout(0, 10));
        setBackground(Theme.BG);
        add(Theme.label("Statistics", Theme.H1, Theme.FG), BorderLayout.NORTH);

        body.setLayout(new BoxLayout(body, BoxLayout.Y_AXIS));
        body.setBackground(Theme.BG);
        JScrollPane scroll = new JScrollPane(body);
        scroll.setBorder(null);
        scroll.getViewport().setBackground(Theme.BG);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        scroll.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        add(scroll, BorderLayout.CENTER);
    }

    @Override
    public void refresh() {
        DashboardStats s = stats.dashboard(user.id, user.dailyGoal);
        List<PhaseProgress> phases = topics.phaseProgress(user.id);

        body.removeAll();

        JPanel row = new JPanel(new GridLayout(1, 4, 10, 0));
        row.setBackground(Theme.BG);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 110));
        row.add(new StatCard("Total problems", String.valueOf(s.totalProblems),
            "all time", Theme.MUTED));
        row.add(new StatCard("Solved", String.valueOf(s.solvedProblems),
            s.attemptedProblems + " attempted", Theme.SUCCESS));
        row.add(new StatCard("To revise", String.valueOf(s.revisionProblems),
            "flagged for another pass", Theme.DANGER));
        row.add(new StatCard("Completion", s.completion() + "%",
            s.doneTopics + " of " + (s.totalTopics - s.skippedTopics) + " topics", Theme.PRIMARY));
        body.add(row);
        body.add(Box.createRigidArea(new Dimension(1, 12)));

        Card monthly = new Card(new BorderLayout());
        monthly.setAlignmentX(Component.LEFT_ALIGNMENT);
        monthly.setMaximumSize(new Dimension(Integer.MAX_VALUE, 260));
        monthly.add(Theme.title("Last 12 months, by difficulty"), BorderLayout.NORTH);
        JPanel holder = new JPanel(new BorderLayout());
        holder.setOpaque(false);
        holder.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 0));
        holder.add(new BarChartPanel(stats.monthlySeries(user.id, 12), true), BorderLayout.CENTER);
        monthly.add(holder, BorderLayout.CENTER);
        body.add(monthly);
        body.add(Box.createRigidArea(new Dimension(1, 12)));

        JPanel pair = new JPanel(new GridLayout(1, 2, 10, 0));
        pair.setBackground(Theme.BG);
        pair.setAlignmentX(Component.LEFT_ALIGNMENT);
        pair.setMaximumSize(new Dimension(Integer.MAX_VALUE, 240));

        Card platform = new Card(new BorderLayout());
        platform.add(Theme.title("By platform"), BorderLayout.NORTH);
        JPanel platformHolder = new JPanel(new BorderLayout());
        platformHolder.setOpaque(false);
        platformHolder.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 0));
        platformHolder.add(new HBarChartPanel(stats.byPlatform(user.id)), BorderLayout.NORTH);
        platform.add(platformHolder, BorderLayout.CENTER);

        Card difficulty = new Card();
        difficulty.setLayout(new BoxLayout(difficulty, BoxLayout.Y_AXIS));
        difficulty.add(Theme.title("By difficulty"));
        int total = Math.max(1, s.totalProblems);
        difficulty.add(difficultyRow(Difficulty.EASY, s.easy, total));
        difficulty.add(difficultyRow(Difficulty.MEDIUM, s.medium, total));
        difficulty.add(difficultyRow(Difficulty.HARD, s.hard, total));

        pair.add(platform);
        pair.add(difficulty);
        body.add(pair);
        body.add(Box.createRigidArea(new Dimension(1, 12)));

        Card phaseCard = new Card();
        phaseCard.setLayout(new BoxLayout(phaseCard, BoxLayout.Y_AXIS));
        phaseCard.setAlignmentX(Component.LEFT_ALIGNMENT);
        phaseCard.setMaximumSize(new Dimension(Integer.MAX_VALUE, 60 + phases.size() * 24));
        phaseCard.add(Theme.title("Completion by phase"));
        for (PhaseProgress p : phases) {
            JPanel line = new JPanel(new BorderLayout(8, 0));
            line.setOpaque(false);
            line.setAlignmentX(Component.LEFT_ALIGNMENT);
            line.setMaximumSize(new Dimension(Integer.MAX_VALUE, 22));
            JLabel name = Theme.label("Phase " + p.phase, Theme.SMALL, Theme.MUTED);
            name.setPreferredSize(new Dimension(70, 14));
            JLabel value = Theme.label(p.done + "/" + p.total + "  " + p.percent() + "%",
                Theme.SMALL, Theme.SUBTLE);
            value.setPreferredSize(new Dimension(86, 14));
            line.add(name, BorderLayout.WEST);
            line.add(new Bar(p.percent()), BorderLayout.CENTER);
            line.add(value, BorderLayout.EAST);
            phaseCard.add(line);
        }
        body.add(phaseCard);

        body.revalidate();
        body.repaint();
    }

    private JPanel difficultyRow(Difficulty d, int count, int total) {
        JPanel line = new JPanel(new BorderLayout(8, 0));
        line.setOpaque(false);
        line.setAlignmentX(Component.LEFT_ALIGNMENT);
        line.setMaximumSize(new Dimension(Integer.MAX_VALUE, 26));
        line.setBorder(BorderFactory.createEmptyBorder(8, 0, 0, 0));
        JLabel name = Theme.label(d.label(), Theme.SMALL, Theme.FG);
        name.setPreferredSize(new Dimension(60, 16));
        Bar bar = new Bar(count * 100 / total);
        bar.setColor(d.color());
        JLabel n = Theme.label(String.valueOf(count), Theme.SMALL, Theme.MUTED);
        n.setPreferredSize(new Dimension(40, 16));
        line.add(name, BorderLayout.WEST);
        line.add(bar, BorderLayout.CENTER);
        line.add(n, BorderLayout.EAST);
        return line;
    }
}
