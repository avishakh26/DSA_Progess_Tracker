package com.dsajourney.desktop.dao;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.DashboardStats;
import com.dsajourney.desktop.domain.DayCount;
import com.dsajourney.desktop.domain.LabelledCount;
import com.dsajourney.desktop.util.Dates;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * Read-only aggregates for the dashboard and statistics screens.
 *
 * Dates are stored as ISO-8601 text, which sorts lexicographically in the same
 * order it sorts chronologically. That lets the month and day buckets be cut
 * with substr() in SQL instead of parsing every row in Java.
 */
public class StatsDao {

    public DashboardStats dashboard(String userId, int dailyGoal) {
        DashboardStats s = new DashboardStats();
        s.dailyGoal = dailyGoal <= 0 ? 3 : dailyGoal;

        try (Connection c = Database.open()) {
            try (PreparedStatement ps = c.prepareStatement(
                    "SELECT COUNT(*) AS total,"
                    + " SUM(CASE WHEN status='DONE' THEN 1 ELSE 0 END) AS done,"
                    + " SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) AS pending,"
                    + " SUM(CASE WHEN status='SKIP' THEN 1 ELSE 0 END) AS skipped"
                    + " FROM \"Topic\" WHERE userId = ?")) {
                ps.setString(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        s.totalTopics = rs.getInt("total");
                        s.doneTopics = rs.getInt("done");
                        s.pendingTopics = rs.getInt("pending");
                        s.skippedTopics = rs.getInt("skipped");
                    }
                }
            }

            try (PreparedStatement ps = c.prepareStatement(
                    "SELECT COUNT(*) AS total,"
                    + " SUM(CASE WHEN status='SOLVED' THEN 1 ELSE 0 END) AS solved,"
                    + " SUM(CASE WHEN status='ATTEMPTED' THEN 1 ELSE 0 END) AS attempted,"
                    + " SUM(CASE WHEN status='REVISION' THEN 1 ELSE 0 END) AS revision,"
                    + " SUM(CASE WHEN difficulty='EASY' THEN 1 ELSE 0 END) AS easy,"
                    + " SUM(CASE WHEN difficulty='MEDIUM' THEN 1 ELSE 0 END) AS medium,"
                    + " SUM(CASE WHEN difficulty='HARD' THEN 1 ELSE 0 END) AS hard"
                    + " FROM \"Problem\" WHERE userId = ?")) {
                ps.setString(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        s.totalProblems = rs.getInt("total");
                        s.solvedProblems = rs.getInt("solved");
                        s.attemptedProblems = rs.getInt("attempted");
                        s.revisionProblems = rs.getInt("revision");
                        s.easy = rs.getInt("easy");
                        s.medium = rs.getInt("medium");
                        s.hard = rs.getInt("hard");
                    }
                }
            }

            s.activity = activity(c, userId);
            s.solvedToday = countOn(c, userId, LocalDate.now(ZoneOffset.UTC));

            int[] streaks = streaks(s.activity);
            s.streak = streaks[0];
            s.longestStreak = streaks[1];
            return s;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load dashboard statistics.", e);
        }
    }

    /**
     * Current and longest run of consecutive active days.
     *
     * The current streak tolerates today being empty — it only breaks once a
     * full day has been missed, otherwise it would read zero every morning.
     */
    static int[] streaks(List<DayCount> activity) {
        Set<LocalDate> unique = new TreeSet<>();
        for (DayCount d : activity) {
            if (d.date != null && d.count > 0) {
                unique.add(d.date);
            }
        }
        if (unique.isEmpty()) {
            return new int[] {0, 0};
        }
        List<LocalDate> days = new ArrayList<>(unique);

        int longest = 1;
        int run = 1;
        for (int i = 1; i < days.size(); i++) {
            run = days.get(i - 1).plusDays(1).equals(days.get(i)) ? run + 1 : 1;
            longest = Math.max(longest, run);
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate last = days.get(days.size() - 1);
        if (!last.equals(today) && !last.equals(today.minusDays(1))) {
            return new int[] {0, longest};
        }

        int current = 1;
        for (int i = days.size() - 1; i > 0; i--) {
            if (!days.get(i - 1).plusDays(1).equals(days.get(i))) {
                break;
            }
            current++;
        }
        return new int[] {current, longest};
    }

    private List<DayCount> activity(Connection c, String userId) throws SQLException {
        List<DayCount> out = new ArrayList<>();
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT date, count FROM \"Activity\" WHERE userId = ? ORDER BY date ASC")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    java.time.Instant when = Dates.parse(rs.getString("date"));
                    if (when != null) {
                        out.add(new DayCount(Dates.toUtcDate(when), rs.getInt("count")));
                    }
                }
            }
        }
        return out;
    }

    private int countOn(Connection c, String userId, LocalDate day) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT COUNT(*) FROM \"Problem\" WHERE userId = ? AND substr(solvedDate,1,10) = ?")) {
            ps.setString(1, userId);
            ps.setString(2, day.format(DateTimeFormatter.ISO_LOCAL_DATE));
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    /** Problems added per day for the last {@code days} days, zero-filled. */
    public List<LabelledCount> dailySeries(String userId, int days) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT substr(solvedDate,1,10) AS day, COUNT(*) AS n FROM \"Problem\""
                 + " WHERE userId = ? GROUP BY day")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    counts.put(rs.getString("day"), rs.getInt("n"));
                }
            }
        } catch (SQLException e) {
            throw new Database.DataException("Could not load the daily series.", e);
        }

        List<LabelledCount> out = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        DateTimeFormatter label = DateTimeFormatter.ofPattern("d MMM");
        for (int i = days - 1; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            Integer n = counts.get(day.format(DateTimeFormatter.ISO_LOCAL_DATE));
            out.add(new LabelledCount(day.format(label), n == null ? 0 : n.intValue()));
        }
        return out;
    }

    /** Problems per month split by difficulty, zero-filled over the window. */
    public List<LabelledCount> monthlySeries(String userId, int months) {
        Map<String, int[]> buckets = new LinkedHashMap<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT substr(solvedDate,1,7) AS ym, difficulty, COUNT(*) AS n"
                 + " FROM \"Problem\" WHERE userId = ? GROUP BY ym, difficulty")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String ym = rs.getString("ym");
                    int[] slot = buckets.get(ym);
                    if (slot == null) {
                        slot = new int[3];
                        buckets.put(ym, slot);
                    }
                    String d = rs.getString("difficulty");
                    int n = rs.getInt("n");
                    if ("EASY".equalsIgnoreCase(d)) {
                        slot[0] += n;
                    } else if ("MEDIUM".equalsIgnoreCase(d)) {
                        slot[1] += n;
                    } else {
                        slot[2] += n;
                    }
                }
            }
        } catch (SQLException e) {
            throw new Database.DataException("Could not load the monthly series.", e);
        }

        List<LabelledCount> out = new ArrayList<>();
        YearMonth now = YearMonth.now(ZoneOffset.UTC);
        DateTimeFormatter key = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter label = DateTimeFormatter.ofPattern("MMM yy");
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            int[] slot = buckets.get(ym.format(key));
            if (slot == null) {
                slot = new int[3];
            }
            out.add(new LabelledCount(ym.format(label), slot[0], slot[1], slot[2]));
        }
        return out;
    }

    /** Problem counts per platform, highest first. */
    public List<LabelledCount> byPlatform(String userId) {
        List<LabelledCount> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT platform, COUNT(*) AS n FROM \"Problem\" WHERE userId = ?"
                 + " GROUP BY platform ORDER BY n DESC")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new LabelledCount(
                        com.dsajourney.desktop.domain.Platform.of(rs.getString("platform")).label(),
                        rs.getInt("n")));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load platform statistics.", e);
        }
    }

    /** Topics per phase that already have at least one problem logged. */
    public Set<Integer> phasesWithWork(String userId) {
        Set<Integer> out = new HashSet<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT DISTINCT t.phase FROM \"Topic\" t"
                 + " JOIN \"Problem\" p ON p.topicId = t.id WHERE t.userId = ?")) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(rs.getInt(1));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load phase activity.", e);
        }
    }
}
