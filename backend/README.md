# DSA Journey — Desktop client

A Java Swing desktop application over the same SQLite database the web app uses.
Progress recorded in either place shows up in the other.

## Running it

Requires **JDK 21** and Maven. From the repository root:

```bash
cd backend
./mvnw clean package          # mvnw.cmd on Windows
java -jar target/dsa-journey-desktop.jar
```

Or straight from source, without packaging:

```bash
cd backend
./mvnw exec:java
```

Sign in with the same email and password you use on the web app.

### Finding the database

On startup the app looks for `prisma/dev.db` by walking up from the working
directory. If you launch it from somewhere else, point it at the file directly:

```bash
java -Ddsa.db=/full/path/to/prisma/dev.db -jar target/dsa-journey-desktop.jar
```

## Screens

| Screen | What it does |
| --- | --- |
| Dashboard | KPI tiles, 53-week contribution heatmap, 14-day and 6-month activity charts, today's goal ring, difficulty split, phase progress, recently solved |
| Roadmap | All topics across 14 phases; edit status, progress and notes; toggle favourites |
| Problems | Full log with search and status/difficulty filters; add, edit and delete |
| Revision | Everything flagged `REVISION`, plus favourites |
| Notes | Two-pane notebook with pinning |
| Goals | Monthly goals and the daily target used by the dashboard ring |
| Statistics | Platform mix, difficulty mix, 12-month trend, completion by phase |

## Design notes

**Plain JDBC, not JPA.** The original module declared Spring Boot with
`spring.jpa.database-platform=org.hibernate.dialect.SQLiteDialect`. That class
does not exist in Hibernate core — the SQLite dialect lives in the separate
`hibernate-community-dialects` artifact — so the application could not start.
It also set `ddl-auto=update` against `../prisma/dev.db`, which would have let
Hibernate rewrite the schema Prisma owns while it held live data. Reading the
existing schema directly through JDBC avoids both problems and keeps the
dependency list to two jars.

**Dates.** Prisma stores SQLite `DATETIME` columns as ISO-8601 strings with an
explicit offset (`2026-08-01T00:00:00.000+00:00`), not as unix millis and not in
the shape `ResultSet.getTimestamp` expects. `util/Dates` reads and writes that
exact format, so rows written here stay readable by the web app. This is covered
by tests in `DesktopApplicationTests`.

**Booleans** are stored as `0`/`1` integers, and `"order"` is a reserved word, so
it stays quoted in every query.

**Activity stays consistent.** Adding or deleting a problem adjusts that day's
`Activity` row in the same transaction, so the heatmap can never drift away from
the problem list.

**The JPA entities in `model/` are untouched.** Nothing at runtime uses them;
`jakarta.persistence-api` is on the classpath purely so they still compile.

## Status

This code has not been compiled or run — it was written in an environment with
no JDK 21 and no access to Maven Central. What *was* verified:

- all 33 SQL statements were extracted and validated against a copy of the real
  `prisma/dev.db`, and the read queries return correct data
- imports, cross-file symbol references and constructor arities were checked
- the streak algorithm and date round-trip were ported and tested against the
  real activity rows

Expect to fix a compile error or two on the first `mvnw package`. Send me
whatever `javac` reports and I'll correct it.
