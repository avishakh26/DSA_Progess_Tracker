package com.dsajourney.desktop.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Prisma stores SQLite DATETIME columns as ISO-8601 strings that carry an
 * explicit offset, e.g. "2026-08-01T00:00:00.000+00:00" — not as unix millis
 * and not in the "yyyy-MM-dd HH:mm:ss" shape JDBC's getTimestamp expects.
 * Everything here reads and writes that exact format so rows written by the
 * desktop app stay readable by the web app and vice versa.
 */
public final class Dates {

    private static final DateTimeFormatter WRITE =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'+00:00'").withZone(ZoneOffset.UTC);

    private static final DateTimeFormatter DISPLAY_DATE =
            DateTimeFormatter.ofPattern("d MMM yyyy").withZone(ZoneOffset.UTC);

    private static final DateTimeFormatter DISPLAY_SHORT =
            DateTimeFormatter.ofPattern("d MMM").withZone(ZoneOffset.UTC);

    private Dates() {}

    /** Lenient parse; returns null rather than throwing on unexpected input. */
    public static Instant parse(String raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim();
        if (s.isEmpty()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(s).toInstant();
        } catch (RuntimeException ignored) {
            // fall through
        }
        try {
            return Instant.parse(s);
        } catch (RuntimeException ignored) {
            // fall through
        }
        try {
            // "yyyy-MM-dd HH:mm:ss" — treated as UTC.
            return OffsetDateTime.parse(s.replace(' ', 'T') + "Z").toInstant();
        } catch (RuntimeException ignored) {
            // fall through
        }
        try {
            return LocalDate.parse(s.substring(0, 10)).atStartOfDay(ZoneOffset.UTC).toInstant();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    /** Serialises in exactly the format Prisma wrote. */
    public static String format(Instant instant) {
        return WRITE.format(instant == null ? Instant.now() : instant);
    }

    public static String now() {
        return format(Instant.now());
    }

    /** Midnight UTC on the given day — the boundary the web app uses for streaks. */
    public static Instant startOfUtcDay(Instant instant) {
        return toUtcDate(instant).atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    public static LocalDate toUtcDate(Instant instant) {
        return instant.atZone(ZoneOffset.UTC).toLocalDate();
    }

    public static String display(Instant instant) {
        return instant == null ? "—" : DISPLAY_DATE.format(instant);
    }

    public static String displayShort(Instant instant) {
        return instant == null ? "—" : DISPLAY_SHORT.format(instant);
    }
}
