package com.agritourism.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * AgriTourism Database Connection Template
 * 
 * PAALALA: Ikaw ang mag-iinstall ng JDBC driver jar file (hal. mysql-connector-j.jar)
 * sa iyong IDE (NetBeans / IntelliJ / Eclipse) at ikaw ang gagawa ng database.
 * Ilagay lamang sa ibaba ang iyong database URL, username, at password.
 */
public class DatabaseConnection {

    // =========================================================================
    // I-CONFIGURE ANG IYONG DATABASE DITO:
    // =========================================================================
    // Halimbawa para sa MySQL: "com.mysql.cj.jdbc.Driver"
    // Halimbawa para sa PostgreSQL: "org.postgresql.Driver"
    private static final String DRIVER = "com.mysql.cj.jdbc.Driver";

    // Palitan ang database name, port, at host ayon sa database na ginawa mo:
    private static final String URL = "jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

    // Ang iyong database user at password:
    private static final String USER = "root";
    private static final String PASS = "";

    /**
     * Kukunin ang Connection gamit ang iyong na-install na JDBC driver
     */
    public static Connection getConnection() throws SQLException {
        try {
            // Load driver na i-install mo sa project libraries
            Class.forName(DRIVER);
        } catch (ClassNotFoundException e) {
            System.err.println("[DatabaseConnection] Paalala: Hindi pa na-a-add ang JDBC driver JAR file sa classpath.");
            System.err.println("Paki-add ang JDBC .jar file sa iyong IDE (Libraries -> Add JAR/Folder).");
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }

    /**
     * Helper method para ma-check kung successful ang connection sa database mo
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DatabaseConnection] Connection failed: " + e.getMessage());
            return false;
        }
    }
}
