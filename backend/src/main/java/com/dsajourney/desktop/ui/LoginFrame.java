package com.dsajourney.desktop.ui;

import com.dsajourney.desktop.dao.UserDao;
import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.ui.comp.Card;

import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.SwingWorker;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;

/** Credentials screen; validates against the bcrypt hashes the web app wrote. */
public class LoginFrame extends JFrame {

    private final JTextField email = new JTextField(22);
    private final JPasswordField password = new JPasswordField(22);
    private final JLabel error = Theme.label(" ", Theme.SMALL, Theme.DANGER);
    private final JButton submit = new JButton("Sign in");

    public LoginFrame() {
        super("DSA Journey");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(560, 480);
        setLocationRelativeTo(null);

        JPanel root = new JPanel(new GridBagLayout());
        root.setBackground(Theme.BG);
        root.add(buildCard(), new GridBagConstraints());
        setContentPane(root);

        getRootPane().setDefaultButton(submit);
        submit.addActionListener(e -> attemptLogin());
    }

    private Card buildCard() {
        Card card = new Card();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBorder(BorderFactory.createEmptyBorder(26, 28, 26, 28));
        card.setPreferredSize(new Dimension(380, 340));

        JLabel brand = Theme.label("DSA Journey", Theme.H1, Theme.FG);
        JLabel sub = Theme.label("Sign in to pick up where you left off.", Theme.SMALL, Theme.MUTED);
        brand.setAlignmentX(Component.LEFT_ALIGNMENT);
        sub.setAlignmentX(Component.LEFT_ALIGNMENT);
        sub.setBorder(BorderFactory.createEmptyBorder(4, 0, 18, 0));

        JLabel emailLabel = Theme.label("Email", Theme.SMALL_BOLD, Theme.MUTED);
        JLabel passwordLabel = Theme.label("Password", Theme.SMALL_BOLD, Theme.MUTED);
        emailLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        passwordLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        passwordLabel.setBorder(BorderFactory.createEmptyBorder(12, 0, 0, 0));

        email.setAlignmentX(Component.LEFT_ALIGNMENT);
        password.setAlignmentX(Component.LEFT_ALIGNMENT);
        email.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
        password.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));

        error.setAlignmentX(Component.LEFT_ALIGNMENT);
        error.setBorder(BorderFactory.createEmptyBorder(10, 0, 10, 0));

        submit.setAlignmentX(Component.LEFT_ALIGNMENT);
        submit.setBackground(Theme.PRIMARY);
        submit.setForeground(Theme.FG);
        submit.setFocusPainted(false);
        submit.setMaximumSize(new Dimension(Integer.MAX_VALUE, 34));

        JLabel hint = Theme.label(
            "Uses the same account as the web app.", Theme.SMALL, Theme.SUBTLE);
        hint.setAlignmentX(Component.LEFT_ALIGNMENT);
        hint.setBorder(BorderFactory.createEmptyBorder(14, 0, 0, 0));

        card.add(brand);
        card.add(sub);
        card.add(emailLabel);
        card.add(email);
        card.add(passwordLabel);
        card.add(password);
        card.add(error);
        card.add(submit);
        card.add(hint);
        return card;
    }

    private void attemptLogin() {
        final String mail = email.getText().trim();
        final String pass = new String(password.getPassword());
        if (mail.isEmpty() || pass.isEmpty()) {
            error.setText("Enter your email and password.");
            return;
        }
        submit.setEnabled(false);
        error.setText(" ");

        new SwingWorker<AppUser, Void>() {
            @Override
            protected AppUser doInBackground() {
                return new UserDao().authenticate(mail, pass);
            }

            @Override
            protected void done() {
                submit.setEnabled(true);
                try {
                    AppUser user = get();
                    if (user == null) {
                        error.setText("Incorrect email or password.");
                        password.setText("");
                        return;
                    }
                    MainFrame main = new MainFrame(user);
                    main.setVisible(true);
                    dispose();
                } catch (Exception ex) {
                    Throwable cause = ex.getCause() == null ? ex : ex.getCause();
                    String message = cause instanceof Database.DataException
                        ? cause.getMessage() : "Could not reach the database.";
                    error.setText(message);
                }
            }
        }.execute();
    }

    /** Convenience for launching straight into the app during development. */
    public static void open() {
        SwingUtilities.invokeLater(() -> new LoginFrame().setVisible(true));
    }
}
