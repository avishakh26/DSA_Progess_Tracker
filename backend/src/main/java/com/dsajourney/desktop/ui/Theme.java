package com.dsajourney.desktop.ui;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.UIManager;
import javax.swing.border.Border;
import java.awt.Color;
import java.awt.Font;

/** Colour and type tokens, mirroring the dark theme of the web app. */
public final class Theme {

    public static final Color BG = new Color(0x0F, 0x17, 0x2A);
    public static final Color SURFACE = new Color(0x13, 0x1C, 0x31);
    public static final Color RAISED = new Color(0x18, 0x22, 0x3B);
    public static final Color HOVER = new Color(0x1F, 0x2B, 0x48);
    public static final Color FG = new Color(0xE2, 0xE8, 0xF0);
    public static final Color MUTED = new Color(0x94, 0xA3, 0xB8);
    public static final Color SUBTLE = new Color(0x64, 0x74, 0x8B);
    public static final Color BORDER = new Color(0x2A, 0x35, 0x4D);
    public static final Color PRIMARY = new Color(0x3B, 0x82, 0xF6);
    public static final Color PRIMARY_SOFT = new Color(0x1B, 0x2E, 0x52);
    public static final Color SUCCESS = new Color(0x10, 0xB9, 0x81);
    public static final Color WARNING = new Color(0xF5, 0x9E, 0x0B);
    public static final Color DANGER = new Color(0xF4, 0x3F, 0x5E);

    public static final Font BASE = new Font("SansSerif", Font.PLAIN, 13);
    public static final Font BOLD = new Font("SansSerif", Font.BOLD, 13);
    public static final Font SMALL = new Font("SansSerif", Font.PLAIN, 11);
    public static final Font SMALL_BOLD = new Font("SansSerif", Font.BOLD, 11);
    public static final Font H1 = new Font("SansSerif", Font.BOLD, 22);
    public static final Font H2 = new Font("SansSerif", Font.BOLD, 15);
    public static final Font NUMBER = new Font("SansSerif", Font.BOLD, 24);
    public static final Font MONO = new Font("Monospaced", Font.PLAIN, 13);

    private Theme() {}

    /** Pushes the palette into Swing's defaults so stock components match. */
    public static void install() {
        UIManager.put("Panel.background", BG);
        UIManager.put("OptionPane.background", SURFACE);
        UIManager.put("OptionPane.messageForeground", FG);
        UIManager.put("Label.foreground", FG);
        UIManager.put("Label.font", BASE);
        UIManager.put("TextField.background", SURFACE);
        UIManager.put("TextField.foreground", FG);
        UIManager.put("TextField.caretForeground", FG);
        UIManager.put("TextField.border", padded(6, 8));
        UIManager.put("PasswordField.background", SURFACE);
        UIManager.put("PasswordField.foreground", FG);
        UIManager.put("PasswordField.caretForeground", FG);
        UIManager.put("PasswordField.border", padded(6, 8));
        UIManager.put("TextArea.background", SURFACE);
        UIManager.put("TextArea.foreground", FG);
        UIManager.put("TextArea.caretForeground", FG);
        UIManager.put("ComboBox.background", SURFACE);
        UIManager.put("ComboBox.foreground", FG);
        UIManager.put("ComboBox.selectionBackground", PRIMARY_SOFT);
        UIManager.put("ComboBox.selectionForeground", FG);
        UIManager.put("List.background", SURFACE);
        UIManager.put("List.foreground", FG);
        UIManager.put("List.selectionBackground", PRIMARY_SOFT);
        UIManager.put("List.selectionForeground", FG);
        UIManager.put("Table.background", SURFACE);
        UIManager.put("Table.foreground", FG);
        UIManager.put("Table.gridColor", BORDER);
        UIManager.put("Table.selectionBackground", PRIMARY_SOFT);
        UIManager.put("Table.selectionForeground", FG);
        UIManager.put("TableHeader.background", RAISED);
        UIManager.put("TableHeader.foreground", MUTED);
        UIManager.put("ScrollPane.background", BG);
        UIManager.put("Viewport.background", BG);
        UIManager.put("ScrollBar.background", BG);
        UIManager.put("ScrollBar.thumb", BORDER);
        UIManager.put("TabbedPane.background", BG);
        UIManager.put("TabbedPane.foreground", FG);
        UIManager.put("CheckBox.background", BG);
        UIManager.put("CheckBox.foreground", FG);
        UIManager.put("Slider.background", BG);
        UIManager.put("SplitPane.background", BG);
        UIManager.put("MenuItem.background", SURFACE);
        UIManager.put("MenuItem.foreground", FG);
    }

    public static Border padded(int vertical, int horizontal) {
        return BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER),
            BorderFactory.createEmptyBorder(vertical, horizontal, vertical, horizontal));
    }

    public static JLabel label(String text, Font font, Color color) {
        JLabel l = new JLabel(text);
        l.setFont(font);
        l.setForeground(color);
        return l;
    }

    public static JLabel title(String text) {
        return label(text, H2, FG);
    }

    public static JLabel muted(String text) {
        return label(text, SMALL, MUTED);
    }

    /** Truncates with an ellipsis so long titles never blow out a column. */
    public static String ellipsis(String text, int max) {
        if (text == null) {
            return "";
        }
        return text.length() <= max ? text : text.substring(0, Math.max(0, max - 1)) + "…";
    }
}
