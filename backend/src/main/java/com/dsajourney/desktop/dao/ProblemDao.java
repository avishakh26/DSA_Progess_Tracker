package com.dsajourney.desktop.dao;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.Difficulty;
import com.dsajourney.desktop.domain.Platform;
import com.dsajourney.desktop.domain.ProblemRow;
import com.dsajourney.desktop.domain.ProblemStatus;
import com.dsajourney.desktop.util.Dates;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ProblemDao {

    private static final String SELECT =
        "SELECT p.id, p.topicId, p.title, p.platform, p.problemLink, p.solutionLink,"
        + " p.difficulty, p.solvedDate, p.status, p.notes, p.tags, p.favorite,"
        + " t.title AS topicTitle"
        + " FROM \"Problem\" p JOIN \"Topic\" t ON t.id = p.topicId"
        + " WHERE p.userId = ?";

    public List<ProblemRow> findAll(String userId) {
        return query(SELECT + " ORDER BY p.solvedDate DESC", userId);
    }

    public List<ProblemRow> findRecent(String userId, int limit) {
        return query(SELECT + " ORDER BY p.solvedDate DESC LIMIT " + Math.max(1, limit), userId);
    }

    public List<ProblemRow> findByTopic(String userId, String topicId) {
        String sql = SELECT + " AND p.topicId = ? ORDER BY p.solvedDate DESC";
        List<ProblemRow> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setString(2, topicId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(map(rs));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load problems.", e);
        }
    }

    public List<ProblemRow> findForRevision(String userId) {
        return query(SELECT + " AND p.status = 'REVISION' ORDER BY p.solvedDate DESC", userId);
    }

    public List<ProblemRow> findFavorites(String userId) {
        return query(SELECT + " AND p.favorite = 1 ORDER BY p.solvedDate DESC", userId);
    }

    /**
     * Inserts a problem and bumps the matching Activity row in one transaction,
     * so the heatmap and the problem list can never drift apart.
     */
    public String insert(String userId, ProblemRow p) {
        String id = UUID.randomUUID().toString();
        String now = Dates.now();
        String sql = "INSERT INTO \"Problem\" (id, userId, topicId, title, platform, problemLink,"
            + " solutionLink, difficulty, solvedDate, status, notes, tags, favorite,"
            + " createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        Connection c = null;
        try {
            c = Database.open();
            c.setAutoCommit(false);
            try (PreparedStatement ps = c.prepareStatement(sql)) {
                ps.setString(1, id);
                ps.setString(2, userId);
                ps.setString(3, p.topicId);
                ps.setString(4, p.title);
                ps.setString(5, p.platform.name());
                ps.setString(6, p.problemLink);
                ps.setString(7, p.solutionLink);
                ps.setString(8, p.difficulty.name());
                ps.setString(9, Dates.format(p.solvedDate));
                ps.setString(10, p.status.name());
                ps.setString(11, p.notes);
                ps.setString(12, p.tags == null ? "" : p.tags);
                ps.setInt(13, p.favorite ? 1 : 0);
                ps.setString(14, now);
                ps.setString(15, now);
                ps.executeUpdate();
            }
            bumpActivity(c, userId, p.solvedDate, 1);
            c.commit();
            return id;
        } catch (SQLException e) {
            rollback(c);
            throw new Database.DataException("Could not save the problem.", e);
        } finally {
            close(c);
        }
    }

    public void update(ProblemRow p) {
        String sql = "UPDATE \"Problem\" SET topicId = ?, title = ?, platform = ?, problemLink = ?,"
            + " solutionLink = ?, difficulty = ?, solvedDate = ?, status = ?, notes = ?,"
            + " tags = ?, favorite = ?, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, p.topicId);
            ps.setString(2, p.title);
            ps.setString(3, p.platform.name());
            ps.setString(4, p.problemLink);
            ps.setString(5, p.solutionLink);
            ps.setString(6, p.difficulty.name());
            ps.setString(7, Dates.format(p.solvedDate));
            ps.setString(8, p.status.name());
            ps.setString(9, p.notes);
            ps.setString(10, p.tags == null ? "" : p.tags);
            ps.setInt(11, p.favorite ? 1 : 0);
            ps.setString(12, Dates.now());
            ps.setString(13, p.id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not update the problem.", e);
        }
    }

    public void delete(String userId, String problemId, Instant solvedDate) {
        Connection c = null;
        try {
            c = Database.open();
            c.setAutoCommit(false);
            try (PreparedStatement ps = c.prepareStatement("DELETE FROM \"Problem\" WHERE id = ?")) {
                ps.setString(1, problemId);
                ps.executeUpdate();
            }
            bumpActivity(c, userId, solvedDate, -1);
            c.commit();
        } catch (SQLException e) {
            rollback(c);
            throw new Database.DataException("Could not delete the problem.", e);
        } finally {
            close(c);
        }
    }

    public void setFavorite(String problemId, boolean favorite) {
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(
                 "UPDATE \"Problem\" SET favorite = ?, updatedAt = ? WHERE id = ?")) {
            ps.setInt(1, favorite ? 1 : 0);
            ps.setString(2, Dates.now());
            ps.setString(3, problemId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not update the favourite flag.", e);
        }
    }

    /** Adds delta to the day's activity count, creating or clearing the row as needed. */
    private void bumpActivity(Connection c, String userId, Instant when, int delta) throws SQLException {
        String day = Dates.format(Dates.startOfUtcDay(when == null ? Instant.now() : when));
        Integer existing = null;
        String existingId = null;
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT id, count FROM \"Activity\" WHERE userId = ? AND date = ?")) {
            ps.setString(1, userId);
            ps.setString(2, day);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    existingId = rs.getString("id");
                    existing = rs.getInt("count");
                }
            }
        }
        if (existing == null) {
            if (delta <= 0) {
                return;
            }
            try (PreparedStatement ps = c.prepareStatement(
                    "INSERT INTO \"Activity\" (id, userId, date, count) VALUES (?,?,?,?)")) {
                ps.setString(1, UUID.randomUUID().toString());
                ps.setString(2, userId);
                ps.setString(3, day);
                ps.setInt(4, delta);
                ps.executeUpdate();
            }
            return;
        }
        int next = existing + delta;
        if (next <= 0) {
            try (PreparedStatement ps = c.prepareStatement("DELETE FROM \"Activity\" WHERE id = ?")) {
                ps.setString(1, existingId);
                ps.executeUpdate();
            }
        } else {
            try (PreparedStatement ps = c.prepareStatement(
                    "UPDATE \"Activity\" SET count = ? WHERE id = ?")) {
                ps.setInt(1, next);
                ps.setString(2, existingId);
                ps.executeUpdate();
            }
        }
    }

    private List<ProblemRow> query(String sql, String userId) {
        List<ProblemRow> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(map(rs));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load problems.", e);
        }
    }

    private ProblemRow map(ResultSet rs) throws SQLException {
        return new ProblemRow(
            rs.getString("id"),
            rs.getString("topicId"),
            rs.getString("topicTitle"),
            rs.getString("title"),
            Platform.of(rs.getString("platform")),
            rs.getString("problemLink"),
            rs.getString("solutionLink"),
            Difficulty.of(rs.getString("difficulty")),
            Dates.parse(rs.getString("solvedDate")),
            ProblemStatus.of(rs.getString("status")),
            rs.getString("notes"),
            rs.getString("tags"),
            rs.getInt("favorite") == 1);
    }

    private void rollback(Connection c) {
        if (c != null) {
            try {
                c.rollback();
            } catch (SQLException ignored) {
                // nothing useful to do here
            }
        }
    }

    private void close(Connection c) {
        if (c != null) {
            try {
                c.close();
            } catch (SQLException ignored) {
                // nothing useful to do here
            }
        }
    }
}
