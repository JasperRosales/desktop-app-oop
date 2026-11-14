package com.agritourism.model;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

public class Booking {
    private int id;
    private String bookingCode;
    private int userId;
    private int farmId;
    private String customerName;
    private String farmName;
    private String activity;
    private Date tourDate;
    private int participants;
    private BigDecimal totalAmount;
    private String status; // "Pending", "Confirmed", "Completed", "Cancelled"
    private Timestamp createdAt;

    public Booking() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getFarmId() { return farmId; }
    public void setFarmId(int farmId) { this.farmId = farmId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }

    public Date getTourDate() { return tourDate; }
    public void setTourDate(Date tourDate) { this.tourDate = tourDate; }

    public int getParticipants() { return participants; }
    public void setParticipants(int participants) { this.participants = participants; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
