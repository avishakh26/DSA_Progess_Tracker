package com.dsajourney.desktop;

import com.dsajourney.desktop.util.Dates;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Guards the date handling, which is the one place the desktop client and the
 * web app have to agree byte-for-byte: Prisma writes SQLite DATETIME columns as
 * ISO-8601 strings with an explicit offset.
 */
class DesktopApplicationTests {

    @Test
    void parsesThePrismaDatetimeFormat() {
        Instant parsed = Dates.parse("2026-08-01T00:00:00.000+00:00");
        assertNotNull(parsed);
        assertEquals(LocalDate.of(2026, 8, 1), Dates.toUtcDate(parsed));
    }

    @Test
    void roundTripsWithoutDrift() {
        String original = "2026-03-13T09:41:07.123+00:00";
        assertEquals(original, Dates.format(Dates.parse(original)));
    }

    @Test
    void toleratesMissingAndMalformedValues() {
        assertNull(Dates.parse(null));
        assertNull(Dates.parse(""));
        assertNull(Dates.parse("not a date"));
    }

    @Test
    void startOfUtcDayTrimsTheClock() {
        Instant midday = LocalDate.of(2026, 8, 1).atTime(13, 45).toInstant(ZoneOffset.UTC);
        assertEquals(LocalDate.of(2026, 8, 1).atStartOfDay(ZoneOffset.UTC).toInstant(),
            Dates.startOfUtcDay(midday));
    }
}
