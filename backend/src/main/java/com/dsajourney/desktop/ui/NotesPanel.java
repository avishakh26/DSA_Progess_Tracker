package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.NoteDao;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.domain.NoteRow;

import javax.swing.BorderFactory;
import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.util.List;

/** Simple two-pane notebook: list on the left, editor on the right. */
public class NotesPanel extends JPanel implements Refreshable {

    private final AppUser user;
    private final NoteDao dao = new NoteDao();

    private final DefaultListModel<NoteRow> listModel = new DefaultListModel<>();
    private final JList<NoteRow> list = new JList<>(listModel);
    private final JTextField title = new JTextField(30);
    private final JTextArea content = new JTextArea();

    private NoteRow selected;

    public NotesPanel(AppUser user) {
        this.user = user;
        setLayout(new BorderLayout(0, 10));
        setBackground(Theme.BG);
        add(Theme.label("Notes", Theme.H1, Theme.FG), BorderLayout.NORTH);

        list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        list.addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                onSelect();
            }
        });
        JScrollPane left = new JScrollPane(list);
        left.setBorder(BorderFactory.createLineBorder(Theme.BORDER));
        left.setPreferredSize(new Dimension(260, 0));

        JSplitPane split = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, left, buildEditor());
        split.setDividerLocation(260);
        split.setBorder(null);
        split.setBackground(Theme.BG);
        add(split, BorderLayout.CENTER);
    }

    private JPanel buildEditor() {
        JPanel editor = new JPanel(new BorderLayout(0, 8));
        editor.setBackground(Theme.BG);
        editor.setBorder(BorderFactory.createEmptyBorder(0, 10, 0, 0));

        JPanel top = new JPanel(new BorderLayout(8, 0));
        top.setBackground(Theme.BG);
        top.add(Theme.label("Title", Theme.SMALL_BOLD, Theme.MUTED), BorderLayout.WEST);
        top.add(title, BorderLayout.CENTER);
        editor.add(top, BorderLayout.NORTH);

        content.setLineWrap(true);
        content.setWrapStyleWord(true);
        content.setFont(Theme.MONO);
        content.setBackground(Theme.SURFACE);
        content.setForeground(Theme.FG);
        content.setCaretColor(Theme.FG);
        content.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        JScrollPane scroll = new JScrollPane(content);
        scroll.setBorder(BorderFactory.createLineBorder(Theme.BORDER));
        editor.add(scroll, BorderLayout.CENTER);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 6));
        actions.setBackground(Theme.BG);

        JButton create = new JButton("New note");
        create.addActionListener(e -> createNote());
        JButton save = new JButton("Save");
        save.setBackground(Theme.PRIMARY);
        save.setForeground(Theme.FG);
        save.addActionListener(e -> save());
        JButton pin = new JButton("Pin / unpin");
        pin.addActionListener(e -> togglePin());
        JButton delete = new JButton("Delete");
        delete.addActionListener(e -> delete());

        actions.add(create);
        actions.add(save);
        actions.add(pin);
        actions.add(delete);
        editor.add(actions, BorderLayout.SOUTH);
        return editor;
    }

    private void onSelect() {
        selected = list.getSelectedValue();
        if (selected == null) {
            title.setText("");
            content.setText("");
            return;
        }
        title.setText(selected.title);
        content.setText(selected.content == null ? "" : selected.content);
        content.setCaretPosition(0);
    }

    private void createNote() {
        String name = JOptionPane.showInputDialog(this, "Note title:", "New note",
            JOptionPane.PLAIN_MESSAGE);
        if (name == null || name.trim().isEmpty()) {
            return;
        }
        dao.create(user.id, name.trim());
        refresh();
    }

    private void save() {
        if (selected == null) {
            JOptionPane.showMessageDialog(this, "Select a note first.");
            return;
        }
        if (title.getText().trim().isEmpty()) {
            JOptionPane.showMessageDialog(this, "A note needs a title.");
            return;
        }
        dao.save(selected.id, title.getText().trim(), content.getText());
        refresh();
    }

    private void togglePin() {
        if (selected == null) {
            return;
        }
        dao.setPinned(selected.id, !selected.pinned);
        refresh();
    }

    private void delete() {
        if (selected == null) {
            return;
        }
        int answer = JOptionPane.showConfirmDialog(this,
            "Delete \"" + selected.title + "\"?", "Delete note", JOptionPane.YES_NO_OPTION);
        if (answer == JOptionPane.YES_OPTION) {
            dao.delete(selected.id);
            selected = null;
            refresh();
        }
    }

    @Override
    public void refresh() {
        String keepId = selected == null ? null : selected.id;
        List<NoteRow> notes = dao.findAll(user.id);
        listModel.clear();
        int restore = -1;
        for (int i = 0; i < notes.size(); i++) {
            listModel.addElement(notes.get(i));
            if (keepId != null && notes.get(i).id.equals(keepId)) {
                restore = i;
            }
        }
        if (restore >= 0) {
            list.setSelectedIndex(restore);
        } else {
            selected = null;
            title.setText("");
            content.setText("");
        }
    }
}
