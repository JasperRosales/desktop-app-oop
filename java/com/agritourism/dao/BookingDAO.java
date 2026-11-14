package com.agritourism.dao;

import com.agritourism.db.DatabaseConnection;
import com.agritourism.model.Booking;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Booking Data Access Object (DAO) using Pure JDBC
 */
public class BookingDAO {

    public boolean createBooking(Booking booking) {
        String sql = "INSERT INTO bookings (booking_code, user_id, farm_id, customer_name, farm_name, activity, tour_date, participants, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, booking.getBookingCode());
            stmt.setInt(2, booking.getUserId());
            stmt.setInt(3, booking.getFarmId());
            stmt.setString(4, booking.getCustomerName());
            stmt.setString(5, booking.getFarmName());
            stmt.setString(6, booking.getActivity());
            stmt.setDate(7, booking.getTourDate());
            stmt.setInt(8, booking.getParticipants());
            stmt.setBigDecimal(9, booking.getTotalAmount());
            stmt.setString(10, booking.getStatus() != null ? booking.getStatus() : "Pending");

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        booking.setId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[BookingDAO] Error creating booking: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    public List<Booking> getBookingsByUserId(int userId) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM bookings WHERE user_id = ? ORDER BY tour_date DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[BookingDAO] Error fetching bookings: " + e.getMessage());
        }
        return list;
    }

    public boolean updateBookingStatus(int bookingId, String newStatus) {
        String sql = "UPDATE bookings SET status = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newStatus);
            stmt.setInt(2, bookingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[BookingDAO] Error updating status: " + e.getMessage());
            return false;
        }
    }

    private Booking mapResultSetToBooking(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setId(rs.getInt("id"));
        b.setBookingCode(rs.getString("booking_code"));
        b.setUserId(rs.getInt("user_id"));
        b.setFarmId(rs.getInt("farm_id"));
        b.setCustomerName(rs.getString("customer_name"));
        b.setFarmName(rs.getString("farm_name"));
        b.setActivity(rs.getString("activity"));
        b.setTourDate(rs.getDate("tour_date"));
        b.setParticipants(rs.getInt("participants"));
        b.setTotalAmount(rs.getBigDecimal("total_amount"));
        b.setStatus(rs.getString("status"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        return b;
    }
}
