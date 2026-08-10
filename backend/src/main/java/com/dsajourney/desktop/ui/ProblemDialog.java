package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.domain.Difficulty;
import com.dsajourney.desktop.domain.Platform;
import com.dsajourney.desktop.domain.ProblemRow;
import com.dsajourney.desktop.domain.ProblemStatus;
import com.dsajourney.desktop.domain.TopicRow;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.awt.Window;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

/** Add or edit a single problem. Returns null from {@link #result()} on cancel. */
public class ProblemDialog extends JDialog {

    private final JTextField title = new JTextField(28);
    private final JComboBox<TopicRow> topic;
    private final JComboBox<Platform> platform = new JComboBox<>(Platform.values());
    private final JComboBox<Difficulty> difficulty = new JComboBox<>(Difficulty.values());
    private final JComboBox<ProblemStatus> status = new JComboBox<>(ProblemStatus.values());
    private final JTextField solvedDate = new JTextField(12);
    private final JTextField problemLink = new JTextField(28);
    private final JTextField solutionLink = new JTextField(28);
    private final JTextField tags = new JTextField(28);
    private final JCheckBox favorite = new JCheckBox("Favourite");
    private final JTextArea notes = new JTextArea(5, 28);

    private final ProblemRow existing;
    private ProblemRow result;

    public ProblemDialog(Window owner, List<TopicRow> topics, ProblemRow existing) {
        super(owner, existing == null ? "Add problem" : "Edit problem", ModalityType.APPLICATION_MODAL);
        this.existing = existing;
        this.topic = new JComboBox<>(topics.toArray(new TopicRow[0]));

        setSize(560, 560);
        setLocationRelativeTo(owner);

        JPanel form = new JPanel(new GridLayout(0, 1, 0, 4));
        form.setBackground(Theme.BG);
        form.setBorder(BorderFactory.createEmptyBorder(14, 16, 8, 16));

        form.add(field("Title", title));
        form.add(field("Topic", topic));
        form.add(field("Platform", platform));
        form.add(field("Difficulty", difficulty));
        form.add(field("Status", status));
        form.add(field("Solved date (yyyy-mm-dd)", solvedDate));
        form.add(field("Problem link", problemLink));
        form.add(field("Solution link", solutionLink));
        form.add(field("Tags (comma separated)", tags));

        favorite.setBackground(Theme.BG);
        favorite.setForeground(Theme.FG);
        form.add(favorite);

        notes.setLineWrap(true);
        notes.setWrapStyleWord(true);
        notes.setBackground(Theme.SURFACE);
        notes.setForeground(Theme.FG);
        notes.setCaretColor(Theme.FG);
        JScrollPane notesScroll = new JScrollPane(notes);
        notesScroll.setBorder(BorderFactory.createLineBorder(Theme.BORDER));

        JPanel centre = new JPanel(new BorderLayout(0, 6));
        centre.setBackground(Theme.BG);
        centre.add(form, BorderLayout.NORTH);
        JPanel notesWrap = new JPanel(new BorderLayout(0, 4));
        notesWrap.setBackground(Theme.BG);
        notesWrap.setBorder(BorderFactory.createEmptyBorder(0, 16, 0, 16));
        notesWrap.add(Theme.label("Notes", Theme.SMALL_BOLD, Theme.MUTED), BorderLayout.NORTH);
        notesWrap.add(notesScroll, BorderLayout.CENTER);
        centre.add(notesWrap, BorderLayout.CENTER);

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.RIGHT, 8, 8));
        buttons.setBackground(Theme.BG);
        JButton cancel = new JButton("Cancel");
        cancel.addActionListener(e -> dispose());
        JButton save = new JButton("Save");
        save.setBackground(Theme.PRIMARY);
        save.setForeground(Theme.FG);
        save.addActionListener(e -> submit());
        buttons.add(cancel);
        buttons.add(save);

        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(Theme.BG);
        root.add(centre, BorderLayout.CENTER);
        root.add(buttons, BorderLayout.SOUTH);
        setContentPane(root);
        getRootPane().setDefaultButton(save);

        prefill(topics);
    }

    private JPanel field(String label, javax.swing.JComponent input) {
        JPanel row = new JPanel(new BorderLayout(10, 0));
        row.setBackground(Theme.BG);
        JLabel l = Theme.label(label, Theme.SMALL_BOLD, Theme.MUTED);
        l.setPreferredSize(new Dimension(170, 24));
        row.add(l, BorderLayout.WEST);
        row.add(input, BorderLayout.CENTER);
        return row;
    }

    private void prefill(List<TopicRow> topics) {
        if (existing == null) {
            solvedDate.setText(LocalDate.now(ZoneOffset.UTC).toString());
            return;
        }
        title.setText(existing.title);
        for (TopicRow t : topics) {
            if (t.id.equals(existing.topicId)) {
                topic.setSelectedItem(t);
                break;
            }
        }
        platform.setSelectedItem(existing.platform);
        difficulty.setSelectedItem(existing.difficulty);
        status.setSelectedItem(existing.status);
        solvedDate.setText(existing.solvedDate == null
            ? LocalDate.now(ZoneOffset.UTC).toString()
            : existing.solvedDate.atZone(ZoneOffset.UTC).toLocalDate().toString());
        problemLink.setText(existing.problemLink == null ? "" : existing.problemLink);
        solutionLink.setText(existing.solutionLink == null ? "" : existing.solutionLink);
        tags.setText(existing.tags == null ? "" : existing.tags);
        favorite.setSelected(existing.favorite);
        notes.setText(existing.notes == null ? "" : existing.notes);
    }

    private void submit() {
        String t = title.getText().trim();
        if (t.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Give the problem a title.");
            return;
        }
        TopicRow selectedTopic = (TopicRow) topic.getSelectedItem();
        if (selectedTopic == null) {
            JOptionPane.showMessageDialog(this, "Pick a topic.");
            return;
        }
        Instant when;
        try {
            LocalDate d = LocalDate.parse(solvedDate.getText().trim(),
                DateTimeFormatter.ISO_LOCAL_DATE);
            when = d.atStartOfDay(ZoneOffset.UTC).toInstant();
        } catch (RuntimeException e) {
            JOptionPane.showMessageDialog(this, "Use the date format yyyy-mm-dd.");
            return;
        }

        result = new ProblemRow(
            existing == null ? null : existing.id,
            selectedTopic.id,
            selectedTopic.title,
            t,
            (Platform) platform.getSelectedItem(),
            emptyToNull(problemLink.getText()),
            emptyToNull(solutionLink.getText()),
            (Difficulty) difficulty.getSelectedItem(),
            when,
            (ProblemStatus) status.getSelectedItem(),
            emptyToNull(notes.getText()),
            tags.getText().trim(),
            favorite.isSelected());
        dispose();
    }

    private static String emptyToNull(String value) {
        String v = value == null ? "" : value.trim();
        return v.isEmpty() ? null : v;
    }

    public ProblemRow result() {
        return result;
    }
}
