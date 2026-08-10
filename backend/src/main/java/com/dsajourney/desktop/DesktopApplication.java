package com.dsajourney.desktop;

/**
 * Kept so the original entry-point name still works.
 *
 * This module used to boot Spring Boot with JPA over the same SQLite file
 * Prisma owns. That combination could not start (Hibernate ships no SQLite
 * dialect in core) and, with ddl-auto=update, would have been free to rewrite
 * tables holding live data. The desktop client replaces it and talks to the
 * database through plain JDBC instead.
 */
public final class DesktopApplication {

    private DesktopApplication() {}

    public static void main(String[] args) {
        DsaJourneyDesktop.main(args);
    }
}
