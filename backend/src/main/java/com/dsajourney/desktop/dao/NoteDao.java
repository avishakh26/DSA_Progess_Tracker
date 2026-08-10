package com.dsajourney.desktop.dao;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.NoteRow;
import com.dsajourney.desktop.util.Dates;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class NoteDao {

    public List<NoteRow> findAll(String userId) {
        String sql = "SELECT id, title, content, pinned, updatedAt FROM \"Note\""
            + " WHERE userId = ? ORDER BY pinned DESC, updatedAt DESC";
        List<NoteRow> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new NoteRow(
                        rs.getString("id"),
                        rs.getString("title"),
                        rs.getString("content"),
                        rs.getInt("pinned") == 1,
                        Dates.parse(rs.getString("updatedAt"))));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load notes.", e);
        }
    }

    public String create(String userId, String title) {
        String id = UUID.randomUUID().toString();
        String now = Dates.now();
        String sql = "INSERT INTO \"Note\" (id, userId, title, content, pinned, createdAt, updatedAt)"
            + " VALUES (?,?,?,'',0,?,?)";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setString(2, userId);
            ps.setString(3, title);
            ps.setString(4, now);
            ps.setString(5, now);
            ps.executeUpdate();
            return id;
        } catch (SQLException e) {
            throw new Database.DataException("Could not create the note.", e);
        }
    }

    public void save(String noteId, String title, String content) {
        String sql = "UPDATE \"Note\" SET title = ?, content = ?, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, title);
            ps.setString(2, content);
            ps.setString(3, Dates.now());
            ps.setString(4, noteId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not save the note.", e);
        }
    }

    public void setPinned(String noteId, boolean pinned) {
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(
                 "UPDATE \"Note\" SET pinned = ?, updatedAt = ? WHERE id = ?")) {
            ps.setInt(1, pinned ? 1 : 0);
            ps.setString(2, Dates.now());
            ps.setString(3, noteId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not pin the note.", e);
        }
    }

    public void delete(String noteId) {
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement("DELETE FROM \"Note\" WHERE id = ?")) {
            ps.setString(1, noteId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not delete the note.", e);
        }
    }
}
