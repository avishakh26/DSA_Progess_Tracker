package com.dsajourney.desktop;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.ui.LoginFrame;
import com.dsajourney.desktop.ui.Theme;

import javax.swing.JOptionPane;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;

/**
 * Entry point for the DSA Journey desktop client.
 *
 * Reads the same SQLite database as the web app, so progress recorded in
 * either place shows up in the other.
 */
public final class DsaJourneyDesktop {

    private DsaJourneyDesktop() {}

    public static void main(String[] args) {
        System.setProperty("awt.useSystemAAFontSettings", "on");
        System.setProperty("swing.aatext", "true");

        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
            } catch (Exception ignored) {
                // The default look and feel is fine; the theme is applied below.
            }
            Theme.install();

            if (!Database.file().isFile()) {
                JOptionPane.showMessageDialog(null,
                    "Could not find the database.\n\nLooked for:\n"
                    + Database.file().getAbsolutePath()
                    + "\n\nStart the app from the project root, or pass\n"
                    + "-Ddsa.db=<path to prisma/dev.db>.",
                    "DSA Journey — database not found",
                    JOptionPane.ERROR_MESSAGE);
                return;
            }

            new LoginFrame().setVisible(true);
        });
    }
}
