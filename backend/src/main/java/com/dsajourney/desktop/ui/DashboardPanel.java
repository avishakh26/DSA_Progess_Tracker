package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.ProblemDao;
import com.dsajourney.desktop.dao.StatsDao;
import com.dsajourney.desktop.dao.TopicDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.DashboardStats;
import com.dsajourney.desktop.domain.Difficulty;
import com.dsajourney.desktop.domain.LabelledCount;
import com.dsajourney.desktop.domain.PhaseProgress;
import com.dsajourney.desktop.domain.ProblemRow;
import com.dsajourney.desktop.domain.TopicRow;
import com.dsajourney.desktop.ui.comp.Bar;
import com.dsajourney.desktop.ui.comp.BarChartPanel;
import com.dsajourney.desktop.ui.comp.Card;
import com.dsajourney.desktop.ui.comp.HeatmapPanel;
import com.dsajourney.desktop.ui.comp.RadialProgress;
import com.dsajourney.desktop.ui.comp.StatCard;
import com.dsajourney.desktop.util.Dates;

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
import java.time.LocalTime;
import java.util.List;

/** Landing screen: KPIs, contribution heatmap, activity charts and recent work. */
public class DashboardPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final JPanel body = new JPanel();

    public DashboardPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout());
        setBackground(Theme.BG);

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
        StatsDao stats = new StatsDao();
        TopicDao topics = new TopicDao();
        ProblemDao problems = new ProblemDao();

        DashboardStats s = stats.dashboard(user.id, user.dailyGoal);
        List<LabelledCount> daily = stats.dailySeries(user.id, 14);
        List<LabelledCount> monthly = stats.monthlySeries(user.id, 6);
        List<PhaseProgress> phases = topics.phaseProgress(user.id);
        TopicRow next = topics.findNextPending(user.id);
        List<ProblemRow> recent = problems.findRecent(user.id, 8);

        body.removeAll();
        body.add(header(s));
        body.add(gap(12));
        body.add(kpis(s));
        body.add(gap(12));
        body.add(heatmapCard(s));
        body.add(gap(12));
        body.add(chartsRow(s, daily));
        body.add(gap(12));
        body.add(monthlyAndNext(monthly, next, phases));
        body.add(gap(12));
        body.add(recentCard(recent));
        body.revalidate();
        body.repaint();
    }

    private Component gap(int h) {
        return Box.createRigidArea(new Dimension(1, h));
    }

    private JPanel header(DashboardStats s) {
        Card card = new Card();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBackground(Theme.RAISED);
        card.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 92));

        JLabel greeting = Theme.label(greeting() + ", " + user.firstName(), Theme.H1, Theme.FG);
        greeting.setAlignmentX(Component.LEFT_ALIGNMENT);

        String streakLine = s.streak > 0
            ? "You're on a " + s.streak + "-day streak — keep it alive."
            : "No active streak. Solve one problem today to start a new one.";
        JLabel sub = Theme.label(streakLine, Theme.BASE, Theme.MUTED);
        sub.setAlignmentX(Component.LEFT_ALIGNMENT);
        sub.setBorder(BorderFactory.createEmptyBorder(6, 0, 0, 0));

        card.add(greeting);
        card.add(sub);
        return card;
    }

    private static String greeting() {
        int hour = LocalTime.now().getHour();
        if (hour < 5) {
            return "Still up";
        }
        if (hour < 12) {
            return "Good morning";
        }
        if (hour < 18) {
            return "Good afternoon";
        }
        return "Good evening";
    }

    private JPanel kpis(DashboardStats s) {
        JPanel row = new JPanel(new GridLayout(1, 6, 10, 0));
        row.setBackground(Theme.BG);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 110));

        row.add(new StatCard("Topics", String.valueOf(s.totalTopics),
            "across 14 phases", Theme.MUTED));
        row.add(new StatCard("Completed", String.valueOf(s.doneTopics),
            s.pendingTopics + " pending · " + s.skippedTopics + " skipped", Theme.SUCCESS));
        row.add(new StatCard("Problems", String.valueOf(s.totalProblems),
            s.solvedProblems + " solved · " + s.revisionProblems + " to revise", Theme.WARNING));
        row.add(new StatCard("Completion", s.completion() + "%",
            "of non-skipped topics", Theme.PRIMARY));
        row.add(new StatCard("Streak", s.streak + "d",
            s.streak > 0 ? "keep going" : "start today", Theme.DANGER));
        row.add(new StatCard("Longest", s.longestStreak + "d",
            "personal best", Theme.MUTED));
        return row;
    }

    private JPanel heatmapCard(DashboardStats s) {
        Card card = new Card(new BorderLayout());
        card.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 190));
        card.add(Theme.title("Contribution heatmap"), BorderLayout.NORTH);

        JPanel holder = new JPanel(new BorderLayout());
        holder.setOpaque(false);
        holder.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 0));
        holder.add(new HeatmapPanel(s.activity), BorderLayout.WEST);
        card.add(holder, BorderLayout.CENTER);
        return card;
    }

    private JPanel chartsRow(DashboardStats s, List<LabelledCount> daily) {
        JPanel row = new JPanel(new BorderLayout(10, 0));
        row.setBackground(Theme.BG);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 260));

        Card left = new Card(new BorderLayout());
        left.add(Theme.title("Last 14 days"), BorderLayout.NORTH);
        JPanel chartHolder = new JPanel(new BorderLayout());
        chartHolder.setOpaque(false);
        chartHolder.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 0));
        chartHolder.add(new BarChartPanel(daily, false), BorderLayout.CENTER);
        left.add(chartHolder, BorderLayout.CENTER);

        JPanel right = new JPanel(new BorderLayout(0, 10));
        right.setBackground(Theme.BG);
        right.setPreferredSize(new Dimension(330, 240));

        Card goal = new Card(new BorderLayout());
        goal.add(Theme.title("Today's goal"), BorderLayout.NORTH);
        goal.add(new RadialProgress(s.solvedToday, s.dailyGoal), BorderLayout.CENTER);
        String goalNote = s.goalPercent() >= 100
            ? "Goal met — anything else is a bonus."
            : (s.dailyGoal - s.solvedToday) + " to go.";
        goal.add(Theme.label(goalNote, Theme.SMALL, Theme.SUBTLE), BorderLayout.SOUTH);

        Card split = new Card();
        split.setLayout(new BoxLayout(split, BoxLayout.Y_AXIS));
        split.add(Theme.title("Difficulty split"));
        int total = Math.max(1, s.totalProblems);
        split.add(difficultyRow(Difficulty.EASY, s.easy, total));
        split.add(difficultyRow(Difficulty.MEDIUM, s.medium, total));
        split.add(difficultyRow(Difficulty.HARD, s.hard, total));

        right.add(goal, BorderLayout.CENTER);
        right.add(split, BorderLayout.SOUTH);

        row.add(left, BorderLayout.CENTER);
        row.add(right, BorderLayout.EAST);
        return row;
    }

    private JPanel difficultyRow(Difficulty d, int count, int total) {
        JPanel line = new JPanel(new BorderLayout(8, 0));
        line.setOpaque(false);
        line.setAlignmentX(Component.LEFT_ALIGNMENT);
        line.setMaximumSize(new Dimension(Integer.MAX_VALUE, 26));
        line.setBorder(BorderFactory.createEmptyBorder(6, 0, 0, 0));

        JLabel name = Theme.label(d.label(), Theme.SMALL, Theme.FG);
        name.setPreferredSize(new Dimension(58, 16));

        Bar bar = new Bar(count * 100 / total);
        bar.setColor(d.color());

        JLabel n = Theme.label(String.valueOf(count), Theme.SMALL, Theme.MUTED);
        n.setPreferredSize(new Dimension(34, 16));

        line.add(name, BorderLayout.WEST);
        line.add(bar, BorderLayout.CENTER);
        line.add(n, BorderLayout.EAST);
        return line;
    }

    private JPanel monthlyAndNext(List<LabelledCount> monthly, TopicRow next,
                                  List<PhaseProgress> phases) {
        JPanel row = new JPanel(new BorderLayout(10, 0));
        row.setBackground(Theme.BG);
        row.setAlignmentX(Component.LEFT_ALIGNMENT);
        row.setMaximumSize(new Dimension(Integer.MAX_VALUE, 280));

        Card left = new Card(new BorderLayout());
        left.add(Theme.title("Monthly progress"), BorderLayout.NORTH);
        JPanel holder = new JPanel(new BorderLayout());
        holder.setOpaque(false);
        holder.setBorder(BorderFactory.createEmptyBorder(10, 0, 0, 0));
        holder.add(new BarChartPanel(monthly, true), BorderLayout.CENTER);
        left.add(holder, BorderLayout.CENTER);

        Card right = new Card();
        right.setLayout(new BoxLayout(right, BoxLayout.Y_AXIS));
        right.setPreferredSize(new Dimension(330, 260));
        right.add(Theme.title("Continue learning"));
        if (next == null) {
            right.add(Theme.label("Nothing pending — every topic is done or skipped.",
                Theme.SMALL, Theme.MUTED));
        } else {
            JLabel phase = Theme.label("Phase " + next.phase, Theme.SMALL, Theme.SUBTLE);
            phase.setAlignmentX(Component.LEFT_ALIGNMENT);
            JLabel titleLabel = Theme.label(Theme.ellipsis(next.title, 34), Theme.H2, Theme.FG);
            titleLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
            titleLabel.setBorder(BorderFactory.createEmptyBorder(4, 0, 6, 0));
            Bar bar = new Bar(next.progress);
            bar.setAlignmentX(Component.LEFT_ALIGNMENT);
            bar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 8));
            right.add(phase);
            right.add(titleLabel);
            right.add(bar);
        }

        JLabel phaseHeading = Theme.label("PHASE PROGRESS", Theme.SMALL_BOLD, Theme.MUTED);
        phaseHeading.setAlignmentX(Component.LEFT_ALIGNMENT);
        phaseHeading.setBorder(BorderFactory.createEmptyBorder(14, 0, 4, 0));
        right.add(phaseHeading);

        int shown = 0;
        for (PhaseProgress p : phases) {
            if (shown++ >= 6) {
                break;
            }
            JPanel line = new JPanel(new BorderLayout(8, 0));
            line.setOpaque(false);
            line.setAlignmentX(Component.LEFT_ALIGNMENT);
            line.setMaximumSize(new Dimension(Integer.MAX_VALUE, 22));
            JLabel n = Theme.label(String.valueOf(p.phase), Theme.SMALL, Theme.SUBTLE);
            n.setPreferredSize(new Dimension(20, 14));
            JLabel pct = Theme.label(p.percent() + "%", Theme.SMALL, Theme.MUTED);
            pct.setPreferredSize(new Dimension(38, 14));
            line.add(n, BorderLayout.WEST);
            line.add(new Bar(p.percent()), BorderLayout.CENTER);
            line.add(pct, BorderLayout.EAST);
            right.add(line);
        }

        row.add(left, BorderLayout.CENTER);
        row.add(right, BorderLayout.EAST);
        return row;
    }

    private JPanel recentCard(List<ProblemRow> recent) {
        Card card = new Card();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 60 + recent.size() * 26));
        card.add(Theme.title("Recently solved"));

        if (recent.isEmpty()) {
            card.add(Theme.label("No problems logged yet.", Theme.SMALL, Theme.SUBTLE));
            return card;
        }
        for (ProblemRow p : recent) {
            JPanel line = new JPanel(new BorderLayout(10, 0));
            line.setOpaque(false);
            line.setAlignmentX(Component.LEFT_ALIGNMENT);
            line.setMaximumSize(new Dimension(Integer.MAX_VALUE, 24));
            line.setBorder(BorderFactory.createEmptyBorder(4, 0, 0, 0));

            JLabel title = Theme.label(Theme.ellipsis(p.title, 46), Theme.BASE, Theme.FG);
            JPanel meta = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.RIGHT, 10, 0));
            meta.setOpaque(false);
            meta.add(Theme.label(p.difficulty.label(), Theme.SMALL, p.difficulty.color()));
            meta.add(Theme.label(p.status.label(), Theme.SMALL, p.status.color()));
            meta.add(Theme.label(Dates.displayShort(p.solvedDate), Theme.SMALL, Theme.SUBTLE));

            line.add(title, BorderLayout.WEST);
            line.add(Theme.label(Theme.ellipsis(p.topicTitle, 26), Theme.SMALL, Theme.MUTED),
                BorderLayout.CENTER);
            line.add(meta, BorderLayout.EAST);
            card.add(line);
        }
        return card;
    }
}
