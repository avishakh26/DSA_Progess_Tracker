package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.domain.AppUser;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.LinkedHashMap;
import java.util.Map;

/** Shell: sidebar navigation on the left, the active screen on the right. */
public class MainFrame extends JFrame {

    private final AppUser user;
    private final CardLayout cards = new CardLayout();
    private final JPanel content = new JPanel(cards);
    private final Map<String, JComponent> screens = new LinkedHashMap<>();
    private final Map<String, JButton> navButtons = new LinkedHashMap<>();
    private String active;

    public MainFrame(AppUser user) {
        super("DSA Journey — " + user.displayName());
        this.user = user;
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1280, 820);
        setMinimumSize(new Dimension(1040, 680));
        setLocationRelativeTo(null);

        content.setBackground(Theme.BG);
        content.setBorder(BorderFactory.createEmptyBorder(16, 18, 18, 18));

        register("Dashboard", new DashboardPanel(user));
        register("Roadmap", new RoadmapPanel(user));
        register("Problems", new ProblemsPanel(user));
        register("Revision", new RevisionPanel(user));
        register("Notes", new NotesPanel(user));
        register("Goals", new GoalsPanel(user));
        register("Statistics", new StatisticsPanel(user));

        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(Theme.BG);
        root.add(buildSidebar(), BorderLayout.WEST);
        root.add(content, BorderLayout.CENTER);
        setContentPane(root);

        show("Dashboard");
    }

    private void register(String name, JComponent screen) {
        screens.put(name, screen);
        content.add(screen, name);
    }

    private JPanel buildSidebar() {
        JPanel side = new JPanel();
        side.setLayout(new BoxLayout(side, BoxLayout.Y_AXIS));
        side.setBackground(Theme.SURFACE);
        side.setPreferredSize(new Dimension(216, 0));
        side.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, Theme.BORDER));

        JLabel brand = Theme.label("  DSA Journey", Theme.H2, Theme.FG);
        brand.setAlignmentX(Component.LEFT_ALIGNMENT);
        brand.setBorder(BorderFactory.createEmptyBorder(18, 10, 6, 10));
        side.add(brand);

        JLabel who = Theme.label("  " + Theme.ellipsis(user.email, 24), Theme.SMALL, Theme.SUBTLE);
        who.setAlignmentX(Component.LEFT_ALIGNMENT);
        who.setBorder(BorderFactory.createEmptyBorder(0, 10, 16, 10));
        side.add(who);

        for (String name : screens.keySet()) {
            JButton b = navButton(name);
            navButtons.put(name, b);
            side.add(b);
        }

        side.add(javax.swing.Box.createVerticalGlue());

        JButton refresh = navButton("Refresh");
        refresh.addActionListener(e -> refreshActive());
        side.add(refresh);

        JButton signOut = navButton("Sign out");
        signOut.addActionListener(e -> {
            new LoginFrame().setVisible(true);
            dispose();
        });
        side.add(signOut);

        JPanel footer = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 8));
        footer.setBackground(Theme.SURFACE);
        footer.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
        footer.add(Theme.label("Shared with the web app", Theme.SMALL, Theme.SUBTLE));
        side.add(footer);
        return side;
    }

    private JButton navButton(String name) {
        final JButton b = new JButton(name);
        b.setAlignmentX(Component.LEFT_ALIGNMENT);
        b.setHorizontalAlignment(SwingConstants.LEFT);
        b.setMaximumSize(new Dimension(Integer.MAX_VALUE, 36));
        b.setPreferredSize(new Dimension(200, 36));
        b.setFocusPainted(false);
        b.setBorderPainted(false);
        b.setContentAreaFilled(true);
        b.setBackground(Theme.SURFACE);
        b.setForeground(Theme.MUTED);
        b.setFont(Theme.BASE);
        b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        b.setBorder(BorderFactory.createEmptyBorder(0, 16, 0, 10));
        if (screens.containsKey(name)) {
            b.addActionListener(e -> show(name));
        }
        b.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                if (!name.equals(active)) {
                    b.setBackground(Theme.HOVER);
                }
            }

            @Override
            public void mouseExited(MouseEvent e) {
                if (!name.equals(active)) {
                    b.setBackground(Theme.SURFACE);
                }
            }
        });
        return b;
    }

    /** Switches screens and reloads the target so it never shows stale rows. */
    public void show(String name) {
        active = name;
        for (Map.Entry<String, JButton> entry : navButtons.entrySet()) {
            boolean on = entry.getKey().equals(name);
            entry.getValue().setBackground(on ? Theme.PRIMARY_SOFT : Theme.SURFACE);
            entry.getValue().setForeground(on ? Theme.FG : Theme.MUTED);
        }
        cards.show(content, name);
        refreshActive();
    }

    private void refreshActive() {
        JComponent screen = screens.get(active);
        if (screen instanceof Refreshable) {
            ((Refreshable) screen).refresh();
        }
    }
}
