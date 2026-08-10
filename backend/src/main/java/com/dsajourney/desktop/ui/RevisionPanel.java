package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.ProblemDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.ProblemRow;
import com.dsajourney.desktop.util.Dates;

import javax.swing.BorderFactory;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.AbstractTableModel;
import java.awt.BorderLayout;
import java.util.ArrayList;
import java.util.List;

/** Everything flagged REVISION, plus favourites, in one queue. */
public class RevisionPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final ProblemDao dao = new ProblemDao();
    private final Model revision = new Model();
    private final Model favorites = new Model();

    public RevisionPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout(0, 10));
        setBackground(Theme.BG);
        add(Theme.label("Revision & favourites", Theme.H1, Theme.FG), BorderLayout.NORTH);

        JPanel grid = new JPanel(new java.awt.GridLayout(2, 1, 0, 12));
        grid.setBackground(Theme.BG);
        grid.add(section("Needs revision", revision));
        grid.add(section("Favourites", favorites));
        add(grid, BorderLayout.CENTER);
    }

    private JPanel section(String heading, Model model) {
        JPanel wrap = new JPanel(new BorderLayout(0, 6));
        wrap.setBackground(Theme.BG);
        wrap.add(Theme.title(heading), BorderLayout.NORTH);
        JTable table = new JTable(model);
        table.setRowHeight(23);
        table.setAutoCreateRowSorter(true);
        table.setFillsViewportHeight(true);
        JScrollPane scroll = new JScrollPane(table);
        scroll.setBorder(BorderFactory.createLineBorder(Theme.BORDER));
        wrap.add(scroll, BorderLayout.CENTER);
        return wrap;
    }

    @Override
    public void refresh() {
        revision.setRows(dao.findForRevision(user.id));
        favorites.setRows(dao.findFavorites(user.id));
    }

    private static class Model extends AbstractTableModel {

        private final String[] columns = {"Title", "Topic", "Platform", "Difficulty", "Solved"};
        private List<ProblemRow> rows = new ArrayList<>();

        void setRows(List<ProblemRow> value) {
            this.rows = value == null ? new ArrayList<>() : value;
            fireTableDataChanged();
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
                default: return Dates.display(p.solvedDate);
            }
        }
    }
}
