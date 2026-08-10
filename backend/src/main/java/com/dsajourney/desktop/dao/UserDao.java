package com.dsajourney.desktop.dao;

import com.dsajourney.desktop.db.Database;
import com.dsajourney.desktop.domain.AppUser;
import com.dsajourney.desktop.util.Passwords;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class UserDao {

    private static final String COLUMNS =
        "id, name, email, image, dailyGoal, handleCf, handleLc";

    /** Returns the user when the password matches, otherwise null. */
    public AppUser authenticate(String email, String password) {
        String sql = "SELECT " + COLUMNS + ", passwordHash FROM \"User\" WHERE lower(email) = lower(?)";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email == null ? "" : email.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                if (!Passwords.matches(password, rs.getString("passwordHash"))) {
                    return null;
                }
                return map(rs);
            }
        } catch (SQLException e) {
            throw new Database.DataException("Could not sign in.", e);
        }
    }

    public List<AppUser> findAll() {
        String sql = "SELECT " + COLUMNS + " FROM \"User\" ORDER BY email";
        List<AppUser> out = new ArrayList<>();
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                out.add(map(rs));
            }
            return out;
        } catch (SQLException e) {
            throw new Database.DataException("Could not load users.", e);
        }
    }

    public void updateDailyGoal(String userId, int dailyGoal) {
        String sql = "UPDATE \"User\" SET dailyGoal = ?, updatedAt = ? WHERE id = ?";
        try (Connection c = Database.open();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, Math.max(1, dailyGoal));
            ps.setString(2, com.dsajourney.desktop.util.Dates.now());
            ps.setString(3, userId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new Database.DataException("Could not save the daily goal.", e);
        }
    }

    private AppUser map(ResultSet rs) throws SQLException {
        return new AppUser(
            rs.getString("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("image"),
            rs.getInt("dailyGoal"),
            rs.getString("handleCf"),
            rs.getString("handleLc"));
    }
}
