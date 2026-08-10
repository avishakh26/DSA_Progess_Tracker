package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.ProblemDao;
import com.dsajourney.desktop.dao.TopicDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.ProblemRow;
import com.dsajourney.desktop.domain.TopicRow;
import com.dsajourney.desktop.util.Dates;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.table.AbstractTableModel;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Full problem log with search, filtering and add/edit/delete. */
public class ProblemsPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final ProblemDao dao = new ProblemDao();
    private final TopicDao topicDao = new TopicDao();

    private final ProblemTableModel model = new ProblemTableModel();
    private final JTable table = new JTable(model);
    private final JTextField search = new JTextField(22);
    private final JComboBox<String> statusFilter =
        new JComboBox<>(new String[] {"All statuses", "SOLVED", "ATTEMPTED", "REVISION"});
    private final JComboBox<String> difficultyFilter =
        new JComboBox<>(new String[] {"All difficulties", "EASY", "MEDIUM", "HARD"});

    private List<ProblemRow> all = new ArrayList<>();
    private List<TopicRow> topics = new ArrayList<>();

    public ProblemsPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout(0, 10));
        setBackground(Theme.BG);

        add(buildToolbar(), BorderLayout.NORTH);

        table.setRowHeight(24);
        table.setFillsViewportHeight(true);
        table.setAutoCreateRowSorter(true);
        table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createLineBorder(Theme.BORDER));
        add(scroll, BorderLayout.CENTER);
    }

    private JPanel buildToolbar() {
        JPanel bar = new JPanel(new BorderLayout(10, 0));
        bar.setBackground(Theme.BG);

        bar.add(Theme.label("Problems", Theme.H1, Theme.FG), BorderLayout.WEST);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 6));
        right.setBackground(Theme.BG);

        search.setPreferredSize(new Dimension(210, 28));
        search.getDocument().addDocumentListener(new DocumentListener() {
            @Override
            public void insertUpdate(DocumentEvent e) {
                applyFilters();
            }

            @Override
            public void removeUpdate(DocumentEvent e) {
                applyFilters();
            }

            @Override
            public void changedUpdate(DocumentEvent e) {
                applyFilters();
            }
        });
        statusFilter.addActionListener(e -> applyFilters());
        difficultyFilter.addActionListener(e -> applyFilters());

        JButton add = new JButton("Add problem");
        add.setBackground(Theme.PRIMARY);
        add.setForeground(Theme.FG);
        add.setFocusPainted(false);
        add.addActionListener(e -> openDialog(null));

        JButton edit = new JButton("Edit");
        edit.setFocusPainted(false);
        edit.addActionListener(e -> {
            ProblemRow row = selectedRow();
            if (row != null) {
                openDialog(row);
            }
        });

        JButton delete = new JButton("Delete");
        delete.setFocusPainted(false);
        delete.addActionListener(e -> deleteSelected());

        right.add(Theme.label("Search", Theme.SMALL_BOLD, Theme.MUTED));
        right.add(search);
        right.add(statusFilter);
        right.add(difficultyFilter);
        right.add(add);
        right.add(edit);
        right.add(delete);
        bar.add(right, BorderLayout.EAST);
        return bar;
    }

    private ProblemRow selectedRow() {
        int view = table.getSelectedRow();
        if (view < 0) {
            JOptionPane.showMessageDialog(this, "Select a problem first.");
            return null;
        }
        return model.at(table.convertRowIndexToModel(view));
    }

    private void openDialog(ProblemRow existing) {
        if (topics.isEmpty()) {
            topics = topicDao.findAll(user.id);
        }
        ProblemDialog dialog = new ProblemDialog(
            javax.swing.SwingUtilities.getWindowAncestor(this), topics, existing);
        dialog.setVisible(true);
        ProblemRow result = dialog.result();
        if (result == null) {
            return;
        }
        if (existing == null) {
            dao.insert(user.id, result);
        } else {
            dao.update(result);
        }
        refresh();
    }

    private void deleteSelected() {
        ProblemRow row = selectedRow();
        if (row == null) {
            return;
        }
        int answer = JOptionPane.showConfirmDialog(this,
            "Delete \"" + row.title + "\"?\nThis also decrements that day's activity count.",
            "Delete problem", JOptionPane.YES_NO_OPTION);
        if (answer == JOptionPane.YES_OPTION) {
            dao.delete(user.id, row.id, row.solvedDate);
            refresh();
        }
    }

    private void applyFilters() {
        String needle = search.getText().trim().toLowerCase(Locale.ROOT);
        String status = (String) statusFilter.getSelectedItem();
        String difficulty = (String) difficultyFilter.getSelectedItem();

        List<ProblemRow> filtered = new ArrayList<>();
        for (ProblemRow p : all) {
            if (!needle.isEmpty()) {
                String haystack = (p.title + " " + p.topicTitle + " "
                    + (p.tags == null ? "" : p.tags)).toLowerCase(Locale.ROOT);
                if (!haystack.contains(needle)) {
                    continue;
                }
            }
            if (status != null && !status.startsWith("All") && !p.status.name().equals(status)) {
                continue;
            }
            if (difficulty != null && !difficulty.startsWith("All")
                && !p.difficulty.name().equals(difficulty)) {
                continue;
            }
            filtered.add(p);
        }
        model.setRows(filtered);
    }

    @Override
    public void refresh() {
        all = dao.findAll(user.id);
        topics = topicDao.findAll(user.id);
        applyFilters();
    }

    private static class ProblemTableModel extends AbstractTableModel {

        private final String[] columns =
            {"Title", "Topic", "Platform", "Difficulty", "Status", "Solved", "Tags"};
        private List<ProblemRow> rows = new ArrayList<>();

        void setRows(List<ProblemRow> value) {
            this.rows = value == null ? new ArrayList<>() : value;
            fireTableDataChanged();
        }

        ProblemRow at(int index) {
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
        public Object getValueAt(int row, int column) {
            ProblemRow p = rows.get(row);
            switch (column) {
                case 0: return p.title;
                case 1: return p.topicTitle;
                case 2: return p.platform.label();
                case 3: return p.difficulty.label();
                case 4: return p.status.label();
                case 5: return Dates.display(p.solvedDate);
                default: return p.tags == null ? "" : p.tags;
            }
        }
    }
}
