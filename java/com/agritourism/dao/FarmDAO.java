package com.agritourism.dao;

import com.agritourism.db.DatabaseConnection;
import com.agritourism.model.FarmTour;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Farm Tour Data Access Object (DAO) using Pure JDBC
 */
public class FarmDAO {

    public List<FarmTour> getAllFarms() {
        List<FarmTour> list = new ArrayList<>();
        String sql = "SELECT * FROM farms ORDER BY rating DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                FarmTour f = new FarmTour();
                f.setId(rs.getInt("id"));
                f.setName(rs.getString("name"));
                f.setLocation(rs.getString("location"));
                f.setFarmerId((Integer) rs.getObject("farmer_id"));
                f.setRating(rs.getDouble("rating"));
                f.setReviewsCount(rs.getInt("reviews_count"));
                f.setPricePerPerson(rs.getBigDecimal("price_per_person"));
                f.setCategory(rs.getString("category"));
                f.setOperatingHours(rs.getString("operating_hours"));
                f.setDescription(rs.getString("description"));
                f.setCreatedAt(rs.getTimestamp("created_at"));
                list.add(f);
            }
        } catch (SQLException e) {
            System.err.println("[FarmDAO] Error retrieving farms: " + e.getMessage());
        }
        return list;
    }

    public boolean addFarm(FarmTour farm) {
        String sql = "INSERT INTO farms (name, location, farmer_id, rating, reviews_count, price_per_person, category, operating_hours, description) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, farm.getName());
            stmt.setString(2, farm.getLocation());
            if (farm.getFarmerId() != null) stmt.setInt(3, farm.getFarmerId());
            else stmt.setNull(3, Types.INTEGER);
            stmt.setDouble(4, farm.getRating());
            stmt.setInt(5, farm.getReviewsCount());
            stmt.setBigDecimal(6, farm.getPricePerPerson());
            stmt.setString(7, farm.getCategory());
            stmt.setString(8, farm.getOperatingHours());
            stmt.setString(9, farm.getDescription());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[FarmDAO] Error adding farm: " + e.getMessage());
            return false;
        }
    }
}
