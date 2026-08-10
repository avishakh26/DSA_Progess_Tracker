package com.dsajourney.desktop.dao;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.GoalRow;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class GoalDao {

    public List<GoalRow> findAll(String userId) {
        String sql = "SELECT id, month, title, focus, description, target, progress, completed"
            + " FROM \"MonthlyGoal\" WHERE userId = ? ORDER BY month";
        List<GoalRow> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new GoalRow(
                        rs.getString("id"),
                        rs.getInt("month"),
                        rs.getString("title"),
                        rs.getString("focus"),
                        rs.getString("description"),
                        rs.getInt("target"),
                        rs.getInt("progress"),
                        rs.getInt("completed") == 1));
                }
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load monthly goals.", e);
        }
    }

    public void update(String goalId, int progress, boolean completed) {
        String sql = "UPDATE \"MonthlyGoal\" SET progress = ?, completed = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, Math.max(0, progress));
            ps.setInt(2, completed ? 1 : 0);
            ps.setString(3, goalId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not update the goal.", e);
        }
    }
}
