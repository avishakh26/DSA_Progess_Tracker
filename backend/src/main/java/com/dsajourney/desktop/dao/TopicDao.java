package com.dsajourney.desktop.dao;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.PhaseProgress;
import com.dsajourney.desktop.domain.TopicRow;
import com.dsajourney.desktop.domain.TopicStatus;
import com.dsajourney.desktop.util.Dates;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class TopicDao {

    /** "order" is a reserved word in SQL, so it stays quoted throughout. */
    private static final String SELECT =
        "SELECT t.id, t.slug, t.title, t.phase, t.description, t.resources, t.status,"
        + " t.progress, t.notes, t.favorite, t.\"order\","
        + " (SELECT COUNT(*) FROM \"Problem\" p WHERE p.topicId = t.id) AS problemCount"
        + " FROM \"Topic\" t WHERE t.userId = ?";

    public List<TopicRow> findAll(String userId) {
        return query(SELECT + " ORDER BY t.phase ASC, t.\"order\" ASC", userId);
    }

    public List<TopicRow> findByPhase(String userId, int phase) {
        String sql = SELECT + " AND t.phase = ? ORDER BY t.\"order\" ASC";
        List<TopicRow> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId);
            ps.setInt(2, phase);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(map(rs));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load topics.", e);
        }
    }

    public List<TopicRow> findFavorites(String userId) {
        return query(SELECT + " AND t.favorite = 1 ORDER BY t.phase, t.\"order\"", userId);
    }

    /** First unfinished topic in roadmap order — drives "Continue learning". */
    public TopicRow findNextPending(String userId) {
        List<TopicRow> rows = query(
            SELECT + " AND t.status = 'PENDING' ORDER BY t.phase ASC, t.\"order\" ASC LIMIT 1",
            userId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<PhaseProgress> phaseProgress(String userId) {
        String sql = "SELECT phase, COUNT(*) AS total,"
            + " SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) AS done"
            + " FROM \"Topic\" WHERE userId = ? GROUP BY phase ORDER BY phase";
        List<PhaseProgress> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new PhaseProgress(rs.getInt("phase"), rs.getInt("total"), rs.getInt("done")));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load phase progress.", e);
        }
    }

    public void updateStatus(String topicId, TopicStatus status) {
        // Marking a topic done pins progress to 100 so the two never disagree.
        String sql = "UPDATE \"Topic\" SET status = ?, progress = CASE WHEN ? = 'DONE' THEN 100"
            + " ELSE progress END, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setString(2, status.name());
            ps.setString(3, Dates.now());
            ps.setString(4, topicId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not update the topic status.", e);
        }
    }

    public void updateProgress(String topicId, int progress) {
        int clamped = Math.max(0, Math.min(100, progress));
        String sql = "UPDATE \"Topic\" SET progress = ?, status = CASE WHEN ? >= 100 THEN 'DONE'"
            + " WHEN status = 'DONE' THEN 'PENDING' ELSE status END, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, clamped);
            ps.setInt(2, clamped);
            ps.setString(3, Dates.now());
            ps.setString(4, topicId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not update progress.", e);
        }
    }

    public void setFavorite(String topicId, boolean favorite) {
        String sql = "UPDATE \"Topic\" SET favorite = ?, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, favorite ? 1 : 0);
            ps.setString(2, Dates.now());
            ps.setString(3, topicId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not update the favourite flag.", e);
        }
    }

    public void updateNotes(String topicId, String notes) {
        String sql = "UPDATE \"Topic\" SET notes = ?, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, notes);
            ps.setString(2, Dates.now());
            ps.setString(3, topicId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not save topic notes.", e);
        }
    }

    private List<TopicRow> query(String sql, String userId) {
        List<TopicRow> out = new ArrayList<>();
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
            throw new Database.DataException("Could not load topics.", e);
        }
    }

    private TopicRow map(ResultSet rs) throws SQLException {
        return new TopicRow(
            rs.getString("id"),
            rs.getString("slug"),
            rs.getString("title"),
            rs.getInt("phase"),
            rs.getString("description"),
            rs.getString("resources"),
            TopicStatus.of(rs.getString("status")),
            rs.getInt("progress"),
            rs.getString("notes"),
            rs.getInt("favorite") == 1,
            rs.getInt("order"),
            rs.getInt("problemCount"));
    }
}
