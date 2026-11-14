package com.agritourism.server;

import com.agritourism.dao.BookingDAO;
import com.agritourism.dao.FarmDAO;
import com.agritourism.dao.UserDAO;
import com.agritourism.db.DatabaseConnection;
import com.agritourism.model.Booking;
import com.agritourism.model.FarmTour;
import com.agritourism.model.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AgriTourism Java Backend Server
 * Serves both the compiled HTML/CSS/TypeScript/JS frontend (dist/)
 * and REST JSON APIs (/api/*) for bookings, produce catalog, orders, and auth.
 */
public class AgriTourismServer {
    public static final int PORT = 8080;
    private static volatile HttpServer activeServer = null;

    // In-memory store (acts as live Java backend state and seamless fallback when JDBC DB is not yet configured)
    private static final List<Map<String, Object>> PRODUCT_STORE = new CopyOnWriteArrayList<>();
    private static final List<Map<String, Object>> BOOKING_STORE = new CopyOnWriteArrayList<>();
    private static final List<Map<String, Object>> ORDER_STORE = new CopyOnWriteArrayList<>();
    private static final AtomicInteger ID_SEQ = new AtomicInteger(500);

    private static final Map<String, String> MIME_TYPES = Map.ofEntries(
            Map.entry(".html", "text/html; charset=utf-8"),
            Map.entry(".js", "application/javascript; charset=utf-8"),
            Map.entry(".mjs", "application/javascript; charset=utf-8"),
            Map.entry(".css", "text/css; charset=utf-8"),
            Map.entry(".json", "application/json; charset=utf-8"),
            Map.entry(".png", "image/png"),
            Map.entry(".jpg", "image/jpeg"),
            Map.entry(".jpeg", "image/jpeg"),
            Map.entry(".gif", "image/gif"),
            Map.entry(".webp", "image/webp"),
            Map.entry(".svg", "image/svg+xml"),
            Map.entry(".ico", "image/x-icon"),
            Map.entry(".woff", "font/woff"),
            Map.entry(".woff2", "font/woff2"),
            Map.entry(".ttf", "font/ttf")
    );

    public static synchronized HttpServer startServer(int port) throws IOException {
        if (activeServer != null) {
            return activeServer;
        }

        System.out.println("==================================================");
        System.out.println("  AGRITOURISM JAVA BACKEND SERVER                 ");
        System.out.println("==================================================");

        boolean isConnected = DatabaseConnection.testConnection();
        if (isConnected) {
            System.out.println("[SUCCESS] Connected to SQL database via JDBC.");
        } else {
            System.out.println("[INFO] JDBC database not configured yet — running with Java in-memory backend store.");
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // REST API routes
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/farms", new FarmsHandler());
        server.createContext("/api/users", new UsersHandler());
        server.createContext("/api/products", new ProductsHandler());
        server.createContext("/api/bookings", new BookingsHandler());
        server.createContext("/api/orders", new OrdersHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/auth/signup", new SignupHandler());

        // Frontend HTML/CSS/JS Static Asset Handler (dist/)
        Path distDir = resolveDistDirectory();
        server.createContext("/", new StaticFrontendHandler(distDir));

        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        activeServer = server;

        System.out.println("[AgriTourism Java Backend] Listening on http://localhost:" + port);
        if (distDir != null) {
            System.out.println("[AgriTourism Frontend] Serving HTML/CSS/TS bundle from: " + distDir.toAbsolutePath());
        } else {
            System.out.println("[AgriTourism Frontend] dist/ not found yet — run 'npm run build' to bundle HTML/CSS/TS for Java.");
        }
        return server;
    }

    public static void main(String[] args) throws IOException {
        startServer(PORT);
    }

    private static Path resolveDistDirectory() {
        String[] candidates = { "dist", "../dist", "../../dist" };
        for (String candidate : candidates) {
            Path p = Paths.get(candidate).normalize();
            if (Files.isDirectory(p) && Files.exists(p.resolve("index.html"))) {
                return p;
            }
        }
        return null;
    }

    static class StaticFrontendHandler implements HttpHandler {
        private final Path distDir;

        StaticFrontendHandler(Path distDir) {
            this.distDir = distDir;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (distDir == null) {
                String msg = "Frontend bundle (dist/index.html) not found. Run 'npm run build' first.";
                byte[] bytes = msg.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
                exchange.sendResponseHeaders(404, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
                return;
            }

            String rawPath = exchange.getRequestURI().getPath();
            String decodedPath = URLDecoder.decode(rawPath == null ? "/" : rawPath, StandardCharsets.UTF_8);
            String relative = decodedPath.replaceFirst("^/+", "");
            if (relative.isEmpty()) {
                relative = "index.html";
            }

            Path target = distDir.resolve(relative).normalize();
            if (!target.startsWith(distDir) || !Files.exists(target) || Files.isDirectory(target)) {
                target = distDir.resolve("index.html");
            }

            String fileName = target.getFileName().toString().toLowerCase();
            String mime = "application/octet-stream";
            int dotIdx = fileName.lastIndexOf('.');
            if (dotIdx >= 0) {
                mime = MIME_TYPES.getOrDefault(fileName.substring(dotIdx), mime);
            }

            byte[] content = Files.readAllBytes(target);
            exchange.getResponseHeaders().set("Content-Type", mime);
            exchange.sendResponseHeaders(200, content.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(content);
            }
        }
    }

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            boolean jdbcOk = false;
            try {
                jdbcOk = DatabaseConnection.testConnection();
            } catch (Exception ignored) {}
            boolean distReady = resolveDistDirectory() != null;
            String response = String.format(
                    "{\"status\":\"UP\",\"backend\":\"Java HttpServer\",\"port\":%d,\"jdbcConnected\":%s,\"frontendBundled\":%s}",
                    PORT, jdbcOk, distReady
            );
            sendJsonResponse(exchange, 200, response);
        }
    }

    static class FarmsHandler implements HttpHandler {
        private final FarmDAO farmDAO = new FarmDAO();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            List<FarmTour> farms = farmDAO.getAllFarms();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < farms.size(); i++) {
                FarmTour f = farms.get(i);
                sb.append(String.format(
                        "{\"id\":%d,\"name\":\"%s\",\"location\":\"%s\",\"rating\":%.1f,\"reviews\":%d,\"price\":%.2f}",
                        f.getId(), escapeJson(f.getName()), escapeJson(f.getLocation()),
                        f.getRating(), f.getReviewsCount(),
                        f.getPricePerPerson() != null ? f.getPricePerPerson().doubleValue() : 0.0
                ));
                if (i < farms.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    static class UsersHandler implements HttpHandler {
        private final UserDAO userDAO = new UserDAO();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            List<User> users = userDAO.getAllUsers();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < users.size(); i++) {
                User u = users.get(i);
                sb.append(String.format(
                        "{\"id\":%d,\"name\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
                        u.getId(), escapeJson(u.getFullName()), escapeJson(u.getEmail()), escapeJson(u.getRole())
                ));
                if (i < users.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    static class ProductsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 200, mapListToJson(PRODUCT_STORE));
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                String body = readRequestBody(exchange);
                String action = extractJsonString(body, "action");
                if ("decrementStock".equals(action)) {
                    int productId = extractJsonInt(body, "productId", -1);
                    int qty = extractJsonInt(body, "quantity", 0);
                    for (Map<String, Object> item : PRODUCT_STORE) {
                        if (((Number) item.get("id")).intValue() == productId) {
                            int current = ((Number) item.getOrDefault("stock", 0)).intValue();
                            item.put("stock", Math.max(0, current - qty));
                        }
                    }
                    sendJsonResponse(exchange, 200, "{\"ok\":true,\"source\":\"java-backend\"}");
                    return;
                }

                Map<String, Object> prod = new ConcurrentHashMap<>();
                int id = extractJsonInt(body, "id", ID_SEQ.incrementAndGet());
                prod.put("id", id);
                prod.put("name", extractJsonString(body, "name"));
                prod.put("category", extractJsonString(body, "category"));
                prod.put("price", extractJsonDouble(body, "price", 100.0));
                prod.put("stock", extractJsonInt(body, "stock", 20));
                prod.put("unit", extractJsonString(body, "unit"));
                PRODUCT_STORE.add(0, prod);

                sendJsonResponse(exchange, 201, "{\"ok\":true,\"id\":" + id + ",\"source\":\"java-backend\"}");
                return;
            }

            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    static class BookingsHandler implements HttpHandler {
        private final BookingDAO bookingDAO = new BookingDAO();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(method)) {
                List<Booking> dbList = bookingDAO.getBookingsByUserId(1);
                if (!dbList.isEmpty()) {
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < dbList.size(); i++) {
                        Booking b = dbList.get(i);
                        sb.append(String.format(
                                "{\"id\":%d,\"bookingCode\":\"%s\",\"customerName\":\"%s\",\"farmName\":\"%s\",\"status\":\"%s\"}",
                                b.getId(), escapeJson(b.getBookingCode()), escapeJson(b.getCustomerName()),
                                escapeJson(b.getFarmName()), escapeJson(b.getStatus())
                        ));
                        if (i < dbList.size() - 1) sb.append(",");
                    }
                    sb.append("]");
                    sendJsonResponse(exchange, 200, sb.toString());
                    return;
                }
                sendJsonResponse(exchange, 200, mapListToJson(BOOKING_STORE));
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                String body = readRequestBody(exchange);
                String action = extractJsonString(body, "action");
                if ("updateStatus".equals(action)) {
                    int bookingId = extractJsonInt(body, "id", -1);
                    String status = extractJsonString(body, "status");
                    if (bookingId > 0 && !status.isEmpty()) {
                        bookingDAO.updateBookingStatus(bookingId, status);
                        for (Map<String, Object> b : BOOKING_STORE) {
                            if (((Number) b.get("id")).intValue() == bookingId) {
                                b.put("status", status);
                            }
                        }
                    }
                    sendJsonResponse(exchange, 200, "{\"ok\":true,\"source\":\"java-backend\"}");
                    return;
                }

                int id = extractJsonInt(body, "id", ID_SEQ.incrementAndGet());
                String bookingCode = extractJsonString(body, "bookingCode");
                String customerName = extractJsonString(body, "customerName");
                String farmName = extractJsonString(body, "farmName");
                String activity = extractJsonString(body, "activity");
                String tourDateStr = extractJsonString(body, "tourDate");
                int participants = extractJsonInt(body, "participants", 1);
                double totalAmount = extractJsonDouble(body, "totalAmount", 0.0);
                String status = extractJsonString(body, "status");

                Map<String, Object> record = new ConcurrentHashMap<>();
                record.put("id", id);
                record.put("bookingCode", bookingCode);
                record.put("customerName", customerName);
                record.put("farmName", farmName);
                record.put("activity", activity);
                record.put("tourDate", tourDateStr);
                record.put("participants", participants);
                record.put("totalAmount", totalAmount);
                record.put("status", status.isEmpty() ? "Pending" : status);
                BOOKING_STORE.add(0, record);

                // Sync to JDBC DAO if configured
                try {
                    Booking b = new Booking();
                    b.setBookingCode(bookingCode);
                    b.setUserId(1);
                    b.setFarmId(1);
                    b.setCustomerName(customerName);
                    b.setFarmName(farmName);
                    b.setActivity(activity);
                    if (!tourDateStr.isEmpty()) {
                        b.setTourDate(Date.valueOf(tourDateStr));
                    }
                    b.setParticipants(participants);
                    b.setTotalAmount(BigDecimal.valueOf(totalAmount));
                    b.setStatus(status.isEmpty() ? "Pending" : status);
                    bookingDAO.createBooking(b);
                } catch (Exception ignored) {}

                sendJsonResponse(exchange, 201, "{\"ok\":true,\"id\":" + id + ",\"source\":\"java-backend\"}");
                return;
            }

            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    static class OrdersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            String method = exchange.getRequestMethod();
            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equalsIgnoreCase(method)) {
                sendJsonResponse(exchange, 200, mapListToJson(ORDER_STORE));
                return;
            }

            if ("POST".equalsIgnoreCase(method)) {
                String body = readRequestBody(exchange);
                String action = extractJsonString(body, "action");
                if ("updateTracking".equals(action)) {
                    String orderId = extractJsonString(body, "orderId");
                    String status = extractJsonString(body, "fulfillmentStatus");
                    String location = extractJsonString(body, "currentLocation");
                    for (Map<String, Object> o : ORDER_STORE) {
                        if (orderId.equals(String.valueOf(o.get("id")))) {
                            if (!status.isEmpty()) o.put("fulfillmentStatus", status);
                            if (!location.isEmpty()) o.put("currentLocation", location);
                        }
                    }
                    sendJsonResponse(exchange, 200, "{\"ok\":true,\"source\":\"java-backend\"}");
                    return;
                }

                Map<String, Object> order = new ConcurrentHashMap<>();
                String id = extractJsonString(body, "id");
                if (id.isEmpty()) id = "ord-" + ID_SEQ.incrementAndGet();
                order.put("id", id);
                order.put("orderNumber", extractJsonString(body, "orderNumber"));
                order.put("customerName", extractJsonString(body, "customerName"));
                order.put("totalAmount", extractJsonDouble(body, "totalAmount", 0.0));
                order.put("paymentMethod", extractJsonString(body, "paymentMethod"));
                order.put("fulfillmentStatus", "Pending Packing");
                ORDER_STORE.add(0, order);

                sendJsonResponse(exchange, 201, "{\"ok\":true,\"id\":\"" + escapeJson(id) + "\",\"source\":\"java-backend\"}");
                return;
            }

            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    static class LoginHandler implements HttpHandler {
        private final UserDAO userDAO = new UserDAO();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String email = extractJsonString(body, "email");
            String role = extractJsonString(body, "role");
            if (role.isEmpty()) role = "user";

            User dbUser = null;
            try {
                if (!email.isEmpty()) dbUser = userDAO.getUserByEmail(email);
            } catch (Exception ignored) {}

            String resolvedRole = dbUser != null && dbUser.getRole() != null ? dbUser.getRole() : role;
            String resolvedName = dbUser != null && dbUser.getFullName() != null ? dbUser.getFullName()
                    : ("farmer".equals(resolvedRole) ? "Juan Dela Cruz" : "admin".equals(resolvedRole) ? "Administrator" : "Maria Santos");

            String res = String.format(
                    "{\"ok\":true,\"email\":\"%s\",\"fullName\":\"%s\",\"role\":\"%s\",\"source\":\"java-backend\"}",
                    escapeJson(email), escapeJson(resolvedName), escapeJson(resolvedRole)
            );
            sendJsonResponse(exchange, 200, res);
        }
    }

    static class SignupHandler implements HttpHandler {
        private final UserDAO userDAO = new UserDAO();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCorsHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            String body = readRequestBody(exchange);
            String fullName = extractJsonString(body, "fullName");
            String email = extractJsonString(body, "email");
            String phone = extractJsonString(body, "phone");
            String role = extractJsonString(body, "role");
            if (role.isEmpty()) role = "user";

            try {
                User u = new User();
                u.setFullName(fullName);
                u.setEmail(email);
                u.setPhone(phone);
                u.setPasswordHash("hashed-password");
                u.setRole(role);
                userDAO.registerUser(u);
            } catch (Exception ignored) {}

            String res = String.format(
                    "{\"ok\":true,\"fullName\":\"%s\",\"email\":\"%s\",\"role\":\"%s\",\"source\":\"java-backend\"}",
                    escapeJson(fullName), escapeJson(email), escapeJson(role)
            );
            sendJsonResponse(exchange, 201, res);
        }
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String extractJsonString(String json, String key) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"");
        Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1).replace("\\\"", "\"").replace("\\\\", "\\");
        }
        return "";
    }

    private static int extractJsonInt(String json, String key, int defaultVal) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(-?\\d+)");
        Matcher m = p.matcher(json);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultVal;
    }

    private static double extractJsonDouble(String json, String key, double defaultVal) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)");
        Matcher m = p.matcher(json);
        if (m.find()) {
            try {
                return Double.parseDouble(m.group(1));
            } catch (NumberFormatException ignored) {}
        }
        return defaultVal;
    }

    private static String mapListToJson(List<Map<String, Object>> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Map<String, Object> row = list.get(i);
            sb.append("{");
            int colIdx = 0;
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                if (colIdx++ > 0) sb.append(",");
                sb.append("\"").append(escapeJson(entry.getKey())).append("\":");
                Object val = entry.getValue();
                if (val instanceof Number || val instanceof Boolean) {
                    sb.append(val);
                } else {
                    sb.append("\"").append(escapeJson(String.valueOf(val))).append("\"");
                }
            }
            sb.append("}");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
        byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
