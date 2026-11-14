/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ============================================================================
 * AGRITOURISM PHILIPPINES · ULTRA-ESTHETIC DESKTOP PLATFORM (SINGLE-FILE APP)
 * ============================================================================
 * 
 * IMAGE CONFIGURATION GUIDE & MARKS:
 * All global images and system configuration settings are centrally located
 * right below in `APP_CONFIG`. Look for the [CHANGE_IMAGE_HERE] markers to easily
 * update or replace any banner, background, avatar, or farm photo.
 * 
 * CORE DESIGN & ARCHITECTURAL HIGHLIGHTS:
 * 1. Full Glassmorphism: Scenic Philippine farm backdrop visible behind the entire page
 *    with a frosted acrylic blur (backdrop-blur-xl), translucent dark green glass sidebar
 *    (rgba(8, 30, 14, 0.72) + 28px blur), and soft cream/frosted glass panels throughout.
 * 2. 5 Distinct Farm Tours with rich, individual descriptions, amenities, and photos:
 *    - Sunnyvale Farm Heritage Agro-Trail (Batangas)
 *    - Golden Sunflower & Honeycomb Sanctuary (San Jose, Batangas)
 *    - Laurel Ridge Taal Overlook & Cacao Forest (Laurel, Batangas)
 *    - Banaue Ancestral Rice Terraces Cultural Trail (Benguet / Ifugao)
 *    - Riverside Bamboo Agritrail & Waterway Haven (Calauan, Laguna)
 * 3. 5 Distinct Fruit Picking Experiences with unique seasonal details:
 *    - Sweet Dalanghita & Valencia Orange Orchard Harvest (Batangas)
 *    - Highland Sweet Strawberry Harvest Festival (La Trinidad, Benguet)
 *    - Golden Carabao Mango Tree-to-Basket Harvest (Guimaras & Batangas)
 *    - Radiant Magenta Dragon Fruit & Passionfruit Trellis (Laurel, Batangas)
 *    - Sweet Rambutan & Lanzones Cluster Harvest (Laguna)
 * 4. 3 Role Perspectives with 1-Click Instant Switching:
 *    - ADMIN: Platform Overview, 4 stat cards (1,248 Users, 86 Farms, 342 Bookings, 1,560 Products),
 *             smooth spline wave chart with 0-300 grid net, recent activity log.
 *    - FARMER (Juan Dela Cruz): 3 stat cards, Farmer Monthly Sales chart, Pending Bookings
 *             with interactive [Accept] / [Decline] actions, My Products, and Add Product form.
 *    - TOURIST (Maria Santos): Hello Maria dashboard, 3 stats, Experience Farm Life banner,
 *             Popular Destinations, Saved Farms, and Bookings.
 * 5. Public Opening Page: Search bar, trending spots, fruit picking, hiking spots, 10% off
 *    sales preview, and 5-star customer reviews readable without login (with login gating for bookings).
 * 6. Sign Up Page & Login Modal: Featuring Mang Rigor Rodriguez with his quote in Filipino.
 * 7. Secure 4-Step Checkout: 1 Cart -> 2 Delivery Address -> 3 Payment (GCash, Bank Transfer, COD) -> 4 Confirmation.
 * 8. In-App SQL Database Studio: Schema viewer, query runner, and schema copy utility.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Calendar,
  ShoppingBag,
  Heart,
  Star,
  Bell,
  User,
  LogOut,
  Search,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Wifi,
  Coffee,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Building,
  Truck,
  ArrowRight,
  Filter,
  DollarSign,
  Users,
  Layers,
  Sparkles,
  Database,
  Download,
  Copy,
  Check,
  Eye,
  Sliders,
  ChevronDown,
  Info,
  Maximize2,
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  Camera,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  FileText,
  CalendarCheck,
  BarChart3,
  Carrot,
  Leaf,
  CheckCircle,
  QrCode,
  Wallet,
  Banknote,
  X,
  BadgePercent,
  Code2,
  Terminal,
  Server,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Upload,
  Package,
  Image as ImageIcon,
  LogIn,
  Tag,
  Sprout,
  Award,
  Edit3,
  AlertCircle,
  CheckSquare,
  XOctagon,
  PhoneCall,
  Droplets,
  Navigation,
  Ticket,
  Printer,
  ChevronLeft,
  Monitor,
  Square,
  RefreshCw
} from 'lucide-react';
import { javaBackend } from './services/javaBackend';
import { OfflineIndicator } from './components/OfflineIndicator';

declare global {
  interface Window {
    desktopApp?: {
      isDesktop: boolean;
      platform: string;
      minimize: () => Promise<void>;
      toggleMaximize: () => Promise<boolean>;
      isMaximized: () => Promise<boolean>;
      close: () => Promise<void>;
      reload: () => Promise<void>;
      toggleDevTools: () => Promise<void>;
      printWindow: () => Promise<boolean>;
      saveAsPdf: () => Promise<{ canceled: boolean; filePath?: string }>;
      onMaximizedChange?: (cb: (state: boolean) => void) => () => void;
    };
  }
}

/* ========================================================================= */
/* 1. CONFIGURATION SETTINGS & HTML ASSET REGISTRY READER                    */
/* ========================================================================= */

// Reads any <img data-key="..." src="..."> defined inside index.html (#agritourism-images)
// so you can easily change all pictures directly inside index.html!
export const getHtmlImage = (key: string, fallback: string): string => {
  if (typeof document === 'undefined') return fallback;
  const tpl = document.getElementById('agritourism-images') as HTMLTemplateElement | null;
  const fromTpl = tpl?.content?.querySelector(`img[data-key="${key}"]`)?.getAttribute('src');
  if (fromTpl && fromTpl.trim()) return fromTpl.trim();
  const fromDoc = document.querySelector(`img[data-key="${key}"]`)?.getAttribute('src');
  return fromDoc && fromDoc.trim() ? fromDoc.trim() : fallback;
};

export const APP_CONFIG = {
  appName: "AgriTourism",
  tagline: "Farm. Connect. Experience.",
  contactEmail: "support@agritourism.ph",
  contactPhone: "+63 917 890 1234",
  currencySymbol: "₱",
  deliveryFee: 70,

  // Images below are automatically loaded from index.html (<template id="agritourism-images">)
  globalFarmBackground: getHtmlImage("globalFarmBackground", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2560&q=85"),
  sunnyvaleTourBanner: getHtmlImage("sunnyvaleTourBanner", "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1200&q=80"),
  fruitPickingBanner: getHtmlImage("fruitPickingBanner", "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80"),
  adminMockupRef: getHtmlImage("adminMockupRef", "/assets/aistudio/Screenshot_2026-11-05_124705_4d6a6d5e.png"),
  farmLifeBannerPhoto: getHtmlImage("farmLifeBannerPhoto", "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1600&q=80"),

  mangRigorPhoto: getHtmlImage("mangRigorPhoto", "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80"),
  mangRigorQuote: "Sa bawat binhing aking itinatanim, kasama ang pagod, tiyaga, at pag-asang aanihin ko rin ang bunga ng aking pagsisikap.",

  mariaAvatar: getHtmlImage("mariaAvatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"),
  juanAvatar: getHtmlImage("juanAvatar", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"),
  adminAvatar: getHtmlImage("adminAvatar", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"),

  gcashQrMockup: getHtmlImage("gcashQrMockup", "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=AGRITOURISM-GCASH-PAYMENT-REF-2026"),

  uploadedMockups: [
    { title: "Admin Platform Overview (Screenshot 124705)", path: "/assets/aistudio/Screenshot_2026-11-05_124705_4d6a6d5e.png" },
    { title: "Sunnyvale Farm Tour Detail (Screenshot 124629)", path: "/assets/aistudio/Screenshot_2026-11-05_124629_d476e790.png" },
    { title: "Fruit Picking Experience (Screenshot 124640)", path: "/assets/aistudio/Screenshot_2026-11-05_124640_9b8d2d65.png" },
    { title: "User Dashboard (Screenshot 122601)", path: "/assets/aistudio/Screenshot_2026-11-05_122601_8a2486ad.png" },
    { title: "Opening / Landing Page (Screenshot 122536)", path: "/assets/aistudio/Screenshot_2026-11-05_122536_7411613e.png" },
    { title: "Sign Up Page (Screenshot 122529)", path: "/assets/aistudio/Screenshot_2026-11-05_122529_f638abde.png" }
  ]
};

/* ========================================================================= */
/* 2. SQL DATABASE SCHEMA                                                    */
/* ========================================================================= */

export const SQL_SCHEMA_SCRIPT = `
-- ========================================================================
-- AGRITOURISM PHILIPPINES DATABASE SCHEMA (PostgreSQL / Relational SQL)
-- Stores Users, Farms, Products, Bookings, Transactions, and Customer Reviews
-- ========================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'farmer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(120) NOT NULL,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    rating NUMERIC(2,1) DEFAULT 4.8,
    reviews_count INT DEFAULT 0,
    price_per_person NUMERIC(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '7:00 AM - 5:00 PM',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Vegetables', 'Fruits', 'Others')),
    price NUMERIC(10,2) NOT NULL,
    unit VARCHAR(30) DEFAULT '/kg',
    discount_percent INT DEFAULT 0,
    stock INT DEFAULT 50,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(30) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    customer_name VARCHAR(120) NOT NULL,
    farm_name VARCHAR(150) NOT NULL,
    activity VARCHAR(100) NOT NULL,
    tour_date DATE NOT NULL,
    participants INT NOT NULL DEFAULT 1,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id INT REFERENCES bookings(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('GCash', 'Bank Transfer', 'Cash on Delivery')),
    amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(120) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export const JAVA_JDBC_CODE = `package com.agritourism.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * AgriTourism Database Connection Template
 * 
 * PAALALA: Ikaw ang mag-iinstall ng JDBC driver JAR file (hal. mysql-connector-j.jar)
 * sa iyong IDE (NetBeans / IntelliJ / Eclipse) at ikaw ang gagawa ng sarili mong database.
 * Ilagay lamang dito ang iyong sariling database URL, username, at password.
 */
public class DatabaseConnection {

    // =========================================================================
    // I-CONFIGURE ANG IYONG DATABASE DITO:
    // =========================================================================
    // Driver class ng JDBC driver na na-install mo sa iyong IDE libraries:
    private static final String DRIVER = "com.mysql.cj.jdbc.Driver";

    // Palitan ng iyong database host, port, at database name:
    private static final String URL = "jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

    // Ang iyong database credentials:
    private static final String USER = "root";
    private static final String PASS = "";

    /**
     * Kukunin ang Connection gamit ang iyong na-install na JDBC driver
     */
    public static Connection getConnection() throws SQLException {
        try {
            // Load ng driver na iyong in-install sa project libraries
            Class.forName(DRIVER);
        } catch (ClassNotFoundException e) {
            System.err.println("[DatabaseConnection] Paalala: Hindi pa na-a-add ang JDBC driver JAR file sa classpath.");
            System.err.println("Paki-add ang JDBC .jar file sa iyong IDE (Libraries -> Add JAR/Folder).");
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }

    /**
     * Helper method para ma-test kung connected na ang database na ginawa mo
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DatabaseConnection] Connection failed: " + e.getMessage());
            return false;
        }
    }
}`;

export const JAVA_DAO_CODE = `package com.agritourism.dao;

import com.agritourism.db.DatabaseConnection;
import com.agritourism.model.Booking;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {
    // Insert new tour booking via JDBC PreparedStatement
    public boolean createBooking(Booking b) {
        String sql = "INSERT INTO bookings (booking_code, user_id, farm_id, customer_name, farm_name, activity, tour_date, participants, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, b.getBookingCode());
            ps.setInt(2, b.getUserId());
            ps.setInt(3, b.getFarmId());
            ps.setString(4, b.getCustomerName());
            ps.setString(5, b.getFarmName());
            ps.setString(6, b.getActivity());
            ps.setDate(7, b.getTourDate());
            ps.setInt(8, b.getParticipants());
            ps.setBigDecimal(9, b.getTotalAmount());
            ps.setString(10, b.getStatus());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Retrieve bookings by User ID
    public List<Booking> getBookingsByUserId(int userId) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM bookings WHERE user_id = ? ORDER BY tour_date DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Booking b = new Booking();
                    b.setId(rs.getInt("id"));
                    b.setBookingCode(rs.getString("booking_code"));
                    b.setCustomerName(rs.getString("customer_name"));
                    b.setFarmName(rs.getString("farm_name"));
                    b.setTourDate(rs.getDate("tour_date"));
                    b.setTotalAmount(rs.getBigDecimal("total_amount"));
                    b.setStatus(rs.getString("status"));
                    list.add(b);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }
}`;

export const JAVA_SERVER_CODE = `package com.agritourism.server;

import com.agritourism.db.DatabaseConnection;
import com.agritourism.dao.FarmDAO;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class AgriTourismServer {
    public static void main(String[] args) throws IOException {
        System.out.println("Starting AgriTourism Java Backend on port 8080...");
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/api/health", exchange -> {
            boolean dbOk = DatabaseConnection.testConnection();
            String res = "{\\"status\\":\\"UP\\",\\"jdbcConnected\\":" + dbOk + "}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, res.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) { os.write(res.getBytes()); }
        });

        server.start();
        System.out.println("Java Backend Running at http://localhost:8080");
    }
}`;

export const JAVA_DESKTOP_CODE = `package com.agritourism.frontend;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

public class AgriTourismDesktopApp extends Application {
    @Override
    public void start(Stage stage) {
        stage.setTitle("AgriTourism Philippines · JavaFX Desktop Client");
        WebView webView = new WebView();
        WebEngine engine = webView.getEngine();
        engine.load("http://localhost:3000"); // Loads the React Desktop UI

        Scene scene = new Scene(new BorderPane(webView), 1440, 900);
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}`;

export const NETBEANS_XAMPP_GUIDE = `================================================================================
AGRITOURISM PHILIPPINES: STEP-BY-STEP JAVA + JDBC SETUP GUIDE
Target Environment: NetBeans IDE / IntelliJ IDEA / Eclipse + XAMPP (MySQL)
================================================================================

1. START LOCAL MYSQL DATABASE (XAMPP)
   - Open XAMPP Control Panel.
   - Click "Start" on Apache and "Start" on MySQL.
   - Open your browser and navigate to: http://localhost/phpmyadmin
   - Click "New" on the left sidebar, name the database: agritourism_db
   - Go to the "SQL" tab, paste the contents of "agritourism_schema.sql" and click "Go".
   - Your tables (users, farms, bookings, products, transactions, reviews) are now created and seeded!

2. CREATE JAVA PROJECT IN NETBEANS / INTELLIJ
   - File -> New Project -> Java with Maven (or Java with Ant).
   - Project Name: AgriTourismApp
   - Package: com.agritourism

3. ADD MYSQL JDBC DRIVER JAR (CRITICAL!)
   - If using Maven, pom.xml already contains:
     <dependency>
       <groupId>com.mysql</groupId>
       <artifactId>mysql-connector-j</artifactId>
       <version>8.3.0</version>
     </dependency>
   - If using Ant/Standard Java in NetBeans:
     Right-click "Libraries" folder -> "Add JAR/Folder" -> Select "mysql-connector-j-8.x.jar".

4. PLACE SOURCE CODE FILES
   - com/agritourism/db/DatabaseConnection.java (JDBC Connection Manager)
   - com/agritourism/model/User.java, Booking.java, FarmTour.java
   - com/agritourism/dao/BookingDAO.java, UserDAO.java, FarmDAO.java
   - com/agritourism/server/AgriTourismServer.java (Built-in HTTP REST Server)
   - com/agritourism/frontend/AgriTourismDesktopApp.java (JavaFX Desktop Client)

5. RUNNING THE SYSTEM
   - STEP A (Backend): Run AgriTourismServer.java
     Output: "[AgriTourism Server] Running on http://localhost:8080"
     Test in browser: http://localhost:8080/api/health
   - STEP B (Frontend Bridge): Run AgriTourismDesktopApp.java
     Native JavaFX desktop window opens rendering the Philippine AgriTourism platform!
     JavaScript calls window.javaBridge for direct Java method execution & JDBC queries.
`;

/* ========================================================================= */
/* 3. ENTITY DATA TYPES                                                      */
/* ========================================================================= */

interface FarmTour {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  pricePerPerson: number;
  operatingHours: string;
  amenities: string[];
  activities: string[];
  imageUrl: string;
  description: string;
  highlightTag: string;
  farmerName: string;
  thumbnails: string[];
}

interface FruitPickingItem {
  id: number;
  title: string;
  farmName: string;
  location: string;
  fruitName: string;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  duration: string;
  seasonalFruits: string;
  imageUrl: string;
  description: string;
  seasonAvailability: string;
  thumbnails?: string[];
}

interface Product {
  id: number;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Others';
  price: number;
  unit: string;
  discountPercent: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  description: string;
  farmOrigin: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Booking {
  id: number;
  bookingCode: string;
  farmId: number;
  farmName: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  activity: string;
  tourDate: string;
  tourTime: string; // Time column (e.g. 08:30 AM - Morning Agro-Walk)
  participants: number;
  totalAmount: number;
  paymentMethod?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  attendanceStatus?: 'Pending Confirmation' | 'Confirmed Attending' | 'Cancelled by Tourist' | 'Arrived & Checked In';
  assignedGuide?: string;
  specialRequests?: string;
  uploadedIdDoc?: string;
  uploadedReceiptDoc?: string;
  checkedInAt?: string;
}

export interface DeliveryCheckpoint {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  notes?: string;
}

export interface FarmerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productName: string; qty: number; unitPrice: number }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Paid via GCash' | 'COD' | 'Paid via Maya';
  fulfillmentStatus: 'Pending Packing' | 'Dispatched' | 'Delivered';
  orderDate: string;
  uploadedReceiptUrl: string;
  specialDeliveryNotes?: string;
  // Delivery Tracking & Location Details
  courierName?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  currentLocation?: string;
  estimatedArrival?: string;
  trackingNumber?: string;
  deliverySteps?: DeliveryCheckpoint[];
  // Customer Receipt Confirmation
  isReceivedByUser?: boolean;
  receivedAt?: string;
  receivedByRecipient?: string;
}

interface CustomerReview {
  id: number;
  author: string;
  roleTag: string;
  rating: number;
  date: string;
  farmOrCrop: string;
  comment: string;
}

export interface FarmerProfileItem {
  id: number;
  name: string;
  roleTitle: string;
  farmName: string;
  location: string;
  province: string;
  yearsExperience: number;
  photoUrl: string;
  farmBannerUrl: string;
  storyQuote: string;
  fullBiography: string;
  farmingPhilosophy: string;
  certifications: string[];
  sustainablePractices: string[];
  specialtyProduce: string[];
  productIds: number[];
  tourId: number;
  rating: number;
  reviewsCount: number;
  generation: string;
  hectares: string;
  gallery: string[];
}

export const FARMERS_COMMUNITY_DATA: FarmerProfileItem[] = [
  {
    id: 1,
    name: "Mang Juan Dela Cruz",
    roleTitle: "Master Pomologist & Agro-Steward",
    farmName: "Sunnyvale Farm & Honeycomb Sanctuary",
    location: "Bauan & San Jose, Batangas",
    province: "Batangas",
    yearsExperience: 40,
    photoUrl: getHtmlImage("farmer1Photo", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"),
    farmBannerUrl: getHtmlImage("farmer1Banner", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"),
    storyQuote: "Ang tunay na yaman ng lupa ay hindi lamang sa dami ng ani, kundi sa pag-aalaga sa kalikasan para sa susunod na henerasyon ng kabataang Pilipino.",
    fullBiography: "Nagsimula si Mang Juan noong 1984 sa 2-ektaryang taniman ng kape at lansones sa paanan ng Mount Maculot. Sa apat na dekadang pagtitiyaga, pinangunahan niya ang paggamit ng vermiculture, rainwater retention canals, at natural bee pollinator sanctuaries. Ngayon, nagbibigay ang Sunnyvale Farm ng regular na kabuhayan sa higit 24 na pamilyang magsasaka at tumatanggap ng mga eco-tourists upang ituro ang tunay na diwa ng Batangueño farming.",
    farmingPhilosophy: "Regenerative soil stewardship: feed the microorganisms first, and the soil will feed the community abundantly without chemicals.",
    certifications: [
      "Bureau of Plant Industry GAP Certified",
      "Organic Soil Conservation Steward",
      "CALABARZON Eco-Farm of the Year"
    ],
    sustainablePractices: [
      "Zero Synthetic Pesticides",
      "Rainwater Harvesting Reservoirs",
      "Native Stingless Bee Pollination",
      "Vermicompost Soil Enrichment"
    ],
    specialtyProduce: ["Carabao Mangoes", "Native Ampalaya", "Wildflower Honey", "Saba Bananas"],
    productIds: [101, 103, 106, 107, 109, 110],
    tourId: 1,
    rating: 4.9,
    reviewsCount: 148,
    generation: "3rd Generation Farmer",
    hectares: "8.5 Hectares",
    gallery: [
      getHtmlImage("farmer1Gallery1", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer1Gallery2", "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer1Gallery3", "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer1Gallery4", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80")
    ]
  },
  {
    id: 2,
    name: "Nanay Elena Soriano",
    roleTitle: "Highland Organic Pioneer & Women Farmers Leader",
    farmName: "Benguet Berry Haven & Highland Mist Sanctuary",
    location: "La Trinidad & Tublay, Benguet",
    province: "Benguet",
    yearsExperience: 28,
    photoUrl: getHtmlImage("farmer2Photo", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"),
    farmBannerUrl: getHtmlImage("farmer2Banner", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80"),
    storyQuote: "Sa bawat umagang nababalot ng hamog ang La Trinidad, bawat punla ng strawberry at kape ay inaalagaan naming parang sariling anak nang walang nakalalasong kemikal.",
    fullBiography: "Tubong Benguet si Nanay Elena at namulat sa tradisyunal na pagtatanim sa bulubundukin ng Cordillera. Noong dekada 90, pinasimulan niya ang pag-aalis ng mga kemikal na pestisidyo pabor sa pine needle composting at botanical sprays. Bilang pangulo ng La Trinidad Women Agrarian Cooperative, matagumpay niyang ikinonekta ang mga turista at direct consumers sa kanilang aning strawberry at kape, kaya napanatili ang patas na presyo para sa kababaihang magsasaka.",
    farmingPhilosophy: "High-altitude organic balance: working in harmony with mountain fog, spring waters, and ancestral terracing wisdom.",
    certifications: [
      "Benguet Agro-Ecological Seal",
      "Cordillera Organic Agriculture Guild",
      "Fair Trade Women Champion"
    ],
    sustainablePractices: [
      "Mountain Spring Water Irrigation",
      "Pine Needle Soil Bed Mulching",
      "Companion Planting with Wild Mint",
      "Heirloom Strawberry Seed Bank"
    ],
    specialtyProduce: ["Sweet Red Strawberries", "Crisp Baguio Lettuce", "Sweet Carrots & Broccoli"],
    productIds: [102, 105, 108],
    tourId: 4,
    rating: 5.0,
    reviewsCount: 162,
    generation: "2nd Generation Highland Steward",
    hectares: "4.2 Hectares",
    gallery: [
      getHtmlImage("farmer2Gallery1", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer2Gallery2", "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer2Gallery3", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer2Gallery4", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80")
    ]
  },
  {
    id: 3,
    name: "Mang Rigor Rodriguez",
    roleTitle: "Veteran Mango Arborist & Heirloom Seed Steward",
    farmName: "Batangas Heritage Mango & Rice Terraces",
    location: "San Juan & Rosario, Batangas",
    province: "Batangas",
    yearsExperience: 35,
    photoUrl: getHtmlImage("farmer3Photo", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"),
    farmBannerUrl: getHtmlImage("farmer3Banner", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80"),
    storyQuote: "Ang lupang ipinamana sa atin ng ating mga ninuno ay may sagradong tungkuling pakainin nang malinis at masustansya ang pamilyang Pilipino.",
    fullBiography: "Si Mang Rigor ay kilala sa buong Katagalugan sa pagpapanatili ng natural na paraan ng pamumunga ng manggang kalabaw nang hindi gumagamit ng calcium carbide o synthetic ripeners. Ang kanyang sakahan ay tahanan din ng mga heirloom na uri ng palay tulad ng Dinorado at Milagrosa. Tumatanggap siya ng mga mag-aaral ng agrikultura upang ituro ang sining ng tree grafting, organic seed storage, at rice field micro-ecosystems.",
    farmingPhilosophy: "Ancestral inheritance: trees that were planted by grandfathers must be preserved with devotion for great-grandchildren.",
    certifications: [
      "Natural Farming Systems Philippines",
      "Heirloom Variety Preservation Award",
      "Batangas Master Agriculturist"
    ],
    sustainablePractices: [
      "Tree-Ripened Hand Harvesting",
      "Botanical Smoke Pest Management",
      "Fermented Plant Juice Nutrition",
      "Free-Range Duck Rice Weeding"
    ],
    specialtyProduce: ["Carabao Mangoes", "Plump Native Kamatis", "Sitaw & Kalabasa", "Banana Chips"],
    productIds: [103, 104, 107, 110],
    tourId: 6,
    rating: 4.8,
    reviewsCount: 119,
    generation: "4th Generation Custodian",
    hectares: "11 Hectares",
    gallery: [
      getHtmlImage("farmer3Gallery1", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer3Gallery2", "https://images.unsplash.com/photo-1553279768-4653b0999a88?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer3Gallery3", "https://images.unsplash.com/photo-1506807803488-8eafc15316c6?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer3Gallery4", "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80")
    ]
  },
  {
    id: 4,
    name: "Tatay Ramon Alcantara",
    roleTitle: "Plateau Watershed Custodian & Agroforester",
    farmName: "Bukidnon Highlands Eco-Orchard & Pine Valley",
    location: "Malaybalay & Manolo Fortich, Bukidnon",
    province: "Bukidnon",
    yearsExperience: 32,
    photoUrl: getHtmlImage("farmer4Photo", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"),
    farmBannerUrl: getHtmlImage("farmer4Banner", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=1200&q=80"),
    storyQuote: "Ang bulkanikong lupa ng Bukidnon ay biyayang dapat pangalagaan. Sa bawat pinya at dragonfruit na inyong kinakain, sinusuportahan ninyo ang aming katutubong watershed.",
    fullBiography: "Lumaki si Tatay Ramon sa malawak na kapatagan ng Bukidnon kung saan nagtatagpo ang malamig na simoy ng bundok at matabang lupang bulkaniko. Nang makita ang pinsala ng soil erosion sa mga kalapit na bayan, sinimulan niya ang vetiver contour hedgerows at diversified agroforestry. Ngayon, ang kanyang plantasyon ay dinadayo ng mga turista na nagnanais maranasan ang pamimitas ng pinakamatamis na golden queen pineapples at pulang dragonfruit.",
    farmingPhilosophy: "Watershed-first agriculture: what happens in our mountain soils directly protects the rivers that sustain hundreds of towns below.",
    certifications: [
      "Mindanao Watershed Protection Partner",
      "Non-GMO Verified Agro-Hub",
      "Rainforest Alliance Certified"
    ],
    sustainablePractices: [
      "Contour Vetiver Grass Bunds",
      "Volcanic Mineral Soil Enrichment",
      "Zero-Waste Fruit Pulp Biomass",
      "Native Tree Shaded Borders"
    ],
    specialtyProduce: ["Golden Queen Pineapple", "Red Pitaya Dragonfruit", "Mountain Honey"],
    productIds: [107, 109, 110],
    tourId: 5,
    rating: 4.9,
    reviewsCount: 135,
    generation: "3rd Generation Mindanao Farmer",
    hectares: "15 Hectares",
    gallery: [
      getHtmlImage("farmer4Gallery1", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer4Gallery2", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer4Gallery3", "https://images.unsplash.com/photo-1553279768-4653b0999a88?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer4Gallery4", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80")
    ]
  },
  {
    id: 5,
    name: "Ka Luming Mendoza",
    roleTitle: "Award-Winning Single-Origin Cacao Cultivator",
    farmName: "Davao Single-Origin Cacao & Tropical Agroforest",
    location: "Malagos & Calinan, Davao del Sur",
    province: "Davao",
    yearsExperience: 24,
    photoUrl: getHtmlImage("farmer5Photo", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"),
    farmBannerUrl: getHtmlImage("farmer5Banner", "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80"),
    storyQuote: "Ang tsokolate ng Pilipinas ay may world-class na sarap kung nagmumula sa minamahal at protektadong shaded agroforest.",
    fullBiography: "Si Ka Luming ay isa sa mga nangungunang babaeng tagapagtaguyod ng Philippine Criollo and Trinitario cacao. Sa kanyang 6-ektaryang sakahan sa paanan ng Mount Apo, ang mga puno ng cacao ay sumisilong sa ilalim ng matatayog na puno ng narra, saging, at mangosteen. Ang kanyang artisan tablea at single-origin chocolates ay umani ng pagkilala sa lokal at pandaigdigang eksena, at nagbibigay ng pangkabuhayang pagsasanay sa higit 30 kababaihan sa kanilang barangay.",
    farmingPhilosophy: "Canopy ecology: the greatest cocoa flavor comes from the complexity of living inside a true tropical forest.",
    certifications: [
      "Philippine Cacao Excellence Gold Medalist",
      "Rainforest Biodiversity Steward",
      "Single-Origin Chocolate Guild"
    ],
    sustainablePractices: [
      "Multi-Story Agroforestry Canopy",
      "Wooden Solar Fermentation Boxes",
      "Banana-Leaf Curing Method",
      "Zero Chemical Additives"
    ],
    specialtyProduce: ["Artisan Tablea Blocks", "70% Dark Cacao Nibs", "Purple Mangosteen"],
    productIds: [101, 107, 109],
    tourId: 3,
    rating: 5.0,
    reviewsCount: 154,
    generation: "1st Generation Farm Founder",
    hectares: "6.0 Hectares",
    gallery: [
      getHtmlImage("farmer5Gallery1", "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer5Gallery2", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer5Gallery3", "https://images.unsplash.com/photo-1517424424660-fef77b78ca90?auto=format&fit=crop&w=600&q=80"),
      getHtmlImage("farmer5Gallery4", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80")
    ]
  }
];

/* ========================================================================= */
/* 4. SEED DATA (6 Distinct Tours, 6 Fruit Pickings, Rich Vegetables)         */
/* ========================================================================= */

const TOURS_DATA: FarmTour[] = [
  {
    id: 1,
    name: "Sunnyvale Farm Heritage Agro-Trail",
    location: "Bauan, Batangas",
    rating: 4.8,
    reviewsCount: 120,
    pricePerPerson: 200,
    operatingHours: "7:00 AM - 5:00 PM",
    amenities: ["Restroom", "Parking", "Garden Cafe", "Guides", "Fast Wi-Fi"],
    activities: ["Fruit Picking", "Farm Tour", "Cookout", "Animal Feeding"],
    imageUrl: getHtmlImage("tour1Image", "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=1000&q=80"),
    description: "Tucked inside the fertile volcanic hills of Bauan, Sunnyvale Farm is a multi-generational eco-estate famous for ancient Lanzones, Rambutan, and Carabao mango groves. Visitors embark on peaceful shaded trails through 40-year-old fruit canopies, taste fresh coconut water harvested right before your eyes, and savor a traditional Batangueño farm lunch cooked over open wood fire.",
    highlightTag: "Trending Farm Tour",
    farmerName: "Mang Juan Dela Cruz",
    thumbnails: [
      getHtmlImage("tour1Thumb1", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour1Thumb2", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour1Thumb3", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour1Thumb4", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 2,
    name: "Golden Sunflower & Honeycomb Sanctuary",
    location: "San Jose, Batangas",
    rating: 4.9,
    reviewsCount: 145,
    pricePerPerson: 250,
    operatingHours: "6:30 AM - 6:00 PM",
    amenities: ["Sun Hats", "Restroom", "Photo Decks", "Honey Pavilion", "Parking"],
    activities: ["Flower Photography", "Beekeeping Demo", "Honey Sampling", "Pollinator Walk"],
    imageUrl: getHtmlImage("tour2Image", "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1000&q=80"),
    description: "A breathtaking 6-hectare botanical sanctuary blanketed in over 50,000 golden blooming sunflowers. Designed as an educational haven for native pollinators and families, guests explore elevated bamboo walkways, interact with gentle stingless bees inside mesh observation huts, and sample pure raw comb honey with native herbal teas.",
    highlightTag: "Best for Photography",
    farmerName: "Aling Rosa Mendoza",
    thumbnails: [
      getHtmlImage("tour2Thumb1", "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour2Thumb2", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour2Thumb3", "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour2Thumb4", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 3,
    name: "Laurel Ridge Taal Overlook & Cacao Forest",
    location: "Laurel, Batangas",
    rating: 4.7,
    reviewsCount: 98,
    pricePerPerson: 280,
    operatingHours: "7:00 AM - 5:30 PM",
    amenities: ["Taal Overlook Deck", "Restroom", "Rustic Cabins", "Wi-Fi", "Campfire"],
    activities: ["Cacao Pod Harvesting", "Tablea Making Class", "Sunset Lounge", "Dragonfruit Trek"],
    imageUrl: getHtmlImage("tour3Image", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80"),
    description: "Perched high along the cool ridges overlooking Taal Lake and volcanic hills, Laurel View Farm combines agro-forestry with artisanal chocolate craft. Walk through shaded cacao trees, harvest purple cacao pods, roast fermented beans in traditional copper skillets, and press your own organic tablea chocolate cake.",
    highlightTag: "Scenic Overlook",
    farmerName: "Elena Bautista",
    thumbnails: [
      getHtmlImage("tour3Thumb1", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour3Thumb2", "https://images.unsplash.com/photo-1544965850-6f8a66788f9b?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour3Thumb3", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour3Thumb4", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 4,
    name: "Banaue Ancestral Rice Terraces Cultural Trail",
    location: "Banaue, Benguet / Ifugao",
    rating: 4.9,
    reviewsCount: 76,
    pricePerPerson: 350,
    operatingHours: "6:00 AM - 4:00 PM",
    amenities: ["Indigenous Guides", "Cultural Center", "Organic Mountain Cafe", "Walking Sticks"],
    activities: ["Terrace Wall Trekking", "Heirloom Rice Planting", "Weaving Demo", "Native Hut Visit"],
    imageUrl: getHtmlImage("tour4Image", "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=80"),
    description: "A monumental cultural expedition along 2,000-year-old stone terrace walls hand-built by ancient Cordillera tribes. Guided by native elder farmers, trekkers step along cascading water canals, learn the sacred cultivation rituals of heirloom Tinawon red rice, and witness traditional back-strap loom weaving.",
    highlightTag: "UNESCO Heritage",
    farmerName: "Lakay Dumangeng",
    thumbnails: [
      getHtmlImage("tour4Thumb1", "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour4Thumb2", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour4Thumb3", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour4Thumb4", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 5,
    name: "Riverside Bamboo Agritrail & Waterway Haven",
    location: "Calauan, Laguna",
    rating: 4.7,
    reviewsCount: 87,
    pricePerPerson: 220,
    operatingHours: "6:00 AM - 5:30 PM",
    amenities: ["Bamboo Rafts", "Campsite", "Restroom", "Riverside Kiosks", "Guides"],
    activities: ["Bamboo Rafting", "River Water Trek", "Freshwater Fish Feeding", "Citrus Gathering"],
    imageUrl: getHtmlImage("tour5Image", "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1000&q=80"),
    description: "Nestled along natural freshwater springs, this tranquil agro-park features floating bamboo bridges, lush riverbanks, and fragrant citrus canopies. Hop aboard bamboo balsa rafts, hand-feed native river carps, harvest fragrant Calamansi and Dalandan, and relax under giant bamboo clusters.",
    highlightTag: "River & Waters",
    farmerName: "Mang Nestor Ramos",
    thumbnails: [
      getHtmlImage("tour5Thumb1", "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour5Thumb2", "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour5Thumb3", "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour5Thumb4", "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 6,
    name: "Green Valley Herbal Sanctuary & Organic Farm",
    location: "Pampanga, Central Luzon",
    rating: 4.8,
    reviewsCount: 110,
    pricePerPerson: 240,
    operatingHours: "7:00 AM - 5:00 PM",
    amenities: ["Herbal Tea Lounge", "Restroom", "Herb Drying Hut", "Fast Wi-Fi", "Parking"],
    activities: ["Herbal Tea Blending", "Organic Compost Workshop", "Medicinal Herb Trail", "Farm-to-Bowl Salad Making"],
    imageUrl: getHtmlImage("tour6Image", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80"),
    description: "An oasis of wellness and agro-ecology at the foot of Mount Arayat. Explore certified organic plots cultivating lemongrass, blue ternatea, gotu kola, and stevia. Hand-pick fresh herbs to blend your own artisan wellness tisanes and enjoy freshly harvested farm salads.",
    highlightTag: "Herbal & Wellness",
    farmerName: "Nanay Corazon Cruz",
    thumbnails: [
      getHtmlImage("tour6Thumb1", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour6Thumb2", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour6Thumb3", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("tour6Thumb4", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80")
    ]
  }
];

const FRUIT_PICKING_DATA: FruitPickingItem[] = [
  {
    id: 1,
    title: "Sweet Dalanghita & Valencia Orange Orchard Harvest",
    farmName: "Sunnyvale Farm",
    location: "Bauan, Batangas",
    fruitName: "Valencia & Dalanghita Oranges",
    pricePerPerson: 200,
    rating: 4.9,
    reviewsCount: 132,
    duration: "1 hour, 30 mins",
    seasonalFruits: "Oranges, Dalanghita, Calamansi",
    imageUrl: getHtmlImage("fruit1Image", "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1000&q=80"),
    description: "Wander through sun-drenched Batangas citrus groves where low-hanging branches are heavy with sweet Valencia oranges and native green Dalanghita. Receive wooden harvest shears and a woven basket to pick the juiciest fruits directly off the tree with guidance from our veteran orchardists.",
    seasonAvailability: "Peak Season: October - May",
    thumbnails: [
      getHtmlImage("fruit1Thumb1", "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit1Thumb2", "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit1Thumb3", "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit1Thumb4", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 2,
    title: "Highland Sweet Strawberry Harvest Festival",
    farmName: "Benguet Berry Haven",
    location: "La Trinidad, Benguet",
    fruitName: "Benguet Sweet Red Strawberries",
    pricePerPerson: 220,
    rating: 4.9,
    reviewsCount: 160,
    duration: "1 hour, 45 mins",
    seasonalFruits: "Strawberries, Highland Blueberries",
    imageUrl: getHtmlImage("fruit2Image", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1000&q=80"),
    description: "Experience the iconic highland morning harvest in the crisp, fog-kissed mountain air of La Trinidad. Handpick bright crimson, perfectly ripe strawberries straight from organic straw-mulched garden beds. Includes a woven keepsake basket and sample tasting of freshly stirred strawberry jam.",
    seasonAvailability: "Peak Season: November - April",
    thumbnails: [
      getHtmlImage("fruit2Thumb1", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit2Thumb2", "https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit2Thumb3", "https://images.unsplash.com/photo-1543158266-0066955047b1?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit2Thumb4", "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 3,
    title: "Golden Carabao Mango Tree-to-Basket Harvest",
    farmName: "Guimaras & Batangas Orchards",
    location: "Guimaras, Western Visayas",
    fruitName: "Carabao Mangoes (Sweet Grade A)",
    pricePerPerson: 250,
    rating: 4.8,
    reviewsCount: 115,
    duration: "1 hour, 30 mins",
    seasonalFruits: "Golden Carabao Mangoes, Pico",
    imageUrl: getHtmlImage("fruit3Image", "https://images.unsplash.com/photo-1553279768-4653b0999a88?auto=format&fit=crop&w=1000&q=80"),
    description: "Harvest the world's sweetest mangoes! Learn traditional bamboo pole harvesting (panungkit with woven cloth pouches) alongside multi-generation mango growers. Pick sun-ripened golden Carabao mangoes directly from 50-year-old heritage canopies with zero chemical carbide treatment.",
    seasonAvailability: "Peak Season: March - July",
    thumbnails: [
      getHtmlImage("fruit3Thumb1", "https://images.unsplash.com/photo-1553279768-4653b0999a88?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit3Thumb2", "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit3Thumb3", "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit3Thumb4", "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 4,
    title: "Radiant Magenta Dragon Fruit & Passionfruit Trellis",
    farmName: "Laurel Ridge Farm",
    location: "Laurel, Batangas",
    fruitName: "Red & White Dragonfruit",
    pricePerPerson: 220,
    rating: 4.7,
    reviewsCount: 95,
    duration: "1 hour, 15 mins",
    seasonalFruits: "Dragon Fruit, Passion Fruit",
    imageUrl: getHtmlImage("fruit4Image", "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&w=1000&q=80"),
    description: "Stroll along towering concrete trellis rows laden with radiant magenta and snowy-white dragonfruits. Clip the ripe, spiny fruit directly from cactus pads with our protective gloves and shears, followed by a chilled glass of fresh dragonfruit-lime juice at the ridge overlook deck.",
    seasonAvailability: "Peak Season: June - November",
    thumbnails: [
      getHtmlImage("fruit4Thumb1", "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit4Thumb2", "https://images.unsplash.com/photo-1588615419957-66a9d72491a6?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit4Thumb3", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit4Thumb4", "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 5,
    title: "Sweet Rambutan & Lanzones Cluster Harvest",
    farmName: "Riverside Haven Farm",
    location: "Calauan, Laguna",
    fruitName: "Maharlika Rambutan & Paete Lanzones",
    pricePerPerson: 200,
    rating: 4.8,
    reviewsCount: 88,
    duration: "1 hour, 30 mins",
    seasonalFruits: "Rambutan, Lanzones, Santol",
    imageUrl: getHtmlImage("fruit5Image", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=1000&q=80"),
    description: "Step into shaded canopy groves where trees are bursting with bright red, hairy sweet Rambutan and translucent sweet Paete Lanzones clusters. Use wooden orchard steps to gently clip thick clusters right into your woven basket while sampling sweet, juicy pulp on the spot.",
    seasonAvailability: "Peak Season: August - November",
    thumbnails: [
      getHtmlImage("fruit5Thumb1", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit5Thumb2", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit5Thumb3", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit5Thumb4", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80")
    ]
  },
  {
    id: 6,
    title: "Bountiful Golden Papaya & Guava Grove Harvest",
    farmName: "Silang Orchard Haven",
    location: "Silang, Cavite",
    fruitName: "Red Lady Papaya & Native Guava",
    pricePerPerson: 190,
    rating: 4.8,
    reviewsCount: 74,
    duration: "1 hour, 20 mins",
    seasonalFruits: "Papaya, Guava, Chico",
    imageUrl: getHtmlImage("fruit6Image", "https://images.unsplash.com/photo-1517424424660-fef77b78ca90?auto=format&fit=crop&w=1000&q=80"),
    description: "Experience the lush upland groves of Silang, Cavite. Pluck fragrant ripe Red Lady papayas and sweet pink guavas directly from gently sloping garden rows, accompanied by fresh fruit slices served with native chili-salt seasoning.",
    seasonAvailability: "Peak Season: Year-Round",
    thumbnails: [
      getHtmlImage("fruit6Thumb1", "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit6Thumb2", "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit6Thumb3", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80"),
      getHtmlImage("fruit6Thumb4", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80")
    ]
  }
];

const INITIAL_PRODUCTS: Product[] = [
  // VEGETABLES
  {
    id: 101,
    name: "Organic Ampalaya (Bitter Gourd)",
    category: "Vegetables",
    price: 90,
    unit: "/kg",
    discountPercent: 10,
    stock: 35,
    rating: 4.8,
    reviewsCount: 22,
    imageUrl: getHtmlImage("product101Image", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"),
    description: "Freshly harvested organic bitter gourd rich in natural charantin and iron. Crisp, firm, and pesticide-free from sunny Batangas fields.",
    farmOrigin: "Sunnyvale Farm (Batangas)"
  },
  {
    id: 102,
    name: "Crisp Baguio Lettuce & Romaine",
    category: "Vegetables",
    price: 110,
    unit: "/kg",
    discountPercent: 10,
    stock: 50,
    rating: 5.0,
    reviewsCount: 45,
    imageUrl: getHtmlImage("product102Image", "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80"),
    description: "High-altitude crisp green lettuce cultivated in Benguet's cool mountain mist. Cleanly washed in mountain spring water.",
    farmOrigin: "Benguet Berry Haven (Benguet)"
  },
  {
    id: 103,
    name: "Plump Native Kamatis (Tomatoes)",
    category: "Vegetables",
    price: 70,
    unit: "/kg",
    discountPercent: 10,
    stock: 60,
    rating: 4.7,
    reviewsCount: 31,
    imageUrl: getHtmlImage("product103Image", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"),
    description: "Sun-ripened vine tomatoes with rich savory acidity. Perfect for Sinigang broths, Ensaladang Talong, and fresh dips.",
    farmOrigin: "Sunnyvale Farm (Batangas)"
  },
  {
    id: 104,
    name: "Fresh Sitaw & Organic Kalabasa Bundle",
    category: "Vegetables",
    price: 95,
    unit: "/bundle",
    discountPercent: 10,
    stock: 40,
    rating: 4.9,
    reviewsCount: 19,
    imageUrl: getHtmlImage("product104Image", "https://images.unsplash.com/photo-1506807803488-8eafc15316c6?auto=format&fit=crop&w=600&q=80"),
    description: "Tender string beans (sitaw) paired with sweet golden squash (kalabasa). Ideal for authentic Ginisang Kalabasa at Sitaw.",
    farmOrigin: "Riverside Farm (Laguna)"
  },
  {
    id: 105,
    name: "Highland Sweet Carrots & Broccoli",
    category: "Vegetables",
    price: 130,
    unit: "/kg",
    discountPercent: 10,
    stock: 28,
    rating: 5.0,
    reviewsCount: 38,
    imageUrl: getHtmlImage("product105Image", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"),
    description: "Sweet, crunchy highland orange carrots and compact dark-green broccoli florets picked fresh at dawn in Benguet.",
    farmOrigin: "Benguet Berry Haven (Benguet)"
  },
  {
    id: 106,
    name: "Purple Eggplant (Talong Tagalog)",
    category: "Vegetables",
    price: 65,
    unit: "/kg",
    discountPercent: 10,
    stock: 55,
    rating: 4.8,
    reviewsCount: 27,
    imageUrl: getHtmlImage("product106Image", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"),
    description: "Glossy purple native eggplants with tender skin and sweet flesh. Charcoal-grill ready for Tortang Talong.",
    farmOrigin: "Sunnyvale Farm (Batangas)"
  },
  // FRUITS
  {
    id: 107,
    name: "Sweet Carabao Mangoes (Grade A)",
    category: "Fruits",
    price: 120,
    unit: "/kg",
    discountPercent: 10,
    stock: 80,
    rating: 5.0,
    reviewsCount: 88,
    imageUrl: getHtmlImage("product107Image", "https://images.unsplash.com/photo-1553279768-4653b0999a88?auto=format&fit=crop&w=600&q=80"),
    description: "Certified Grade A golden Carabao mangoes from Batangas orchards. Silky smooth, naturally tree-ripened, intensely sweet.",
    farmOrigin: "Sunnyvale Farm (Batangas)"
  },
  {
    id: 108,
    name: "Fresh Highland Strawberries",
    category: "Fruits",
    price: 220,
    unit: "/kg",
    discountPercent: 10,
    stock: 40,
    rating: 4.9,
    reviewsCount: 64,
    imageUrl: getHtmlImage("product108Image", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80"),
    description: "Handpicked sweet red mountain strawberries from La Trinidad. Packed with natural vitamin C and intoxicating floral aroma.",
    farmOrigin: "Benguet Berry Haven (Benguet)"
  },
  // OTHERS
  {
    id: 109,
    name: "Pure Wild Forest Honey",
    category: "Others",
    price: 250,
    unit: "/bottle",
    discountPercent: 10,
    stock: 30,
    rating: 5.0,
    reviewsCount: 52,
    imageUrl: getHtmlImage("product109Image", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80"),
    description: "100% pure raw honeycomb nectar harvested by indigenous gatherers from flowering forest canopies.",
    farmOrigin: "Golden Sunflower Sanctuary (San Jose)"
  },
  {
    id: 110,
    name: "Crispy Saba Banana Chips",
    category: "Others",
    price: 60,
    unit: "/pack",
    discountPercent: 10,
    stock: 90,
    rating: 4.8,
    reviewsCount: 34,
    imageUrl: getHtmlImage("product110Image", "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80"),
    description: "Thinly sliced Saba bananas lightly crisped in virgin coconut oil with natural raw cane sugar glaze.",
    farmOrigin: "Sunnyvale Farm (Batangas)"
  },
  {
    id: 111,
    name: "Benguet Mountain Arabica Beans",
    category: "Others",
    price: 280,
    unit: "/pack (250g)",
    discountPercent: 10,
    stock: 45,
    rating: 5.0,
    reviewsCount: 68,
    imageUrl: getHtmlImage("product111Image", "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"),
    description: "Single-origin high-altitude Arabica coffee handpicked in Tublay, Benguet. Chocolatey notes with a clean caramel finish.",
    farmOrigin: "Benguet Berry Haven (Benguet)"
  },
  {
    id: 112,
    name: "Bukidnon Sweet Golden Queen Pineapple",
    category: "Fruits",
    price: 95,
    unit: "/piece",
    discountPercent: 10,
    stock: 70,
    rating: 4.9,
    reviewsCount: 54,
    imageUrl: getHtmlImage("product112Image", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80"),
    description: "Sweet, low-acid Golden Queen pineapple grown on the volcanic slopes of Malaybalay, Bukidnon.",
    farmOrigin: "Bukidnon Highlands Eco-Orchard (Bukidnon)"
  },
  {
    id: 113,
    name: "Davao Single-Origin Artisan Tablea",
    category: "Others",
    price: 180,
    unit: "/roll (10 discs)",
    discountPercent: 10,
    stock: 50,
    rating: 5.0,
    reviewsCount: 92,
    imageUrl: getHtmlImage("product113Image", "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80"),
    description: "100% pure fermented Criollo cacao nibs ground into traditional Filipino tablea for authentic rich hot tsokolate.",
    farmOrigin: "Davao Single-Origin Cacao (Davao)"
  },
  {
    id: 114,
    name: "Fresh Valencia Sweet Oranges",
    category: "Fruits",
    price: 130,
    unit: "/kg",
    discountPercent: 10,
    stock: 65,
    rating: 4.8,
    reviewsCount: 42,
    imageUrl: getHtmlImage("product114Image", "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80"),
    description: "Juicy, thin-skinned Valencia citrus harvested from sunny orchard slopes. Bursting with vitamin C and natural sweetness.",
    farmOrigin: "Sunnyvale Farm (Batangas)"
  },
  {
    id: 115,
    name: "Organic Red Dragonfruit (Pitaya)",
    category: "Fruits",
    price: 160,
    unit: "/kg",
    discountPercent: 10,
    stock: 35,
    rating: 4.9,
    reviewsCount: 39,
    imageUrl: getHtmlImage("product115Image", "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&w=600&q=80"),
    description: "Vibrant magenta-fleshed dragonfruit packed with antioxidants, fiber, and crisp refreshing sweetness.",
    farmOrigin: "Bukidnon Highlands Eco-Orchard (Bukidnon)"
  },
  {
    id: 116,
    name: "Fresh Purple Mangosteen",
    category: "Fruits",
    price: 190,
    unit: "/kg",
    discountPercent: 10,
    stock: 25,
    rating: 5.0,
    reviewsCount: 61,
    imageUrl: getHtmlImage("product116Image", "https://images.unsplash.com/photo-1517424424660-fef77b78ca90?auto=format&fit=crop&w=600&q=80"),
    description: "The queen of Philippine fruits. Thick purple rind shielding snow-white, floral sweet-tart citrusy segments.",
    farmOrigin: "Davao Single-Origin Cacao (Davao)"
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 101,
    bookingCode: "BK-2026-881",
    farmId: 2,
    farmName: "Golden Sunflower & Honeycomb Sanctuary",
    customerName: "Maria Santos",
    customerPhone: "+63 917 555 0192",
    customerEmail: "maria.santos@gmail.com",
    activity: "Sunflower Field & Bee Haven Tour",
    tourDate: "Nov 20, 2026",
    tourTime: "08:30 AM - Morning Agro-Walk",
    participants: 2,
    totalAmount: 500,
    paymentMethod: "GCash",
    status: "Confirmed",
    attendanceStatus: "Pending Confirmation",
    assignedGuide: "Ate Rosa (Master Beekeeper)",
    specialRequests: "Vegetarian harvest snacks requested. 1 senior citizen in group; needs golf cart trail assist.",
    uploadedIdDoc: "Philippine National ID · Verified Eco-Tourist",
    uploadedReceiptDoc: "GCash Ref #9821-441-0023 · ₱500.00 Paid"
  },
  {
    id: 102,
    bookingCode: "BK-2026-882",
    farmId: 1,
    farmName: "Sunnyvale Farm",
    customerName: "James Smith",
    customerPhone: "+63 920 111 2233",
    customerEmail: "james.smith@outlook.com",
    activity: "Valencia Orange Fruit Picking",
    tourDate: "Nov 21, 2026",
    tourTime: "10:30 AM - Canopy Orchard Harvest",
    participants: 2,
    totalAmount: 400,
    paymentMethod: "GCash",
    status: "Pending",
    attendanceStatus: "Pending Confirmation",
    assignedGuide: "Kuya Dennis (Senior Pomologist)",
    specialRequests: "First-time visitor. Needs 2 harvesting baskets and tree clippers.",
    uploadedIdDoc: "Passport / Tourist Visa Verified",
    uploadedReceiptDoc: "GCash Ref #9821-441-0089 · ₱400.00 Paid"
  },
  {
    id: 103,
    bookingCode: "BK-2026-883",
    farmId: 3,
    farmName: "Laurel Ridge Taal Overlook",
    customerName: "Sofia Tan",
    customerPhone: "+63 918 444 8899",
    customerEmail: "sofia.tan@gmail.com",
    activity: "Taal Ridge Cacao & Tablea Class",
    tourDate: "Nov 22, 2026",
    tourTime: "02:00 PM - Afternoon Farm Experience",
    participants: 2,
    totalAmount: 560,
    paymentMethod: "Bank Transfer",
    status: "Confirmed",
    attendanceStatus: "Confirmed Attending",
    assignedGuide: "Mang Rigor (Heritage Agro Guide)",
    specialRequests: "Interested in purchasing 5 blocks of artisanal tablea after the workshop.",
    uploadedIdDoc: "Driver's License (Verified)",
    uploadedReceiptDoc: "BPI Online Ref #BPI-889102 · ₱560.00 Paid"
  },
  {
    id: 104,
    bookingCode: "BK-2026-884",
    farmId: 1,
    farmName: "Sunnyvale Farm",
    customerName: "Anna Addyson",
    customerPhone: "+63 917 999 0011",
    customerEmail: "anna.addyson@yahoo.com",
    activity: "Heritage Farm Agro-Trail Walk",
    tourDate: "Nov 25, 2026",
    tourTime: "09:00 AM - Morning Agro-Walk",
    participants: 4,
    totalAmount: 800,
    paymentMethod: "Pay at Farm",
    status: "Pending",
    attendanceStatus: "Pending Confirmation",
    assignedGuide: "Kuya Elmer (Trail Captain)",
    specialRequests: "Family group with 2 kids; requests animal feeding basket.",
    uploadedIdDoc: "Company ID Verified",
    uploadedReceiptDoc: "On-site Cash Check-in Arranged"
  }
];

const INITIAL_FARMER_ORDERS: FarmerOrder[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2026-441",
    customerName: "Maria Santos",
    customerPhone: "+63 917 555 0192",
    customerAddress: "Unit 12B Green Residences, Taft Ave, Malate, Manila",
    items: [
      { productName: "Carabao Mangoes", qty: 2, unitPrice: 120 },
      { productName: "Pure Wild Honey", qty: 1, unitPrice: 250 }
    ],
    totalAmount: 490,
    paymentMethod: "GCash",
    paymentStatus: "Paid via GCash",
    fulfillmentStatus: "Dispatched",
    orderDate: "Nov 19, 2026 · 10:15 AM",
    uploadedReceiptUrl: getHtmlImage("receiptSamplePhoto", "https://images.unsplash.com/photo-1554415707-9e4966668834?auto=format&fit=crop&w=600&q=80"),
    specialDeliveryNotes: "Please deliver fresh ripe mangoes with bubble padding.",
    courierName: "AgriExpress Direct Logistics",
    riderName: "Kuya Jun-Jun Ramos",
    riderPhone: "+63 920 112 3456",
    riderVehicle: "Yamaha NMAX (Insulated Box) · Plate DA 7192",
    currentLocation: "Taft Ave / Malate Corridor, Manila · 1.2 km away from destination",
    estimatedArrival: "Today, ~11:30 AM (15 mins away)",
    trackingNumber: "AGX-2026-88194",
    isReceivedByUser: false,
    deliverySteps: [
      { title: "Order Placed & Payment Verified", location: "AgriTourism Gateway", timestamp: "Nov 19 · 10:15 AM", completed: true },
      { title: "Fresh Farm Harvest & Packed", location: "Sunnyvale Farm, Lipa City", timestamp: "Nov 19 · 10:35 AM", completed: true },
      { title: "Picked Up by Courier Rider", location: "Lipa Logistics Dispatch Center", timestamp: "Nov 19 · 10:55 AM", completed: true },
      { title: "Out for Delivery (On Route)", location: "Taft Ave / Malate Corridor", timestamp: "Nov 19 · 11:15 AM", completed: true, notes: "Rider approaching recipient building" },
      { title: "Delivered & Confirmed by Tourist", location: "Customer Delivery Address", timestamp: "Estimated 11:30 AM", completed: false }
    ]
  },
  {
    id: "ord-2",
    orderNumber: "ORD-2026-442",
    customerName: "Carlos Mendoza",
    customerPhone: "+63 918 333 7744",
    customerAddress: "Blk 4 Lot 15 Tierra Verde Subd, Lipa City, Batangas",
    items: [
      { productName: "Organic Bitter Gourd (Ampalaya)", qty: 3, unitPrice: 65 },
      { productName: "Farm Fresh Free-Range Eggs", qty: 2, unitPrice: 150 }
    ],
    totalAmount: 495,
    paymentMethod: "GCash",
    paymentStatus: "Paid via GCash",
    fulfillmentStatus: "Dispatched",
    orderDate: "Nov 19, 2026 · 08:30 AM",
    uploadedReceiptUrl: getHtmlImage("receiptSamplePhoto", "https://images.unsplash.com/photo-1554415707-9e4966668834?auto=format&fit=crop&w=600&q=80"),
    specialDeliveryNotes: "Call upon arrival at subdivision security guard house.",
    courierName: "Batangas Green Courier",
    riderName: "Kuya Arnel Gutierrez",
    riderPhone: "+63 918 444 8899",
    riderVehicle: "Honda Click 150i · Plate BA 5521",
    currentLocation: "Lipa City Highway near Tierra Verde Subd gate",
    estimatedArrival: "Today, ~11:00 AM (5 mins away)",
    trackingNumber: "AGX-2026-33918",
    isReceivedByUser: false,
    deliverySteps: [
      { title: "Order Placed & Payment Verified", location: "AgriTourism Gateway", timestamp: "Nov 19 · 08:30 AM", completed: true },
      { title: "Packed & Sealed by Farm Staff", location: "Sunnyvale Farm, Lipa City", timestamp: "Nov 19 · 09:00 AM", completed: true },
      { title: "Dispatched with Local Rider", location: "Lipa Express Hub", timestamp: "Nov 19 · 09:30 AM", completed: true },
      { title: "Out for Delivery", location: "Tierra Verde Gate 2", timestamp: "Nov 19 · 10:45 AM", completed: true },
      { title: "Delivered & Confirmed by Tourist", location: "Blk 4 Lot 15 Tierra Verde", timestamp: "Pending arrival", completed: false }
    ]
  },
  {
    id: "ord-3",
    orderNumber: "ORD-2026-443",
    customerName: "Anna Addyson",
    customerPhone: "+63 917 999 0011",
    customerAddress: "24 Acacia St, Ayala Alabang Village, Muntinlupa",
    items: [
      { productName: "Pure Wild Honey", qty: 2, unitPrice: 250 },
      { productName: "Crisp Benguet Highland Lettuce", qty: 2, unitPrice: 85 }
    ],
    totalAmount: 670,
    paymentMethod: "GCash",
    paymentStatus: "Paid via GCash",
    fulfillmentStatus: "Delivered",
    orderDate: "Nov 18, 2026 · 02:40 PM",
    uploadedReceiptUrl: getHtmlImage("receiptSamplePhoto", "https://images.unsplash.com/photo-1554415707-9e4966668834?auto=format&fit=crop&w=600&q=80"),
    specialDeliveryNotes: "Leave with security reception if recipient is not available.",
    courierName: "AgriExpress Direct Logistics",
    riderName: "Kuya Joel Bautista",
    riderPhone: "+63 917 222 3344",
    riderVehicle: "L300 Insulated Van · Plate NAK 4091",
    currentLocation: "Delivered at 24 Acacia St, Ayala Alabang Village, Muntinlupa",
    estimatedArrival: "Delivered & Confirmed",
    trackingNumber: "AGX-2026-11938",
    isReceivedByUser: true,
    receivedAt: "Nov 18, 2026 · 03:15 PM",
    receivedByRecipient: "Anna Addyson (Signed in good condition)",
    deliverySteps: [
      { title: "Order Placed & Payment Verified", location: "AgriTourism Gateway", timestamp: "Nov 18 · 02:40 PM", completed: true },
      { title: "Harvested & Packed by Farmer", location: "Sunnyvale Farm, Lipa City", timestamp: "Nov 18 · 02:45 PM", completed: true },
      { title: "In Transit via SLEX", location: "South Luzon Expressway Alabang Exit", timestamp: "Nov 18 · 03:00 PM", completed: true },
      { title: "Out for Delivery", location: "Ayala Alabang Village Gate 1", timestamp: "Nov 18 · 03:10 PM", completed: true },
      { title: "Delivered & Confirmed by Tourist", location: "24 Acacia St Doorstep", timestamp: "Nov 18 · 03:15 PM", completed: true, notes: "Package received & verified by Anna Addyson" }
    ]
  }
];

const REVIEWS_DATA: CustomerReview[] = [
  {
    id: 1,
    author: "Maria Santos",
    roleTag: "Eco-Tourist from Manila",
    rating: 5,
    date: "October 2026",
    farmOrCrop: "Sunnyvale Farm Tour",
    comment: "The rambutan and mango groves are magical! Mang Juan's family welcomed us with fresh buko and hot kapeng barako. Picking sweet oranges straight from the trees was unforgettable for our kids!"
  },
  {
    id: 2,
    author: "Engr. Carlo Reyes",
    roleTag: "Weekend Explorer",
    rating: 5,
    date: "October 2026",
    farmOrCrop: "Sunflower Sanctuary & Bee Haven",
    comment: "Over 50,000 sunflowers in full bloom! The stingless bees are so gentle, and tasting fresh honey squeezed straight from the comb is an experience you won't get in the city."
  },
  {
    id: 3,
    author: "Jasmine Siddiqui",
    roleTag: "Culinary Blogger",
    rating: 5,
    date: "September 2026",
    farmOrCrop: "Laurel Ridge Taal Overlook",
    comment: "The view of Taal Lake while roasting fresh cacao beans into pure Batangas tablea is pure therapeutic bliss. Highly recommended!"
  },
  {
    id: 4,
    author: "Gabriel Mendoza",
    roleTag: "Organic Produce Buyer",
    rating: 5,
    date: "October 2026",
    farmOrCrop: "Fresh Organic Vegetables",
    comment: "The organic Ampalaya and Baguio Romaine delivered straight to our doorstep in Quezon City were crisp and garden-fresh. True farm-to-table quality."
  }
];

/* ========================================================================= */
/* 5. MAIN APPLICATION COMPONENT                                             */
/* ========================================================================= */

function loadLocalState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Navigation & Role State
  const [activePage, setActivePage] = useState<string>('dashboard'); // 'dashboard', 'home', 'farm_detail', 'fruit_picking', 'market', 'my_bookings', 'cart_checkout', 'signup', 'login', 'farmer_profile'
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'farmer'>('admin'); // Default admin for initial preview
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Desktop Application Chrome & Catalog State
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<'file' | 'catalog' | 'view' | 'account' | null>(null);
  const [openingShowcaseCategory, setOpeningShowcaseCategory] = useState<'all' | 'places' | 'products' | 'orchards'>('all');
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(false);

  // Collapsible Dashboard Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState<boolean>(false);

  // Dedicated Login Form State
  const [loginEmail, setLoginEmail] = useState<string>("maria.santos@gmail.com");
  const [loginPassword, setLoginPassword] = useState<string>("••••••••");
  const [loginRoleSelect, setLoginRoleSelect] = useState<'admin' | 'user' | 'farmer'>('user');

  // Selected Entities
  const [selectedTour, setSelectedTour] = useState<FarmTour>(TOURS_DATA[0]);
  const [selectedFruitPicking, setSelectedFruitPicking] = useState<FruitPickingItem>(FRUIT_PICKING_DATA[0]);

  // Tourist Tour Booking State
  const [tourDate, setTourDate] = useState<string>("2026-11-20");
  const [tourTime, setTourTime] = useState<string>("08:00 AM - Morning Agro-Walk");
  const [tourGuests, setTourGuests] = useState<number>(2);
  const [tourPaymentMethod, setTourPaymentMethod] = useState<'GCash' | 'Maya' | 'Bank Transfer' | 'Pay at Farm'>('GCash');

  // Fruit Picking Booking State
  const [fruitDate, setFruitDate] = useState<string>("2026-11-20");
  const [fruitTime, setFruitTime] = useState<string>("08:30 AM - Fresh Morning Orchard Harvest");
  const [fruitGuests, setFruitGuests] = useState<number>(2);
  const [fruitPaymentMethod, setFruitPaymentMethod] = useState<'GCash' | 'Maya' | 'Bank Transfer' | 'Pay at Farm'>('GCash');

  // Inventory & Bookings (Offline-First Persistent State)
  const [products, setProducts] = useState<Product[]>(() => loadLocalState('agritourism_products_v1', INITIAL_PRODUCTS));
  const [bookings, setBookings] = useState<Booking[]>(() => loadLocalState('agritourism_bookings_v1', INITIAL_BOOKINGS));

  // Cart & Multi-Step Checkout State
  const [cart, setCart] = useState<CartItem[]>(() => loadLocalState('agritourism_cart_v1', [
    { product: INITIAL_PRODUCTS[6], quantity: 2 }, // Fresh mangoes ₱120 x 2
    { product: INITIAL_PRODUCTS[8], quantity: 1 }, // Local honey ₱250 x 1
    { product: INITIAL_PRODUCTS[9], quantity: 1 }  // Banana chips ₱60 x 1
  ]));
  const [checkoutStep, setCheckoutStep] = useState<number>(1); // 1: Cart, 2: Delivery, 3: Payment, 4: Confirmation
  const [deliveryInfo, setDeliveryInfo] = useState({
    recipientName: "Maria Santos",
    contactPhone: "+63 917 555 0192",
    deliveryAddress: "Unit 402 Greenbelt Residences, Legazpi St, Makati City",
    deliveryNotes: "Please leave with building reception if unavailable."
  });
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Bank Transfer' | 'Cash on Delivery'>('GCash');

  // Preserved Order Amount for Confirmation (Fixes Total Payment = 0 bug)
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(550);
  const [lastOrderReference, setLastOrderReference] = useState<string>("AGT-782491");
  const [lastOrderPaymentMethod, setLastOrderPaymentMethod] = useState<string>('GCash');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<FarmerOrder | null>(null);

  // Interactive Modals & Drawers
  const [isMockupDrawerOpen, setIsMockupDrawerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [isFruitModalOpen, setIsFruitModalOpen] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => loadLocalState('agritourism_favorites_v1', [1, 2, 3]));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Farmer New Tour Booking State (Walk-in or Phone Reservation)
  const [newBookingCustomer, setNewBookingCustomer] = useState<string>("Anna Addyson");
  const [newBookingPhone, setNewBookingPhone] = useState<string>("+63 918 333 4455");
  const [newBookingActivity, setNewBookingActivity] = useState<string>(TOURS_DATA[0].name);
  const [newBookingDate, setNewBookingDate] = useState<string>("2026-11-25");
  const [newBookingTime, setNewBookingTime] = useState<string>("09:00 AM - Morning Agro-Walk");
  const [newBookingGuests, setNewBookingGuests] = useState<number>(2);
  const [newBookingAmount, setNewBookingAmount] = useState<number>(400);
  const [newBookingPayment, setNewBookingPayment] = useState<'GCash' | 'Maya' | 'Cash on Arrival'>('Cash on Arrival');

  // Farmer: New Product Form State with Picture & Custom Stock Limit
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState<'Vegetables' | 'Fruits' | 'Others'>('Vegetables');
  const [newProductPrice, setNewProductPrice] = useState("100");
  const [newProductQty, setNewProductQty] = useState("kg");
  const [newProductStock, setNewProductStock] = useState<string>("25");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductImage, setNewProductImage] = useState<string>(getHtmlImage("product101Image", "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"));

  // Search & Filtering
  const [marketFilter, setMarketFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // My Bookings Management Modals: View Voucher, Edit, Delete
  const [selectedBookingForView, setSelectedBookingForView] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const [bookingsFilter, setBookingsFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Cancelled'>('All');

  // Farmer Produce Orders State
  const [farmerOrders, setFarmerOrders] = useState<FarmerOrder[]>(() => loadLocalState('agritourism_orders_v1', INITIAL_FARMER_ORDERS));
  const [selectedOrderForView, setSelectedOrderForView] = useState<FarmerOrder | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<FarmerOrder | null>(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>("ord-1");
  const [ordersFilter, setOrdersFilter] = useState<'All' | 'Pending Packing' | 'Dispatched' | 'Delivered'>('All');

  // Farmers Community & In-Depth Stories Page State
  const [selectedFarmerForModal, setSelectedFarmerForModal] = useState<FarmerProfileItem | null>(null);
  const [farmerStoriesFilter, setFarmerStoriesFilter] = useState<string>("All");
  const [farmerSearchQuery, setFarmerSearchQuery] = useState<string>("");

  // Slide Animation for Login & Sign-Up Farmer Stories Showcase
  const [currentFarmerStorySlide, setCurrentFarmerStorySlide] = useState<number>(0);

  // Online Digital Tour Pass & E-Ticket Modal
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<Booking | null>(null);

  // Official Printable E-Receipt Modal & Print Preview
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<{
    receiptNumber: string;
    issueDate: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    farmName: string;
    hostFarmerName: string;
    items: { name: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    authReference: string;
    type: 'produce_order' | 'tour_booking';
  } | null>(null);

  // Notifications List in English with Strict Target Role
  const [notificationsList, setNotificationsList] = useState<any[]>(() => loadLocalState('agritourism_notifications_v1', [
    {
      id: 99,
      title: "1-Day Before Tour: Will you proceed tomorrow?",
      desc: "Sunflower Field & Bee Haven Tour scheduled tomorrow at 08:30 AM! Please confirm your attendance.",
      fullDetail: "Friendly 1-Day reminder from AgriTourism Philippines: Your guided eco-tour to Golden Sunflower & Honeycomb Sanctuary is scheduled for tomorrow at 08:30 AM (2 guests). Please confirm if you will proceed so farm host Mang Juan can prepare fresh refreshments, harvested fruits, and assign your personal agro-guide.",
      time: "1 day before appointment",
      read: false,
      type: 'attendance_reminder',
      targetRole: 'tourist',
      bookingId: 101,
      attendanceStatus: 'Pending Confirmation'
    },
    {
      id: 1,
      title: "Tour Booking Confirmed",
      desc: "Your booking for Sunflower Sanctuary on Nov 20 is confirmed!",
      fullDetail: "Your reservation for 2 guests at Golden Sunflower & Honeycomb Sanctuary has been confirmed by farmer Mang Juan. Guide assigned. Reference: #BK-2026-881",
      time: "10 mins ago",
      read: false,
      type: 'booking',
      targetRole: 'tourist'
    },
    {
      id: 2,
      title: "New Harvest Deal 10% OFF",
      desc: "10% OFF on all fresh organic vegetables from Batangas orchards.",
      fullDetail: "Batangas organic farms just published a new harvest of Bitter Gourd, Plump Tomatoes, and Baguio Lettuce with automatic 10% discount applied at checkout.",
      time: "1 hour ago",
      read: false,
      type: 'market',
      targetRole: 'tourist'
    },
    {
      id: 3,
      title: "Farmer Reservation Update",
      desc: "Mang Juan accepted tour booking #BK-2026-882.",
      fullDetail: "Mang Juan Dela Cruz reviewed and approved tour booking #BK-2026-882 for Sunnyvale Farm Heritage Agro-Trail. The farm is ready to welcome your group.",
      time: "3 hours ago",
      read: true,
      type: 'booking',
      targetRole: 'tourist'
    },
    {
      id: 10,
      title: "New Tourist Tour Booking: James Smith",
      desc: "James Smith booked Valencia Orange Fruit Picking for 2 guests.",
      fullDetail: "New tourist reservation received for 2 guests on Nov 21, 2026 at 10:30 AM. Total payment: ₱400 paid via GCash. Customer contact: +63 920 111 2233. Tourist uploaded valid ID and special requests for orange crates.",
      time: "20 mins ago",
      read: false,
      type: 'farmer_booking_alert',
      targetRole: 'farmer'
    },
    {
      id: 11,
      title: "New Tourist Produce Order #ORD-2026-441",
      desc: "Maria Santos ordered 2kg Carabao Mangoes & Pure Wild Honey.",
      fullDetail: "Tourist Maria Santos placed order #ORD-2026-441: 2kg Carabao Mangoes and 1 bottle Pure Wild Honey. Delivery address: Unit 12B Green Residences, Taft Ave, Malate, Manila. Payment verified via GCash with receipt uploaded. Ready for harvest packing.",
      time: "40 mins ago",
      read: false,
      type: 'farmer_order',
      targetRole: 'farmer'
    },
    {
      id: 12,
      title: "Visitor Attendance Alert: Sofia Tan",
      desc: "Sofia Tan confirmed attendance for Cacao Forest Experience.",
      fullDetail: "Tourist Sofia Tan responded YES to the 1-day confirmation check. Reference #BK-2026-883. Group size: 2 guests. Arrival scheduled on Nov 22 at 02:00 PM.",
      time: "2 hours ago",
      read: true,
      type: 'farmer_attendance_alert',
      targetRole: 'farmer'
    }
  ]));

  // Strict Role-Based Notification Filtering: Hidden when logged out; Farmers only see farm alerts; Tourists only see tourist alerts
  const roleFilteredNotifications = useMemo(() => {
    if (!isLoggedIn) return [];
    if (userRole === 'farmer') {
      return notificationsList.filter(n => n.targetRole === 'farmer' || n.type === 'farmer_attendance_alert' || n.type === 'farmer_order' || n.type === 'farmer_booking_alert');
    } else if (userRole === 'user') {
      return notificationsList.filter(n => n.targetRole === 'tourist' || n.type === 'attendance_reminder' || n.type === 'booking' || n.type === 'market');
    }
    return notificationsList;
  }, [notificationsList, userRole, isLoggedIn]);

  // Automated Smooth Slide Transition for Login & Signup picture showcase
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentFarmerStorySlide(prev => (prev + 1) % FARMERS_COMMUNITY_DATA.length);
    }, 3800);
    return () => clearInterval(slideTimer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem('agritourism_products_v1', JSON.stringify(products));
      window.localStorage.setItem('agritourism_bookings_v1', JSON.stringify(bookings));
      window.localStorage.setItem('agritourism_cart_v1', JSON.stringify(cart));
      window.localStorage.setItem('agritourism_favorites_v1', JSON.stringify(favoriteIds));
      window.localStorage.setItem('agritourism_orders_v1', JSON.stringify(farmerOrders));
      window.localStorage.setItem('agritourism_notifications_v1', JSON.stringify(notificationsList));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [products, bookings, cart, favoriteIds, farmerOrders, notificationsList]);

  useEffect(() => {
    const handleReconnectSync = () => {
      void javaBackend.flushOfflineQueue().then((syncedCount) => {
        if (syncedCount > 0) {
          showToast(`Synced ${syncedCount} offline update${syncedCount > 1 ? 's' : ''} cleanly.`);
        }
      });
    };
    window.addEventListener('online', handleReconnectSync);
    return () => window.removeEventListener('online', handleReconnectSync);
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    if (window.desktopApp?.isDesktop) {
      window.desktopApp.isMaximized().then(setIsWindowMaximized).catch(() => {});
      if (window.desktopApp.onMaximizedChange) {
        unsub = window.desktopApp.onMaximizedChange(setIsWindowMaximized);
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDesktopMenu(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (unsub) unsub();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDesktopSavePdf = async () => {
    setActiveDesktopMenu(null);
    if (window.desktopApp?.saveAsPdf) {
      const res = await window.desktopApp.saveAsPdf();
      if (!res.canceled && res.filePath) {
        showToast(`Saved PDF document to: ${res.filePath}`);
      }
    } else {
      window.print();
    }
  };

  const handleDesktopPrint = async () => {
    setActiveDesktopMenu(null);
    if (window.desktopApp?.printWindow) {
      await window.desktopApp.printWindow();
    } else {
      window.print();
    }
  };

  const toggleFavorite = (id: number, name: string) => {
    setFavoriteIds(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast(`Removed "${name}" from your favorites.`);
        return prev.filter(i => i !== id);
      } else {
        showToast(`Saved "${name}" to your favorites.`);
        return [...prev, id];
      }
    });
  };

  // Sign Out Handler: Redirects to Opening Page (home) and resets drawer state
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsNotificationsOpen(false);
    setSelectedNotification(null);
    setActivePage('home');
    showToast("Signed out successfully. Welcome to AgriTourism Philippines!");
  };

  // Automatic Cart Calculations (Guaranteed Non-Zero when items exist)
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = item.product;
      if (!p) return sum;
      const price = (p.price || 0) * (1 - (p.discountPercent || 0) / 100);
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.length > 0 ? cartSubtotal + APP_CONFIG.deliveryFee : 0;
  }, [cartSubtotal, cart.length]);

  const addToCart = (product: Product) => {
    if (!isLoggedIn) {
      showToast("Log in or Sign Up is required before adding products to your cart.");
      setActivePage('login');
      return;
    }

    const maxStock = product.stock !== undefined ? product.stock : 30;
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (maxStock <= 0) {
      showToast(`Sorry, "${product.name}" is currently sold out!`);
      return;
    }

    if (currentQty >= maxStock) {
      showToast(`Cannot add more: Farmer's limit reached (${maxStock} ${product.unit || 'units'} max in stock).`);
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    const discountedUnitPrice = Math.round(product.price * (1 - (product.discountPercent || 0) / 100));
    const newTotal = cartSubtotal + discountedUnitPrice;
    showToast(`Added ${product.name} to cart! (Stock remaining: ${maxStock - (currentQty + 1)})`);
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart(prev => {
      const target = prev.find(i => i.product.id === productId);
      if (!target) return prev;

      const maxStock = target.product.stock !== undefined ? target.product.stock : 30;
      const newQty = target.quantity + delta;

      if (delta > 0 && newQty > maxStock) {
        showToast(`Cannot exceed farmer's stock limit! Only ${maxStock} ${target.product.unit || 'units'} available.`);
        return prev;
      }

      return prev.map(item => {
        if (item.product.id === productId) {
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Farmer Actions: Accept / Decline Pending Booking
  const handleBookingAction = (bookingId: number, newStatus: 'Confirmed' | 'Cancelled') => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    void javaBackend.updateBookingStatus(bookingId, newStatus);
    showToast(`Booking ${newStatus === 'Confirmed' ? 'ACCEPTED' : 'DECLINED'} successfully!`);
  };

  // Cancel Booking (Tourist or Farmer)
  const handleCancelBooking = (bookingId: number) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled', attendanceStatus: 'Cancelled by Tourist' } : b));
    showToast("Booking appointment has been CANCELLED.");
  };

  // Delete Booking (Removes completely from list)
  const handleDeleteBooking = (bookingId: number) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    setDeletingBookingId(null);
    showToast("Booking deleted from your records.");
  };

  // Update Booking (Edit date, time, guests, status)
  const handleUpdateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setBookings(prev => prev.map(b => b.id === editingBooking.id ? editingBooking : b));
    setEditingBooking(null);
    showToast(`Booking #${editingBooking.bookingCode} updated successfully!`);
  };

  // 1-Day Before Tour Confirmation (Tourist says YES or NO)
  const handleAttendanceConfirmation = (bookingId: number, willAttend: boolean) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    if (willAttend) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, attendanceStatus: 'Confirmed Attending' } : b));
      // Update tourist notification
      setNotificationsList(prev => prev.map(n => n.bookingId === bookingId ? {
        ...n,
        read: true,
        attendanceStatus: 'Confirmed Attending',
        title: "Confirmed: Tour Attendance Locked In",
        desc: `You confirmed you are proceeding tomorrow at ${targetBooking.tourTime}!`
      } : n));
      // Notify farm host
      const farmerAlert = {
        id: Date.now(),
        title: `Visitor Confirmed Arrival: ${targetBooking.customerName}`,
        desc: `${targetBooking.customerName} confirmed arrival for ${targetBooking.activity} on ${targetBooking.tourDate} (${targetBooking.tourTime})!`,
        fullDetail: `Tourist ${targetBooking.customerName} responded YES to 1-day confirmation. Booking #${targetBooking.bookingCode}. Group size: ${targetBooking.participants} guests. Contact: ${targetBooking.customerPhone || '+63 917 555 0192'}. Fresh farm refreshments and local guide are confirmed.`,
        time: "Just now",
        read: false,
        type: 'farmer_attendance_alert',
        targetRole: 'farmer'
      };
      setNotificationsList(prev => [farmerAlert, ...prev]);
      showToast(`Your attendance for ${targetBooking.farmName} tomorrow is confirmed.`);
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, attendanceStatus: 'Cancelled by Tourist', status: 'Cancelled' } : b));
      // Update tourist notification
      setNotificationsList(prev => prev.map(n => n.bookingId === bookingId ? {
        ...n,
        read: true,
        attendanceStatus: 'Cancelled by Tourist',
        title: "Tour Visit Cancelled",
        desc: `You cancelled your tour appointment for ${targetBooking.farmName}.`
      } : n));
      // Notify farm host
      const farmerAlert = {
        id: Date.now(),
        title: `Tourist Cancelled Visit: ${targetBooking.customerName}`,
        desc: `${targetBooking.customerName} responded NO for ${targetBooking.activity} on ${targetBooking.tourDate}.`,
        fullDetail: `Tourist ${targetBooking.customerName} responded NO to 1-day confirmation. Booking #${targetBooking.bookingCode} is now marked as Cancelled.`,
        time: "Just now",
        read: false,
        type: 'farmer_attendance_alert',
        targetRole: 'farmer'
      };
      setNotificationsList(prev => [farmerAlert, ...prev]);
      showToast("Tour appointment cancelled. We hope to see you next time.");
    }
  };

  // Farmer: Add Product Handler (with uploaded/selected photo)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;
    const parsedStock = parseInt(newProductStock, 10) || 20;
    const item: Product = {
      id: Date.now(),
      name: newProductName,
      category: newProductCategory,
      price: parseFloat(newProductPrice) || 80,
      unit: newProductQty.startsWith('/') ? newProductQty : `/${newProductQty || 'kg'}`,
      discountPercent: 10,
      stock: parsedStock,
      rating: 5.0,
      reviewsCount: 1,
      imageUrl: newProductImage || getHtmlImage("defaultProductFallbackImage", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"),
      description: newProductDesc || "Freshly harvested organic produce from Sunnyvale Farm.",
      farmOrigin: "Sunnyvale Farm (Batangas)"
    };
    setProducts(prev => [item, ...prev]);
    void javaBackend.createProduct({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock,
      unit: item.unit,
    });
    setIsAddProductModalOpen(false);
    setNewProductName("");
    setNewProductDesc("");
    setNewProductStock("25");
    showToast(`Successfully added "${item.name}" (Stock limit: ${parsedStock} ${item.unit}) to your catalog!`);
  };

  // Farmer: Add Tour Booking Handler
  const handleSaveFarmerBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingCustomer) return;
    const tour = TOURS_DATA.find(t => t.name === newBookingActivity) || TOURS_DATA[0];
    const total = tour.pricePerPerson * newBookingGuests;
    const newBooking: Booking = {
      id: Date.now(),
      bookingCode: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      farmId: tour.id,
      farmName: tour.name,
      customerName: newBookingCustomer,
      customerPhone: "+63 917 555 0192",
      customerEmail: "tourist@agritourism.ph",
      activity: tour.name,
      tourDate: newBookingDate,
      tourTime: newBookingTime || "09:00 AM",
      participants: newBookingGuests,
      totalAmount: total,
      paymentMethod: "GCash",
      attendanceStatus: "Pending Confirmation",
      status: "Confirmed"
    };
    setBookings(prev => [newBooking, ...prev]);
    void javaBackend.createBooking({
      id: newBooking.id,
      bookingCode: newBooking.bookingCode,
      customerName: newBooking.customerName,
      farmName: newBooking.farmName,
      activity: newBooking.activity,
      tourDate: newBooking.tourDate,
      participants: newBooking.participants,
      totalAmount: newBooking.totalAmount,
      status: newBooking.status,
    });
    setIsAddBookingModalOpen(false);
    setNewBookingCustomer("");
    showToast(`Tour booking created for ${newBookingCustomer} (₱${total})!`);
  };

  // Additional Farmer Functions: Gate Check-in, Guide Assignment & Order Management
  const handleCheckInBooking = (bookingId: number) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      attendanceStatus: 'Arrived & Checked In',
      status: 'Confirmed',
      checkedInAt: nowTime
    } : b));
    void javaBackend.updateBookingStatus(bookingId, 'Confirmed');
    showToast(`Tourist guest checked in at farm gate (${nowTime})!`);
  };

  const handleAssignGuide = (bookingId: number, guideName: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? {
      ...b,
      assignedGuide: guideName
    } : b));
    showToast(`Tour guide "${guideName}" assigned to reservation.`);
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: 'Pending Packing' | 'Dispatched' | 'Delivered') => {
    setFarmerOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillmentStatus: newStatus } : o));
    void javaBackend.updateOrderTracking(orderId, newStatus, '');
    showToast(`Order #${orderId} status updated to: ${newStatus}`);
  };

  // Tourist Delivery Receipt Confirmation
  const handleConfirmOrderReceivedByUser = (orderId: string) => {
    const timeStamp = "Nov 19, 2026 · 11:45 AM";
    setFarmerOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedSteps = (o.deliverySteps || []).map(s => {
          if (s.title.toLowerCase().includes("delivered") || s.title.toLowerCase().includes("confirmed")) {
            return { ...s, completed: true, timestamp: timeStamp, notes: `Verified & received by ${o.customerName}` };
          }
          return s;
        });
        return {
          ...o,
          fulfillmentStatus: 'Delivered',
          isReceivedByUser: true,
          receivedAt: timeStamp,
          receivedByRecipient: `${o.customerName} (Confirmed Delivery Handover)`,
          currentLocation: `Delivered at ${o.customerAddress}`,
          deliverySteps: updatedSteps
        };
      }
      return o;
    }));

    // Alert notification for farmer
    setNotificationsList(prev => [
      {
        id: Date.now(),
        title: "Order Delivered & Received by Tourist!",
        desc: `Customer confirmed receiving Order #${orderId} in good condition.`,
        fullDetail: `Eco-tourist customer confirmed receiving the delivered organic farm produce in fresh condition. Reference #${orderId}. Handover verified.`,
        time: "Just now",
        read: false,
        type: 'farmer_order',
        targetRole: 'farmer'
      },
      ...prev
    ]);

    showToast("Package marked as Received! Thank you for supporting our local farmers.");
  };

  // Handler: Save and Download Standalone Offline Ticket Pass
  const handleDownloadTicket = (b: Booking) => {
    const htmlTicket = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriTourism Pass - ${b.bookingCode}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #F4F7F4; color: #1E293B; padding: 24px; display: flex; justify-content: center; }
    .ticket-container { max-width: 650px; width: 100%; background: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #CBD5E1; }
    .header { background: #144824; color: #ffffff; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
    .badge { font-size: 11px; font-weight: 800; background: #86EFAC; color: #064E3B; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
    .content { padding: 28px; }
    .ref-tag { display: inline-block; font-family: monospace; font-size: 12px; font-weight: 900; background: #1E562F; color: #ffffff; padding: 4px 12px; border-radius: 8px; margin-bottom: 12px; }
    .farm-title { font-size: 24px; font-weight: 900; color: #144824; margin-bottom: 4px; }
    .activity-sub { font-size: 14px; font-weight: 600; color: #4B6F55; margin-bottom: 24px; }
    .grid-details { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .card { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 14px; }
    .card-label { font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
    .card-val { font-size: 13px; font-weight: 800; color: #0F172A; }
    .info-banner { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 14px; padding: 16px; margin-bottom: 24px; font-size: 12px; color: #166534; line-height: 1.5; }
    .divider { border-top: 2px dashed #CBD5E1; margin: 24px 0; position: relative; }
    .barcode-section { display: flex; justify-content: space-between; align-items: center; }
    .qr-box { width: 80px; height: 80px; background: #144824; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; text-align: center; }
    .action-bar { background: #F1F5F9; padding: 16px 28px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #E2E8F0; }
    .btn-print { background: #1E562F; color: #ffffff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .ticket-container { box-shadow: none; border: 1px solid #000000; }
      .action-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="header">
      <div>
        <div class="brand">AgriTourism Philippines</div>
        <p style="font-size: 11px; opacity: 0.85; margin-top: 2px;">Official Verified Farm E-Ticket Pass</p>
      </div>
      <span class="badge">Confirmed Entry</span>
    </div>
    <div class="content">
      <span class="ref-tag">Pass Reference: ${b.bookingCode}</span>
      <h1 class="farm-title">${b.farmName}</h1>
      <p class="activity-sub">${b.activity}</p>

      <div class="grid-details">
        <div class="card">
          <div class="card-label">Tour Date</div>
          <div class="card-val">${b.tourDate}</div>
        </div>
        <div class="card">
          <div class="card-label">Scheduled Slot</div>
          <div class="card-val">${b.tourTime}</div>
        </div>
        <div class="card">
          <div class="card-label">Lead Visitor</div>
          <div class="card-val">${b.customerName}</div>
        </div>
        <div class="card">
          <div class="card-label">Party Size</div>
          <div class="card-val">${b.participants} Guests</div>
        </div>
        <div class="card">
          <div class="card-label">Assigned Guide</div>
          <div class="card-val">${b.assignedGuide || 'Senior Agro-Guide (Batangas)'}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Admission Paid</div>
          <div class="card-val" style="color: #1E562F; font-size: 15px;">₱${b.totalAmount.toLocaleString()} (${b.paymentMethod || 'GCash'})</div>
        </div>
      </div>

      <div class="info-banner">
        <strong>Gate Turnstile Instructions:</strong><br>
        Please arrive 15 minutes before your time slot. Present this digital ticket on your phone or printed paper at the farm entrance scanner. Includes complimentary native welcome drink and farm basket.
      </div>

      <div class="divider"></div>

      <div class="barcode-section">
        <div>
          <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Turnstile Validation</div>
          <div style="font-family: monospace; font-size: 13px; font-weight: 700; color: #1E293B; margin-top: 4px;">||| |||| | ||| |||| | |||||</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">SECURE CHECK-IN #${b.id}</div>
        </div>
        <div class="qr-box">
          VALID<br>ENTRY
        </div>
      </div>
    </div>
    <div class="action-bar">
      <button class="btn-print" onclick="window.print()">Print This Ticket</button>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlTicket], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AgriTourism-Ticket-${b.bookingCode}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Ticket pass "${b.bookingCode}" downloaded successfully to your device!`);
  };

  // Handler: Print Tour Booking Official Receipt
  const handlePrintTourReceipt = (b: Booking) => {
    const unitPrice = Math.round(b.totalAmount / (b.participants || 1));
    const subtotal = b.totalAmount;
    setSelectedReceiptForPrint({
      receiptNumber: `RCP-${b.bookingCode}`,
      issueDate: `${b.tourDate} · Paid via ${b.paymentMethod || 'GCash'}`,
      customerName: b.customerName,
      customerPhone: b.customerPhone || '+63 917 555 0192',
      customerAddress: b.customerEmail || 'tourist@agritourism.ph',
      farmName: b.farmName,
      hostFarmerName: b.assignedGuide || 'Mang Juan Dela Cruz (Farm Host)',
      items: [
        {
          name: `${b.activity} (${b.tourTime})`,
          quantity: b.participants,
          unitPrice: unitPrice,
          total: subtotal
        }
      ],
      subtotal: subtotal,
      deliveryFee: 0,
      totalAmount: subtotal,
      paymentMethod: b.paymentMethod || 'GCash',
      paymentStatus: 'PAID & CONFIRMED',
      authReference: `AUTH-TK-${b.id}88`,
      type: 'tour_booking'
    });
  };

  // Handler: Print Produce Order Receipt
  const handlePrintOrderReceipt = (order: FarmerOrder) => {
    const items = order.items.map(it => ({
      name: it.productName,
      quantity: it.qty,
      unitPrice: it.unitPrice,
      total: it.qty * it.unitPrice
    }));
    const calculatedSubtotal = items.reduce((sum, it) => sum + it.total, 0);
    const deliveryFee = order.totalAmount > calculatedSubtotal ? order.totalAmount - calculatedSubtotal : (order.totalAmount > 0 ? APP_CONFIG.deliveryFee : 0);
    const calculatedTotal = calculatedSubtotal + deliveryFee;

    setSelectedReceiptForPrint({
      receiptNumber: `RCP-${order.orderNumber}`,
      issueDate: order.orderDate,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      farmName: "Sunnyvale Farm & Partner Agro-Estates",
      hostFarmerName: "Mang Juan Dela Cruz",
      items: items,
      subtotal: calculatedSubtotal,
      deliveryFee: deliveryFee,
      totalAmount: calculatedTotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || 'PAID & VERIFIED',
      authReference: `TXN-${order.orderNumber}-PH`,
      type: 'produce_order'
    });
  };

  // Farmer Delivery Location / Status Advancement
  const handleUpdateDeliveryLocation = (orderId: string, newLocation: string, newStatus?: 'Pending Packing' | 'Dispatched' | 'Delivered', isReceived?: boolean) => {
    setFarmerOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          currentLocation: newLocation,
          fulfillmentStatus: newStatus || o.fulfillmentStatus,
          isReceivedByUser: isReceived !== undefined ? isReceived : o.isReceivedByUser,
          receivedAt: isReceived ? "Nov 19, 2026 · 11:45 AM" : o.receivedAt
        };
      }
      return o;
    }));
    void javaBackend.updateOrderTracking(orderId, newStatus || '', newLocation);
    showToast(`Delivery location updated for order #${orderId}.`);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = marketFilter === "All" || p.category === marketFilter;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmOrigin.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, marketFilter, searchQuery]);

  return (
    <div className="relative w-full h-screen text-[#1D321F] flex flex-col font-sans selection:bg-[#1E562F] selection:text-white overflow-hidden">

      {/* =================================================================== */}
      {/* 1. SCENIC FARM WALLPAPER BACKGROUND (Clean, bright, NO dark green)  */}
      {/* =================================================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={APP_CONFIG.globalFarmBackground}
          alt="Philippine Scenic Farm Backdrop"
          className="w-full h-full object-cover filter brightness-[0.96] contrast-[1.02]"
        />
        {/* Luminous Soft-Cream Frosted Layer - NO dark green tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F4]/75 via-[#FFFFFF]/60 to-[#F5F2EA]/75 backdrop-blur-[8px]" />
      </div>

      {/* =================================================================== */}
      {/* 2. TOP APPLICATION MENU & SESSION BAR                               */}
      {/* =================================================================== */}
      <div className="relative w-full shrink-0 z-50 no-print select-none">
        <header className="relative w-full h-12 bg-white/95 backdrop-blur-md text-[#1E562F] px-4 sm:px-6 flex items-center justify-between text-xs border-b border-[#D5DDD6] shadow-xs">
          {/* Left: Sidebar Toggle + App Brand + Menu Strip */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-1.5 rounded-lg bg-white border border-[#D5DDD6] text-[#1E562F] hover:bg-[#E8F3EB] transition shadow-2xs cursor-pointer"
              title={isSidebarCollapsed ? "Expand Navigation Dock" : "Collapse Navigation Dock"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div
              onClick={() => setActivePage(isLoggedIn ? 'dashboard' : 'home')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition pr-2 border-r border-[#D5DDD6]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#E8F3EB] border border-[#BDE0C7] flex items-center justify-center text-[#1E562F]">
                <Leaf className="w-3.5 h-3.5 text-[#1E562F]" />
              </div>
              <span className="font-black text-xs tracking-tight text-[#144824]">AgriTourism</span>
            </div>

            <div className="relative flex items-center gap-0.5 ml-1">
              {/* FILE MENU */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDesktopMenu(prev => (prev === 'file' ? null : 'file'))}
                  className={`px-2.5 py-1 rounded-md font-semibold text-xs transition cursor-pointer ${
                    activeDesktopMenu === 'file' ? 'bg-[#1E562F] text-white' : 'text-[#1E3A24] hover:bg-[#E8F3EB]'
                  }`}
                >
                  File
                </button>
                {activeDesktopMenu === 'file' && (
                  <div className="absolute left-0 top-8 w-52 bg-white border border-[#D5DDD6] rounded-xl shadow-xl py-1.5 z-50 text-xs text-[#144824]">
                    <button
                      type="button"
                      onClick={handleDesktopPrint}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] flex items-center justify-between font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Printer className="w-3.5 h-3.5" /> Print Current View</span>
                      <span className="text-[10px] text-slate-400">Ctrl+P</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDesktopSavePdf}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] flex items-center justify-between font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Save View as PDF</span>
                      <span className="text-[10px] text-slate-400">Ctrl+S</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDesktopMenu(null);
                        if (window.desktopApp?.reload) window.desktopApp.reload();
                        else window.location.reload();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reload Desktop App
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDesktopMenu(null);
                        if (window.desktopApp?.close) window.desktopApp.close();
                        else handleSignOut();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-red-50 text-red-700 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> {window.desktopApp?.isDesktop ? 'Exit Desktop App' : 'Lock Session'}
                    </button>
                  </div>
                )}
              </div>

              {/* CATALOG MENU */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDesktopMenu(prev => (prev === 'catalog' ? null : 'catalog'))}
                  className={`px-2.5 py-1 rounded-md font-semibold text-xs transition cursor-pointer ${
                    activeDesktopMenu === 'catalog' ? 'bg-[#1E562F] text-white' : 'text-[#1E3A24] hover:bg-[#E8F3EB]'
                  }`}
                >
                  Catalog
                </button>
                {activeDesktopMenu === 'catalog' && (
                  <div className="absolute left-0 top-8 w-52 bg-white border border-[#D5DDD6] rounded-xl shadow-xl py-1.5 z-50 text-xs text-[#144824]">
                    <button
                      type="button"
                      onClick={() => { setOpeningShowcaseCategory('all'); setActivePage('home'); setActiveDesktopMenu(null); }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                    >
                      All Showcase Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOpeningShowcaseCategory('places'); setActivePage('home'); setActiveDesktopMenu(null); }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                    >
                      Farm Destinations (Places)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOpeningShowcaseCategory('products'); setActivePage('home'); setActiveDesktopMenu(null); }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                    >
                      Fresh Produce Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => { setOpeningShowcaseCategory('orchards'); setActivePage('home'); setActiveDesktopMenu(null); }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                    >
                      Fruit Orchards Catalog
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW MENU */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDesktopMenu(prev => (prev === 'view' ? null : 'view'))}
                  className={`px-2.5 py-1 rounded-md font-semibold text-xs transition cursor-pointer ${
                    activeDesktopMenu === 'view' ? 'bg-[#1E562F] text-white' : 'text-[#1E3A24] hover:bg-[#E8F3EB]'
                  }`}
                >
                  View
                </button>
                {activeDesktopMenu === 'view' && (
                  <div className="absolute left-0 top-8 w-52 bg-white border border-[#D5DDD6] rounded-xl shadow-xl py-1.5 z-50 text-xs text-[#144824]">
                    <button
                      type="button"
                      onClick={() => { setIsSidebarCollapsed(prev => !prev); setActiveDesktopMenu(null); }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                    >
                      {isSidebarCollapsed ? 'Expand Left Dock' : 'Collapse Left Dock'}
                    </button>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => { setActivePage('dashboard'); setActiveDesktopMenu(null); }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                      >
                        Go to Workspace Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setMarketFilter('All'); setActiveDesktopMenu(null); showToast('Filters cleared.'); }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                    >
                      Reset Search & Filters
                    </button>
                  </div>
                )}
              </div>

              {/* ACCOUNT MENU */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDesktopMenu(prev => (prev === 'account' ? null : 'account'))}
                  className={`px-2.5 py-1 rounded-md font-semibold text-xs transition cursor-pointer ${
                    activeDesktopMenu === 'account' ? 'bg-[#1E562F] text-white' : 'text-[#1E3A24] hover:bg-[#E8F3EB]'
                  }`}
                >
                  Account
                </button>
                {activeDesktopMenu === 'account' && (
                  <div className="absolute left-0 top-8 w-52 bg-white border border-[#D5DDD6] rounded-xl shadow-xl py-1.5 z-50 text-xs text-[#144824]">
                    {isLoggedIn ? (
                      <>
                        <button
                          type="button"
                          onClick={() => { setIsProfileModalOpen(true); setActiveDesktopMenu(null); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                        >
                          My Desktop Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveDesktopMenu(null); handleSignOut(); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-red-50 text-red-700 font-semibold cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => { setActivePage('login'); setActiveDesktopMenu(null); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-semibold cursor-pointer"
                        >
                          Log In to Account
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActivePage('signup'); setActiveDesktopMenu(null); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#E8F3EB] font-medium cursor-pointer"
                        >
                          Create New Account
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Notifications, Cart / Orders, Profile, Sign Out / Sign In */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className="relative p-1.5 rounded-lg bg-white border border-[#D5DDD6] text-[#1E562F] hover:bg-[#E8F3EB] transition shadow-2xs cursor-pointer"
                  title="Notifications (Click to view)"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {roleFilteredNotifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1E562F] text-white rounded-full text-[9px] font-black flex items-center justify-center">
                      {roleFilteredNotifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {userRole === 'farmer' ? (
                  <button
                    type="button"
                    onClick={() => setActivePage('farmer_orders')}
                    className="p-1.5 px-2.5 rounded-lg bg-white border border-[#D5DDD6] text-[#144824] hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    title="Tourist Produce Orders & Deliveries"
                  >
                    <Package className="w-3.5 h-3.5 text-[#1E562F]" />
                    <span className="font-bold text-xs">Orders ({farmerOrders.length})</span>
                    {farmerOrders.filter(o => o.fulfillmentStatus === 'Pending Packing' || o.fulfillmentStatus === 'Dispatched').length > 0 && (
                      <span className="w-4 h-4 bg-[#1E562F] text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {farmerOrders.filter(o => o.fulfillmentStatus === 'Pending Packing' || o.fulfillmentStatus === 'Dispatched').length}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep(1);
                      setActivePage('cart_checkout');
                    }}
                    className="p-1.5 px-2.5 rounded-lg bg-white border border-[#D5DDD6] text-[#144824] hover:bg-slate-50 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    title="Shopping Cart & Checkout"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#1E562F]" />
                    <span className="font-bold text-xs">₱{cartSubtotal.toLocaleString()}</span>
                    {cart.length > 0 && (
                      <span className="w-4 h-4 bg-[#1E562F] text-white rounded-full text-[9px] font-black flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </button>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-[#D5DDD6]">
                  <div
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-90"
                    title="View My Profile"
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#A6CCA9] bg-[#E8F3EB]">
                      <img
                        src={userRole === 'admin' ? APP_CONFIG.adminAvatar : userRole === 'farmer' ? APP_CONFIG.juanAvatar : APP_CONFIG.mariaAvatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="font-bold text-[11px] text-[#144824] leading-tight">
                        {userRole === 'admin' ? 'Administrator' : userRole === 'farmer' ? 'Juan Dela Cruz' : 'Maria Santos'}
                      </p>
                      <span className="text-[9px] text-[#55785C] capitalize">{userRole}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#D5DDD6] text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                    title="Sign Out of AgriTourism"
                  >
                    <LogOut className="w-3 h-3 text-slate-600" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePage('login')}
                  className="px-3 py-1 rounded-lg bg-[#1E562F] text-white hover:bg-[#144824] text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePage('signup')}
                  className="px-3 py-1 rounded-lg bg-white text-[#144824] hover:bg-[#F4F9F5] border border-[#D5DDD6] text-[11px] font-bold transition shadow-2xs cursor-pointer"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN DESKTOP WORKSPACE: ALWAYS-ON LEFT DOCK + VIEWPORT           */}
      {/* =================================================================== */}
      <div
        onClick={() => { if (activeDesktopMenu) setActiveDesktopMenu(null); }}
        className="relative z-10 w-full flex-1 flex overflow-hidden min-h-0"
      >

        {/* PERSISTENT DESKTOP APPLICATION LEFT NAVIGATION DOCK */}
        <aside
          onMouseEnter={() => {
            if (isSidebarCollapsed) setIsSidebarHovered(true);
          }}
          onMouseLeave={() => {
            if (isSidebarCollapsed) setIsSidebarHovered(false);
          }}
          className={`${!isSidebarCollapsed || isSidebarHovered ? 'w-64' : 'w-20'} h-full flex flex-col justify-between shrink-0 z-30 border-r border-[#D5DDD6] shadow-xl transition-all duration-300 ease-in-out no-print`}
          style={{
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)"
          }}
        >
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Sidebar Top: Logo & Collapse Action */}
            <div className={`p-4 border-b border-[#EAE3D8] flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'justify-between' : 'justify-center'} shrink-0`}>
              {(!isSidebarCollapsed || isSidebarHovered) ? (
                <div
                  onClick={() => setActivePage('dashboard')}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-90 overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F3EB] border border-[#BDE0C7] flex items-center justify-center text-[#1E562F] shadow-xs shrink-0">
                    <Leaf className="w-5 h-5 text-[#1E562F]" />
                  </div>
                  <div className="animate-in fade-in duration-200">
                    <h1 className="font-black text-lg tracking-tight text-[#144824] leading-none">AgriTourism</h1>
                    <p className="text-[10px] text-[#55785C] mt-0.5 tracking-wider uppercase font-semibold">Farm · Connect · Experience</p>
                  </div>
                </div>
              ) : (
                /* Collapsed Mode: AgriTourism Leaf Logo Icon is prominently visible and centered */
                <div
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="w-11 h-11 rounded-2xl bg-[#E8F3EB] border-2 border-[#BDE0C7] flex items-center justify-center text-[#1E562F] shadow-sm cursor-pointer hover:scale-110 active:scale-95 transition"
                  title="AgriTourism Philippines - Click to expand sidebar"
                >
                  <Leaf className="w-6 h-6 text-[#1E562F]" />
                </div>
              )}

              {(!isSidebarCollapsed || isSidebarHovered) && (
                <button
                  onClick={() => setIsSidebarCollapsed(prev => !prev)}
                  className="p-1.5 rounded-lg text-[#5D7762] hover:text-[#144824] hover:bg-[#EAE3D8]/50 transition"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Navigation Menu */}
            <nav className="p-3 space-y-1.5 flex-1">
              {(!isLoggedIn || activePage === 'home') ? (
                <>
                  {(!isSidebarCollapsed || isSidebarHovered) && (
                    <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-[#55785C]">
                      Catalog Browser
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => { setOpeningShowcaseCategory('all'); setActivePage('home'); }}
                    title="All Catalog Showcase"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3 px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePage === 'home' && openingShowcaseCategory === 'all' ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#284B31] hover:bg-[#E8F3EB] hover:text-[#144824]'}`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>All Showcase</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpeningShowcaseCategory('places'); setActivePage('home'); }}
                    title="Farm Destinations"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3 px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePage === 'home' && openingShowcaseCategory === 'places' ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#284B31] hover:bg-[#E8F3EB] hover:text-[#144824]'}`}
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Farm Destinations</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpeningShowcaseCategory('products'); setActivePage('home'); }}
                    title="Fresh Produce"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3 px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePage === 'home' && openingShowcaseCategory === 'products' ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#284B31] hover:bg-[#E8F3EB] hover:text-[#144824]'}`}
                  >
                    <Carrot className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Fresh Produce</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpeningShowcaseCategory('orchards'); setActivePage('home'); }}
                    title="Fruit Orchards"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3 px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePage === 'home' && openingShowcaseCategory === 'orchards' ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#284B31] hover:bg-[#E8F3EB] hover:text-[#144824]'}`}
                  >
                    <Leaf className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Fruit Orchards</span>}
                  </button>

                  {isLoggedIn && (
                    <div className="pt-2 mt-2 border-t border-[#EAE3D8]">
                      <button
                        type="button"
                        onClick={() => setActivePage('dashboard')}
                        title="Return to Workspace Dashboard"
                        className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3 px-3.5' : 'justify-center px-0'} py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-[#144824] bg-[#E8F3EB] hover:bg-[#D5EAD9]`}
                      >
                        <Monitor className="w-4 h-4 shrink-0" />
                        {(!isSidebarCollapsed || isSidebarHovered) && <span>Back to Dashboard</span>}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
              {/* Dashboard */}
              <button
                onClick={() => setActivePage('dashboard')}
                title="Dashboard"
                className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'dashboard' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                {(!isSidebarCollapsed || isSidebarHovered) && <span>Dashboard</span>}
              </button>

              {/* FARMER-ONLY NAVIGATION: Tourist Bookings, Orders, Produce, and Profile */}
              {userRole === 'farmer' && (
                <>
                  {/* Farmer: Tourist Bookings & Gate Check-In */}
                  <button
                    onClick={() => setActivePage('my_bookings')}
                    title="Tourist Bookings & Check-In"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'my_bookings' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Tourist Bookings & Check-In</span>}
                  </button>

                  {/* Farmer: Tourist Produce Orders */}
                  <button
                    onClick={() => setActivePage('farmer_orders')}
                    title="Tourist Produce Orders"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'farmer_orders' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0 text-emerald-700" />
                    {(!isSidebarCollapsed || isSidebarHovered) && (
                      <span className="flex items-center justify-between flex-1">
                        <span>Tourist Orders</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">
                          {farmerOrders.length}
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Farmer: My Produce Catalog */}
                  <button
                    onClick={() => setActivePage('farmer_products')}
                    title="My Produce Catalog"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'farmer_products' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Carrot className="w-4 h-4 shrink-0 text-orange-600" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>My Produce Catalog</span>}
                  </button>

                  {/* Farmer: Farm Profile & Host Details */}
                  <button
                    onClick={() => setActivePage('farmer_profile')}
                    title="Farmer Profile & Overall Portfolio"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'farmer_profile' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <User className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Farmer Profile & Catalog</span>}
                  </button>
                </>
              )}

              {/* TOURIST-ONLY NAVIGATION: General consumer explore interface (hidden from farmer) */}
              {userRole !== 'farmer' && (
                <>
                  {/* Farm Tours */}
                  <button
                    onClick={() => setActivePage('farm_detail')}
                    title="Explore Tours"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'farm_detail' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Explore Tours</span>}
                  </button>

                  {/* Fruit Picking */}
                  <button
                    onClick={() => setActivePage('fruit_picking')}
                    title="Fruit Picking"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'fruit_picking' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Fruit Picking</span>}
                  </button>

                  {/* Fresh Vegetables & Harvest */}
                  <button
                    onClick={() => setActivePage('market')}
                    title="Vegetables & Harvest"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'market' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Carrot className="w-4 h-4 shrink-0 text-orange-500" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>Vegetables & Harvest</span>}
                  </button>

                  {/* Farmers & Stories (Dedicated Page for Tourists) */}
                  <button
                    onClick={() => setActivePage('farmers_stories')}
                    title="Farmers & Stories"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'farmers_stories' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0 text-emerald-600" />
                    {(!isSidebarCollapsed || isSidebarHovered) && (
                      <span className="flex items-center justify-between flex-1">
                        <span>Farmers & Stories</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                          Profiles
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Bookings */}
                  <button
                    onClick={() => setActivePage('my_bookings')}
                    title="My Bookings"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'my_bookings' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isSidebarHovered) && <span>My Bookings</span>}
                  </button>

                  {/* Delivery Tracking for Tourist */}
                  <button
                    onClick={() => setActivePage('order_tracking')}
                    title="Delivery Tracking"
                    className={`w-full flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-3.5 px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition ${activePage === 'order_tracking' ? 'bg-[#1E562F] text-white shadow-md' : 'text-[#284B31] hover:bg-white hover:text-[#144824]'}`}
                  >
                    <Truck className="w-4 h-4 shrink-0 text-emerald-600" />
                    {(!isSidebarCollapsed || isSidebarHovered) && (
                      <span className="flex items-center justify-between flex-1">
                        <span>Delivery Tracking</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                          Live
                        </span>
                      </span>
                    )}
                  </button>
                </>
              )}

              {/* Farmer Action Shortcuts */}
              {userRole === 'farmer' && (!isSidebarCollapsed || isSidebarHovered) && (
                <div className="pt-2 space-y-2 border-t border-[#EAE3D8]">
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#DCFCE7] text-[#14532D] hover:bg-[#BBF7D0] transition shadow-xs border border-[#86EFAC]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Farm Product</span>
                  </button>

                  <button
                    onClick={() => setIsAddBookingModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-white text-[#144824] hover:bg-[#E8F3EB] transition shadow-xs border border-[#D5DDD6]"
                  >
                    <CalendarCheck className="w-4 h-4 text-[#1E562F]" />
                    <span>Add Walk-in Tour</span>
                  </button>
                </div>
              )}
                </>
              )}
            </nav>
          </div>

          {/* Desktop Dock Footer: Authenticated Profile Card OR Read-Only Desktop Mode Status */}
          {isLoggedIn ? (
          <div className={`p-3 border-t border-[#EAE3D8] bg-white/95 backdrop-blur-md flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'justify-between' : 'justify-center flex-col gap-2'} shrink-0 mt-auto`}>
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-2.5' : 'justify-center'} cursor-pointer hover:opacity-90 transition overflow-hidden`}
              title="Click to view full profile details"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#E8F3EB] border border-[#CBD5E1] flex items-center justify-center font-black text-xs text-[#144824] shadow-xs overflow-hidden shrink-0 hover:ring-2 hover:ring-[#1E562F] transition">
                {userRole === 'admin' ? (
                  <span className="font-bold text-[#1E562F]">A</span>
                ) : userRole === 'farmer' ? (
                  <img src={APP_CONFIG.juanAvatar} alt="Farmer Juan" className="w-full h-full object-cover" />
                ) : (
                  <img src={APP_CONFIG.mariaAvatar} alt="Maria Santos" className="w-full h-full object-cover" />
                )}
              </div>
              {(!isSidebarCollapsed || isSidebarHovered) && (
                <div className="text-xs truncate">
                  <p className="font-bold text-[#144824] truncate">
                    {userRole === 'admin' ? 'Administrator' : userRole === 'farmer' ? 'Juan Dela Cruz' : 'Maria Santos'}
                  </p>
                  <p className="text-[10px] text-[#55785C] capitalize truncate">
                    {userRole === 'admin' ? 'Platform Manager' : userRole === 'farmer' ? 'Accredited Farmer' : 'Eco Tourist'}
                  </p>
                </div>
              )}
            </div>

            {(!isSidebarCollapsed || isSidebarHovered) && (
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          ) : (
          <div className={`p-3 border-t border-[#EAE3D8] bg-[#F7F9F7] flex items-center ${!isSidebarCollapsed || isSidebarHovered ? 'gap-2.5' : 'justify-center'} shrink-0 mt-auto`}>
            <div className="w-8 h-8 rounded-lg bg-[#E8F3EB] border border-[#BDE0C7] flex items-center justify-center text-[#1E562F] shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            {(!isSidebarCollapsed || isSidebarHovered) && (
              <div className="text-[11px] truncate">
                <p className="font-bold text-[#144824] truncate">Catalog Preview</p>
                <p className="text-[10px] text-[#55785C] truncate">Pictures & Descriptions</p>
              </div>
            )}
          </div>
          )}
        </aside>

        {/* EXPANSIVE DESKTOP GLASSMORPHIC MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto flex flex-col relative transition-all">

          {/* Sticky Top Glass Header (Search, Notifications, Cart) - Only visible when logged in and not on opening page */}
          {isLoggedIn && activePage !== 'home' && (
            <div className="w-full px-8 py-3.5 glass-topbar sticky top-0 z-20 flex items-center justify-between">
              <div className="relative w-full max-w-lg">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#476C50]" />
                <input
                  type="text"
                  placeholder="Search farm tours, fruit picking, fresh vegetables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/85 border border-white/80 rounded-2xl text-xs text-[#144824] placeholder:text-[#678A6F] focus:outline-none shadow-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications Button */}
                <button
                  onClick={() => setIsNotificationsOpen(prev => !prev)}
                  className="relative p-2.5 rounded-2xl bg-white/85 border border-white/80 text-[#1E562F] hover:bg-white transition shadow-xs flex items-center gap-1.5 text-xs font-bold"
                >
                  <Bell className="w-4 h-4 text-[#1E562F]" />
                  <span className="hidden sm:inline">Alerts</span>
                  {roleFilteredNotifications.filter(n => !n.read).length > 0 && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </button>

                {/* Quick Cart Button */}
                <button
                  onClick={() => {
                    setCheckoutStep(1);
                    setActivePage('cart_checkout');
                  }}
                  className="relative p-2.5 px-3.5 rounded-2xl bg-[#1E562F] text-white hover:bg-[#144824] transition shadow-xs flex items-center gap-2 text-xs font-bold"
                >
                  <ShoppingBag className="w-4 h-4 text-[#86EFAC]" />
                  <span>Cart (₱{cartSubtotal.toLocaleString()})</span>
                  {cart.length > 0 && (
                    <span className="w-5 h-5 bg-amber-400 text-[#092211] rounded-full text-[10px] font-black flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* Profile Shortcut */}
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-9 h-9 rounded-2xl bg-white/85 border border-white/80 flex items-center justify-center text-[#1E562F] font-black text-xs shadow-xs hover:bg-white"
                >
                  {userRole === 'admin' ? 'A' : userRole === 'farmer' ? 'J' : 'M'}
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 1: ADMIN PLATFORM OVERVIEW (Exact match to Screenshot 124705) */}
          {/* =============================================================== */}
          {activePage === 'dashboard' && userRole === 'admin' && (
            <div className="p-8 md:p-10 w-full max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-[#144824] tracking-tight">Platform Overview</h2>
                  <p className="text-xs text-[#5D7762] mt-0.5 font-medium">Real-time platform metrics, booking trends, and system telemetry</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#DCFCE7] text-[#15803D] rounded-full text-xs font-bold border border-[#86EFAC]/40">
                    System Healthy · Live
                  </span>
                </div>
              </div>

              {/* 4 Stat Cards (Matching Screenshot 124705 exact colors & numbers) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-3xl p-6 bg-[#E8F1FC]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#446890]">Total Users</p>
                  <p className="text-4xl font-black text-[#15416E] mt-2">1,248</p>
                  <p className="text-[11px] text-[#446890] mt-1 font-medium">↑ +14% from last month</p>
                </div>

                <div className="rounded-3xl p-6 bg-[#EAF5ED]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#356342]">Total Farms</p>
                  <p className="text-4xl font-black text-[#124220] mt-2">86</p>
                  <p className="text-[11px] text-[#356342] mt-1 font-medium">Active accredited estates</p>
                </div>

                <div className="rounded-3xl p-6 bg-[#FEF2E4]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#8E5E2E]">Total Bookings</p>
                  <p className="text-4xl font-black text-[#854508] mt-2">342</p>
                  <p className="text-[11px] text-[#8E5E2E] mt-1 font-medium">98.4% fulfillment rate</p>
                </div>

                <div className="rounded-3xl p-6 bg-[#F1EDF8]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#624D82]">Total Products</p>
                  <p className="text-4xl font-black text-[#452D6A] mt-2">1,560</p>
                  <p className="text-[11px] text-[#624D82] mt-1 font-medium">Organic vegetables & fruits</p>
                </div>
              </div>

              {/* 2-Column Split: Bookings Overview Chart (Left) + Recent Activities (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* LEFT: Bookings Overview Card with Smooth Wave Spline Chart & Grid Net */}
                <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/80 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#144824]">Bookings Overview</h3>
                      <p className="text-xs text-[#5D7762]">Monthly reservation volume across all accredited tourist farms</p>
                    </div>
                    <button
                      onClick={() => {
                        setActivePage('my_bookings');
                        showToast("Opened Farm Bookings management!");
                      }}
                      className="text-xs font-bold text-[#1E562F] hover:underline"
                    >
                      View Reports
                    </button>
                  </div>

                  {/* Smooth Wave SVG Chart with Grid Net (Matching Screenshot 124705) */}
                  <div className="w-full h-72 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 650 250">
                      {/* Grid Net: Horizontal Lines (0, 50, 100, 150, 200, 300) */}
                      {[
                        { y: 25, label: "300" },
                        { y: 65, label: "200" },
                        { y: 105, label: "150" },
                        { y: 145, label: "100" },
                        { y: 185, label: "50" },
                        { y: 220, label: "0" }
                      ].map((item, idx) => (
                        <g key={idx}>
                          <line x1="50" y1={item.y} x2="620" y2={item.y} stroke="#D8E2DA" strokeWidth="1" />
                          <text x="18" y={item.y + 4} className="text-[11px] fill-[#718875] font-semibold">{item.label}</text>
                        </g>
                      ))}

                      {/* Grid Net: Vertical Lines for Months */}
                      {[75, 150, 225, 300, 375, 450, 525, 600].map((x, idx) => (
                        <line key={idx} x1={x} y1="25" x2={x} y2="220" stroke="#D8E2DA" strokeWidth="1" strokeDasharray="2 2" />
                      ))}

                      {/* Teal / Emerald Wave Gradient */}
                      <defs>
                        <linearGradient id="waveFillGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.45" />
                          <stop offset="60%" stopColor="#2DD4BF" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Smooth Bezier Spline Path (Matching exact flow in Screenshot 124705) */}
                      <path
                        d="M 50 190 
                           C 100 155, 120 160, 150 160
                           C 180 160, 200 145, 230 135
                           C 260 120, 280 155, 310 160
                           C 340 165, 360 145, 390 145
                           C 430 145, 470 95, 510 70
                           C 540 50, 570 90, 600 105
                           L 600 220 L 50 220 Z"
                        fill="url(#waveFillGrad)"
                      />

                      {/* Curved Stroke Line */}
                      <path
                        d="M 50 190 
                           C 100 155, 120 160, 150 160
                           C 180 160, 200 145, 230 135
                           C 260 120, 280 155, 310 160
                           C 340 165, 360 145, 390 145
                           C 430 145, 470 95, 510 70
                           C 540 50, 570 90, 600 105"
                        fill="none"
                        stroke="#0D9488"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Month Labels along bottom */}
                      {[
                        { x: 50, label: "Jan" },
                        { x: 130, label: "Feb" },
                        { x: 210, label: "Mar" },
                        { x: 290, label: "Apr" },
                        { x: 370, label: "May" },
                        { x: 450, label: "Jun" },
                        { x: 530, label: "Jul" },
                        { x: 600, label: "Aug" }
                      ].map((m, idx) => (
                        <text key={idx} x={m.x} y="240" textAnchor="middle" className="text-[11px] fill-[#5D7762] font-semibold">
                          {m.label}
                        </text>
                      ))}
                    </svg>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <span
                      onClick={() => setActivePage('my_bookings')}
                      className="text-xs font-bold text-[#1E562F] hover:underline cursor-pointer"
                    >
                      View All Bookings Table →
                    </span>
                  </div>
                </div>

                {/* RIGHT: Recent Activities Card (Matching Screenshot 124705) */}
                <div className="glass-panel rounded-3xl p-8 border border-white/80 space-y-6 shadow-lg">
                  <h3 className="text-lg font-bold text-[#144824]">Recent Activities</h3>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-[#144824] text-sm">New user registered</p>
                        <p className="text-[#556F59]">Anna Addyson - (Tourist)</p>
                        <p className="text-[11px] text-[#8A9E8E]">5 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-[#144824] text-sm">New product added</p>
                        <p className="text-[#556F59]">Exotic Mangoes (Sunnyvale Farm)</p>
                        <p className="text-[11px] text-[#8A9E8E]">55 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-[#144824] text-sm">Booking confirmed</p>
                        <p className="text-[#556F59]">Jasmine Siddiqui (Green Valley Farm)</p>
                        <p className="text-[11px] text-[#8A9E8E]">12 minutes ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-[#144824] text-sm">Report generated</p>
                        <p className="text-[#556F59]">Monthly_report (May_2026)</p>
                        <p className="text-[11px] text-[#8A9E8E]">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 1B: FARMER ROLE DASHBOARD (Juan Dela Cruz - Screenshot 836405251) */}
          {/* =============================================================== */}
          {activePage === 'dashboard' && userRole === 'farmer' && (
            <div className="p-8 md:p-10 w-full max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#144824] tracking-tight">Welcome, Juan Dela Cruz</h2>
                  <p className="text-xs text-[#5D7762] mt-0.5 font-medium">Sunnyvale Farm · Accredited AgriTourism Host (Bauan, Batangas)</p>
                </div>
                <button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-5 py-2.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 self-start"
                >
                  <Plus className="w-4 h-4 text-[#86EFAC]" />
                  <span>List New Produce</span>
                </button>
              </div>

              {/* 3 Metric Cards for Farmer (Screenshot 836405251) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl p-6 bg-[#D1EBD8]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#2A5C35]">Total Products</p>
                  <p className="text-4xl font-black text-[#144824] mt-2">12</p>
                  <p className="text-[11px] text-[#3F6E4A] mt-1">Active in marketplace</p>
                </div>

                <div className="rounded-3xl p-6 bg-[#D7E8F7]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#28537D]">New Orders</p>
                  <p className="text-4xl font-black text-[#15416E] mt-2">8</p>
                  <p className="text-[11px] text-[#3B6692] mt-1">Ready for packing & delivery</p>
                </div>

                <div className="rounded-3xl p-6 bg-[#FEE9D0]/90 backdrop-blur-md border border-white/80 shadow-md">
                  <p className="text-xs font-bold text-[#8E5E2E]">Active Bookings</p>
                  <p className="text-4xl font-black text-[#854508] mt-2">15</p>
                  <p className="text-[11px] text-[#9A6A3B] mt-1">Upcoming weekend visitors</p>
                </div>
              </div>

              {/* Farmer Sales & Monthly Volume Graph (User requested: "lagay ka din ng sa farmers na sales graph") */}
              <div className="glass-panel rounded-3xl p-8 border border-white/80 space-y-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#144824]">Farm Sales & Revenue Graph</h3>
                    <p className="text-xs text-[#5D7762]">Monthly harvest sales and visitor tour revenues (PHP)</p>
                  </div>
                  <span className="text-xs font-bold text-[#1E562F] bg-white/70 px-3 py-1 rounded-full border border-white">
                    Year 2026: ₱148,500 Total
                  </span>
                </div>

                {/* Farmer Spline Chart */}
                <div className="w-full h-56 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 650 200">
                    {[
                      { y: 20, label: "₱40k" },
                      { y: 60, label: "₱30k" },
                      { y: 100, label: "₱20k" },
                      { y: 140, label: "₱10k" },
                      { y: 175, label: "₱0" }
                    ].map((item, idx) => (
                      <g key={idx}>
                        <line x1="50" y1={item.y} x2="620" y2={item.y} stroke="#D8E2DA" strokeWidth="1" />
                        <text x="10" y={item.y + 4} className="text-[11px] fill-[#718875] font-semibold">{item.label}</text>
                      </g>
                    ))}

                    <defs>
                      <linearGradient id="farmerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16A34A" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 50 150 C 120 130, 180 140, 230 110 C 290 80, 360 120, 420 70 C 490 30, 550 65, 600 50 L 600 175 L 50 175 Z"
                      fill="url(#farmerGrad)"
                    />
                    <path
                      d="M 50 150 C 120 130, 180 140, 230 110 C 290 80, 360 120, 420 70 C 490 30, 550 65, 600 50"
                      fill="none"
                      stroke="#15803D"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {[
                      { x: 50, label: "Jan" },
                      { x: 140, label: "Feb" },
                      { x: 230, label: "Mar" },
                      { x: 320, label: "Apr" },
                      { x: 410, label: "May" },
                      { x: 500, label: "Jun" },
                      { x: 600, label: "Jul" }
                    ].map((m, idx) => (
                      <text key={idx} x={m.x} y="195" textAnchor="middle" className="text-[11px] fill-[#5D7762] font-semibold">
                        {m.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Farmer Pending Bookings with Accept / Decline Buttons (Screenshot 836405251) */}
              <div className="glass-panel rounded-3xl p-8 border border-white/80 space-y-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#144824]">Recent Tour Bookings</h3>
                    <p className="text-xs text-[#5D7762]">Accept or manage visitor requests for Sunnyvale Farm</p>
                  </div>
                  <span className="text-xs font-bold text-[#1E562F]">
                    {bookings.filter(b => b.status === 'Pending').length} Pending Requests
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#D8E2DA] text-[#476C50] font-bold">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Time</th>
                        <th className="py-3 px-2">Tourist Guest</th>
                        <th className="py-3 px-2">Activity</th>
                        <th className="py-3 px-2">Guests</th>
                        <th className="py-3 px-2">1-Day Confirmation</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6EFE8]">
                      {bookings.map(b => (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBookingForView(b)}
                          className="hover:bg-white/70 transition cursor-pointer group"
                          title="Click row to view full tourist booking details"
                        >
                          <td className="py-3.5 px-2 font-bold text-[#144824]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
                              <span>{b.tourDate}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="font-bold text-[#144824] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#15803D]" />
                              {b.tourTime}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <p className="font-bold text-[#144824] group-hover:text-[#1E562F] flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-[#5D7762]" />
                              {b.customerName}
                            </p>
                            <p className="text-[11px] text-[#5D7762]">{b.customerPhone || '+63 917 555 0192'}</p>
                          </td>
                          <td className="py-3.5 px-2 text-[#35533C] font-medium">{b.activity}</td>
                          <td className="py-3.5 px-2 text-[#44634B]">
                            <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#E0D8CB]">
                              <Users className="w-3 h-3 text-[#5D7762]" />
                              {b.participants} {b.participants === 1 ? 'person' : 'persons'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${b.attendanceStatus === 'Arrived & Checked In' ? 'bg-purple-100 text-purple-800 border border-purple-300' : b.attendanceStatus === 'Confirmed Attending' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : b.attendanceStatus === 'Cancelled by Tourist' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                              {b.attendanceStatus === 'Arrived & Checked In' ? 'Checked In' : b.attendanceStatus === 'Confirmed Attending' ? 'Attending' : b.attendanceStatus === 'Cancelled by Tourist' ? 'Cancelled' : 'Pending Check'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-black text-[#144824]">₱{b.totalAmount}</td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${b.status === 'Confirmed' ? 'bg-[#DCFCE7] text-[#15803D]' : b.status === 'Pending' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-red-100 text-red-700'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {b.status === 'Pending' ? (
                                <>
                                  <button
                                    onClick={() => handleBookingAction(b.id, 'Confirmed')}
                                    className="px-2.5 py-1 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white font-bold text-[11px] shadow-xs"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleBookingAction(b.id, 'Cancelled')}
                                    className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px]"
                                  >
                                    Decline
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setSelectedBookingForView(b)}
                                  className="px-2.5 py-1 rounded-lg bg-[#1E562F] hover:bg-[#144824] text-white font-bold text-[11px] shadow-xs flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Farmer My Products Showcase (Screenshot 836405251) */}
              <div className="glass-panel rounded-3xl p-8 border border-white/80 space-y-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#144824]">My Farm Products</h3>
                  <button
                    onClick={() => setActivePage('market')}
                    className="text-xs font-bold text-[#1E562F] hover:underline"
                  >
                    View All in Market →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Carabao Mangoes", price: "₱120 /kg", icon: Sparkles },
                    { name: "Farm Fresh Eggs", price: "₱150 /dozen", icon: Award },
                    { name: "Organic Vegetables", price: "₱80 /kg", icon: Carrot },
                    { name: "Pure Wild Honey", price: "₱250 /bottle", icon: Droplets }
                  ].map((p, idx) => (
                    <div key={idx} className="rounded-2xl p-5 bg-white/80 border border-white/90 shadow-sm flex flex-col justify-between h-40">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center shadow-inner">
                        <p.icon className="w-6 h-6 text-[#1E562F]" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#144824]">{p.name}</p>
                        <p className="text-xs font-bold text-[#15803D] mt-0.5">{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 1C: TOURIST USER DASHBOARD (Maria Santos - Screenshot 122601) */}
          {/* =============================================================== */}
          {activePage === 'dashboard' && userRole === 'user' && (
            <div className="p-8 md:p-10 w-full max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-4xl font-black text-[#144824]">Hello, Maria!</h2>
                  <p className="text-xs text-[#5D7762] mt-0.5 font-medium">Where do you want to go today?</p>
                </div>
                <button
                  onClick={() => setActivePage('farm_detail')}
                  className="px-5 py-2.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#86EFAC]" />
                  <span>Book a Tour</span>
                </button>
              </div>

              {/* 1-Day Before Tour Interactive Confirmation Card */}
              {(() => {
                const upcomingTour = bookings.find(b => b.id === 101);
                if (!upcomingTour) return null;
                const isConfirmed = upcomingTour.attendanceStatus === 'Confirmed Attending';
                const isCancelled = upcomingTour.attendanceStatus === 'Cancelled by Tourist' || upcomingTour.status === 'Cancelled';

                return (
                  <div className={`p-6 md:p-7 rounded-3xl border shadow-lg transition-all ${isConfirmed ? 'bg-emerald-50/90 border-[#A7F3D0]' : isCancelled ? 'bg-red-50/90 border-red-200' : 'bg-gradient-to-r from-amber-50/95 via-emerald-50/90 to-amber-50/95 border-amber-300'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isConfirmed ? 'bg-emerald-500 text-white' : isCancelled ? 'bg-red-500 text-white' : 'bg-amber-400 text-[#144824] animate-bounce'}`}>
                          {isConfirmed ? <CheckSquare className="w-6 h-6" /> : isCancelled ? <XOctagon className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-black/10 text-[#144824]">
                              1-Day Before Tour Check
                            </span>
                            <span className="text-xs font-bold text-[#1E562F]">Tomorrow at {upcomingTour.tourTime}</span>
                          </div>
                          <h3 className="text-lg md:text-xl font-black text-[#144824]">
                            {isConfirmed ? 'Attendance Confirmed: See You Tomorrow!' : isCancelled ? 'Tour Visit Cancelled' : 'Will you proceed with your scheduled Farm Tour tomorrow?'}
                          </h3>
                          <p className="text-xs text-[#3E5C45] leading-relaxed max-w-2xl font-medium">
                            {isConfirmed
                              ? `Your tour reservation at ${upcomingTour.farmName} is confirmed. Farm host Mang Juan and your guide are preparing for your arrival at ${upcomingTour.tourTime}.`
                              : isCancelled
                              ? `You have cancelled your tour reservation at ${upcomingTour.farmName}. The farm host has been notified.`
                              : `Your tour to ${upcomingTour.farmName} is scheduled for tomorrow, ${upcomingTour.tourDate} at ${upcomingTour.tourTime} (${upcomingTour.participants} guests). Please confirm if you will proceed so the farm can prepare fresh refreshments, harvest baskets, and your agro-guide.`}
                          </p>
                        </div>
                      </div>

                      {/* Interactive YES / NO Buttons in English */}
                      {!isConfirmed && !isCancelled && (
                        <div className="flex flex-wrap items-center gap-3 self-start md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAttendanceConfirmation(upcomingTour.id, true)}
                            className="px-5 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 transition cursor-pointer active:scale-95"
                          >
                            <CheckSquare className="w-4 h-4 text-emerald-300" />
                            <span>YES, I WILL ATTEND</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceConfirmation(upcomingTour.id, false)}
                            className="px-4 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer active:scale-95"
                          >
                            <XCircle className="w-4 h-4 text-slate-500" />
                            <span>NO, CANCEL TOUR</span>
                          </button>
                        </div>
                      )}

                      {(isConfirmed || isCancelled) && (
                        <button
                          onClick={() => setActivePage('my_bookings')}
                          className="px-4 py-2.5 bg-white text-[#144824] hover:bg-slate-100 rounded-xl text-xs font-bold border border-[#D5DDD6] shadow-xs self-start md:self-center"
                        >
                          View Booking Voucher →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 3 Metric Cards (Screenshot 122601) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  onClick={() => setActivePage('my_bookings')}
                  className="rounded-3xl p-6 bg-[#D1EBD8]/90 backdrop-blur-md border border-white/80 flex items-center gap-5 shadow-sm cursor-pointer hover:shadow-md transition"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#286439]/15 flex items-center justify-center text-[#1B4B27]">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#144824]">2</p>
                    <p className="text-xs font-bold text-[#3C6345]">Active Bookings</p>
                  </div>
                </div>

                <div
                  onClick={() => showToast("You have 1 posted review. Thank you for supporting local farmers!")}
                  className="rounded-3xl p-6 bg-[#FEE9D0]/90 backdrop-blur-md border border-white/80 flex items-center gap-5 shadow-sm cursor-pointer hover:shadow-md transition"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#A16207]/15 flex items-center justify-center text-[#A16207]">
                    <Star className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#854508]">1</p>
                    <p className="text-xs font-bold text-[#7C552D]">Submitted Reviews</p>
                  </div>
                </div>

                <div
                  onClick={() => showToast("5 farms wishlisted: Sunflower Farm, Laurel View, Banaue, Sunnyvale, Riverside.")}
                  className="rounded-3xl p-6 bg-[#D7E8F7]/90 backdrop-blur-md border border-white/80 flex items-center gap-5 shadow-sm cursor-pointer hover:shadow-md transition"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#1D4ED8]/15 flex items-center justify-center text-[#1E40AF]">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#1E3A8A]">5</p>
                    <p className="text-xs font-bold text-[#3B5A80]">Wishlisted Farms</p>
                  </div>
                </div>
              </div>

              {/* Experience Farm Life Banner (Screenshot 122601) */}
              <div className="relative rounded-3xl overflow-hidden min-h-[260px] p-10 flex flex-col justify-center border border-white/80 shadow-lg text-white">
                <img
                  src={APP_CONFIG.farmLifeBannerPhoto}
                  alt="Experience Farm Life"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0C2A15]/90 via-[#0C2A15]/65 to-transparent" />

                <div className="relative z-10 max-w-xl space-y-3">
                  <h3 className="text-3xl font-black text-[#DDF2E0]">Experience Farm Life</h3>
                  <p className="text-xs text-[#C2DEC6] leading-relaxed">
                    Join farm tours, try fresh produce, meet local farmers, and create unforgettable memories.
                  </p>
                  <button
                    onClick={() => setActivePage('farm_detail')}
                    className="px-6 py-2.5 rounded-xl bg-white text-[#144824] font-bold text-xs hover:bg-[#F2F7F3] transition shadow-md self-start inline-block"
                  >
                    Explore Tours Now
                  </button>
                </div>
              </div>

              {/* Popular Destinations Cards (Screenshot 122601) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#144824]">Popular Destinations</h3>
                  <button
                    onClick={() => setActivePage('farm_detail')}
                    className="text-xs font-bold text-[#1E562F] hover:underline"
                  >
                    View All Farms →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TOURS_DATA.slice(0, 3).map(tour => {
                    const isFavorited = favoriteIds.includes(tour.id);
                    return (
                      <div
                        key={tour.id}
                        onClick={() => {
                          setSelectedTour(tour);
                          setIsTourModalOpen(true);
                        }}
                        className="group relative bg-[#FDFBF7]/90 hover:bg-white rounded-[28px] overflow-hidden border border-[#EBE4D5] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                      >
                        <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                          <img
                            src={tour.imageUrl}
                            alt={tour.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white text-[#144824] text-xs font-black shadow-md tracking-wide">
                            {tour.location.split(',')[0]}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(tour.id, tour.name);
                            }}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                            title="Save to favorites"
                          >
                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-300 fill-transparent'}`} />
                          </button>
                        </div>
                        <div className="p-5 space-y-2 bg-[#FAF8F5]/95 border-t border-[#EDE7DB]">
                          <h4 className="font-extrabold text-sm md:text-base text-[#144824] group-hover:text-[#1E562F] transition line-clamp-1">{tour.name}</h4>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-[#144824]">{tour.rating} ({tour.reviewsCount})</span>
                            </span>
                            <span className="font-black text-sm md:text-base text-[#1E562F]">
                              ₱{tour.pricePerPerson} <span className="text-xs font-semibold text-[#5D7762]">/person</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* =============================================================== */}
          {/* FARMER RESTRICTION NOTICE FOR CONSUMER TOURIST INTERFACES       */}
          {/* =============================================================== */}
          {userRole === 'farmer' && (activePage === 'farm_detail' || activePage === 'fruit_picking' || activePage === 'market') && (
            <div className="p-8 md:p-12 w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/90 shadow-xl bg-white/90 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#E8F3EB] border border-[#BDE0C7] text-[#1E562F] flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-8 h-8 text-[#1E562F]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#15803D] tracking-wider px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    Farmer Host Workspace Active
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#144824] mt-2">
                    Consumer Browsing Restricted for Farm Hosts
                  </h3>
                  <p className="text-xs md:text-sm text-[#5D7762] max-w-lg mx-auto mt-2 leading-relaxed">
                    You are signed in as <strong>Juan Dela Cruz</strong> (Registered Farm Host at Sunnyvale Farm). Consumer tourist discovery pages (Explore Tours, Fruit Picking, Market) are exclusive to Eco-Tourist visitors.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setActivePage('my_bookings')}
                    className="px-6 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md transition flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#86EFAC]" />
                    <span>Manage Tourist Bookings & Gate Check-In</span>
                  </button>
                  <button
                    onClick={() => setActivePage('farmer_orders')}
                    className="px-6 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-50 text-[#144824] rounded-2xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-[#1E562F]" />
                    <span>Manage Tourist Produce Orders</span>
                  </button>
                  <button
                    onClick={() => setActivePage('farmer_products')}
                    className="px-6 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-50 text-[#144824] rounded-2xl text-xs font-bold shadow-xs transition flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#1E562F]" />
                    <span>My Produce Catalog</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 2: EXPLORE TOURS (Desktop 6-Card Grid - image_8057368a)     */}
          {/* =============================================================== */}
          {activePage === 'farm_detail' && userRole !== 'farmer' && (
            <div className="p-8 md:p-12 w-full max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Header Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#144824] tracking-tight">Explore Philippine Farm Tours</h2>
                  <p className="text-xs md:text-sm text-[#5D7762] mt-1 font-medium">
                    Handpicked eco-sanctuaries, heritage agro-trails, and scenic mountain farms across Batangas, Benguet, Laguna, and Pampanga
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1E562F] bg-white/80 px-4 py-2 rounded-full border border-white/90 shadow-xs">
                    6 Verified Destinations
                  </span>
                </div>
              </div>

              {/* 3-COLUMN DESKTOP PHOTO-CARD GRID (EXACT FORMAT FROM image_8057368a.png) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOURS_DATA.map((tour) => {
                  const isFavorited = favoriteIds.includes(tour.id);
                  return (
                    <div
                      key={tour.id}
                      onClick={() => {
                        setSelectedTour(tour);
                        setIsTourModalOpen(true);
                      }}
                      className="group relative bg-[#FDFBF7]/90 hover:bg-white rounded-[32px] overflow-hidden border border-[#EBE4D5] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Top Tall Image with Floating Location Badge & Heart Button */}
                      <div className="relative h-64 md:h-72 w-full overflow-hidden bg-slate-200">
                        <img
                          src={tour.imageUrl}
                          alt={tour.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Floating Location Pill Top-Left */}
                        <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white text-[#144824] text-xs font-black shadow-md tracking-wide">
                          {tour.location.split(',')[0]}
                        </div>
                        {/* Floating Heart Icon Top-Right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(tour.id, tour.name);
                          }}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                          title="Save to favorites"
                        >
                          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-300 fill-transparent'}`} />
                        </button>
                      </div>

                      {/* Bottom Content Area */}
                      <div className="p-6 space-y-3 bg-[#FAF8F5]/95 border-t border-[#EDE7DB]">
                        <h3 className="font-extrabold text-base md:text-lg text-[#144824] leading-snug group-hover:text-[#1E562F] transition line-clamp-1">
                          {tour.name}
                        </h3>

                        <div className="flex items-center justify-between pt-1">
                          {/* Star Rating on Left */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-[#144824] font-bold">{tour.rating} ({tour.reviewsCount})</span>
                          </div>

                          {/* Price on Right */}
                          <div className="text-right">
                            <span className="font-black text-base md:text-lg text-[#1E562F]">
                              ₱{tour.pricePerPerson}
                            </span>
                            <span className="text-xs font-semibold text-[#5D7762] ml-1">/person</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 3: FRUIT PICKING (Desktop 6-Card Grid - image_8057368a)     */}
          {/* =============================================================== */}
          {activePage === 'fruit_picking' && userRole !== 'farmer' && (
            <div className="p-8 md:p-12 w-full max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Header Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#144824] tracking-tight">Fruit Picking Experiences</h2>
                  <p className="text-xs md:text-sm text-[#5D7762] mt-1 font-medium">
                    Pluck fresh tree-ripened Valencia oranges, strawberries, mangoes, dragonfruits, and rambutan direct from the branch
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1E562F] bg-white/80 px-4 py-2 rounded-full border border-white/90 shadow-xs">
                    6 Harvest Groves
                  </span>
                </div>
              </div>

              {/* 3-COLUMN DESKTOP PHOTO-CARD GRID (EXACT FORMAT FROM image_8057368a.png) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {FRUIT_PICKING_DATA.map((fp) => {
                  const isFavorited = favoriteIds.includes(fp.id + 100);
                  return (
                    <div
                      key={fp.id}
                      onClick={() => {
                        setSelectedFruitPicking(fp);
                        setIsFruitModalOpen(true);
                      }}
                      className="group relative bg-[#FDFBF7]/90 hover:bg-white rounded-[32px] overflow-hidden border border-[#EBE4D5] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Top Tall Image with Floating Location Badge & Heart Button */}
                      <div className="relative h-64 md:h-72 w-full overflow-hidden bg-slate-200">
                        <img
                          src={fp.imageUrl}
                          alt={fp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Floating Location Pill Top-Left */}
                        <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white text-[#144824] text-xs font-black shadow-md tracking-wide">
                          {fp.location.split(',')[0]}
                        </div>
                        {/* Floating Heart Icon Top-Right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(fp.id + 100, fp.title);
                          }}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                          title="Save to favorites"
                        >
                          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-300 fill-transparent'}`} />
                        </button>
                      </div>

                      {/* Bottom Content Area */}
                      <div className="p-6 space-y-3 bg-[#FAF8F5]/95 border-t border-[#EDE7DB]">
                        <h3 className="font-extrabold text-base md:text-lg text-[#144824] leading-snug group-hover:text-[#1E562F] transition line-clamp-1">
                          {fp.title}
                        </h3>

                        <div className="flex items-center justify-between pt-1">
                          {/* Star Rating on Left */}
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-[#144824] font-bold">{fp.rating} ({fp.reviewsCount})</span>
                          </div>

                          {/* Price on Right */}
                          <div className="text-right">
                            <span className="font-black text-base md:text-lg text-[#1E562F]">
                              ₱{fp.pricePerPerson}
                            </span>
                            <span className="text-xs font-semibold text-[#5D7762] ml-1">/person</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 4: ABUNDANT VEGETABLES & MARKETPLACE                       */}
          {/* =============================================================== */}
          {activePage === 'market' && userRole !== 'farmer' && (
            <div className="p-8 md:p-10 w-full max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#144824] tracking-tight">Fresh Local Vegetables & Organic Harvest</h2>
                  <p className="text-xs text-[#5D7762] mt-0.5 font-medium">100% natural, farm-to-table organic vegetables harvested directly from Batangas, Benguet, and Laguna</p>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {["All", "Vegetables", "Fruits", "Others"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMarketFilter(cat)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${marketFilter === cat ? 'bg-[#1E562F] text-white shadow-md' : 'glass-card text-[#26482D] hover:bg-white'}`}
                    >
                      {cat === 'All' ? 'All Products' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promotional Banner */}
              <div className="p-4 px-6 rounded-2xl bg-[#0F381B]/85 text-white flex items-center justify-between text-xs font-bold border border-white/20 shadow-md">
                <span className="flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-[#86EFAC]" />
                  Seasonal Harvest Promo: 10% OFF automatically applied on all local vegetables and fruits!
                </span>
                <span className="text-[#86EFAC] tracking-wider uppercase">Direct Farm-to-Table</span>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="glass-panel rounded-3xl p-5 flex flex-col justify-between border border-white/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-200"
                  >
                    <div className="space-y-3">
                      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-[#1E562F] text-white rounded-full text-[10px] font-black shadow-xs">
                          {p.discountPercent}% OFF
                        </span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 text-[#144824] rounded-full text-[10px] font-bold">
                          {p.category}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-[#144824] line-clamp-1">{p.name}</h4>
                        <div className="flex items-center justify-between text-[11px] mt-0.5">
                          <p className="text-[#5D7762] truncate">{p.farmOrigin}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            (p.stock !== undefined ? p.stock : 30) <= 0 
                              ? 'bg-rose-100 text-rose-700' 
                              : (p.stock !== undefined ? p.stock : 30) <= 5 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {(p.stock !== undefined ? p.stock : 30) <= 0 ? 'Sold Out' : `Stock: ${p.stock !== undefined ? p.stock : 30} left`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#445E48] mt-1.5 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#EAE3D8] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-[#144824]">
                            ₱{Math.round(p.price * (1 - p.discountPercent / 100))}
                          </span>
                          <span className="text-xs text-[#8A9E8E] line-through">₱{p.price}</span>
                          <span className="text-[10px] text-[#5D7762] font-semibold">{p.unit}</span>
                        </div>
                      </div>

                      {(() => {
                        const inCartQty = cart.find(c => c.product.id === p.id)?.quantity || 0;
                        const maxStock = p.stock !== undefined ? p.stock : 30;
                        const isSoldOut = maxStock <= 0;
                        const isLimitReached = inCartQty >= maxStock;

                        return (
                          <button
                            type="button"
                            disabled={isSoldOut || isLimitReached}
                            onClick={() => addToCart(p)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition ${
                              isSoldOut || isLimitReached
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-[#1E562F] hover:bg-[#144824] text-white cursor-pointer active:scale-95'
                            }`}
                            title={isSoldOut ? 'Sold Out' : isLimitReached ? `Farmer stock limit of ${maxStock} items reached` : 'Add to cart'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              {isSoldOut ? 'Sold Out' : isLimitReached ? 'Limit Reached' : inCartQty > 0 ? `Add (${inCartQty}/${maxStock})` : 'Add'}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW: FARMERS STORIES & PROFILES (Exclusive Tourist Community)   */}
          {/* =============================================================== */}
          {activePage === 'farmers_stories' && (
            <div className="p-6 md:p-12 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Hero Banner */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#144824] via-[#1E562F] to-[#2E7D46] text-white p-8 md:p-12">
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Heart of Philippine Agro-Heritage</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                    Meet Our Local Farmers & Agro-Stewards
                  </h2>
                  <p className="text-sm text-emerald-100/90 font-medium leading-relaxed">
                    Behind every basket of fresh strawberries, sweet carabao mangoes, pure raw honeycomb, and artisanal tablea is a dedicated Filipino farmer. Explore their generational stories, learn about their sustainable soil practices, and directly purchase their freshly harvested crops.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setActivePage('market')}
                      className="px-5 py-2.5 rounded-xl bg-white text-[#144824] font-bold text-xs shadow-md hover:bg-emerald-50 transition flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#1E562F]" />
                      <span>Shop All Harvests</span>
                    </button>
                    <button
                      onClick={() => setActivePage('farm_detail')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600/50 text-white font-bold text-xs transition flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-[#86EFAC]" />
                      <span>Book Farm Tours</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Province Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {(['All', 'Batangas', 'Benguet', 'Bukidnon', 'Davao'] as const).map(prov => (
                    <button
                      key={prov}
                      onClick={() => setFarmerStoriesFilter(prov)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${farmerStoriesFilter === prov ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#3E5C45] hover:bg-white/80'}`}
                    >
                      {prov} {prov === 'All' ? `(${FARMERS_COMMUNITY_DATA.length})` : `(${FARMERS_COMMUNITY_DATA.filter(f => f.province === prov).length})`}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#5D7762] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={farmerSearchQuery}
                    onChange={(e) => setFarmerSearchQuery(e.target.value)}
                    placeholder="Search farmer or crop..."
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-xs text-[#144824] border border-[#D5DDD6] focus:outline-none focus:ring-2 focus:ring-[#1E562F]"
                  />
                </div>
              </div>

              {/* Farmers Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {FARMERS_COMMUNITY_DATA
                  .filter(f => farmerStoriesFilter === 'All' || f.province === farmerStoriesFilter)
                  .filter(f => !farmerSearchQuery || f.name.toLowerCase().includes(farmerSearchQuery.toLowerCase()) || f.farmName.toLowerCase().includes(farmerSearchQuery.toLowerCase()) || f.specialtyProduce.some(p => p.toLowerCase().includes(farmerSearchQuery.toLowerCase())))
                  .map(farmer => {
                    // Match associated harvest products
                    const farmerHarvests = products.filter(p => farmer.productIds.includes(p.id));
                    return (
                      <div
                        key={farmer.id}
                        className="glass-panel rounded-3xl overflow-hidden border border-white/90 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between bg-white/90 group"
                      >
                        {/* Farm Cover Banner & Floating Farmer Photo */}
                        <div>
                          <div className="relative h-48 overflow-hidden bg-slate-900">
                            <img
                              src={farmer.farmBannerUrl}
                              alt={farmer.farmName}
                              className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                            
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>{farmer.location}</span>
                              </span>
                            </div>

                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-md">
                                {farmer.generation}
                              </span>
                            </div>

                            {/* Floating Farmer Avatar and Headline */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3.5">
                              <img
                                src={farmer.photoUrl}
                                alt={farmer.name}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xl shrink-0"
                              />
                              <div className="text-white">
                                <h3 className="text-xl font-black leading-tight text-white drop-shadow-sm">{farmer.name}</h3>
                                <p className="text-xs text-emerald-300 font-semibold">{farmer.farmName}</p>
                              </div>
                            </div>
                          </div>

                          {/* Profile Content Body */}
                          <div className="p-6 space-y-4">
                            {/* Role and Experience Badges */}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-[#1E562F] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                                {farmer.roleTitle}
                              </span>
                              <span className="text-[11px] font-bold text-[#5D7762] flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>{farmer.yearsExperience} Years Farming</span>
                              </span>
                            </div>

                            {/* Farmer's Story Quote */}
                            <div className="p-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2] text-xs text-[#2C4831] italic leading-relaxed">
                              "{farmer.storyQuote}"
                            </div>

                            {/* Sustainable Practices Badges */}
                            <div className="space-y-1.5">
                              <p className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">
                                Certified Sustainable Practices:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {farmer.sustainablePractices.slice(0, 3).map((prac, i) => (
                                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-[#D5DDD6] text-[10px] font-bold text-[#144824] shadow-2xs">
                                    ✓ {prac}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Products Harvested by this Farmer */}
                            <div className="space-y-2 pt-2 border-t border-black/5">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">
                                  Harvested Products ({farmerHarvests.length} crops):
                                </p>
                                <span className="text-[10px] text-[#5D7762]">Direct from Farm</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2.5">
                                {farmerHarvests.slice(0, 2).map((prod) => (
                                  <div key={prod.id} className="p-2.5 bg-white rounded-xl border border-[#D5DDD6] flex items-center justify-between gap-2 shadow-2xs">
                                    <div className="flex items-center gap-2 truncate">
                                      <img src={prod.imageUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                      <div className="truncate text-left">
                                        <p className="font-bold text-xs text-[#144824] truncate">{prod.name}</p>
                                        <p className="text-[11px] font-black text-[#1E562F]">₱{prod.price} <span className="text-[9px] text-[#718875] font-normal">{prod.unit}</span></p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => addToCart(prod)}
                                      className="p-1.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-lg text-xs font-bold shrink-0 transition"
                                      title={`Add ${prod.name} to cart`}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions: View Full Profile & Book Tour */}
                        <div className="p-6 pt-0 flex items-center gap-2.5">
                          <button
                            onClick={() => setSelectedFarmerForModal(farmer)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#1E562F] hover:bg-emerald-50 text-[#144824] font-bold text-xs transition text-center shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#1E562F]" />
                            <span>Read Full Story & Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              const matchingTour = TOURS_DATA.find(t => t.id === farmer.tourId) || TOURS_DATA[0];
                              setSelectedTour(matchingTour);
                              setIsTourModalOpen(true);
                            }}
                            className="py-2.5 px-4 rounded-xl bg-[#1E562F] hover:bg-[#144824] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#86EFAC]" />
                            <span>Book Farm Tour</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 5: 4-STEP CHECKOUT & CART (Screenshot 830562405)            */}
          {/* =============================================================== */}
          {activePage === 'cart_checkout' && (
            <div className="p-8 md:p-12 w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-[#144824]">Your Cart & Checkout</h2>
                  <p className="text-xs text-[#5D7762] mt-0.5">Secure payment via GCash, Bank Transfer, or Cash on Delivery</p>
                </div>
                <button
                  onClick={() => setActivePage('market')}
                  className="text-xs font-bold text-[#1E562F] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Shopping</span>
                </button>
              </div>

              {/* 4 Step Indicator Pills (Matching Screenshot 830562405) */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { step: 1, title: "1 Cart" },
                  { step: 2, title: "2 Delivery" },
                  { step: 3, title: "3 Payment" },
                  { step: 4, title: "4 Confirmation" }
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => {
                      if (s.step <= checkoutStep) setCheckoutStep(s.step);
                    }}
                    className={`py-3 rounded-2xl text-xs font-bold transition text-center ${checkoutStep === s.step ? 'bg-[#1E562F] text-white shadow-md' : checkoutStep > s.step ? 'bg-[#D1EBD8] text-[#1E562F]' : 'glass-card text-[#718875]'}`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* STEP 1: CART ITEMS */}
              {checkoutStep === 1 && (
                <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-2xl space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <ShoppingBag className="w-12 h-12 text-[#78967E] mx-auto opacity-60" />
                      <p className="font-bold text-sm text-[#144824]">Your cart is currently empty.</p>
                      <button
                        onClick={() => setActivePage('market')}
                        className="px-5 py-2.5 bg-[#1E562F] text-white rounded-xl text-xs font-bold"
                      >
                        Explore Fresh Vegetables & Produce
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 divide-y divide-[#EAE3D8]">
                        {cart.map((item) => (
                          <div key={item.product.id} className="pt-4 first:pt-0 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded-2xl object-cover border border-white" />
                              <div>
                                <h4 className="font-extrabold text-sm text-[#144824]">{item.product.name}</h4>
                                <p className="text-xs text-[#5D7762]">{item.product.farmOrigin}</p>
                                <p className="text-xs font-bold text-[#15803D] mt-0.5">
                                  ₱{(item.product.price * (1 - item.product.discountPercent / 100)).toFixed(0)} {item.product.unit}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2 bg-white/90 border border-[#D5DDD6] rounded-xl px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(item.product.id, -1)}
                                    className="p-1 hover:bg-slate-100 rounded text-[#144824] transition cursor-pointer"
                                    title="Decrease quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-black text-xs px-2 text-[#144824]">{item.quantity}</span>
                                  <button
                                    type="button"
                                    disabled={item.quantity >= (item.product.stock !== undefined ? item.product.stock : 30)}
                                    onClick={() => updateCartQty(item.product.id, 1)}
                                    className="p-1 hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed rounded text-[#144824] transition cursor-pointer"
                                    title={item.quantity >= (item.product.stock !== undefined ? item.product.stock : 30) ? "Farmer's maximum stock limit reached" : "Increase quantity"}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className={`text-[10px] font-bold ${item.quantity >= (item.product.stock !== undefined ? item.product.stock : 30) ? 'text-amber-700 font-extrabold' : 'text-slate-500'}`}>
                                  {item.quantity >= (item.product.stock !== undefined ? item.product.stock : 30) ? 'Max stock reached' : `Limit: ${item.product.stock !== undefined ? item.product.stock : 30} max ${item.product.unit || 'units'}`}
                                </span>
                              </div>

                              <span className="font-black text-sm text-[#144824] w-20 text-right">
                                ₱{(item.product.price * (1 - item.product.discountPercent / 100) * item.quantity).toFixed(0)}
                              </span>

                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, -item.quantity)}
                                className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Remove product from cart"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="border-t border-[#EAE3D8] pt-6 space-y-2">
                        <div className="flex justify-between text-xs text-[#5D7762]">
                          <span>Subtotal</span>
                          <span className="font-bold text-[#144824]">₱{cartSubtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-[#5D7762]">
                          <span>Delivery Fee (Refrigerated Van)</span>
                          <span className="font-bold text-[#144824]">₱{APP_CONFIG.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-base font-black text-[#144824] pt-2 border-t border-[#EAE3D8]">
                          <span>Total</span>
                          <span>₱{cartTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="w-full py-4 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-sm shadow-xl transition"
                      >
                        Proceed to Delivery Details →
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* STEP 2: DELIVERY DETAILS */}
              {checkoutStep === 2 && (
                <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-2xl space-y-6">
                  <h3 className="text-lg font-bold text-[#144824]">Shipping & Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#144824]">Recipient Full Name</label>
                      <input
                        type="text"
                        value={deliveryInfo.recipientName}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, recipientName: e.target.value })}
                        className="w-full p-3 bg-white/90 border border-[#D5DDD6] rounded-xl text-xs text-[#144824]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#144824]">Mobile Contact Number</label>
                      <input
                        type="text"
                        value={deliveryInfo.contactPhone}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, contactPhone: e.target.value })}
                        className="w-full p-3 bg-white/90 border border-[#D5DDD6] rounded-xl text-xs text-[#144824]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#144824]">Delivery Address</label>
                    <textarea
                      rows={3}
                      value={deliveryInfo.deliveryAddress}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryAddress: e.target.value })}
                      className="w-full p-3 bg-white/90 border border-[#D5DDD6] rounded-xl text-xs text-[#144824]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#144824]">Special Rider Instructions</label>
                    <input
                      type="text"
                      value={deliveryInfo.deliveryNotes}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, deliveryNotes: e.target.value })}
                      className="w-full p-3 bg-white/90 border border-[#D5DDD6] rounded-xl text-xs text-[#144824]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="px-6 py-3.5 bg-white border border-[#D5DDD6] text-[#144824] rounded-2xl text-xs font-bold"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={() => setCheckoutStep(3)}
                      className="flex-1 py-3.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md"
                    >
                      Proceed to Payment Method →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD (GCash / Bank Transfer / Cash on Delivery) */}
              {checkoutStep === 3 && (
                <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-2xl space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#144824]">Select Payment Method</h3>
                    <p className="text-xs text-[#5D7762]">Pay securely via GCash, Bank Transfer, or Cash on Delivery</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { method: 'GCash' as const, label: 'GCash e-Wallet', icon: Wallet, desc: 'Instant QR code or mobile number transfer' },
                      { method: 'Bank Transfer' as const, label: 'Bank Transfer', icon: Building, desc: 'BDO, BPI, or UnionBank online transfer' },
                      { method: 'Cash on Delivery' as const, label: 'Cash on Delivery', icon: Banknote, desc: 'Pay rider directly upon vegetable arrival' }
                    ].map((opt) => (
                      <div
                        key={opt.method}
                        onClick={() => setPaymentMethod(opt.method)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${paymentMethod === opt.method ? 'border-[#15803D] bg-[#EAF5ED]/90 shadow-md' : 'border-[#EAE3D8] bg-white/70 hover:bg-white'}`}
                      >
                        <div className="space-y-2">
                          <opt.icon className={`w-6 h-6 ${paymentMethod === opt.method ? 'text-[#15803D]' : 'text-[#5D7762]'}`} />
                          <p className="font-extrabold text-sm text-[#144824]">{opt.label}</p>
                          <p className="text-[11px] text-[#5D7762] leading-tight">{opt.desc}</p>
                        </div>
                        <div className="pt-4 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#15803D]">
                            {paymentMethod === opt.method ? 'Selected' : 'Click to select'}
                          </span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === opt.method ? 'border-[#15803D] bg-[#15803D]' : 'border-[#A6C4A9]'}`}>
                            {paymentMethod === opt.method && <Check className="w-3 h-3 text-white" />}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Details Box */}
                  {paymentMethod === 'GCash' && (
                    <div className="p-6 rounded-2xl bg-sky-50/90 border border-sky-200 flex flex-col md:flex-row items-center gap-6">
                      <img src={APP_CONFIG.gcashQrMockup} alt="GCash QR Code" className="w-32 h-32 rounded-xl bg-white p-2 shadow-sm" />
                      <div className="space-y-1.5 text-xs text-sky-950 text-center md:text-left">
                        <p className="font-black text-sm text-sky-900">GCash Official Merchant Account</p>
                        <p>Merchant Name: <span className="font-bold">AgriTourism Philippines Co.</span></p>
                        <p>Mobile: <span className="font-mono font-bold">+63 917 890 1234</span></p>
                        <p className="text-[11px] text-sky-800">Scan QR or enter mobile number. Amount: <span className="font-bold">₱{cartTotal.toLocaleString()}</span></p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'Bank Transfer' && (
                    <div className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                      <p className="font-black text-sm text-emerald-900">Bank Transfer Account Details</p>
                      <p>Bank: <span className="font-bold">BDO Unibank (Batangas City Branch)</span></p>
                      <p>Account Name: <span className="font-bold">AgriTourism Network PH Inc.</span></p>
                      <p>Account Number: <span className="font-mono font-bold">0045-8912-3401</span></p>
                    </div>
                  )}

                  {paymentMethod === 'Cash on Delivery' && (
                    <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-1.5 text-xs text-amber-950">
                      <p className="font-black text-sm text-amber-900">Cash on Delivery (COD) Selected</p>
                      <p>Please prepare exact cash amount of <span className="font-bold">₱{cartTotal.toLocaleString()}</span> upon arrival of the delivery rider.</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="px-6 py-3.5 bg-white border border-[#D5DDD6] text-[#144824] rounded-2xl text-xs font-bold"
                    >
                      Back to Delivery
                    </button>
                    <button
                      onClick={() => {
                        const orderAmt = cartTotal > 0 ? cartTotal : 550;
                        const refCode = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
                        const newOrderId = `ord-${Date.now()}`;
                        
                        const newPlacedOrder: FarmerOrder = {
                          id: newOrderId,
                          orderNumber: refCode,
                          customerName: deliveryInfo.recipientName || "Maria Santos",
                          customerPhone: deliveryInfo.contactPhone || "+63 917 555 0192",
                          customerAddress: deliveryInfo.deliveryAddress || "Unit 12B Green Residences, Taft Ave, Malate, Manila",
                          items: cart.length > 0 ? cart.map(c => ({
                            productName: c.product.name,
                            qty: c.quantity,
                            unitPrice: c.product.price * (1 - c.product.discountPercent / 100)
                          })) : [
                            { productName: "Carabao Mangoes", qty: 2, unitPrice: 120 },
                            { productName: "Pure Wild Honey", qty: 1, unitPrice: 250 }
                          ],
                          totalAmount: orderAmt,
                          paymentMethod: paymentMethod,
                          paymentStatus: paymentMethod === 'Cash on Delivery' ? 'COD' : 'Paid via GCash',
                          fulfillmentStatus: 'Dispatched',
                          orderDate: 'Nov 19, 2026 · Just now',
                          uploadedReceiptUrl: getHtmlImage("receiptSamplePhoto", "https://images.unsplash.com/photo-1554415707-9e4966668834?auto=format&fit=crop&w=600&q=80"),
                          specialDeliveryNotes: deliveryInfo.deliveryNotes || "Please deliver fresh with protective foam padding.",
                          courierName: "AgriExpress Direct Logistics",
                          riderName: "Kuya Jun-Jun Ramos",
                          riderPhone: "+63 920 112 3456",
                          riderVehicle: "Yamaha NMAX (Insulated Box) · Plate DA 7192",
                          currentLocation: "STAR Tollway approaching SLEX Corridor · En route to customer",
                          estimatedArrival: "Today, ~11:30 AM (20-30 mins away)",
                          trackingNumber: `AGX-${Math.floor(100000 + Math.random() * 900000)}`,
                          isReceivedByUser: false,
                          deliverySteps: [
                            { title: "Order Placed & Payment Verified", location: "AgriTourism Gateway", timestamp: "Just now", completed: true },
                            { title: "Fresh Farm Harvest & Packed", location: "Sunnyvale Farm, Lipa City", timestamp: "Just now", completed: true },
                            { title: "Picked Up by Courier Rider", location: "Lipa Express Logistics Center", timestamp: "Just now", completed: true },
                            { title: "Out for Delivery", location: "Corridor en route to delivery address", timestamp: "Estimated 11:30 AM", completed: true, notes: "Rider on the road" },
                            { title: "Delivered & Confirmed by Tourist", location: "Customer Delivery Address", timestamp: "Pending arrival", completed: false }
                          ]
                        };

                        setFarmerOrders(prev => [newPlacedOrder, ...prev]);
                        if (cart.length > 0) {
                          setProducts(prev =>
                            prev.map(p => {
                              const bought = cart.find(c => c.product.id === p.id);
                              return bought ? { ...p, stock: Math.max(0, p.stock - bought.quantity) } : p;
                            })
                          );
                        }
                        void javaBackend.createOrder({
                          id: newPlacedOrder.id,
                          orderNumber: newPlacedOrder.orderNumber,
                          customerName: newPlacedOrder.customerName,
                          totalAmount: newPlacedOrder.totalAmount,
                          paymentMethod: newPlacedOrder.paymentMethod,
                        });
                        cart.forEach(c => {
                          void javaBackend.decrementProductStock(c.product.id, c.quantity);
                        });
                        setLastPlacedOrder(newPlacedOrder);
                        setActiveTrackingOrderId(newOrderId);
                        setLastOrderTotal(orderAmt);
                        setLastOrderPaymentMethod(paymentMethod);
                        setLastOrderReference(refCode);
                        setCheckoutStep(4);
                        setCart([]);
                        showToast(`Order placed successfully! Amount: ₱${orderAmt.toLocaleString()}`);
                      }}
                      className="flex-1 py-3.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      Confirm and Place Order · ₱{cartTotal.toLocaleString()}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ORDER CONFIRMED */}
              {checkoutStep === 4 && (
                <div className="glass-panel rounded-3xl p-10 border border-white/80 shadow-2xl text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#144824]">Mabuhay! Order Confirmed</h3>
                    <p className="text-xs text-[#5D7762] max-w-md mx-auto">
                      Thank you for directly supporting local farmers! Your fresh organic vegetables and products have been queued for dispatch.
                    </p>
                    <p className="text-xs font-mono font-bold text-[#1E562F] mt-2">
                      Order Reference: #{lastOrderReference}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#EAF5ED] text-xs text-[#144824] font-medium max-w-md mx-auto">
                    Payment Method: <span className="font-bold">{lastOrderPaymentMethod}</span> • Total Paid: <span className="font-bold text-[#1E562F]">₱{lastOrderTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setCheckoutStep(1);
                        setActivePage('order_tracking');
                      }}
                      className="px-6 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-[#86EFAC]" />
                      <span>Track Delivery Route Now →</span>
                    </button>
                    <button
                      onClick={() => {
                        if (lastPlacedOrder) {
                          handlePrintOrderReceipt(lastPlacedOrder);
                        } else {
                          const fallback = farmerOrders[0];
                          if (fallback) handlePrintOrderReceipt(fallback);
                        }
                      }}
                      className="px-6 py-3 bg-white text-[#144824] border border-[#1E562F] hover:bg-emerald-50 rounded-2xl font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-[#1E562F]" />
                      <span>Print Official Receipt</span>
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutStep(1);
                        setActivePage('market');
                      }}
                      className="px-6 py-3 bg-white text-[#144824] border border-[#D5DDD6] rounded-2xl font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Return to Marketplace
                    </button>
                    <button
                      onClick={() => setActivePage('my_bookings')}
                      className="px-6 py-3 bg-white text-[#144824] border border-[#D5DDD6] rounded-2xl font-bold text-xs hover:bg-slate-50 transition"
                    >
                      View All Bookings
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW: LIVE PRODUCE DELIVERY TRACKING (Tourist / Customer & Admin) */}
          {/* =============================================================== */}
          {activePage === 'order_tracking' && (
            <div className="p-8 md:p-12 w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E562F]/10 text-[#1E562F] text-xs font-bold mb-2">
                    <Truck className="w-3.5 h-3.5 text-[#1E562F]" />
                    <span>Real-Time Farm Logistics Tracker</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#144824] tracking-tight">
                    Delivery Tracking
                  </h2>
                  <p className="text-xs text-[#5D7762] mt-1 font-medium">
                    Monitor the live route of your fresh organic farm harvest directly from Batangas to your doorstep.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      const cur = farmerOrders.find(o => o.id === activeTrackingOrderId || o.orderNumber === activeTrackingOrderId) || farmerOrders[0];
                      if (cur) handlePrintOrderReceipt(cur);
                    }}
                    className="px-4 py-2 bg-white text-[#144824] border border-[#1E562F] rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-50 transition flex items-center gap-1.5"
                    title="Print official receipt for this order"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#1E562F]" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setActivePage('market')}
                    className="px-4 py-2 bg-white text-[#1E562F] border border-[#D5DDD6] rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <span>Marketplace</span>
                  </button>
                  <button
                    onClick={() => setActivePage('my_bookings')}
                    className="px-4 py-2 bg-[#1E562F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#144824] transition flex items-center gap-1.5"
                  >
                    <span>My Bookings</span>
                  </button>
                </div>
              </div>

              {/* Order Selection Tabs */}
              <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-white/90 shadow-sm">
                <span className="text-xs font-bold text-[#5D7762] px-3">Select Order to Track:</span>
                {farmerOrders.map((ord) => {
                  const isSelected = (activeTrackingOrderId === ord.id || activeTrackingOrderId === ord.orderNumber);
                  return (
                    <button
                      key={ord.id}
                      onClick={() => setActiveTrackingOrderId(ord.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${isSelected ? 'bg-[#1E562F] text-white shadow-md' : 'bg-white/80 text-[#2C4831] hover:bg-white'}`}
                    >
                      <span>#{ord.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${ord.fulfillmentStatus === 'Delivered' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-amber-100 text-amber-800'}`}>
                        {ord.fulfillmentStatus}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tracked Order Details */}
              {(() => {
                const currentOrder = farmerOrders.find(o => o.id === activeTrackingOrderId || o.orderNumber === activeTrackingOrderId) || farmerOrders[0];
                if (!currentOrder) return null;

                return (
                  <div className="space-y-6">
                    {/* Live Courier & Route Status Card */}
                    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/90 shadow-xl bg-white/95 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black bg-[#1E562F] text-white px-3 py-1 rounded-lg">
                              #{currentOrder.orderNumber}
                            </span>
                            <span className="text-xs text-[#5D7762] font-semibold">{currentOrder.orderDate}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              <span>{currentOrder.fulfillmentStatus === 'Delivered' ? 'Delivered' : 'Live Tracking Active'}</span>
                            </span>
                          </div>
                          <p className="font-bold text-sm text-[#144824] pt-1 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Destination: {currentOrder.customerAddress}</span>
                          </p>
                        </div>

                        {/* Customer Receipt Status Badge */}
                        {currentOrder.isReceivedByUser ? (
                          <div className="p-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="font-extrabold text-[#15803D]">Package Confirmed Received</p>
                              <p className="text-[10px] text-emerald-700">{currentOrder.receivedAt || 'Handed over in good condition'}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 px-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <p className="font-extrabold text-amber-800">In Transit to Your Doorstep</p>
                              <p className="text-[10px] text-amber-700">{currentOrder.estimatedArrival || 'ETA ~11:30 AM'}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Current Location & Courier Rider Box */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Courier Rider Info */}
                        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#15803D]">Assigned Courier & Rider</span>
                            <span className="text-[10px] font-bold text-[#5D7762]">{currentOrder.courierName || 'AgriExpress Direct'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#E8F3EB] border border-[#BDE0C7] flex items-center justify-center text-[#1E562F] shrink-0 font-black text-sm">
                              <Truck className="w-5 h-5 text-[#1E562F]" />
                            </div>
                            <div className="truncate">
                              <p className="font-extrabold text-sm text-[#144824] truncate">{currentOrder.riderName || 'Kuya Jun-Jun Ramos'}</p>
                              <p className="text-[11px] text-[#55785C] truncate">{currentOrder.riderVehicle || 'Yamaha NMAX (Insulated Box) · Plate DA 7192'}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                            <span className="text-[#5D7762] flex items-center gap-1.5">
                              <PhoneCall className="w-3.5 h-3.5 text-[#15803D]" />
                              <span>{currentOrder.riderPhone || '+63 920 112 3456'}</span>
                            </span>
                            <span className="text-[10px] font-bold text-[#1E562F] bg-white px-2 py-1 rounded-lg border border-[#D5DDD6]">
                              Verified Carrier
                            </span>
                          </div>
                        </div>

                        {/* Current Real-time Location */}
                        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2] space-y-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#15803D]">Current Courier Coordinates</span>
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                              <Navigation className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div>
                              <p className="font-extrabold text-xs text-[#144824] leading-snug">
                                {currentOrder.currentLocation || 'In Transit: Approaching delivery destination'}
                              </p>
                              <p className="text-[11px] text-[#55785C] mt-1">
                                Tracking No: <span className="font-mono font-bold">{currentOrder.trackingNumber || 'AGX-2026-88194'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="pt-1 flex items-center justify-between text-[11px] text-[#5D7762]">
                            <span>Estimated Arrival:</span>
                            <span className="font-bold text-[#1E562F]">{currentOrder.estimatedArrival || '15-20 mins away'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Visual Delivery Route Graphic */}
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F0F7F2] via-[#E8F3EB] to-[#F5F9F6] border border-[#CDE5D3] space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#144824] flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-700" />
                            <span>Live Route: Sunnyvale Farm (Batangas) → {currentOrder.customerAddress.split(',')[1] || 'Destination'}</span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#1E562F] bg-white/80 px-2.5 py-1 rounded-full border border-[#BDE0C7]">
                            Express Farm Corridor
                          </span>
                        </div>

                        {/* Route Progress Graphic */}
                        <div className="relative py-4 px-2">
                          <div className="h-2 w-full bg-[#D5E8D9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: currentOrder.fulfillmentStatus === 'Delivered' ? '100%' : '75%' }}
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-3 text-center">
                            <div className="space-y-1">
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[10px] font-bold text-[#144824]">Farm Packed</p>
                              <p className="text-[9px] text-[#5D7762]">Lipa, Batangas</p>
                            </div>

                            <div className="space-y-1">
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[10px] font-bold">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[10px] font-bold text-[#144824]">STAR / SLEX</p>
                              <p className="text-[9px] text-[#5D7762]">Dispatched</p>
                            </div>

                            <div className="space-y-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${currentOrder.fulfillmentStatus === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white ring-4 ring-emerald-200 animate-pulse'}`}>
                                <Truck className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[10px] font-bold text-[#144824]">Out for Delivery</p>
                              <p className="text-[9px] text-[#1E562F] font-bold">En Route</p>
                            </div>

                            <div className="space-y-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] font-bold ${currentOrder.isReceivedByUser ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                                {currentOrder.isReceivedByUser ? <Check className="w-3.5 h-3.5" /> : '4'}
                              </div>
                              <p className="text-[10px] font-bold text-[#144824]">Customer Received</p>
                              <p className="text-[9px] text-[#5D7762]">{currentOrder.isReceivedByUser ? 'Confirmed' : 'Pending'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5-Step Detailed Activity Log */}
                      <div className="space-y-3 pt-2">
                        <h4 className="font-extrabold text-xs text-[#144824] uppercase tracking-wider">Logistics Milestones & Checkpoints</h4>
                        <div className="space-y-2">
                          {(currentOrder.deliverySteps || []).map((st, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F8FAF8] border border-[#EBE4D8]">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${st.completed ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-slate-200 text-slate-500'}`}>
                                {st.completed ? <Check className="w-3.5 h-3.5" /> : (i + 1)}
                              </div>
                              <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-[#144824]">{st.title}</p>
                                  <span className="text-[10px] text-[#78967E] font-semibold">{st.timestamp}</span>
                                </div>
                                <p className="text-[11px] text-[#5D7762] mt-0.5">{st.location}</p>
                                {st.notes && (
                                  <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-50/80 p-1 rounded mt-1">
                                    {st.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tourist "Confirm Order Received" Action Button */}
                      <div className="pt-4 border-t border-black/5">
                        {currentOrder.isReceivedByUser ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
                            <p className="font-black text-sm text-emerald-900 flex items-center justify-center gap-2">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span>You have confirmed receipt of this order</span>
                            </p>
                            <p className="text-xs text-emerald-800">
                              Verified received on {currentOrder.receivedAt || 'Nov 19, 2026'}. Farm host Mang Juan has been notified of the successful delivery!
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-0.5 text-center sm:text-left">
                              <p className="font-bold text-xs text-amber-900">Have you received your fresh produce?</p>
                              <p className="text-[11px] text-amber-800">
                                Once the courier delivers your package, click the button to verify receipt and notify the farmer.
                              </p>
                            </div>
                            <button
                              onClick={() => handleConfirmOrderReceivedByUser(currentOrder.id)}
                              className="px-5 py-3 rounded-2xl bg-[#1E562F] hover:bg-[#144824] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition shrink-0"
                            >
                              <Check className="w-4 h-4 text-[#86EFAC]" />
                              <span>Confirm Order Received</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 6: MY BOOKINGS TABLE (Screenshot 836110931)                 */}
          {/* =============================================================== */}
          {activePage === 'my_bookings' && (
            <div className="p-8 md:p-12 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E562F]/10 text-[#1E562F] text-xs font-bold mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reservations & Schedule Management</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#144824] tracking-tight">
                    {userRole === 'farmer' ? 'Tourist Bookings & Gate Check-In' : 'My Bookings & Reservations'}
                  </h2>
                  <p className="text-xs text-[#5D7762] mt-1 font-medium">
                    {userRole === 'farmer'
                      ? 'Review incoming eco-tourists, inspect uploaded tourist IDs & receipts, assign farm guides, and check-in visitors at the farm gate.'
                      : 'View your official e-tickets, update tour schedules, verify 1-day attendance, or cancel bookings.'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {userRole === 'farmer' ? (
                    <>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 transition"
                        title="Print today's visitor manifest"
                      >
                        <Download className="w-4 h-4 text-[#15803D]" />
                        <span>Print Guest Manifest</span>
                      </button>
                      <button
                        onClick={() => setIsAddBookingModalOpen(true)}
                        className="px-4 py-2.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition"
                      >
                        <Plus className="w-4 h-4 text-[#86EFAC]" />
                        <span>Add Walk-in Tour</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActivePage('farm_detail')}
                      className="px-5 py-2.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition"
                    >
                      <Plus className="w-4 h-4 text-[#86EFAC]" />
                      <span>Book New Tour</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs & Quick Stats */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-sm">
                <div className="flex items-center gap-2">
                  {(['All', 'Confirmed', 'Pending', 'Cancelled'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBookingsFilter(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${bookingsFilter === tab ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#3E5C45] hover:bg-white/80'}`}
                    >
                      {tab} ({tab === 'All' ? bookings.length : bookings.filter(b => b.status === tab).length})
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#5D7762] px-2">
                  Showing {bookings.filter(b => bookingsFilter === 'All' || b.status === bookingsFilter).length} reservation(s)
                </span>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {bookings.filter(b => bookingsFilter === 'All' || b.status === bookingsFilter).length === 0 ? (
                  <div className="glass-panel p-12 text-center rounded-3xl border border-white/80 space-y-3">
                    <Calendar className="w-12 h-12 text-[#9FB6A4] mx-auto" />
                    <h4 className="text-base font-extrabold text-[#144824]">No bookings found</h4>
                    <p className="text-xs text-[#5D7762]">There are no reservations matching this filter.</p>
                  </div>
                ) : (
                  bookings
                    .filter(b => bookingsFilter === 'All' || b.status === bookingsFilter)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="glass-panel p-6 md:p-7 rounded-3xl border border-white/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col gap-5 bg-white/90"
                      >
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                          {/* Left Info */}
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#E8F5EC] text-[#1E562F] flex flex-col items-center justify-center shrink-0 border border-[#C6E6D0]">
                              <Calendar className="w-5 h-5 text-[#15803D]" />
                              <span className="text-[10px] font-black uppercase mt-0.5">{b.tourDate.split(' ')[0]}</span>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black bg-[#1E562F]/10 text-[#1E562F] px-2.5 py-0.5 rounded-lg">
                                  {b.bookingCode}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${b.status === 'Confirmed' ? 'bg-[#DCFCE7] text-[#15803D]' : b.status === 'Pending' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-red-100 text-red-700'}`}>
                                  {b.status}
                                </span>
                                {b.attendanceStatus && (
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.attendanceStatus === 'Arrived & Checked In' ? 'bg-purple-100 text-purple-800 border border-purple-300' : b.attendanceStatus === 'Confirmed Attending' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : b.attendanceStatus === 'Cancelled by Tourist' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'}`}>
                                    {b.attendanceStatus === 'Arrived & Checked In' ? 'Arrived & Checked In' : b.attendanceStatus === 'Confirmed Attending' ? 'Attending Confirmed' : b.attendanceStatus === 'Cancelled by Tourist' ? 'Tourist Cancelled' : '1-Day Confirmation Pending'}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-black text-lg text-[#144824] leading-snug">{b.farmName}</h4>
                              <p className="text-xs text-[#426349] font-medium">
                                Activity: <strong className="text-[#144824]">{b.activity}</strong>
                              </p>

                              {/* Date, Time, Tourist & Contact */}
                              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#5D7762] pt-1 border-t border-black/5">
                                <span className="flex items-center gap-1 font-semibold text-[#1E562F]">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {b.tourDate}
                                </span>
                                <span className="flex items-center gap-1 font-bold text-[#144824] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <Clock className="w-3.5 h-3.5 text-[#15803D]" />
                                  Time: {b.tourTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-[#5D7762]" />
                                  {b.participants} {b.participants === 1 ? 'person' : 'persons'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-[#5D7762]" />
                                  {b.customerName}
                                </span>
                                {b.customerPhone && (
                                  <span className="flex items-center gap-1 text-[11px] text-[#718875]">
                                    <PhoneCall className="w-3 h-3 text-[#15803D]" />
                                    {b.customerPhone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Payment & Action Buttons */}
                          <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end justify-between gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-[#EAE3D8]">
                            <div className="text-left xl:text-right">
                              <span className="text-[11px] text-[#718875] font-semibold block">Total Payment</span>
                              <span className="text-2xl font-black text-[#144824]">₱{b.totalAmount}</span>
                              <span className="text-[10px] text-[#15803D] block font-bold">Paid via {b.paymentMethod || 'GCash'}</span>
                            </div>

                            {/* Action Buttons: Clean, Neutral, Professional Styling */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Farmer Gate Check-In Function */}
                              {userRole === 'farmer' && b.status !== 'Cancelled' && (
                                b.attendanceStatus === 'Arrived & Checked In' ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[#144824] border border-slate-200 font-bold text-xs flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-[#1E562F]" />
                                    <span>Checked-in ({b.checkedInAt || '08:35 AM'})</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCheckInBooking(b.id)}
                                    className="px-3.5 py-2 rounded-xl bg-[#1E562F] hover:bg-[#144824] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                                    title="Mark visitor as checked in at the farm gate"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Gate Check-In</span>
                                  </button>
                                )
                              )}

                              {/* Tourist Online Ticket Pass - Prominently clickable */}
                              {userRole !== 'farmer' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBookingForTicket(b)}
                                  className="px-3.5 py-2 rounded-xl bg-[#1E562F] hover:bg-[#144824] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer active:scale-98"
                                  title="View and print official online tour ticket pass"
                                >
                                  <Ticket className="w-3.5 h-3.5 text-white" />
                                  <span>Online Ticket</span>
                                </button>
                              )}

                              {/* Print Tour Receipt */}
                              <button
                                type="button"
                                onClick={() => handlePrintTourReceipt(b)}
                                className="px-3 py-2 rounded-xl bg-white border border-[#D5DDD6] hover:bg-slate-50 text-[#144824] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                                title="Print official booking payment receipt"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#1E562F]" />
                                <span>Receipt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedBookingForView(b)}
                                className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDD6] hover:bg-slate-50 text-[#144824] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                                title="View booking ticket and full details"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#1E562F]" />
                                <span>{userRole === 'farmer' ? 'View Dossier' : 'View Voucher'}</span>
                              </button>

                              {b.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => setEditingBooking({ ...b })}
                                  className="px-3 py-2 rounded-xl bg-white border border-[#D5DDD6] hover:bg-slate-50 text-[#144824] text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                                  title="Update schedule or guests"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#1E562F]" />
                                  <span>Update</span>
                                </button>
                              )}

                              {b.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                  title="Cancel this reservation"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Cancel</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setDeletingBookingId(b.id)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                                title="Delete booking from history"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Farmer Special: Tourist Uploaded Details & Tour Guide Assignment Bar */}
                        {userRole === 'farmer' && (
                          <div className="pt-3 border-t border-[#EAE3D8] bg-[#F7FAF8] -mx-6 -mb-6 p-4 rounded-b-3xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">
                                Tourist Uploads:
                              </span>
                              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#D5DDD6] font-semibold text-[#144824]">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                                {b.uploadedIdDoc || 'Valid ID Document Verified'}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#D5DDD6] font-semibold text-[#144824]">
                                <CreditCard className="w-3.5 h-3.5 text-[#15803D]" />
                                {b.uploadedReceiptDoc || 'GCash E-Receipt Verified'}
                              </span>
                              {b.specialRequests && (
                                <span className="text-[11px] text-[#55785C] italic">
                                  "{b.specialRequests}"
                                </span>
                              )}
                            </div>

                            {/* Tour Guide Assignment Dropdown */}
                            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                              <span className="text-[11px] font-bold text-[#144824]">Assigned Guide:</span>
                              <select
                                value={b.assignedGuide || ''}
                                onChange={(e) => handleAssignGuide(b.id, e.target.value)}
                                className="px-2.5 py-1.5 bg-white border border-[#D5DDD6] rounded-xl text-xs font-semibold text-[#144824] shadow-xs focus:outline-none"
                              >
                                <option value="">Assign Tour Guide...</option>
                                <option value="Ate Rosa (Master Beekeeper)">Ate Rosa (Master Beekeeper)</option>
                                <option value="Kuya Dennis (Senior Pomologist)">Kuya Dennis (Senior Pomologist)</option>
                                <option value="Mang Rigor (Heritage Agro Guide)">Mang Rigor (Heritage Agro Guide)</option>
                                <option value="Kuya Elmer (Trail Captain)">Kuya Elmer (Trail Captain)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW: FARMER TOURIST PRODUCE ORDERS (Exclusive for Farmer)       */}
          {/* =============================================================== */}
          {activePage === 'farmer_orders' && (
            <div className="p-8 md:p-12 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E562F]/10 text-[#1E562F] text-xs font-bold mb-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Fulfillment & Packing Desk</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#144824] tracking-tight">
                    Tourist Produce Orders
                  </h2>
                  <p className="text-xs text-[#5D7762] mt-1 font-medium">
                    Review orders placed by tourists for Sunnyvale Farm produce, inspect uploaded GCash receipts, and manage packing & dispatch.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-[#15803D]" />
                    <span>Print Packing Slips</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/90 shadow-sm">
                <div className="flex items-center gap-2">
                  {(['All', 'Pending Packing', 'Dispatched', 'Delivered'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setOrdersFilter(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${ordersFilter === tab ? 'bg-[#1E562F] text-white shadow-sm' : 'text-[#3E5C45] hover:bg-white/80'}`}
                    >
                      {tab} ({tab === 'All' ? farmerOrders.length : farmerOrders.filter(o => o.fulfillmentStatus === tab).length})
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#5D7762] px-2">
                  Total Orders Value: ₱{farmerOrders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}
                </span>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {farmerOrders
                  .filter(o => ordersFilter === 'All' || o.fulfillmentStatus === ordersFilter)
                  .map(order => (
                    <div
                      key={order.id}
                      className="glass-panel p-6 md:p-7 rounded-3xl border border-white/90 shadow-md bg-white/90 space-y-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/5">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-black bg-[#1E562F] text-white px-3 py-1 rounded-lg">
                            #{order.orderNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${order.fulfillmentStatus === 'Delivered' ? 'bg-[#DCFCE7] text-[#15803D]' : order.fulfillmentStatus === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-[#FEF3C7] text-[#B45309]'}`}>
                            {order.fulfillmentStatus}
                          </span>
                          <span className="text-xs text-[#5D7762] font-semibold">{order.orderDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#718875]">Payment Status:</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>{order.paymentStatus}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                        {/* Customer Details */}
                        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2] space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#15803D]">Tourist Customer Details</p>
                          <p className="font-extrabold text-sm text-[#144824] flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#15803D]" />
                            {order.customerName}
                          </p>
                          <p className="text-[#4D6953] flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-[#15803D]" />
                            {order.customerPhone}
                          </p>
                          <p className="text-[#4D6953] flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                            <span>{order.customerAddress}</span>
                          </p>
                          {order.specialDeliveryNotes && (
                            <p className="text-[11px] bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 mt-1">
                              <strong>Delivery Note:</strong> {order.specialDeliveryNotes}
                            </p>
                          )}
                        </div>

                        {/* Produce Items Ordered */}
                        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2] space-y-2.5">
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#15803D]">Ordered Farm Produce</p>
                          <div className="space-y-1.5">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between py-1 border-b border-black/5 last:border-0">
                                <span className="font-semibold text-[#144824]">{it.productName} <span className="text-[#5D7762]">× {it.qty}</span></span>
                                <span className="font-black text-[#144824]">₱{it.qty * it.unitPrice}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                            <span className="font-bold text-[#144824]">Total Amount:</span>
                            <span className="text-base font-black text-[#1E562F]">₱{order.totalAmount}</span>
                          </div>
                        </div>

                        {/* Uploaded Receipt & Actions */}
                        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2] flex flex-col justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#15803D] mb-1">Tourist Uploaded Receipt</p>
                            <div
                              onClick={() => setSelectedOrderForView(order)}
                              className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#D5DDD6] cursor-pointer hover:bg-slate-50 transition"
                            >
                              <img src={order.uploadedReceiptUrl} alt="Receipt preview" className="w-12 h-12 rounded-lg object-cover border" />
                              <div className="truncate">
                                <p className="font-bold text-[#144824] truncate">GCash E-Receipt</p>
                                <p className="text-[10px] text-[#15803D] font-semibold">Click to inspect receipt →</p>
                              </div>
                            </div>
                          </div>

                          {/* Status Update Buttons */}
                          <div className="pt-2 border-t border-black/5 space-y-1.5">
                            <p className="text-[10px] font-bold text-[#5D7762]">Update Fulfillment Status:</p>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOrderStatusUpdate(order.id, 'Pending Packing')}
                                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer ${order.fulfillmentStatus === 'Pending Packing' ? 'bg-[#1E562F] text-white shadow-xs' : 'bg-white border border-[#D5DDD6] hover:bg-slate-50 text-slate-700'}`}
                              >
                                Packing
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOrderStatusUpdate(order.id, 'Dispatched')}
                                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer ${order.fulfillmentStatus === 'Dispatched' ? 'bg-[#1E562F] text-white shadow-xs' : 'bg-white border border-[#D5DDD6] hover:bg-slate-50 text-slate-700'}`}
                              >
                                Dispatch
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOrderStatusUpdate(order.id, 'Delivered')}
                                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer ${order.fulfillmentStatus === 'Delivered' ? 'bg-[#1E562F] text-white shadow-xs' : 'bg-white border border-[#D5DDD6] hover:bg-slate-50 text-slate-700'}`}
                              >
                                Delivered
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Real-Time Delivery & Tourist Receipt Status Bar */}
                      <div className="pt-3 border-t border-black/5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2]">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="text-xs truncate">
                            <p className="font-bold text-[#144824] truncate">
                              Courier: {order.courierName || 'AgriExpress Direct'} · {order.riderName || 'Kuya Jun-Jun Ramos'}
                            </p>
                            <p className="text-[11px] text-[#55785C] truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                              <span className="font-medium">{order.currentLocation || 'In Transit: Approaching delivery destination'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#F8FAF8] border border-[#E0EBE2]">
                          {order.isReceivedByUser ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div className="text-xs">
                                <p className="font-extrabold text-[#15803D]">Received by Tourist (Verified)</p>
                                <p className="text-[10px] text-emerald-700">{order.receivedAt || order.orderDate}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                              <div className="text-xs">
                                <p className="font-bold text-amber-800">Tourist Has Not Yet Received</p>
                                <p className="text-[10px] text-amber-700">{order.estimatedArrival || 'In Transit · Awaiting Handover'}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePrintOrderReceipt(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                              title="Print official receipt for this order"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#1E562F]" />
                              <span>Receipt</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderForTracking(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#1E562F] hover:bg-[#144824] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                            >
                              <Navigation className="w-3.5 h-3.5 text-[#86EFAC]" />
                              <span>Track Delivery</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW: FARMER PRODUCE CATALOG (Exclusive for Farmer)              */}
          {/* =============================================================== */}
          {activePage === 'farmer_products' && (
            <div className="p-8 md:p-12 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E562F]/10 text-[#1E562F] text-xs font-bold mb-2">
                    <Carrot className="w-3.5 h-3.5 text-orange-600" />
                    <span>Farm Produce Inventory</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#144824] tracking-tight">
                    My Produce Catalog
                  </h2>
                  <p className="text-xs text-[#5D7762] mt-1 font-medium">
                    Manage vegetables, fruits, and honey produced at Sunnyvale Farm. Add new harvests with photos and pricing.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-5 py-2.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4 text-[#86EFAC]" />
                  <span>List New Produce</span>
                </button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(p => p.farmOrigin.includes("Sunnyvale") || p.id <= 6)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="glass-panel p-5 rounded-3xl border border-white/90 shadow-md bg-white/90 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#144824]">
                            {product.category}
                          </span>
                          <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            In Stock ({product.stock})
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-[#144824]">{product.name}</h4>
                          <p className="text-xs text-[#5D7762] line-clamp-2 mt-0.5">{product.description}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#5D7762] block font-semibold">Farmer Price</span>
                          <span className="text-lg font-black text-[#15803D]">₱{product.price}</span>
                          <span className="text-xs text-[#5D7762] font-semibold">{product.unit}</span>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          Active Listing
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* WORKSPACE NOTICE: Prevent Farmer from seeing tourist interface   */}
          {/* =============================================================== */}
          {userRole === 'farmer' && ['farm_detail', 'fruit_picking', 'market', 'farmers_stories'].includes(activePage) && (
            <div className="p-8 md:p-12 w-full max-w-2xl mx-auto space-y-6 text-center animate-in fade-in duration-200 my-auto">
              <div className="glass-panel p-10 rounded-3xl border border-white/80 shadow-2xl space-y-5 bg-white/95">
                <div className="w-16 h-16 rounded-3xl bg-[#E8F3EB] text-[#1E562F] flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-[#15803D]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black text-[#144824]">Farmer Workspace Active</h3>
                  <p className="text-xs text-[#5D7762] leading-relaxed max-w-md mx-auto">
                    You are logged in as accredited farm host <strong>Juan Dela Cruz</strong>. Consumer tourist exploring pages are hidden to focus on your farm operations, tourist reservations, and produce orders.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActivePage('my_bookings')}
                    className="px-5 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl text-xs font-bold shadow-md transition"
                  >
                    View Tourist Bookings & Check-In →
                  </button>
                  <button
                    onClick={() => setActivePage('farmer_orders')}
                    className="px-5 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-50 text-[#144824] rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    View Tourist Orders →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 7: DESKTOP CATALOG WORKSPACE (Picture & Description Only)  */}
          {/* =============================================================== */}
          {activePage === 'home' && (
            <div className="w-full p-6 md:p-8 space-y-8 animate-in fade-in duration-300">

              {/* Compact Desktop Workspace Toolbar (No Website Hero Banner) */}
              <div className="glass-panel rounded-2xl p-5 border border-white/80 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#144824] tracking-tight">
                    AgriTourism Desktop Catalog
                  </h2>
                  <p className="text-xs text-[#5D7762] mt-0.5">
                    Browse farm destinations, local farm products, and fruit orchards (Picture &amp; Description View)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Category Filter Tabs */}
                  <div className="flex items-center bg-[#F3F6F3] p-1 rounded-xl border border-[#D5DDD6]">
                    {([
                      { id: 'all', label: 'All' },
                      { id: 'places', label: 'Destinations' },
                      { id: 'products', label: 'Products' },
                      { id: 'orchards', label: 'Orchards' },
                    ] as const).map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setOpeningShowcaseCategory(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          openingShowcaseCategory === tab.id
                            ? 'bg-[#1E562F] text-white shadow-xs'
                            : 'text-[#325238] hover:text-[#144824]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Compact Desktop Search Input */}
                  <div className="flex items-center bg-white rounded-xl border border-[#D5DDD6] px-3 py-1.5 shadow-2xs w-full sm:w-64">
                    <Search className="w-4 h-4 text-[#5D7762] shrink-0" />
                    <input
                      type="text"
                      placeholder="Filter farms or products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2 py-0.5 text-xs font-medium text-[#144824] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-[11px] font-bold text-[#5D7762] hover:text-[#144824] cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: AGRI-TOURISM FARM DESTINATIONS (Picture & Description Only) */}
              {(openingShowcaseCategory === 'all' || openingShowcaseCategory === 'places') && (
              <div id="opening-showcase" className="space-y-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#144824]">Farm Destinations</h3>
                  <p className="text-xs text-[#5D7762]">Sustainable agro-estates and eco-sanctuaries across the Philippines</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TOURS_DATA.filter(t =>
                    !searchQuery.trim() ||
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((tour) => (
                    <div
                      key={tour.id}
                      className="group relative bg-[#FDFBF7]/95 rounded-2xl overflow-hidden border border-[#EBE4D5] shadow-md flex flex-col"
                    >
                      <div className="relative h-56 w-full overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={tour.imageUrl}
                          alt={tour.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white text-[#144824] text-[11px] font-black shadow-sm">
                          {tour.location}
                        </div>
                      </div>

                      <div className="p-5 space-y-2 bg-[#FAF8F5]/95 border-t border-[#EDE7DB] flex-1">
                        <h4 className="font-extrabold text-sm text-[#144824] leading-snug">{tour.name}</h4>
                        <p className="text-xs text-[#395640] leading-relaxed">
                          {tour.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* SECTION: FRESH FARM PRODUCE & HARVESTS (Picture & Description Only) */}
              {(openingShowcaseCategory === 'all' || openingShowcaseCategory === 'products') && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#144824]">Fresh Produce from Local Farms</h3>
                  <p className="text-xs text-[#5D7762]">Naturally cultivated organic crops and artisanal agricultural products</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {products.filter(p =>
                    !searchQuery.trim() ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.farmOrigin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((p) => (
                    <div key={p.id} className="glass-panel rounded-2xl p-4 border border-white/80 shadow-sm flex flex-col">
                      <div className="space-y-3">
                        <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100">
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="space-y-1.5">
                          <div>
                            <p className="font-extrabold text-sm text-[#144824] leading-snug">{p.name}</p>
                            <p className="text-[11px] text-[#5D7762] font-semibold mt-0.5">{p.farmOrigin}</p>
                          </div>
                          <p className="text-xs text-[#3E5C45] leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* SECTION: FRUIT PICKING ORCHARDS SHOWCASE (Picture & Description Only) */}
              {(openingShowcaseCategory === 'all' || openingShowcaseCategory === 'orchards') && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#144824]">Tree-to-Basket Fruit Orchards</h3>
                  <p className="text-xs text-[#5D7762]">Lush Philippine fruit orchards for seasonal harvesting</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {FRUIT_PICKING_DATA.filter(o =>
                    !searchQuery.trim() ||
                    o.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.fruitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((orchard) => (
                    <div
                      key={orchard.id}
                      className="group relative bg-[#FDFBF7]/95 rounded-2xl overflow-hidden border border-[#EBE4D5] shadow-md flex flex-col"
                    >
                      <div className="relative h-52 w-full overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={orchard.imageUrl}
                          alt={orchard.farmName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white text-[#144824] text-[11px] font-black shadow-sm">
                          {orchard.fruitName || orchard.title}
                        </div>
                      </div>

                      <div className="p-5 space-y-2 bg-[#FAF8F5]/95 border-t border-[#EDE7DB] flex-1">
                        <h4 className="font-extrabold text-sm text-[#144824] leading-snug">{orchard.farmName}</h4>
                        <p className="text-[11px] text-[#5D7762] font-semibold">{orchard.location}</p>
                        <p className="text-xs text-[#395640] leading-relaxed">
                          {orchard.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW 8: SIGN UP PAGE (Mang Rigor Rodriguez - Screenshot 122529)   */}
          {/* =============================================================== */}
          {activePage === 'signup' && (
            <div className="p-8 md:p-12 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/80 shadow-2xl grid grid-cols-1 md:grid-cols-2 min-h-[580px]">

                {/* LEFT: Clean Auto-Sliding Farm Photo Showcase (Clean, Unobstructed Pictures) */}
                <div className="relative overflow-hidden bg-slate-950 min-h-[560px] flex flex-col justify-between p-6">
                  {/* Auto-sliding farm photographs with gentle crossfade */}
                  {FARMERS_COMMUNITY_DATA.map((farmer, idx) => (
                    <div
                      key={`slide-img-signup-${farmer.id}`}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === currentFarmerStorySlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={farmer.farmBannerUrl}
                        alt={farmer.farmName}
                        className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.05]"
                      />
                      {/* Subtle gradient vignette at top and bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                    </div>
                  ))}

                  {/* Top Minimal Branding Tag */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold tracking-wide">AgriTourism Philippines</span>
                    </div>
                  </div>

                  {/* Bottom Minimal Slide Indicators (Clean Dots) */}
                  <div className="relative z-10 flex items-center justify-center gap-2 pb-2">
                    {FARMERS_COMMUNITY_DATA.map((_, idx) => (
                      <div
                        key={`dot-signup-${idx}`}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === currentFarmerStorySlide ? 'w-8 bg-white shadow-sm' : 'w-2 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* RIGHT: Create Your Account Form */}
                <div className="p-10 md:p-12 flex flex-col justify-between space-y-6 bg-white/90">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-[#15803D]" />
                      <span className="font-black text-sm text-[#144824]">AgriTourism Philippines</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-[#144824]">Create Your Account</h3>
                    <p className="text-xs text-[#5D7762]">Join our community and support local farmers!</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsLoggedIn(true);
                      void javaBackend.signup('Maria Santos', 'maria.santos@gmail.com', '+63 917 555 0192', userRole);
                      showToast("Account created successfully! Welcome to AgriTourism.");
                      setActivePage('dashboard');
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        defaultValue="Maria Santos"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        defaultValue="maria.santos@gmail.com"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        defaultValue="+63 917 555 0192"
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="password"
                        placeholder="Password"
                        defaultValue="••••••••"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        defaultValue="••••••••"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#144824]">Select Role</label>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none font-semibold"
                      >
                        <option value="user">Tourist (Book Tours & Buy Fruits)</option>
                        <option value="farmer">Farmer (Manage Farm & List Produce)</option>
                        <option value="admin">Administrator (Platform Overview)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-xs shadow-md transition"
                    >
                      Sign Up
                    </button>
                  </form>

                  <div className="text-center text-xs text-[#5D7762]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActivePage('login')}
                      className="font-bold text-[#15803D] hover:underline"
                    >
                      Login
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW: DEDICATED LOG IN PAGE (Matching Filipino Farm Aesthetic)    */}
          {/* =============================================================== */}
          {activePage === 'login' && (
            <div className="p-8 md:p-12 w-full max-w-5xl mx-auto animate-in fade-in duration-300">
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/80 shadow-2xl grid grid-cols-1 md:grid-cols-2 min-h-[580px]">

                {/* LEFT: Clean Auto-Sliding Farm Photo Showcase (Clean, Unobstructed Pictures) */}
                <div className="relative overflow-hidden bg-slate-950 min-h-[560px] flex flex-col justify-between p-6">
                  {/* Auto-sliding farm photographs with gentle crossfade */}
                  {FARMERS_COMMUNITY_DATA.map((farmer, idx) => (
                    <div
                      key={`slide-img-login-${farmer.id}`}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === currentFarmerStorySlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={farmer.farmBannerUrl}
                        alt={farmer.farmName}
                        className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.05]"
                      />
                      {/* Subtle gradient vignette at top and bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                    </div>
                  ))}

                  {/* Top Minimal Branding Tag */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold tracking-wide">AgriTourism Philippines</span>
                    </div>
                  </div>

                  {/* Bottom Minimal Slide Indicators (Clean Dots) */}
                  <div className="relative z-10 flex items-center justify-center gap-2 pb-2">
                    {FARMERS_COMMUNITY_DATA.map((_, idx) => (
                      <div
                        key={`dot-login-${idx}`}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === currentFarmerStorySlide ? 'w-8 bg-white shadow-sm' : 'w-2 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* RIGHT: Log In to Your Account */}
                <div className="p-10 md:p-12 flex flex-col justify-between space-y-6 bg-white/95">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-[#15803D]" />
                      <span className="font-black text-sm text-[#144824]">AgriTourism Philippines</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-[#144824]">Welcome Back</h3>
                    <p className="text-xs text-[#5D7762]">Log in to manage bookings, harvest produce, or book farm tours</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsLoggedIn(true);
                      setUserRole(loginRoleSelect);
                      void javaBackend.login(loginEmail, loginRoleSelect);
                      showToast(`Welcome back! Logged in as ${loginRoleSelect.toUpperCase()}.`);
                      setActivePage(loginRoleSelect === 'farmer' ? 'farmer_profile' : 'dashboard');
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#144824]">Email Address</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@email.com"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none focus:ring-2 focus:ring-[#1E562F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#144824]">Password</label>
                        <span className="text-[10px] text-[#15803D] hover:underline cursor-pointer">Forgot?</span>
                      </div>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none focus:ring-2 focus:ring-[#1E562F]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#144824]">Log in as:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { role: 'user' as const, label: 'Tourist', icon: Compass },
                          { role: 'farmer' as const, label: 'Farmer', icon: Sprout },
                          { role: 'admin' as const, label: 'Admin', icon: ShieldCheck }
                        ].map((r) => (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => {
                              setLoginRoleSelect(r.role);
                              if (r.role === 'farmer') setLoginEmail('juan.delacruz@sunnyvalefarm.ph');
                              else if (r.role === 'admin') setLoginEmail('admin@agritourism.ph');
                              else setLoginEmail('maria.santos@gmail.com');
                            }}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${loginRoleSelect === r.role ? 'bg-[#1E562F] text-white border-[#1E562F] shadow-sm' : 'bg-white/80 border-[#D5DDD6] text-[#2C4831] hover:bg-emerald-50'}`}
                          >
                            <r.icon className="w-3.5 h-3.5" />
                            <span>{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In to Dashboard</span>
                    </button>
                  </form>

                  <div className="pt-2 border-t border-[#EAE3D8] text-center text-xs text-[#5D7762]">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setActivePage('signup')}
                      className="font-bold text-[#15803D] hover:underline"
                    >
                      Create Account
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* VIEW: FARMER OVERALL PROFILE (Mang Juan Dela Cruz - Sunnyvale)    */}
          {/* =============================================================== */}
          {activePage === 'farmer_profile' && (
            <div className="p-6 md:p-10 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              
              {/* Farmer Banner & Bio */}
              <div className="glass-panel rounded-3xl overflow-hidden border border-white/80 shadow-2xl relative">
                <div className="relative h-56 md:h-64 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={getHtmlImage("farmerProfileBanner", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80")}
                    alt="Sunnyvale Farm Landscape"
                    className="w-full h-full object-cover filter brightness-[0.85]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#14532D] shadow-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      DA-ATI Accredited Farm #PH-2024-91
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex items-end gap-5">
                    <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white shrink-0">
                      <img
                        src={APP_CONFIG.juanAvatar}
                        alt="Juan Dela Cruz"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl md:text-3xl font-black text-[#144824]">Juan Dela Cruz</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D1EBD8] text-[#1E562F]">
                          Master Farmer
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1E562F] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Sunnyvale Heritage Farm · Bauan, Batangas
                      </p>
                      <p className="text-xs text-[#5D7762] max-w-xl">
                        3rd generation family agro-farm specializing in organic heirloom vegetables, carabao mango orchards, and immersive eco-tours.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="px-5 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Farm Product with Photo</span>
                    </button>
                    <button
                      onClick={() => setIsAddBookingModalOpen(true)}
                      className="px-5 py-3 bg-white text-[#144824] border border-[#D5DDD6] hover:bg-emerald-50 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 transition"
                    >
                      <Calendar className="w-4 h-4 text-[#1E562F]" />
                      <span>New Tour Reservation</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Farmer Quick Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tourist Rating", val: "4.9 / 5.0", sub: "145 verified reviews", icon: Star, color: "text-amber-500" },
                  { label: "Listed Products", val: `${products.length} Items`, sub: "Fresh organic produce", icon: Sprout, color: "text-emerald-600" },
                  { label: "Active Tours", val: `${TOURS_DATA.length} Tours`, sub: "Agro-trail & Fruit Picking", icon: Compass, color: "text-blue-600" },
                  { label: "Tour Bookings", val: `${bookings.length} Bookings`, sub: "₱148,200 revenue", icon: Award, color: "text-purple-600" }
                ].map((st, i) => (
                  <div key={i} className="glass-panel p-5 rounded-3xl border border-white/80 shadow-md flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/90 border border-[#EAE3D8] flex items-center justify-center shrink-0">
                      <st.icon className={`w-6 h-6 ${st.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#5D7762] font-semibold">{st.label}</p>
                      <p className="text-xl font-black text-[#144824]">{st.val}</p>
                      <p className="text-[10px] text-[#78967E]">{st.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 1: FARMER'S TOUR OFFERINGS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#144824]">Farmer's Tour & Fruit Picking Experiences</h3>
                    <p className="text-xs text-[#5D7762]">Direct booking schedules operated at Sunnyvale Farm</p>
                  </div>
                  <button
                    onClick={() => setIsAddBookingModalOpen(true)}
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-[#144824] rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Tour Booking</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {TOURS_DATA.slice(0, 3).map((tour) => (
                    <div key={tour.id} className="glass-panel rounded-3xl overflow-hidden border border-white/80 shadow-lg flex flex-col justify-between">
                      <div className="relative h-44 w-full bg-slate-200">
                        <img src={tour.imageUrl} alt={tour.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#144824] text-[11px] font-black shadow-sm">
                          {tour.location}
                        </span>
                      </div>
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{tour.highlightTag}</span>
                            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {tour.rating}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-[#144824] mt-1">{tour.name}</h4>
                          <p className="text-[11px] text-[#55785C] line-clamp-2 mt-1">{tour.description}</p>
                        </div>
                        <div className="pt-3 border-t border-[#EAE3D8] flex items-center justify-between">
                          <span className="font-black text-sm text-[#144824]">₱{tour.pricePerPerson} <span className="text-[10px] font-normal text-[#5D7762]">/guest</span></span>
                          <button
                            onClick={() => {
                              setSelectedTour(tour);
                              setIsTourModalOpen(true);
                            }}
                            className="px-4 py-1.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl text-xs font-bold transition"
                          >
                            Book & Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2: FARM HARVEST PRODUCE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#144824]">Harvest Catalog & Available Produce</h3>
                    <p className="text-xs text-[#5D7762]">Fresh vegetables, fruits, and processed farm goods</p>
                  </div>
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-4 py-2 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Farm Product</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.slice(0, 8).map((prod) => (
                    <div key={prod.id} className="glass-panel rounded-2xl overflow-hidden border border-white/80 shadow-sm p-3.5 space-y-2.5 flex flex-col justify-between">
                      <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100">
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 text-[#144824] text-[10px] font-bold">
                          {prod.category}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-[#144824] truncate">{prod.name}</h4>
                        <p className="text-[10px] text-[#5D7762] truncate">{prod.farmOrigin}</p>
                        <p className="text-xs font-black text-[#15803D]">
                          ₱{prod.price} <span className="text-[10px] font-normal text-[#5D7762]">{prod.unit}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(prod)}
                        className="w-full py-1.5 bg-[#EAF5ED] hover:bg-[#1E562F] hover:text-white text-[#1E562F] rounded-xl text-[11px] font-bold transition"
                      >
                        + Add to Basket
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: FARM STORY & ACCREDITATION */}
              <div className="glass-panel rounded-3xl p-8 border border-white/80 shadow-lg space-y-4">
                <h3 className="text-lg font-black text-[#144824]">About Sunnyvale Heritage Farm</h3>
                <p className="text-xs text-[#3E5C43] leading-relaxed">
                  Located at the foot of Mount Maculot in Bauan, Batangas, Sunnyvale Farm was established in 1984 as a small coffee and fruit orchard. Today, under Mang Juan Dela Cruz, the farm employs 24 local agrarian families, utilizing strict regenerative farming, rainwater harvesting, and vermiculture. Our tours directly educate visitors on Philippine agro-heritage and sustainable food systems.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white/80 border border-[#EAE3D8] space-y-1">
                    <p className="font-bold text-xs text-[#144824]">Certification</p>
                    <p className="text-[11px] text-[#5D7762]">DA-ATI Certified Good Agricultural Practices (GAP)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-[#EAE3D8] space-y-1">
                    <p className="font-bold text-xs text-[#144824]">Direct Farm Tours</p>
                    <p className="text-[11px] text-[#5D7762]">Tuesdays to Sundays · 7:00 AM - 5:00 PM</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-[#EAE3D8] space-y-1">
                    <p className="font-bold text-xs text-[#144824]">Contact & Inquiries</p>
                    <p className="text-[11px] text-[#5D7762]">+63 917 555 0192 · juan.delacruz@sunnyvalefarm.ph</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: ADD PRODUCT FORM FOR FARMERS (Screenshot 833763230)       */}
      {/* =================================================================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl glass-panel rounded-3xl p-8 border border-white/90 shadow-2xl space-y-6 my-6 bg-[#FAF8F5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div>
                <h3 className="font-extrabold text-xl text-[#144824]">Add Farm Product with Photo</h3>
                <p className="text-xs text-[#5D7762]">Publish organic harvest with picture to the local marketplace</p>
              </div>
              <button onClick={() => setIsAddProductModalOpen(false)}>
                <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Product Photo Selector / Upload */}
              <div className="space-y-2 p-4 rounded-2xl bg-white/80 border border-[#D5DDD6]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#144824] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#1E562F]" />
                    <span>Product Photo</span>
                  </label>
                  <span className="text-[10px] text-[#5D7762]">JPG, PNG or presets</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1E562F]/30 bg-slate-100 shrink-0 shadow-xs">
                    <img
                      src={newProductImage}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#144824] border border-[#BDE0C7] rounded-xl text-xs font-bold transition">
                      <Upload className="w-3.5 h-3.5 text-[#1E562F]" />
                      <span>Upload Picture from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                const rawDataUrl = reader.result;
                                const img = new Image();
                                img.onload = () => {
                                  const maxWidth = 640;
                                  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                                  const canvas = document.createElement('canvas');
                                  canvas.width = Math.round(img.width * scale);
                                  canvas.height = Math.round(img.height * scale);
                                  const ctx = canvas.getContext('2d');
                                  if (ctx) {
                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                    setNewProductImage(canvas.toDataURL('image/jpeg', 0.82));
                                  } else {
                                    setNewProductImage(rawDataUrl);
                                  }
                                  showToast("Photo uploaded & saved for offline catalog!");
                                };
                                img.onerror = () => {
                                  setNewProductImage(rawDataUrl);
                                  showToast("Photo uploaded successfully!");
                                };
                                img.src = rawDataUrl;
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-[#718875]">Or choose fresh harvest preset:</p>
                  </div>
                </div>

                {/* Preset Photo Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "Carabao Mango", url: getHtmlImage("presetMangoImage", "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80") },
                    { label: "Organic Tomatoes", url: getHtmlImage("presetTomatoImage", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80") },
                    { label: "Sweet Papaya", url: getHtmlImage("presetPapayaImage", "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=600&q=80") },
                    { label: "Strawberries", url: getHtmlImage("presetStrawberryImage", "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80") },
                    { label: "Wild Honey", url: getHtmlImage("presetHoneyImage", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80") },
                    { label: "Fresh Eggplant", url: getHtmlImage("presetEggplantImage", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80") }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setNewProductImage(chip.url);
                        showToast(`Selected "${chip.label}" photo!`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${newProductImage === chip.url ? 'bg-[#1E562F] text-white border-[#1E562F]' : 'bg-white text-[#2C4831] border-[#D5DDD6] hover:bg-slate-50'}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#144824]">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Carabao Mangoes"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Category</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Price (₱)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Packaging Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. /kg, /bundle, /tray"
                    value={newProductQty}
                    onChange={(e) => setNewProductQty(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#144824] flex items-center justify-between">
                    <span>Stock Limit (Max Inventory)</span>
                    <span className="text-[10px] text-[#55785C]">Tourist Limit</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    required
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#144824]">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe freshness, harvest method, origin..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-xs shadow-md transition"
              >
                Save Product & Publish with Photo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: FARMER TOUR BOOKING CREATION (Walk-in / Phone Reservation)   */}
      {/* =================================================================== */}
      {isAddBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/90 shadow-2xl space-y-6 my-6 bg-[#FAF8F5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div>
                <h3 className="font-extrabold text-xl text-[#144824]">Create Tour Booking</h3>
                <p className="text-xs text-[#5D7762]">Farmer manual booking for walk-in tourists or phone reservations</p>
              </div>
              <button onClick={() => setIsAddBookingModalOpen(false)}>
                <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveFarmerBooking} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#144824]">Guest / Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anna Addyson"
                  value={newBookingCustomer}
                  onChange={(e) => setNewBookingCustomer(e.target.value)}
                  required
                  className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="+63 918 333 4455"
                    value={newBookingPhone}
                    onChange={(e) => setNewBookingPhone(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Select Tour</label>
                  <select
                    value={newBookingActivity}
                    onChange={(e) => {
                      setNewBookingActivity(e.target.value);
                      const t = TOURS_DATA.find(x => x.name === e.target.value) || TOURS_DATA[0];
                      setNewBookingAmount(t.pricePerPerson * newBookingGuests);
                    }}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  >
                    {TOURS_DATA.map((t) => (
                      <option key={t.id} value={t.name}>{t.name} (₱{t.pricePerPerson}/pax)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Tour Schedule Date</label>
                  <input
                    type="date"
                    value={newBookingDate}
                    onChange={(e) => setNewBookingDate(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#144824]">Time Slot</label>
                  <select
                    value={newBookingTime}
                    onChange={(e) => setNewBookingTime(e.target.value)}
                    className="w-full p-3 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] focus:outline-none"
                  >
                    <option value="08:00 AM - Morning Agro-Walk">08:00 AM - Morning Agro-Walk</option>
                    <option value="10:30 AM - Canopy & Cacao Trail">10:30 AM - Canopy & Cacao Trail</option>
                    <option value="02:00 PM - Afternoon Farm Experience">02:00 PM - Afternoon Farm Experience</option>
                    <option value="04:00 PM - Sunset Overlook">04:00 PM - Sunset Overlook</option>
                  </select>
                </div>
              </div>

              {/* Number of Guests & Total Computation */}
              <div className="p-4 rounded-2xl bg-white/90 border border-[#D5DDD6] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#144824]">Number of Guests / Pax</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextG = Math.max(1, newBookingGuests - 1);
                        setNewBookingGuests(nextG);
                        const t = TOURS_DATA.find(x => x.name === newBookingActivity) || TOURS_DATA[0];
                        setNewBookingAmount(t.pricePerPerson * nextG);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-black text-sm px-2 text-[#144824]">{newBookingGuests}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextG = newBookingGuests + 1;
                        setNewBookingGuests(nextG);
                        const t = TOURS_DATA.find(x => x.name === newBookingActivity) || TOURS_DATA[0];
                        setNewBookingAmount(t.pricePerPerson * nextG);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EAE3D8]">
                  <span className="text-xs font-semibold text-[#5D7762]">Calculated Total Payment</span>
                  <span className="text-base font-black text-[#1E562F]">
                    ₱{((TOURS_DATA.find(x => x.name === newBookingActivity)?.pricePerPerson || 200) * newBookingGuests).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#144824]">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GCash', 'Maya', 'Cash on Arrival'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewBookingPayment(m)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${newBookingPayment === m ? 'bg-[#1E562F] text-white border-[#1E562F]' : 'bg-white text-[#2C4831] border-[#D5DDD6]'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-xs shadow-md transition"
              >
                Confirm & Record Tour Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: USER / FARMER / ADMIN PROFILE MODAL                        */}
      {/* =================================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/90 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <h3 className="font-extrabold text-lg text-[#144824]">Profile Information</h3>
              <button onClick={() => setIsProfileModalOpen(false)}>
                <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4 border-white shadow-md">
                <img
                  src={userRole === 'admin' ? APP_CONFIG.adminAvatar : userRole === 'farmer' ? APP_CONFIG.juanAvatar : APP_CONFIG.mariaAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-[#144824]">
                  {userRole === 'admin' ? 'Administrator' : userRole === 'farmer' ? 'Juan Dela Cruz' : 'Maria Santos'}
                </h4>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D1EBD8] text-[#1E562F] capitalize">
                  {userRole} Account
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-[#EAE3D8]">
              <div className="pt-2 flex justify-between">
                <span className="text-[#5D7762]">Email Address</span>
                <span className="font-bold text-[#144824]">
                  {userRole === 'admin' ? 'admin@agritourism.ph' : userRole === 'farmer' ? 'juan.delacruz@sunnyvalefarm.ph' : 'maria.santos@gmail.com'}
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#5D7762]">Contact Phone</span>
                <span className="font-bold text-[#144824]">+63 917 555 0192</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#5D7762]">Location</span>
                <span className="font-bold text-[#144824]">Batangas & Metro Manila, Philippines</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                showToast("Profile settings updated!");
              }}
              className="w-full py-3 bg-[#1E562F] text-white rounded-2xl font-bold text-xs shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TOUR DETAIL & RESERVATION (Screenshot 124629)               */}
      {/* =================================================================== */}
      {isTourModalOpen && selectedTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl glass-panel rounded-[32px] overflow-hidden border border-white/90 shadow-2xl my-8 bg-[#FAF8F5] max-h-[90vh] flex flex-col">
            {/* Hero Image */}
            <div className="relative h-72 md:h-80 w-full overflow-hidden bg-slate-200 shrink-0">
              <img
                src={selectedTour.imageUrl}
                alt={selectedTour.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsTourModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white text-[#144824] text-xs font-black shadow-md">
                {selectedTour.location}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#144824]">{selectedTour.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5D7762] mt-1.5">
                    <span className="flex items-center gap-1 text-[#1E562F] font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedTour.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {selectedTour.rating} ({selectedTour.reviewsCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="px-3 py-0.5 rounded-full bg-[#D1EBD8] text-[#1E562F] font-bold">
                      {selectedTour.highlightTag}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-black text-[#144824]">₱{selectedTour.pricePerPerson}</span>
                  <span className="text-xs text-[#5D7762] font-semibold pl-1">/person</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-[#EAE3D8] pt-4">
                <p className="text-xs text-[#3E5C43] leading-relaxed font-medium">
                  {selectedTour.description}
                </p>
              </div>

              {/* Operating Hours, Amenities & Activities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#EAE3D8]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5EC] text-[#1E562F] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#144824]">Operating Hours</p>
                    <p className="text-[#5D7762] mt-0.5">{selectedTour.operatingHours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5EC] text-[#1E562F] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#144824]">Amenities</p>
                    <p className="text-[#5D7762] mt-0.5">{selectedTour.amenities.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5EC] text-[#1E562F] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#144824]">Activities</p>
                    <p className="text-[#5D7762] mt-0.5">{selectedTour.activities.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              <div className="space-y-2 border-t border-[#EAE3D8] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#144824]">Tour Gallery Photo Highlights</span>
                  <span className="text-[11px] text-[#1E562F] font-bold">4 Photos</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {selectedTour.thumbnails.map((imgUrl, i) => (
                    <div key={i} className="h-24 rounded-2xl overflow-hidden bg-slate-200 border border-white/80 shadow-sm">
                      <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition" />
                    </div>
                  ))}
                </div>
              </div>

              {/* TOUR RESERVATION CONTROLS (Date, Time, Guests, Payment) */}
              <div className="p-5 rounded-2xl bg-[#F2F7F3] border border-[#C5DEC9] space-y-4">
                <h4 className="text-sm font-black text-[#144824] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1E562F]" />
                  <span>Customize Your Tour Booking</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Schedule Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#144824]">Tour Schedule Date</label>
                    <input
                      type="date"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] font-semibold focus:outline-none"
                    />
                  </div>

                  {/* Select Time Slot */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#144824]">Select Time Slot</label>
                    <select
                      value={tourTime}
                      onChange={(e) => setTourTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] font-semibold focus:outline-none"
                    >
                      <option value="08:00 AM - Morning Agro-Walk">08:00 AM - Morning Agro-Walk</option>
                      <option value="10:30 AM - Canopy & Cacao Trail">10:30 AM - Canopy & Cacao Trail</option>
                      <option value="02:00 PM - Afternoon Farm Experience">02:00 PM - Afternoon Farm Experience</option>
                      <option value="04:00 PM - Sunset Overlook">04:00 PM - Sunset Overlook</option>
                    </select>
                  </div>
                </div>

                {/* Number of Persons / Guests with [-] and [+] Counter */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#D5DDD6]">
                  <div>
                    <label className="text-xs font-bold text-[#144824]">Number of Persons / Guests</label>
                    <p className="text-[10px] text-[#5D7762]">Family and group passes automatically adjusted</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTourGuests(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E562F] hover:text-white flex items-center justify-center font-bold text-sm transition"
                    >
                      -
                    </button>
                    <span className="font-black text-sm px-3 text-[#144824]">{tourGuests} Pax</span>
                    <button
                      type="button"
                      onClick={() => setTourGuests(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E562F] hover:text-white flex items-center justify-center font-bold text-sm transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tour Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#144824]">Select Tour Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['GCash', 'Maya', 'Bank Transfer', 'Pay at Farm'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setTourPaymentMethod(method)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${tourPaymentMethod === method ? 'bg-[#1E562F] text-white border-[#1E562F] shadow-xs' : 'bg-white text-[#2C4831] border-[#D5DDD6] hover:bg-emerald-50'}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Automatic Computation (Never Zero!) */}
                <div className="pt-3 border-t border-[#C5DEC9] flex items-center justify-between">
                  <div className="text-xs text-[#5D7762]">
                    <span>₱{selectedTour.pricePerPerson} × {tourGuests} {tourGuests === 1 ? 'person' : 'persons'}</span>
                    <span className="block text-[10px] text-[#1E562F] font-semibold">Payment via {tourPaymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#5D7762] block font-medium">Automatic Total Calculation:</span>
                    <span className="text-2xl font-black text-[#1E562F]">
                      ₱{(selectedTour.pricePerPerson * tourGuests).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    showToast("Please log in using the Log In button at the top header to confirm your booking.");
                    return;
                  }
                  const calculatedTotal = selectedTour.pricePerPerson * tourGuests;
                  const newBooking: Booking = {
                    id: Date.now(),
                    bookingCode: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
                    farmId: selectedTour.id,
                    farmName: selectedTour.name,
                    customerName: "Maria Santos",
                    customerPhone: "+63 917 555 0192",
                    customerEmail: "maria.santos@gmail.com",
                    activity: selectedTour.name,
                    tourDate: tourDate,
                    tourTime: tourTime || "09:00 AM",
                    participants: tourGuests,
                    totalAmount: calculatedTotal,
                    paymentMethod: "GCash",
                    status: "Confirmed",
                    assignedGuide: selectedTour.farmerName ? `${selectedTour.farmerName} (Farm Host & Guide)` : "Ate Rosa (Master Guide)"
                  };
                  setBookings(prev => [newBooking, ...prev]);
                  void javaBackend.createBooking({
                    id: newBooking.id,
                    bookingCode: newBooking.bookingCode,
                    customerName: newBooking.customerName,
                    farmName: newBooking.farmName,
                    activity: newBooking.activity,
                    tourDate: newBooking.tourDate,
                    participants: newBooking.participants,
                    totalAmount: newBooking.totalAmount,
                    status: newBooking.status,
                  });
                  setIsTourModalOpen(false);
                  setSelectedBookingForTicket(newBooking);
                  showToast(`Tour Confirmed! Your official Online Ticket Pass is ready below.`);
                  setActivePage('my_bookings');
                }}
                className="w-full py-4 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
              >
                <span>Confirm Tour Booking & Pay · ₱{(selectedTour.pricePerPerson * tourGuests).toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: FRUIT PICKING RESERVATION (Screenshot 124640)               */}
      {/* =================================================================== */}
      {isFruitModalOpen && selectedFruitPicking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-panel rounded-[32px] overflow-hidden border border-white/90 shadow-2xl my-8 bg-[#FAF8F5] max-h-[90vh] flex flex-col">
            {/* Photo Header */}
            <div className="relative h-64 w-full overflow-hidden bg-slate-200 shrink-0">
              <img
                src={selectedFruitPicking.imageUrl}
                alt={selectedFruitPicking.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsFruitModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white text-[#144824] text-xs font-black shadow-md">
                {selectedFruitPicking.location}
              </div>
            </div>

            {/* Content & Booking Form */}
            <div className="p-6 md:p-8 space-y-5 overflow-y-auto">
              <div>
                <h3 className="text-2xl font-extrabold text-[#144824]">{selectedFruitPicking.title}</h3>
                <p className="text-xs font-semibold text-[#1E562F] mt-1">
                  {selectedFruitPicking.farmName} · {selectedFruitPicking.seasonAvailability}
                </p>
                <p className="text-xs text-[#445E48] mt-2 leading-relaxed">
                  {selectedFruitPicking.description}
                </p>
              </div>

              {/* Fruit Picking 4-Photo Gallery Highlights */}
              <div className="space-y-2 border-t border-[#EAE3D8] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#144824] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#1E562F]" />
                    <span>Fruit Picking Gallery Photos</span>
                  </span>
                  <span className="text-[10px] text-[#5D7762] font-semibold">4 Photos</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {(selectedFruitPicking.thumbnails || []).map((thumbUrl, idx) => (
                    <div key={idx} className="h-20 rounded-xl overflow-hidden bg-slate-200 border border-white shadow-xs">
                      <img src={thumbUrl} alt={`Fruit thumb ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-1.5 text-xs text-[#204026] font-semibold pt-2 border-t border-[#EAE3D8]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>Includes harvest basket and dedicated farm guide</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#15803D]" />
                  <span>Duration: {selectedFruitPicking.duration}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#15803D]" />
                  <span>Available seasonal fruits: {selectedFruitPicking.seasonalFruits}</span>
                </div>
              </div>

              {/* FRUIT PICKING RESERVATION CONTROLS */}
              <div className="p-5 rounded-2xl bg-[#F2F7F3] border border-[#C5DEC9] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Date Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#144824]">Select Date</label>
                    <input
                      type="date"
                      value={fruitDate}
                      onChange={(e) => setFruitDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] font-semibold focus:outline-none"
                    />
                  </div>

                  {/* Fruit Picking Select Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#144824]">Select Time Slot</label>
                    <select
                      value={fruitTime}
                      onChange={(e) => setFruitTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#D5DDD6] rounded-xl text-xs text-[#144824] font-semibold focus:outline-none"
                    >
                      <option value="07:30 AM - Cool Morning Orchard Harvest">07:30 AM - Cool Morning Orchard Harvest</option>
                      <option value="09:30 AM - Prime Picking Session">09:30 AM - Prime Picking Session</option>
                      <option value="02:30 PM - Afternoon Family Picking">02:30 PM - Afternoon Family Picking</option>
                      <option value="04:00 PM - Golden Hour Farm Harvest">04:00 PM - Golden Hour Farm Harvest</option>
                    </select>
                  </div>
                </div>

                {/* Number of Participants with Counter */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#D5DDD6]">
                  <div>
                    <label className="text-xs font-bold text-[#144824]">Number of Fruit Pickers</label>
                    <p className="text-[10px] text-[#5D7762]">Includes individual harvesting basket</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFruitGuests(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E562F] hover:text-white flex items-center justify-center font-bold text-sm transition"
                    >
                      -
                    </button>
                    <span className="font-black text-sm px-3 text-[#144824]">{fruitGuests} Pax</span>
                    <button
                      type="button"
                      onClick={() => setFruitGuests(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#1E562F] hover:text-white flex items-center justify-center font-bold text-sm transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Fruit Picking Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#144824]">Select Fruit Picking Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['GCash', 'Maya', 'Bank Transfer', 'Pay at Farm'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFruitPaymentMethod(method)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${fruitPaymentMethod === method ? 'bg-[#1E562F] text-white border-[#1E562F] shadow-xs' : 'bg-white text-[#2C4831] border-[#D5DDD6] hover:bg-emerald-50'}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Automatic Computation (Never Zero!) */}
                <div className="pt-3 border-t border-[#C5DEC9] flex items-center justify-between">
                  <div className="text-xs text-[#5D7762]">
                    <span>₱{selectedFruitPicking.pricePerPerson} × {fruitGuests} {fruitGuests === 1 ? 'picker' : 'pickers'}</span>
                    <span className="block text-[10px] text-[#1E562F] font-semibold">Payment via {fruitPaymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#5D7762] block font-medium">Automatic Total Calculation:</span>
                    <span className="text-2xl font-black text-[#1E562F]">
                      ₱{(selectedFruitPicking.pricePerPerson * fruitGuests).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Checkout Button */}
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    showToast("Please log in using the Log In button at the top header to confirm your booking.");
                    return;
                  }
                  const calculatedTotal = selectedFruitPicking.pricePerPerson * fruitGuests;
                  const newBooking: Booking = {
                    id: Date.now(),
                    bookingCode: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
                    farmId: selectedFruitPicking.id,
                    farmName: selectedFruitPicking.farmName,
                    customerName: "Maria Santos",
                    customerPhone: "+63 917 555 0192",
                    customerEmail: "maria.santos@gmail.com",
                    activity: selectedFruitPicking.title,
                    tourDate: fruitDate,
                    tourTime: fruitTime.split(' - ')[0] || "09:30 AM",
                    participants: fruitGuests,
                    totalAmount: calculatedTotal,
                    paymentMethod: "GCash",
                    attendanceStatus: "Pending Confirmation",
                    status: "Confirmed",
                    assignedGuide: "Kuya Dennis (Senior Orchardist)"
                  };
                  setBookings(prev => [newBooking, ...prev]);
                  void javaBackend.createBooking({
                    id: newBooking.id,
                    bookingCode: newBooking.bookingCode,
                    customerName: newBooking.customerName,
                    farmName: newBooking.farmName,
                    activity: newBooking.activity,
                    tourDate: newBooking.tourDate,
                    participants: newBooking.participants,
                    totalAmount: newBooking.totalAmount,
                    status: newBooking.status,
                  });
                  setIsFruitModalOpen(false);
                  setSelectedBookingForTicket(newBooking);
                  showToast(`Fruit picking booked! Your Online Ticket Pass is ready below.`);
                  setActivePage('my_bookings');
                }}
                className="w-full py-4 bg-[#1E562F] hover:bg-[#144824] text-white rounded-2xl font-bold text-sm shadow-xl transition"
              >
                Confirm Fruit Picking Booking · ₱{(selectedFruitPicking.pricePerPerson * fruitGuests).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DRAWER: NOTIFICATIONS PANEL                                         */}
      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* DRAWER: NOTIFICATIONS PANEL (Clickable with full view)              */}
      {/* =================================================================== */}
      {isNotificationsOpen && isLoggedIn && (
        <div className="fixed top-16 right-6 z-50 w-88 glass-panel rounded-3xl p-5 border border-white/90 shadow-2xl space-y-4 animate-in fade-in duration-200 bg-[#FAF8F5]">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D8]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1E562F]" />
              <span className="font-extrabold text-sm text-[#144824]">
                {userRole === 'farmer' ? 'Farmer Host Alerts' : 'Farm Notifications'}
              </span>
              {roleFilteredNotifications.filter(n => !n.read).length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#15803D] text-white">
                  {roleFilteredNotifications.filter(n => !n.read).length} New
                </span>
              )}
            </div>
            <button onClick={() => setIsNotificationsOpen(false)}>
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {roleFilteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#5D7762]">
                <Bell className="w-8 h-8 text-[#78967E] mx-auto opacity-50 mb-2" />
                <p>No new alerts for this account.</p>
              </div>
            ) : (
              roleFilteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setNotificationsList(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                    setSelectedNotification(n);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-1.5 ${n.type === 'attendance_reminder' ? 'bg-amber-50/95 border-amber-300 shadow-md ring-1 ring-amber-300' : n.read ? 'bg-white/60 border-white/80 opacity-80 hover:opacity-100 hover:bg-white' : 'bg-emerald-50/90 border-[#BDE0C7] shadow-xs hover:bg-emerald-100/80'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${n.type === 'attendance_reminder' ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md' : n.type === 'farmer_attendance_alert' ? 'text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md' : n.type === 'booking' ? 'text-blue-700' : 'text-emerald-700'}`}>
                      {n.type === 'attendance_reminder' ? '1-Day Pre-Tour Reminder' : n.type === 'farmer_attendance_alert' ? 'Visitor Arrival Alert' : n.type === 'booking' ? 'Booking Alert' : 'Harvest Update'}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                    )}
                  </div>
                  <p className="font-bold text-xs text-[#144824] leading-snug">{n.title}</p>
                  <p className="text-[11px] text-[#445E48] leading-tight line-clamp-2">{n.desc}</p>

                  {/* Direct Clickable Yes/No buttons in notification item */}
                  {n.type === 'attendance_reminder' && n.attendanceStatus === 'Pending Confirmation' && (
                    <div className="flex items-center gap-2 pt-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleAttendanceConfirmation(n.bookingId, true)}
                        className="flex-1 py-1.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-lg font-bold text-[10px] shadow-xs transition text-center cursor-pointer"
                      >
                        YES, I WILL ATTEND
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceConfirmation(n.bookingId, false)}
                        className="flex-1 py-1.5 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] transition text-center cursor-pointer"
                      >
                        NO, CANCEL TOUR
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] text-[#718875]">
                    <span>{n.time}</span>
                    <span className="font-bold text-[#1E562F] hover:underline">Click to view full detail →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: NOTIFICATION FULL DETAIL POPUP                               */}
      {/* =================================================================== */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md glass-panel rounded-3xl p-7 border border-white/90 shadow-2xl space-y-5 bg-[#FAF8F5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${selectedNotification.type === 'attendance_reminder' ? 'bg-[#E8F3EB] text-[#1E562F]' : 'bg-emerald-100 text-[#1E562F]'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#15803D] tracking-wider">
                    {selectedNotification.type === 'attendance_reminder' ? 'Tour Attendance Confirmation' : selectedNotification.type === 'farmer_attendance_alert' ? 'Host Reservation Alert' : selectedNotification.type === 'booking' ? 'Tour & Reservation Alert' : 'Fresh Harvest Alert'}
                  </span>
                  <h3 className="font-extrabold text-base text-[#144824]">{selectedNotification.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedNotification(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-[#D5DDD6] space-y-2 text-xs">
              <p className="text-[#204026] leading-relaxed font-medium">
                {selectedNotification.fullDetail}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-[#5D7762] border-t border-[#EAE3D8]">
                <span>Status: <span className="font-bold text-[#15803D]">Read</span></span>
                <span>{selectedNotification.time}</span>
              </div>
            </div>

            {/* Clickable Yes / No confirmation inside Modal */}
            {selectedNotification.type === 'attendance_reminder' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-bold text-xs text-[#144824] text-center">
                  Will you proceed with your scheduled farm tour tomorrow?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAttendanceConfirmation(selectedNotification.bookingId, true);
                      setSelectedNotification(null);
                    }}
                    className="flex-1 py-2.5 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-300" />
                    <span>YES, I WILL ATTEND</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAttendanceConfirmation(selectedNotification.bookingId, false);
                      setSelectedNotification(null);
                    }}
                    className="flex-1 py-2.5 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <XCircle className="w-4 h-4 text-slate-500" />
                    <span>NO, CANCEL TOUR</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setSelectedNotification(null);
                  setIsNotificationsOpen(false);
                  if (selectedNotification.type === 'booking' || selectedNotification.type === 'attendance_reminder' || selectedNotification.type === 'farmer_attendance_alert') {
                    setActivePage('my_bookings');
                  } else {
                    setActivePage('market');
                  }
                }}
                className="flex-1 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                {selectedNotification.type === 'market' ? 'Explore Farm Produce →' : 'View Bookings Page →'}
              </button>
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-5 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: VIEW BOOKING AS TOURIST / E-TICKET VOUCHER                 */}
      {/* =================================================================== */}
      {selectedBookingForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-7 md:p-8 border border-white/90 shadow-2xl space-y-6 bg-[#FAF8F5] max-h-[90vh] overflow-y-auto">
            {/* Header with Ticket Brand */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1E562F] text-white flex items-center justify-center shadow-md">
                  <Leaf className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">
                    Official AgriTourism Tour Voucher
                  </span>
                  <h3 className="font-extrabold text-lg text-[#144824]">
                    {userRole === 'farmer' ? 'Tourist Reservation Dossier' : 'Tourist E-Ticket & Pass'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForView(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* E-Ticket Card Layout with Perforated Edge Visual */}
            <div className="rounded-2xl border-2 border-dashed border-[#B8D7C0] bg-white p-6 space-y-5 shadow-xs relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-black bg-[#1E562F] text-white px-3 py-1 rounded-lg">
                    {selectedBookingForView.bookingCode}
                  </span>
                  <h4 className="font-black text-xl text-[#144824] mt-2 leading-tight">
                    {selectedBookingForView.farmName}
                  </h4>
                  <p className="text-xs text-[#5D7762] font-semibold">{selectedBookingForView.activity}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${selectedBookingForView.status === 'Confirmed' ? 'bg-[#DCFCE7] text-[#15803D]' : selectedBookingForView.status === 'Pending' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-red-100 text-red-700'}`}>
                    {selectedBookingForView.status}
                  </span>
                  <p className="text-lg font-black text-[#144824] mt-2">₱{selectedBookingForView.totalAmount}</p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-black/5 text-xs">
                <div className="p-3 bg-[#F4F9F5] rounded-xl border border-[#DCEEE0]">
                  <span className="text-[10px] text-[#5D7762] block font-bold uppercase">Tour Date</span>
                  <span className="font-extrabold text-[#144824] text-sm flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
                    {selectedBookingForView.tourDate}
                  </span>
                </div>

                <div className="p-3 bg-[#F4F9F5] rounded-xl border border-[#DCEEE0]">
                  <span className="text-[10px] text-[#5D7762] block font-bold uppercase">Scheduled Time</span>
                  <span className="font-extrabold text-[#144824] text-sm flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#15803D]" />
                    {selectedBookingForView.tourTime}
                  </span>
                </div>

                <div className="p-3 bg-[#F4F9F5] rounded-xl border border-[#DCEEE0]">
                  <span className="text-[10px] text-[#5D7762] block font-bold uppercase">Tourist / Guest</span>
                  <span className="font-extrabold text-[#144824] text-sm flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-[#15803D]" />
                    {selectedBookingForView.customerName}
                  </span>
                </div>

                <div className="p-3 bg-[#F4F9F5] rounded-xl border border-[#DCEEE0]">
                  <span className="text-[10px] text-[#5D7762] block font-bold uppercase">Group Size</span>
                  <span className="font-extrabold text-[#144824] text-sm flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#15803D]" />
                    {selectedBookingForView.participants} Persons
                  </span>
                </div>
              </div>

              {/* Tourist Contact Details */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Tourist Contact Information</span>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#144824]">
                  <span className="flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-[#15803D]" />
                    {selectedBookingForView.customerPhone || '+63 917 555 0192'}
                  </span>
                  <span className="flex items-center gap-1 text-[#5D7762]">
                    <Mail className="w-3.5 h-3.5 text-[#15803D]" />
                    {selectedBookingForView.customerEmail || 'tourist@agritourism.ph'}
                  </span>
                </div>
              </div>

              {/* 1-Day Before Tour Confirmation Status */}
              <div className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs bg-slate-50 border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#5D7762] block">1-Day Attendance Confirmation</span>
                  <span className="font-black text-[#144824] text-sm">
                    {selectedBookingForView.attendanceStatus || 'Pending Confirmation'}
                  </span>
                </div>
                {selectedBookingForView.attendanceStatus === 'Pending Confirmation' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAttendanceConfirmation(selectedBookingForView.id, true)}
                      className="px-3 py-1.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Confirm Yes
                    </button>
                    <button
                      onClick={() => handleAttendanceConfirmation(selectedBookingForView.id, false)}
                      className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>

              {/* Tourist Uploaded Documents & Verification Dossier */}
              <div className="p-4 rounded-2xl bg-[#F0F7F2] border border-[#BFDFCA] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#15803D] tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Tourist Uploaded Documents & Dossier
                  </span>
                  <span className="text-[10px] font-bold text-[#1E562F] bg-white px-2.5 py-0.5 rounded-full border border-[#BDE0C7]">
                    DOT Verified Guest
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Uploaded ID */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#D5DDD6] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5D7762] uppercase block">Uploaded Valid ID</span>
                    <span className="font-bold text-[#144824] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                      {selectedBookingForView.uploadedIdDoc || 'Philippine National ID · Verified Eco-Tourist'}
                    </span>
                  </div>

                  {/* Uploaded Receipt */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#D5DDD6] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5D7762] uppercase block">Payment Verification Proof</span>
                    <span className="font-bold text-[#144824] flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#15803D]" />
                      {selectedBookingForView.uploadedReceiptDoc || 'GCash Reference Receipt · ₱500.00 Verified'}
                    </span>
                  </div>
                </div>

                {/* Special Requests & Assigned Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-[#D5DDD6] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5D7762] uppercase block">Special Requests & Notes</span>
                    <span className="font-semibold text-[#144824] text-[11px] block">
                      {selectedBookingForView.specialRequests || 'No special dietary or accessibility requests.'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#D5DDD6] space-y-0.5">
                    <span className="text-[10px] font-bold text-[#5D7762] uppercase block">Assigned Tour Guide</span>
                    <span className="font-bold text-[#144824] flex items-center gap-1 text-[11px]">
                      <Compass className="w-3.5 h-3.5 text-[#15803D]" />
                      {selectedBookingForView.assignedGuide || 'Kuya Noel (Master Horticulturist)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Farmer Host Gate Check-In & Guide Controls */}
              {userRole === 'farmer' && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                      Farmer Host Gate Controls
                    </span>
                    <span className="text-[10px] font-bold text-[#1E562F]">
                      Status: {selectedBookingForView.attendanceStatus || 'Pending'}
                    </span>
                  </div>

                  {selectedBookingForView.attendanceStatus === 'Arrived & Checked In' ? (
                    <div className="p-3 bg-emerald-100/90 rounded-xl border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                        Tourist has arrived & Gate Check-In is recorded!
                      </span>
                      <span className="font-mono text-[11px]">{selectedBookingForView.checkedInAt || 'Verified Today'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleCheckInBooking(selectedBookingForView.id);
                        setSelectedBookingForView(prev => prev ? {
                          ...prev,
                          attendanceStatus: 'Arrived & Checked In',
                          checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        } : null);
                      }}
                      className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4 text-[#86EFAC]" />
                      <span>Mark Tourist as Arrived (Gate Check-In)</span>
                    </button>
                  )}

                  {/* Guide Assignment Selector */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="text-[11px] font-bold text-[#144824] shrink-0">Assign Guide:</label>
                    <select
                      value={selectedBookingForView.assignedGuide || 'Kuya Noel (Master Horticulturist)'}
                      onChange={(e) => {
                        handleAssignGuide(selectedBookingForView.id, e.target.value);
                        setSelectedBookingForView(prev => prev ? { ...prev, assignedGuide: e.target.value } : null);
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-[#D5DDD6] rounded-xl text-xs font-semibold text-[#144824]"
                    >
                      <option value="Kuya Noel (Master Horticulturist)">Kuya Noel (Master Horticulturist)</option>
                      <option value="Ate Luisa (Organic Trail Guide)">Ate Luisa (Organic Trail Guide)</option>
                      <option value="Mang Ben (Orchard Elder)">Mang Ben (Orchard Elder)</option>
                      <option value="Ramon (Bee & Honey Specialist)">Ramon (Bee & Honey Specialist)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Digital QR Code Visual */}
              <div className="pt-2 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-[#5D7762] uppercase block">AgriTourism QR Check-in</span>
                  <p className="text-xs font-bold text-[#144824]">Show this code at the farm entrance</p>
                  <p className="text-[11px] text-[#78967E]">Verified by Department of Tourism Accredited Hosts</p>
                </div>
                <div className="w-16 h-16 bg-white border border-black/10 rounded-lg p-1.5 shadow-xs flex items-center justify-center">
                  {/* Decorative QR code */}
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                    {[1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1].map((bit, idx) => (
                      <div key={idx} className={bit ? 'bg-[#144824] rounded-xs' : 'bg-white'} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#86EFAC]" />
                <span>Save / Print Ticket</span>
              </button>
              <button
                onClick={() => setSelectedBookingForView(null)}
                className="px-6 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: FARMER INSPECT TOURIST PRODUCE ORDER & UPLOADED RECEIPT     */}
      {/* =================================================================== */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-7 border border-white/90 shadow-2xl space-y-5 bg-[#FAF8F5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1E562F] text-white flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">
                    Produce Order Dossier #{selectedOrderForView.orderNumber}
                  </span>
                  <h3 className="font-extrabold text-base text-[#144824]">
                    Tourist Order & GCash Verification
                  </h3>
                </div>
              </div>
              <button onClick={() => setSelectedOrderForView(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Order Info & Customer */}
            <div className="p-4 rounded-2xl bg-white border border-[#D5DDD6] space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-[#5D7762] uppercase">Customer</p>
                  <p className="font-extrabold text-sm text-[#144824]">{selectedOrderForView.customerName}</p>
                  <p className="text-[#5D7762]">{selectedOrderForView.customerPhone}</p>
                  <p className="text-[#5D7762] mt-0.5">{selectedOrderForView.customerAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#5D7762] uppercase">Fulfillment Status</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block mt-0.5 ${selectedOrderForView.fulfillmentStatus === 'Delivered' ? 'bg-[#DCFCE7] text-[#15803D]' : selectedOrderForView.fulfillmentStatus === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-[#FEF3C7] text-[#B45309]'}`}>
                    {selectedOrderForView.fulfillmentStatus}
                  </span>
                  <p className="text-base font-black text-[#1E562F] mt-1.5">₱{selectedOrderForView.totalAmount}</p>
                </div>
              </div>

              {selectedOrderForView.specialDeliveryNotes && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <strong>Delivery Note:</strong> {selectedOrderForView.specialDeliveryNotes}
                </div>
              )}

              {/* Items List */}
              <div className="pt-2 border-t border-black/5 space-y-1.5">
                <p className="font-bold text-[#144824]">Ordered Items:</p>
                {selectedOrderForView.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-[#204026]">
                    <span>{it.productName} × {it.qty}</span>
                    <span className="font-bold">₱{it.qty * it.unitPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Size Uploaded GCash Receipt Inspection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#144824]">Tourist Uploaded GCash Payment Proof</label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Payment Verified</span>
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[#D5DDD6] bg-slate-100 shadow-inner max-h-64 flex items-center justify-center">
                <img
                  src={selectedOrderForView.uploadedReceiptUrl}
                  alt="Uploaded Receipt"
                  className="w-full h-auto object-cover max-h-64"
                />
              </div>
            </div>

            {/* Host Status Actions */}
            <div className="space-y-2 pt-2 border-t border-[#EAE3D8]">
              <p className="text-xs font-bold text-[#144824]">Update Order Status:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOrderStatusUpdate(selectedOrderForView.id, 'Pending Packing');
                    setSelectedOrderForView(prev => prev ? { ...prev, fulfillmentStatus: 'Pending Packing' } : null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedOrderForView.fulfillmentStatus === 'Pending Packing' ? 'bg-[#1E562F] text-white shadow-xs' : 'bg-white border border-[#D5DDD6] text-slate-700 hover:bg-slate-50'}`}
                >
                  Packing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOrderStatusUpdate(selectedOrderForView.id, 'Dispatched');
                    setSelectedOrderForView(prev => prev ? { ...prev, fulfillmentStatus: 'Dispatched' } : null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedOrderForView.fulfillmentStatus === 'Dispatched' ? 'bg-[#1E562F] text-white shadow-xs' : 'bg-white border border-[#D5DDD6] text-slate-700 hover:bg-slate-50'}`}
                >
                  Dispatched
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOrderStatusUpdate(selectedOrderForView.id, 'Delivered');
                    setSelectedOrderForView(prev => prev ? { ...prev, fulfillmentStatus: 'Delivered' } : null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${selectedOrderForView.fulfillmentStatus === 'Delivered' ? 'bg-[#1E562F] text-white shadow-xs' : 'bg-white border border-[#D5DDD6] text-slate-700 hover:bg-slate-50'}`}
                >
                  Delivered
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print Order Dossier</span>
              </button>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="px-6 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: FARMER DELIVERY TRACKING & ROUTE INSPECTION                  */}
      {/* =================================================================== */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-panel rounded-3xl p-7 border border-white/90 shadow-2xl space-y-5 bg-[#FAF8F5] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1E562F] text-white flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">
                    Logistics & Route Inspection #{selectedOrderForTracking.orderNumber}
                  </span>
                  <h3 className="font-extrabold text-base text-[#144824]">
                    Farmer Courier Tracking & Handover
                  </h3>
                </div>
              </div>
              <button onClick={() => setSelectedOrderForTracking(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Courier & Location Summary */}
            <div className="p-4 rounded-2xl bg-white border border-[#D5DDD6] space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-[#5D7762] uppercase">Courier Carrier & Rider</p>
                  <p className="font-extrabold text-sm text-[#144824]">{selectedOrderForTracking.riderName || 'Kuya Jun-Jun Ramos'}</p>
                  <p className="text-[#5D7762]">{selectedOrderForTracking.courierName || 'AgriExpress Direct Fleet'}</p>
                  <p className="text-[11px] text-[#1E562F] font-semibold">{selectedOrderForTracking.riderVehicle || 'Yamaha NMAX · Plate DA 7192'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#5D7762] uppercase">Tourist Recipient</p>
                  <p className="font-bold text-[#144824]">{selectedOrderForTracking.customerName}</p>
                  <p className="text-[#5D7762]">{selectedOrderForTracking.customerPhone}</p>
                  <p className="font-mono font-bold text-xs text-[#1E562F] mt-1">{selectedOrderForTracking.trackingNumber}</p>
                </div>
              </div>

              {/* Real-time Location Banner */}
              <div className="p-3 rounded-xl bg-[#F0F7F2] border border-[#CDE5D3] flex items-start gap-2.5">
                <Navigation className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-[#15803D]">Live Courier Location:</p>
                  <p className="font-bold text-xs text-[#144824]">{selectedOrderForTracking.currentLocation || 'In Transit: En route to destination'}</p>
                  <p className="text-[11px] text-[#55785C] mt-0.5">Estimated Arrival: <span className="font-bold text-[#1E562F]">{selectedOrderForTracking.estimatedArrival || '15-20 mins away'}</span></p>
                </div>
              </div>

              {/* Tourist Handover / Receipt Status */}
              <div className="p-3.5 rounded-xl border">
                {selectedOrderForTracking.isReceivedByUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-extrabold text-xs text-emerald-900">Package Successfully Handed Over & Received</p>
                        <p className="text-[11px] text-emerald-700">Verified by {selectedOrderForTracking.receivedByRecipient || selectedOrderForTracking.customerName} on {selectedOrderForTracking.receivedAt || selectedOrderForTracking.orderDate}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-amber-900">Tourist Has Not Yet Confirmed Receipt</p>
                        <p className="text-[11px] text-amber-700">Package is en route. Tourist will inspect and verify upon rider arrival.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleConfirmOrderReceivedByUser(selectedOrderForTracking.id);
                        setSelectedOrderForTracking(prev => prev ? { ...prev, isReceivedByUser: true, fulfillmentStatus: 'Delivered', receivedAt: 'Nov 19, 2026 · 11:45 AM' } : null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1E562F] text-white hover:bg-[#144824] font-bold text-[11px] shadow-xs transition shrink-0"
                    >
                      Mark as Received by Tourist
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Checkpoints Timeline */}
              <div className="space-y-2 pt-2 border-t border-black/5">
                <p className="font-bold text-xs text-[#144824]">Delivery Route Steps:</p>
                <div className="space-y-1.5">
                  {(selectedOrderForTracking.deliverySteps || []).map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#FAF8F5] border border-black/5 text-[11px]">
                      <span className="flex items-center gap-2 font-medium text-[#144824]">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${step.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {step.completed ? '✓' : idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </span>
                      <span className="text-[#5D7762] text-[10px] font-semibold">{step.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action: Update Location Preset */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#D5DDD6] space-y-2 text-xs">
              <p className="font-bold text-[#144824]">Advance Courier Position / Location:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleUpdateDeliveryLocation(selectedOrderForTracking.id, "SLEX Alabang Corridor · En route north", "Dispatched");
                    setSelectedOrderForTracking(prev => prev ? { ...prev, currentLocation: "SLEX Alabang Corridor · En route north", fulfillmentStatus: "Dispatched" } : null);
                  }}
                  className="p-2 rounded-xl border border-[#D5DDD6] hover:bg-emerald-50 text-[11px] font-bold text-[#144824] text-left transition"
                >
                  SLEX Corridor (In Transit)
                </button>
                <button
                  onClick={() => {
                    handleUpdateDeliveryLocation(selectedOrderForTracking.id, "Approaching Destination: Within 1 km radius", "Dispatched");
                    setSelectedOrderForTracking(prev => prev ? { ...prev, currentLocation: "Approaching Destination: Within 1 km radius", fulfillmentStatus: "Dispatched" } : null);
                  }}
                  className="p-2 rounded-xl border border-[#D5DDD6] hover:bg-emerald-50 text-[11px] font-bold text-[#144824] text-left transition"
                >
                  Nearby Destination (1 km)
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-full py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl font-bold text-xs transition shadow-md"
              >
                Close Tracking Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: UPDATE / RESCHEDULE BOOKING                                */}
      {/* =================================================================== */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleUpdateBookingSubmit}
            className="w-full max-w-md glass-panel rounded-3xl p-7 border border-white/90 shadow-2xl space-y-5 bg-[#FAF8F5]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                    Update Reservation #{editingBooking.bookingCode}
                  </span>
                  <h3 className="font-extrabold text-base text-[#144824]">Reschedule Tour & Guests</h3>
                </div>
              </div>
              <button type="button" onClick={() => setEditingBooking(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#144824] block mb-1">Farm Destination</label>
                <input
                  type="text"
                  disabled
                  value={editingBooking.farmName}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#D5DDD6] rounded-xl font-bold text-[#144824]"
                />
              </div>

              {/* Tour Date */}
              <div>
                <label className="font-bold text-[#144824] block mb-1">Tour Date</label>
                <input
                  type="date"
                  required
                  value={editingBooking.tourDate.includes('-') ? editingBooking.tourDate : '2026-11-20'}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, tourDate: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5DDD6] rounded-xl font-semibold text-[#144824] focus:outline-none"
                />
              </div>

              {/* Tour Time Slot */}
              <div>
                <label className="font-bold text-[#144824] block mb-1">Time Slot</label>
                <select
                  value={editingBooking.tourTime}
                  onChange={(e) => setEditingBooking(prev => prev ? { ...prev, tourTime: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5DDD6] rounded-xl font-semibold text-[#144824] focus:outline-none"
                >
                  <option value="08:30 AM">08:30 AM - Morning Eco Trail</option>
                  <option value="10:00 AM">10:00 AM - Honeycomb & Orchard Tour</option>
                  <option value="01:30 PM">01:30 PM - Cacao Forest Experience</option>
                  <option value="03:00 PM">03:00 PM - Afternoon Farm Excursion</option>
                </select>
              </div>

              {/* Number of Guests */}
              <div>
                <label className="font-bold text-[#144824] block mb-1">Number of Guests</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newPax = Math.max(1, editingBooking.participants - 1);
                      const basePricePerPerson = editingBooking.totalAmount / editingBooking.participants;
                      setEditingBooking(prev => prev ? {
                        ...prev,
                        participants: newPax,
                        totalAmount: Math.round(basePricePerPerson * newPax)
                      } : null);
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#1E562F] hover:text-white flex items-center justify-center font-bold text-base transition"
                  >
                    -
                  </button>
                  <span className="font-black text-sm px-4 text-[#144824]">{editingBooking.participants} Guests</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newPax = editingBooking.participants + 1;
                      const basePricePerPerson = editingBooking.totalAmount / editingBooking.participants;
                      setEditingBooking(prev => prev ? {
                        ...prev,
                        participants: newPax,
                        totalAmount: Math.round(basePricePerPerson * newPax)
                      } : null);
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#1E562F] hover:text-white flex items-center justify-center font-bold text-base transition"
                  >
                    +
                  </button>
                  <span className="ml-auto text-sm font-black text-[#15803D]">
                    Total: ₱{editingBooking.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                Save Updated Schedule
              </button>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="px-5 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl font-bold text-xs transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: DELETE BOOKING CONFIRMATION                                */}
      {/* =================================================================== */}
      {deletingBookingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-white/90 shadow-2xl space-y-4 bg-[#FAF8F5] text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#144824]">Delete this reservation?</h3>
              <p className="text-xs text-[#5D7762] mt-1 leading-relaxed">
                This will permanently delete this booking from your list. Are you sure you want to proceed?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDeleteBooking(deletingBookingId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeletingBookingId(null)}
                className="flex-1 py-2.5 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl font-bold text-xs transition"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DRAWER: USER UPLOADED REFERENCE MOCKUPS                             */}
      {/* =================================================================== */}
      {isMockupDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#FAF8F5] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-[#E0D8CB]">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D8]">
                <h3 className="font-bold text-base text-[#144824]">Uploaded Design Mockups</h3>
                <button onClick={() => setIsMockupDrawerOpen(false)}><XCircle className="w-6 h-6 text-slate-400" /></button>
              </div>
              <div className="space-y-6">
                {APP_CONFIG.uploadedMockups.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs font-bold text-[#144824]">{m.title}</p>
                    <img src={m.path} alt={m.title} className="w-full rounded-2xl border border-[#D5DDD6]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: IN-DEPTH FARMER PROFILE & GENERATIONAL STORY                 */}
      {/* =================================================================== */}
      {selectedFarmerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl glass-panel rounded-3xl overflow-hidden border border-white/90 shadow-2xl bg-[#FAF8F5] max-h-[92vh] overflow-y-auto">
            {/* Cover Banner */}
            <div className="relative h-56 bg-slate-900">
              <img
                src={selectedFarmerForModal.farmBannerUrl}
                alt={selectedFarmerForModal.farmName}
                className="w-full h-full object-cover filter brightness-[0.80]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />
              <button
                onClick={() => setSelectedFarmerForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4 text-white">
                <img
                  src={selectedFarmerForModal.photoUrl}
                  alt={selectedFarmerForModal.name}
                  className="w-20 h-20 rounded-2xl object-cover border-3 border-amber-300 shadow-2xl shrink-0"
                />
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white inline-block mb-1">
                    {selectedFarmerForModal.generation} · {selectedFarmerForModal.hectares}
                  </span>
                  <h3 className="text-2xl font-black text-white leading-tight">{selectedFarmerForModal.name}</h3>
                  <p className="text-xs text-amber-300 font-semibold">{selectedFarmerForModal.farmName} · {selectedFarmerForModal.location}</p>
                </div>
              </div>
            </div>

            {/* Profile Body */}
            <div className="p-6 md:p-8 space-y-6 text-xs text-[#2C4831]">
              {/* Quote & Experience Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF5ED] to-[#F4FAF5] border border-[#CDE5D3] space-y-2">
                <p className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">Farmer Philosophy & Words</p>
                <p className="text-sm italic font-medium text-[#144824] leading-relaxed">
                  "{selectedFarmerForModal.storyQuote}"
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-[#5D7762]">
                  <span className="flex items-center gap-1 text-[#1E562F] font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedFarmerForModal.yearsExperience} Years Dedicated to Agriculture</span>
                  </span>
                  <span>•</span>
                  <span>{selectedFarmerForModal.roleTitle}</span>
                </div>
              </div>

              {/* Generational Story / Biography */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-[#144824] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1E562F]" />
                  <span>The Farmer's Journey & Heritage</span>
                </h4>
                <p className="text-xs leading-relaxed text-[#3D5A43] bg-white p-4 rounded-2xl border border-[#D5DDD6]">
                  {selectedFarmerForModal.fullBiography}
                </p>
              </div>

              {/* Sustainable Practices & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#D5DDD6] space-y-2">
                  <p className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">Official Certifications</p>
                  <div className="space-y-1.5">
                    {selectedFarmerForModal.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#144824]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#D5DDD6] space-y-2">
                  <p className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">Eco-Friendly Practices</p>
                  <div className="space-y-1.5">
                    {selectedFarmerForModal.sustainablePractices.map((prac, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-[#144824]">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{prac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Farm Photo Gallery */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-[#15803D] tracking-wider">Farm Landscape & Harvest Photos</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {selectedFarmerForModal.gallery.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Gallery item ${i + 1}`}
                      className="w-full h-20 rounded-xl object-cover border border-[#D5DDD6] hover:scale-105 transition"
                    />
                  ))}
                </div>
              </div>

              {/* Harvested Produce Catalog */}
              <div className="space-y-3 pt-2 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#144824] flex items-center gap-2">
                    <Carrot className="w-4 h-4 text-orange-600" />
                    <span>Harvested Produce Available Now</span>
                  </h4>
                  <span className="text-[11px] text-[#5D7762]">Direct from {selectedFarmerForModal.name}'s fields</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.filter(p => selectedFarmerForModal.productIds.includes(p.id)).map(prod => {
                    const itemStock = prod.stock !== undefined ? prod.stock : 30;
                    const inCartItem = cart.find(c => c.product.id === prod.id);
                    const inCartQty = inCartItem ? inCartItem.quantity : 0;
                    const isSoldOut = itemStock <= 0;
                    const isLimitReached = inCartQty >= itemStock;

                    return (
                      <div key={prod.id} className="p-3 bg-white rounded-2xl border border-[#D5DDD6] flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 truncate">
                          <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div className="truncate">
                            <p className="font-bold text-xs text-[#144824] truncate">{prod.name}</p>
                            <p className="text-xs font-black text-[#1E562F]">
                              ₱{prod.price} <span className="text-[10px] text-[#718875] font-normal">{prod.unit}</span>
                            </p>
                            <span className={`text-[10px] font-bold ${isSoldOut ? 'text-red-600' : isLimitReached ? 'text-amber-700' : 'text-slate-500'}`}>
                              {isSoldOut ? 'Sold Out' : isLimitReached ? 'Max limit in cart' : `Stock: ${itemStock} left`}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isSoldOut || isLimitReached}
                          onClick={() => {
                            addToCart(prod);
                            showToast(`Added ${prod.name} from ${selectedFarmerForModal.name} to cart!`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-xs ${
                            isSoldOut || isLimitReached
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                              : 'bg-[#1E562F] hover:bg-[#144824] text-white cursor-pointer active:scale-95'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isSoldOut ? 'Out' : isLimitReached ? 'Max' : 'Add'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-black/5">
                <button
                  onClick={() => {
                    const matchingTour = TOURS_DATA.find(t => t.id === selectedFarmerForModal.tourId) || TOURS_DATA[0];
                    setSelectedTour(matchingTour);
                    setSelectedFarmerForModal(null);
                    setIsTourModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#86EFAC]" />
                  <span>Book Tour at {selectedFarmerForModal.farmName}</span>
                </button>
                <button
                  onClick={() => setSelectedFarmerForModal(null)}
                  className="px-6 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl font-bold text-xs transition"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: OFFICIAL PRINTABLE ELECTRONIC SALES INVOICE & RECEIPT        */}
      {/* =================================================================== */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200 modal-print-overlay">
          <div className="w-full max-w-xl bg-white rounded-3xl p-7 md:p-9 shadow-2xl border border-slate-300 text-slate-900 max-h-[94vh] overflow-y-auto printable-document">
            
            {/* Receipt Header */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1E562F] text-white flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-[#86EFAC]" />
                  </div>
                  <h3 className="font-black text-lg text-[#144824] tracking-tight">AgriTourism Philippines</h3>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Official Electronic Sales Invoice & Receipt
                </p>
                <p className="text-[10px] text-slate-500">
                  Accredited Philippine Agri-Tourism E-Commerce Platform · BIR Registered Receipt
                </p>
              </div>

              <div className="text-right no-print">
                <button
                  onClick={() => setSelectedReceiptForPrint(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400">Receipt Reference</p>
                <p className="font-mono font-black text-sm text-[#144824]">{selectedReceiptForPrint.receiptNumber}</p>
                <p className="text-[11px] text-slate-600">{selectedReceiptForPrint.issueDate}</p>
                <p className="text-[10px] text-slate-500 font-mono">Auth: {selectedReceiptForPrint.authReference}</p>
              </div>

              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Customer Details</p>
                <p className="font-extrabold text-sm text-slate-900">{selectedReceiptForPrint.customerName}</p>
                <p className="text-[11px] text-slate-600">{selectedReceiptForPrint.customerPhone}</p>
                <p className="text-[10px] text-slate-500 truncate">{selectedReceiptForPrint.customerAddress}</p>
              </div>
            </div>

            {/* Farm Origin */}
            <div className="py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200 my-4 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Accredited Farm Host</span>
                <span className="font-bold text-[#144824]">{selectedReceiptForPrint.farmName}</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Host: {selectedReceiptForPrint.hostFarmerName}
              </span>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2 py-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-left text-[10px] uppercase font-black text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceiptForPrint.items.map((it, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2 font-bold text-slate-800">{it.name}</td>
                      <td className="py-2 text-center text-slate-600">{it.quantity}</td>
                      <td className="py-2 text-right text-slate-600">₱{it.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-black text-slate-900">₱{it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t-2 border-slate-900 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₱{selectedReceiptForPrint.subtotal.toLocaleString()}</span>
              </div>
              {selectedReceiptForPrint.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Logistics & Direct Delivery:</span>
                  <span>₱{selectedReceiptForPrint.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base text-[#144824] pt-2 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span>₱{selectedReceiptForPrint.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Paid Stamp & Verification Barcode */}
            <div className="pt-5 flex items-center justify-between border-t border-slate-200 mt-4">
              <div className="border-2 border-emerald-700 text-emerald-800 px-3.5 py-1.5 rounded-lg text-center font-black tracking-wider text-[11px] uppercase transform -rotate-2">
                PAID & VERIFIED · AGRITOURISM PH
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-slate-400">||| | ||||| || |||| ||| ||||</div>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">E-RECEIPT AUTHENTICATED</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print Official Receipt (PDF / Paper)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptForPrint(null)}
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: OFFICIAL ONLINE DIGITAL TOUR PASS & E-TICKET                 */}
      {/* =================================================================== */}
      {selectedBookingForTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200 modal-print-overlay">
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/30 text-slate-900 max-h-[94vh] overflow-y-auto printable-document flex flex-col justify-between">
            
            {/* E-Ticket Top Header Bar */}
            <div className="bg-[#144824] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Ticket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-200 tracking-wider">Philippine AgriTourism</p>
                  <h3 className="font-extrabold text-sm text-white">Official Digital Tour Pass & E-Ticket</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTicket(selectedBookingForTicket)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer no-print active:scale-95"
                  title="Save / Download Ticket Pass to Device"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Save / Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-[#144824] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer no-print active:scale-95"
                  title="Print Official Ticket Now"
                >
                  <Printer className="w-3.5 h-3.5 text-[#1E562F]" />
                  <span>Print Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForTicket(null)}
                  className="p-1 rounded-lg text-white/70 hover:text-white transition cursor-pointer no-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Boarding-Pass Style Ticket Body */}
            <div className="p-6 md:p-8 space-y-6 bg-[#FCFDFD] relative flex-1">
              
              {/* Interactive Prompt: Save or Print Question Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-slate-800 shadow-xs no-print space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                    <Ticket className="w-5 h-5 text-amber-900" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Do you want to save this ticket or do you want to print this ticket?
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      You can save and download this ticket directly to your phone or computer for offline turnstile check-in, or print a physical copy right now.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pl-12">
                  <button
                    type="button"
                    onClick={() => handleDownloadTicket(selectedBookingForTicket)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4 text-emerald-100" />
                    <span>Save / Download Digital Ticket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-[#144824] border border-[#144824] rounded-xl text-xs font-black shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-[#1E562F]" />
                    <span>Print Ticket</span>
                  </button>
                </div>
              </div>

              {/* Tour Headline & Booking Reference */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="font-mono text-xs font-black bg-[#1E562F] text-white px-3 py-1 rounded-lg inline-block mb-1.5 shadow-xs">
                    Pass Reference: {selectedBookingForTicket.bookingCode}
                  </span>
                  <h4 className="text-xl md:text-2xl font-black text-[#144824] leading-snug">
                    {selectedBookingForTicket.farmName}
                  </h4>
                  <p className="text-xs font-semibold text-[#144824] mt-0.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#1E562F]" />
                    <span>{selectedBookingForTicket.activity}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Total Admission Paid</span>
                  <p className="text-2xl font-black text-[#1E562F]">₱{selectedBookingForTicket.totalAmount}</p>
                  <p className="text-[10px] text-slate-600 font-bold">Paid via {selectedBookingForTicket.paymentMethod || 'GCash'}</p>
                </div>
              </div>

              {/* 4-Box Key Admission Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Tour Date</span>
                  <span className="font-extrabold text-[#144824] text-xs flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#1E562F]" />
                    {selectedBookingForTicket.tourDate}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Scheduled Slot</span>
                  <span className="font-extrabold text-[#144824] text-xs flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#1E562F]" />
                    {selectedBookingForTicket.tourTime.split('-')[0].trim()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Visitor</span>
                  <span className="font-extrabold text-[#144824] text-xs flex items-center gap-1 mt-0.5 truncate">
                    <User className="w-3 h-3 text-[#1E562F]" />
                    {selectedBookingForTicket.customerName}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Party Size</span>
                  <span className="font-extrabold text-[#144824] text-xs flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-[#1E562F]" />
                    {selectedBookingForTicket.participants} Guests
                  </span>
                </div>
              </div>

              {/* Guide, Meeting Point & Inclusions */}
              <div className="p-4 rounded-2xl bg-[#F0F7F2] border border-[#BFDFCA] space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#144824] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#1E562F]" />
                    <span>Assigned Agro-Guide: <strong>{selectedBookingForTicket.assignedGuide || 'Ate Rosa (Senior Guide)'}</strong></span>
                  </span>
                  <span className="text-[10px] font-bold text-[#144824] bg-white px-2 py-0.5 rounded-lg border border-[#BDE0C7]">
                    Gate 1 Welcome Pavilion
                  </span>
                </div>

                <div className="pt-2 border-t border-black/5 text-[11px] text-[#426349] leading-relaxed">
                  <strong>Pass Inclusions:</strong> Welcome native honey-lemonade drink, guided educational trail walk, sanitized harvesting basket, farm safety sun hat, and free parking access.
                </div>
              </div>

              {/* Perforated Stub Line with Barcode & Gate Scanner Notice */}
              <div className="relative pt-4 border-t-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Circular cutouts for tear-off effect */}
                <div className="hidden sm:block absolute -left-10 -top-3 w-6 h-6 bg-[#FCFDFD] rounded-full border border-slate-300" />
                <div className="hidden sm:block absolute -right-10 -top-3 w-6 h-6 bg-[#FCFDFD] rounded-full border border-slate-300" />

                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-[11px] font-black uppercase text-slate-500">Gate Turnstile Instructions</p>
                  <p className="text-xs text-slate-600 max-w-sm">
                    Present this digital ticket on your phone screen or printed paper at the farm gate scanner. Arrive 15 minutes prior to your time slot.
                  </p>
                </div>

                {/* Simulated QR Code & Barcode */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <QrCode className="w-12 h-12 text-[#144824]" />
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-slate-800">||| |||| | ||| ||||</p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">VALIDATED ENTRY</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions Bar */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 px-6 md:px-8 border-t border-slate-200 flex flex-wrap items-center gap-3 no-print z-30 shadow-lg shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadTicket(selectedBookingForTicket)}
                className="flex-1 min-w-[200px] py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4 text-emerald-100" />
                <span>Save / Download Digital Pass</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 min-w-[180px] py-3 bg-[#1E562F] hover:bg-[#144824] text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print Online Ticket Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBookingForTicket(null)}
                className="px-6 py-3 bg-white border border-[#D5DDD6] hover:bg-slate-100 text-[#144824] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* GLOBAL TOAST POPUP                                                  */}
      {/* =================================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E351A] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-white/20">
          <Sparkles className="w-4 h-4 text-[#86EFAC]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <OfflineIndicator />

    </div>
  );
}
