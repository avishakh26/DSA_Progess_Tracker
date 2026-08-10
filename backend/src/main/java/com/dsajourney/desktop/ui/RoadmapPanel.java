package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.TopicDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.TopicRow;
import com.dsajourney.desktop.domain.TopicStatus;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSlider;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.JTextArea;
import javax.swing.ListSelectionModel;
import javax.swing.table.AbstractTableModel;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.util.ArrayList;
import java.util.List;

/** All 14 phases: pick a topic, change its status, progress and notes. */
public class RoadmapPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final TopicDao dao = new TopicDao();
    private final TopicTableModel model = new TopicTableModel();
    private final JTable table = new JTable(model);

    private final JComboBox<TopicStatus> statusBox = new JComboBox<>(TopicStatus.values());
    private final JSlider progress = new JSlider(0, 100, 0);
    private final JTextArea notes = new JTextArea(6, 30);
    private final JLabel heading = Theme.label("Select a topic", Theme.H2, Theme.FG);
    private final JLabel description = Theme.label(" ", Theme.SMALL, Theme.MUTED);
    private final JLabel progressLabel = Theme.label("0%", Theme.SMALL, Theme.MUTED);

    private TopicRow selected;

    public RoadmapPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout(0, 10));
        setBackground(Theme.BG);

        add(Theme.label("DSA Roadmap", Theme.H1, Theme.FG), BorderLayout.NORTH);

        table.setRowHeight(24);
        table.setFillsViewportHeight(true);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        table.setAutoCreateRowSorter(true);
        table.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                onSelect();
            }
        });

        JScrollPane left = new JScrollPane(table);
        left.setBorder(BorderFactory.createLineBorder(Theme.BORDER));

        JSplitPane split = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, left, buildEditor());
        split.setDividerLocation(660);
        split.setBorder(null);
        split.setBackground(Theme.BG);
        add(split, BorderLayout.CENTER);
    }

    private JPanel buildEditor() {
        JPanel editor = new JPanel(new BorderLayout(0, 8));
        editor.setBackground(Theme.BG);
        editor.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));

        JPanel head = new JPanel(new GridLayout(2, 1));
        head.setBackground(Theme.BG);
        head.add(heading);
        head.add(description);
        editor.add(head, BorderLayout.NORTH);

        JPanel form = new JPanel();
        form.setBackground(Theme.BG);
        form.setLayout(new BorderLayout(0, 8));

        JPanel controls = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        controls.setBackground(Theme.BG);
        controls.add(Theme.label("Status", Theme.SMALL_BOLD, Theme.MUTED));
        controls.add(statusBox);
        controls.add(Theme.label("Progress", Theme.SMALL_BOLD, Theme.MUTED));
        progress.setPreferredSize(new Dimension(180, 28));
        progress.setBackground(Theme.BG);
        controls.add(progress);
        controls.add(progressLabel);
        form.add(controls, BorderLayout.NORTH);

        notes.setLineWrap(true);
        notes.setWrapStyleWord(true);
        notes.setBackground(Theme.SURFACE);
        notes.setForeground(Theme.FG);
        notes.setCaretColor(Theme.FG);
        notes.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        JScrollPane notesScroll = new JScrollPane(notes);
        notesScroll.setBorder(BorderFactory.createLineBorder(Theme.BORDER));
        form.add(notesScroll, BorderLayout.CENTER);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        actions.setBackground(Theme.BG);
        JButton save = new JButton("Save changes");
        save.setBackground(Theme.PRIMARY);
        save.setForeground(Theme.FG);
        save.setFocusPainted(false);
        save.addActionListener(e -> save());
        JButton favorite = new JButton("Toggle favourite");
        favorite.setFocusPainted(false);
        favorite.addActionListener(e -> toggleFavorite());
        actions.add(save);
        actions.add(favorite);
        form.add(actions, BorderLayout.SOUTH);

        editor.add(form, BorderLayout.CENTER);

        progress.addChangeListener(e -> progressLabel.setText(progress.getValue() + "%"));
        return editor;
    }

    private void onSelect() {
        int viewRow = table.getSelectedRow();
        if (viewRow < 0) {
            selected = null;
            return;
        }
        selected = model.at(table.convertRowIndexToModel(viewRow));
        heading.setText(Theme.ellipsis(selected.title, 40) + (selected.favorite ? "  ★" : ""));
        description.setText("Phase " + selected.phase + " · " + selected.problemCount
            + " problems logged");
        statusBox.setSelectedItem(selected.status);
        progress.setValue(selected.progress);
        progressLabel.setText(selected.progress + "%");
        notes.setText(selected.notes == null ? "" : selected.notes);
        notes.setCaretPosition(0);
    }

    private void save() {
        if (selected == null) {
            JOptionPane.showMessageDialog(this, "Pick a topic first.");
            return;
        }
        TopicStatus status = (TopicStatus) statusBox.getSelectedItem();
        dao.updateProgress(selected.id, progress.getValue());
        dao.updateStatus(selected.id, status);
        dao.updateNotes(selected.id, notes.getText());
        refresh();
    }

    private void toggleFavorite() {
        if (selected == null) {
            return;
        }
        dao.setFavorite(selected.id, !selected.favorite);
        refresh();
    }

    @Override
    public void refresh() {
        String keepId = selected == null ? null : selected.id;
        model.setRows(dao.findAll(user.id));
        if (keepId != null) {
            for (int i = 0; i < model.getRowCount(); i++) {
                if (model.at(i).id.equals(keepId)) {
                    int view = table.convertRowIndexToView(i);
                    table.setRowSelectionInterval(view, view);
                    break;
                }
            }
        }
    }

    /** Table model over the topic list; every column is read-only. */
    private static class TopicTableModel extends AbstractTableModel {

        private final String[] columns = {"Phase", "Topic", "Status", "Progress", "Problems", "★"};
        private List<TopicRow> rows = new ArrayList<>();

        void setRows(List<TopicRow> value) {
            this.rows = value == null ? new ArrayList<>() : value;
            fireTableDataChanged();
        }

        TopicRow at(int index) {
            return rows.get(index);
        }

        @Override
        public int getRowCount() {
            return rows.size();
        }

        @Override
        public int getColumnCount() {
            return columns.length;
        }

        @Override
        public String getColumnName(int column) {
            return columns[column];
        }

        @Override
        public Class<?> getColumnClass(int column) {
            return column == 0 || column == 4 ? Integer.class : String.class;
        }

        @Override
        public Object getValueAt(int row, int column) {
            TopicRow t = rows.get(row);
            switch (column) {
                case 0: return Integer.valueOf(t.phase);
                case 1: return t.title;
                case 2: return t.status.label();
                case 3: return t.progress + "%";
                case 4: return Integer.valueOf(t.problemCount);
                default: return t.favorite ? "★" : "";
            }
        }
    }
}
