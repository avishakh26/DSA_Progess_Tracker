package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.GoalDao;
import com.dsajourney.desktop.dao.UserDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.GoalRow;
import com.dsajourney.desktop.ui.comp.Bar;
import com.dsajourney.desktop.ui.comp.Card;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSpinner;
import javax.swing.ScrollPaneConstants;
import javax.swing.SpinnerNumberModel;
import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.util.List;

/** Monthly goals plus the daily target used by the dashboard ring. */
public class GoalsPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final GoalDao dao = new GoalDao();
    private final UserDao userDao = new UserDao();
    private final JPanel list = new JPanel();
    private final JSpinner dailyGoal;

    public GoalsPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout(0, 10));
        setBackground(Theme.BG);

        dailyGoal = new JSpinner(new SpinnerNumberModel(Math.max(1, user.dailyGoal), 1, 50, 1));

        JPanel head = new JPanel(new BorderLayout());
        head.setBackground(Theme.BG);
        head.add(Theme.label("Monthly goals", Theme.H1, Theme.FG), BorderLayout.WEST);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 6));
        right.setBackground(Theme.BG);
        right.add(Theme.label("Daily target", Theme.SMALL_BOLD, Theme.MUTED));
        dailyGoal.setPreferredSize(new Dimension(64, 26));
        right.add(dailyGoal);
        JButton save = new JButton("Save target");
        save.setBackground(Theme.PRIMARY);
        save.setForeground(Theme.FG);
        save.setFocusPainted(false);
        save.addActionListener(e -> {
            userDao.updateDailyGoal(user.id, ((Integer) dailyGoal.getValue()).intValue());
            javax.swing.JOptionPane.showMessageDialog(this,
                "Saved. The dashboard picks this up after the next sign-in.");
        });
        right.add(save);
        head.add(right, BorderLayout.EAST);
        add(head, BorderLayout.NORTH);

        list.setLayout(new BoxLayout(list, BoxLayout.Y_AXIS));
        list.setBackground(Theme.BG);
        JScrollPane scroll = new JScrollPane(list);
        scroll.setBorder(null);
        scroll.getViewport().setBackground(Theme.BG);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        scroll.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        add(scroll, BorderLayout.CENTER);
    }

    @Override
    public void refresh() {
        List<GoalRow> goals = dao.findAll(user.id);
        list.removeAll();
        if (goals.isEmpty()) {
            list.add(Theme.label("No monthly goals yet.", Theme.BASE, Theme.MUTED));
        }
        for (final GoalRow g : goals) {
            list.add(goalCard(g));
            list.add(javax.swing.Box.createRigidArea(new Dimension(1, 8)));
        }
        list.revalidate();
        list.repaint();
    }

    private Card goalCard(final GoalRow g) {
        Card card = new Card();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setAlignmentX(Component.LEFT_ALIGNMENT);
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 132));

        JLabel heading = Theme.label("Month " + g.month + " — " + g.title, Theme.H2, Theme.FG);
        heading.setAlignmentX(Component.LEFT_ALIGNMENT);

        JLabel focus = Theme.label(g.focus == null ? "" : g.focus, Theme.SMALL, Theme.MUTED);
        focus.setAlignmentX(Component.LEFT_ALIGNMENT);
        focus.setBorder(BorderFactory.createEmptyBorder(2, 0, 8, 0));

        Bar bar = new Bar(g.percent());
        bar.setColor(g.completed ? Theme.SUCCESS : Theme.PRIMARY);
        bar.setAlignmentX(Component.LEFT_ALIGNMENT);
        bar.setMaximumSize(new Dimension(Integer.MAX_VALUE, 8));

        JPanel controls = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        controls.setOpaque(false);
        controls.setAlignmentX(Component.LEFT_ALIGNMENT);
        controls.setMaximumSize(new Dimension(Integer.MAX_VALUE, 40));
        controls.add(Theme.label(g.progress + " / " + g.target + "  (" + g.percent() + "%)",
            Theme.SMALL, Theme.MUTED));

        final JSpinner spinner = new JSpinner(
            new SpinnerNumberModel(Math.max(0, g.progress), 0, 10000, 1));
        spinner.setPreferredSize(new Dimension(70, 24));
        controls.add(spinner);

        JButton update = new JButton("Update");
        update.setFocusPainted(false);
        update.addActionListener(e -> {
            int value = ((Integer) spinner.getValue()).intValue();
            dao.update(g.id, value, g.target > 0 && value >= g.target);
            refresh();
        });
        controls.add(update);

        card.add(heading);
        card.add(focus);
        card.add(bar);
        card.add(controls);
        return card;
    }
}
