package com.dsajourney.desktop.db;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Locates and opens the SQLite file shared with the web app.
 *
 * The path is resolved at runtime rather than hard-coded because the app may
 * be launched from the module directory (mvn exec:java) or from the project
 * root (java -jar backend/target/...). An explicit -Ddsa.db=/path/to/dev.db
 * always wins.
 */
public final class Database {

    private static final String[] CANDIDATES = {
        "prisma/dev.db",
        "../prisma/dev.db",
        "../../prisma/dev.db",
        "backend/../prisma/dev.db"
    };

    private static File resolved;

    private Database() {}

    public static synchronized File file() {
        if (resolved != null) {
            return resolved;
        }
        String override = System.getProperty("dsa.db");
        if (override != null && !override.isEmpty()) {
            resolved = new File(override);
            return resolved;
        }
        for (String candidate : CANDIDATES) {
            File f = new File(candidate);
            if (f.isFile()) {
                resolved = f.getAbsoluteFile();
                return resolved;
            }
        }
        resolved = new File(CANDIDATES[1]).getAbsoluteFile();
        return resolved;
    }

    public static Connection open() throws SQLException {
        File f = file();
        if (!f.isFile()) {
            throw new SQLException(
                "Could not find the database.\n\nLooked for: " + f.getAbsolutePath()
                + "\n\nRun the app from the project root, or start it with"
                + " -Ddsa.db=<path to prisma/dev.db>.");
        }
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new SQLException("SQLite JDBC driver is missing from the classpath.", e);
        }
        Connection c = DriverManager.getConnection("jdbc:sqlite:" + f.getAbsolutePath());
        try (java.sql.Statement st = c.createStatement()) {
            st.execute("PRAGMA foreign_keys = ON");
        }
        return c;
    }

    /** Wraps the checked SQLException so UI code can stay readable. */
    public static class DataException extends RuntimeException {
        public DataException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
