package ph.agritourism.data

import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json
import ph.agritourism.model.*
import java.io.File
import java.sql.Connection
import java.sql.DriverManager
import java.sql.PreparedStatement
import java.sql.ResultSet

/**
 * SQLite3 persistence layer. Replaces the old browser localStorage + Java/XAMPP MySQL backend.
 * The database file lives in ~/.agritourism/agritourism.db (override with AGRITOURISM_DB)
 * and is seeded from seed.json on first run.
 */
class Database(file: File = defaultFile()) {

    val conn: Connection
    private var txDepth = 0

    init {
        file.parentFile?.mkdirs()
        Class.forName("org.sqlite.JDBC")
        conn = DriverManager.getConnection("jdbc:sqlite:${file.absolutePath}")
        conn.createStatement().use {
            it.execute("PRAGMA foreign_keys = ON")
            it.execute("PRAGMA journal_mode = WAL")
        }
        createSchema()
        if (count("products") == 0 && count("tours") == 0) seed()
    }

    companion object {
        val json = Json { ignoreUnknownKeys = true; explicitNulls = false }
        private val strList = ListSerializer(String.serializer())
        private val longList = ListSerializer(Long.serializer())

        fun defaultFile(): File =
            System.getenv("AGRITOURISM_DB")?.let(::File)
                ?: File(System.getProperty("user.home"), ".agritourism/agritourism.db")

        fun loadSeed(): SeedData {
            val text = Database::class.java.getResource("/seed.json")!!.readText()
            return json.decodeFromString(SeedData.serializer(), text)
        }

        fun List<String>.enc() = json.encodeToString(strList, this)
        fun String.decList(): List<String> = json.decodeFromString(strList, this)
    }

    // ------------------------------------------------------------------ schema
    private fun createSchema() {
        val ddl = listOf(
            """CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                password_hash TEXT,
                role TEXT NOT NULL CHECK (role IN ('user','farmer','admin')),
                created_at TEXT DEFAULT CURRENT_TIMESTAMP)""",
            """CREATE TABLE IF NOT EXISTS farmers (
                id INTEGER PRIMARY KEY, name TEXT, role_title TEXT, farm_name TEXT, location TEXT,
                province TEXT, years_experience INTEGER, photo_url TEXT, farm_banner_url TEXT,
                story_quote TEXT, full_biography TEXT, farming_philosophy TEXT, certifications TEXT,
                sustainable_practices TEXT, specialty_produce TEXT, product_ids TEXT, tour_id INTEGER,
                rating REAL, reviews_count INTEGER, generation TEXT, hectares TEXT, gallery TEXT)""",
            """CREATE TABLE IF NOT EXISTS tours (
                id INTEGER PRIMARY KEY, name TEXT, location TEXT, rating REAL, reviews_count INTEGER,
                price_per_person INTEGER, operating_hours TEXT, amenities TEXT, activities TEXT,
                image_url TEXT, description TEXT, highlight_tag TEXT, farmer_name TEXT, thumbnails TEXT)""",
            """CREATE TABLE IF NOT EXISTS fruit_picking (
                id INTEGER PRIMARY KEY, title TEXT, farm_name TEXT, location TEXT, fruit_name TEXT,
                price_per_person INTEGER, rating REAL, reviews_count INTEGER, duration TEXT,
                seasonal_fruits TEXT, image_url TEXT, description TEXT, season_availability TEXT, thumbnails TEXT)""",
            """CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, price REAL, unit TEXT,
                discount_percent INTEGER, stock INTEGER, rating REAL, reviews_count INTEGER,
                image_url TEXT, description TEXT, farm_origin TEXT, sort_order INTEGER)""",
            """CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY, booking_code TEXT, farm_id INTEGER, farm_name TEXT,
                customer_name TEXT, customer_phone TEXT, customer_email TEXT, activity TEXT,
                tour_date TEXT, tour_time TEXT, participants INTEGER, total_amount INTEGER,
                payment_method TEXT, status TEXT, attendance_status TEXT, assigned_guide TEXT,
                special_requests TEXT, uploaded_id_doc TEXT, uploaded_receipt_doc TEXT,
                checked_in_at TEXT, sort_order INTEGER)""",
            """CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY, order_number TEXT, customer_name TEXT, customer_phone TEXT,
                customer_address TEXT, total_amount REAL, payment_method TEXT, payment_status TEXT,
                fulfillment_status TEXT, order_date TEXT, uploaded_receipt_url TEXT,
                special_delivery_notes TEXT, courier_name TEXT, rider_name TEXT, rider_phone TEXT,
                rider_vehicle TEXT, current_location TEXT, estimated_arrival TEXT, tracking_number TEXT,
                is_received_by_user INTEGER DEFAULT 0, received_at TEXT, received_by_recipient TEXT,
                sort_order INTEGER)""",
            """CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_name TEXT, qty INTEGER, unit_price REAL)""",
            """CREATE TABLE IF NOT EXISTS delivery_steps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                step_index INTEGER, title TEXT, location TEXT, timestamp TEXT, completed INTEGER, notes TEXT)""",
            """CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY, title TEXT, description TEXT, full_detail TEXT, time_label TEXT,
                is_read INTEGER, type TEXT, target_role TEXT, booking_id INTEGER, attendance_status TEXT,
                sort_order INTEGER)""",
            """CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY, author TEXT, role_tag TEXT, rating INTEGER, review_date TEXT,
                farm_or_crop TEXT, comment TEXT)""",
            """CREATE TABLE IF NOT EXISTS cart_items (
                product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL, sort_order INTEGER)""",
            """CREATE TABLE IF NOT EXISTS favorites (item_id INTEGER PRIMARY KEY)""",
        )
        conn.createStatement().use { st -> ddl.forEach(st::execute) }
    }

    private fun seed() {
        val s = loadSeed()
        tx {
            s.farmers.forEach(::saveFarmer)
            s.tours.forEach(::saveTour)
            s.fruitPicking.forEach(::saveFruit)
            s.products.forEachIndexed { i, p -> saveProduct(p, i) }
            s.bookings.forEachIndexed { i, b -> saveBooking(b, i) }
            s.orders.forEachIndexed { i, o -> saveOrder(o, i) }
            s.notifications.forEachIndexed { i, n -> saveNotification(n, i) }
            s.reviews.forEach(::saveReview)
            // Initial cart: mangoes x2, honey x1, banana chips x1 (same as the original app)
            listOf(6 to 2, 8 to 1, 9 to 1).forEachIndexed { i, (idx, q) -> setCartItem(s.products[idx].id, q, i) }
            listOf(1L, 2L, 3L).forEach { setFavorite(it, true) }
            listOf(
                Triple("Maria Santos", "maria.santos@gmail.com", "user"),
                Triple("Juan Dela Cruz", "juan.delacruz@sunnyvalefarm.ph", "farmer"),
                Triple("Administrator", "admin@agritourism.ph", "admin"),
            ).forEach { (n, e, r) -> upsertUser(n, e, "+63 917 555 0192", r) }
        }
    }

    // ------------------------------------------------------------------ helpers
    /** Runs block in a transaction; nested calls join the outer transaction. */
    fun <T> tx(block: () -> T): T {
        if (txDepth > 0) { txDepth++; try { return block() } finally { txDepth-- } }
        conn.autoCommit = false
        txDepth = 1
        try {
            val r = block(); conn.commit(); return r
        } catch (e: Throwable) {
            conn.rollback(); throw e
        } finally {
            txDepth = 0
            conn.autoCommit = true
        }
    }

    private fun count(table: String): Int =
        conn.createStatement().use { it.executeQuery("SELECT COUNT(*) FROM $table").use { r -> r.next(); r.getInt(1) } }

    private fun exec(sql: String, vararg args: Any?) = conn.prepareStatement(sql).use { it.bind(args); it.executeUpdate() }

    private fun <T> query(sql: String, vararg args: Any?, map: (ResultSet) -> T): List<T> =
        conn.prepareStatement(sql).use { ps ->
            ps.bind(args)
            ps.executeQuery().use { rs -> buildList { while (rs.next()) add(map(rs)) } }
        }

    private fun PreparedStatement.bind(args: Array<out Any?>) = args.forEachIndexed { i, a ->
        when (a) {
            null -> setObject(i + 1, null)
            is Boolean -> setInt(i + 1, if (a) 1 else 0)
            else -> setObject(i + 1, a)
        }
    }

    private fun ResultSet.str(c: String): String? = getString(c)
    private fun ResultSet.longOrNull(c: String): Long? = getLong(c).let { if (wasNull()) null else it }

    private fun insertSql(table: String, cols: List<String>) =
        "INSERT OR REPLACE INTO $table (${cols.joinToString()}) VALUES (${cols.joinToString { "?" }})"

    private fun existingSort(table: String, id: Any): Int? =
        query("SELECT sort_order FROM $table WHERE id=?", id) { it.getInt(1) }.firstOrNull()

    fun minSort(table: String): Int =
        conn.createStatement().use { it.executeQuery("SELECT COALESCE(MIN(sort_order),0) FROM $table").use { r -> r.next(); r.getInt(1) } }

    // ------------------------------------------------------------------ users
    fun upsertUser(fullName: String, email: String, phone: String, role: String) = exec(
        """INSERT INTO users (full_name, email, phone, role) VALUES (?,?,?,?)
           ON CONFLICT(email) DO UPDATE SET full_name=excluded.full_name, phone=excluded.phone, role=excluded.role""",
        fullName, email, phone, role,
    )

    // ------------------------------------------------------------------ farmers / tours / fruit
    private fun saveFarmer(f: FarmerProfile) = exec(
        insertSql("farmers", listOf("id", "name", "role_title", "farm_name", "location", "province", "years_experience",
            "photo_url", "farm_banner_url", "story_quote", "full_biography", "farming_philosophy", "certifications",
            "sustainable_practices", "specialty_produce", "product_ids", "tour_id", "rating", "reviews_count",
            "generation", "hectares", "gallery")),
        f.id, f.name, f.roleTitle, f.farmName, f.location, f.province, f.yearsExperience, f.photoUrl, f.farmBannerUrl,
        f.storyQuote, f.fullBiography, f.farmingPhilosophy, f.certifications.enc(), f.sustainablePractices.enc(),
        f.specialtyProduce.enc(), json.encodeToString(longList, f.productIds), f.tourId, f.rating, f.reviewsCount,
        f.generation, f.hectares, f.gallery.enc(),
    )

    fun farmers(): List<FarmerProfile> = query("SELECT * FROM farmers ORDER BY id") { r ->
        FarmerProfile(
            r.getInt("id"), r.str("name")!!, r.str("role_title")!!, r.str("farm_name")!!, r.str("location")!!,
            r.str("province")!!, r.getInt("years_experience"), r.str("photo_url")!!, r.str("farm_banner_url")!!,
            r.str("story_quote")!!, r.str("full_biography")!!, r.str("farming_philosophy")!!,
            r.str("certifications")!!.decList(), r.str("sustainable_practices")!!.decList(),
            r.str("specialty_produce")!!.decList(), json.decodeFromString(longList, r.str("product_ids")!!),
            r.getInt("tour_id"), r.getDouble("rating"), r.getInt("reviews_count"), r.str("generation")!!,
            r.str("hectares")!!, r.str("gallery")!!.decList(),
        )
    }

    private fun saveTour(t: FarmTour) = exec(
        insertSql("tours", listOf("id", "name", "location", "rating", "reviews_count", "price_per_person",
            "operating_hours", "amenities", "activities", "image_url", "description", "highlight_tag", "farmer_name", "thumbnails")),
        t.id, t.name, t.location, t.rating, t.reviewsCount, t.pricePerPerson, t.operatingHours, t.amenities.enc(),
        t.activities.enc(), t.imageUrl, t.description, t.highlightTag, t.farmerName, t.thumbnails.enc(),
    )

    fun tours(): List<FarmTour> = query("SELECT * FROM tours ORDER BY id") { r ->
        FarmTour(
            r.getInt("id"), r.str("name")!!, r.str("location")!!, r.getDouble("rating"), r.getInt("reviews_count"),
            r.getInt("price_per_person"), r.str("operating_hours")!!, r.str("amenities")!!.decList(),
            r.str("activities")!!.decList(), r.str("image_url")!!, r.str("description")!!, r.str("highlight_tag")!!,
            r.str("farmer_name")!!, r.str("thumbnails")!!.decList(),
        )
    }

    private fun saveFruit(f: FruitPickingItem) = exec(
        insertSql("fruit_picking", listOf("id", "title", "farm_name", "location", "fruit_name", "price_per_person",
            "rating", "reviews_count", "duration", "seasonal_fruits", "image_url", "description", "season_availability", "thumbnails")),
        f.id, f.title, f.farmName, f.location, f.fruitName, f.pricePerPerson, f.rating, f.reviewsCount, f.duration,
        f.seasonalFruits, f.imageUrl, f.description, f.seasonAvailability, f.thumbnails.enc(),
    )

    fun fruitPicking(): List<FruitPickingItem> = query("SELECT * FROM fruit_picking ORDER BY id") { r ->
        FruitPickingItem(
            r.getInt("id"), r.str("title")!!, r.str("farm_name")!!, r.str("location")!!, r.str("fruit_name")!!,
            r.getInt("price_per_person"), r.getDouble("rating"), r.getInt("reviews_count"), r.str("duration")!!,
            r.str("seasonal_fruits")!!, r.str("image_url")!!, r.str("description")!!, r.str("season_availability")!!,
            r.str("thumbnails")!!.decList(),
        )
    }

    // ------------------------------------------------------------------ products
    fun saveProduct(p: Product, sortOrder: Int) = exec(
        insertSql("products", listOf("id", "name", "category", "price", "unit", "discount_percent", "stock", "rating",
            "reviews_count", "image_url", "description", "farm_origin", "sort_order")),
        p.id, p.name, p.category, p.price, p.unit, p.discountPercent, p.stock, p.rating, p.reviewsCount, p.imageUrl,
        p.description, p.farmOrigin, sortOrder,
    )

    fun updateStock(productId: Long, stock: Int) = exec("UPDATE products SET stock=? WHERE id=?", stock, productId)

    fun products(): List<Product> = query("SELECT * FROM products ORDER BY sort_order, id") { r ->
        Product(
            r.getLong("id"), r.str("name")!!, r.str("category")!!, r.getDouble("price"), r.str("unit")!!,
            r.getInt("discount_percent"), r.getInt("stock"), r.getDouble("rating"), r.getInt("reviews_count"),
            r.str("image_url")!!, r.str("description")!!, r.str("farm_origin")!!,
        )
    }

    // ------------------------------------------------------------------ bookings
    fun saveBooking(b: Booking, sortOrder: Int? = null) {
        val order = sortOrder ?: existingSort("bookings", b.id) ?: (minSort("bookings") - 1)
        exec(
            insertSql("bookings", listOf("id", "booking_code", "farm_id", "farm_name", "customer_name", "customer_phone",
                "customer_email", "activity", "tour_date", "tour_time", "participants", "total_amount", "payment_method",
                "status", "attendance_status", "assigned_guide", "special_requests", "uploaded_id_doc",
                "uploaded_receipt_doc", "checked_in_at", "sort_order")),
            b.id, b.bookingCode, b.farmId, b.farmName, b.customerName, b.customerPhone, b.customerEmail, b.activity,
            b.tourDate, b.tourTime, b.participants, b.totalAmount, b.paymentMethod, b.status, b.attendanceStatus,
            b.assignedGuide, b.specialRequests, b.uploadedIdDoc, b.uploadedReceiptDoc, b.checkedInAt, order,
        )
    }

    fun deleteBooking(id: Long) = exec("DELETE FROM bookings WHERE id=?", id)

    fun bookings(): List<Booking> = query("SELECT * FROM bookings ORDER BY sort_order, id") { r ->
        Booking(
            r.getLong("id"), r.str("booking_code")!!, r.getInt("farm_id"), r.str("farm_name")!!, r.str("customer_name")!!,
            r.str("customer_phone"), r.str("customer_email"), r.str("activity")!!, r.str("tour_date")!!,
            r.str("tour_time")!!, r.getInt("participants"), r.getInt("total_amount"), r.str("payment_method"),
            r.str("status")!!, r.str("attendance_status"), r.str("assigned_guide"), r.str("special_requests"),
            r.str("uploaded_id_doc"), r.str("uploaded_receipt_doc"), r.str("checked_in_at"),
        )
    }

    // ------------------------------------------------------------------ orders
    fun saveOrder(o: FarmerOrder, sortOrder: Int? = null) = tx {
        val order = sortOrder ?: existingSort("orders", o.id) ?: (minSort("orders") - 1)
        exec("DELETE FROM order_items WHERE order_id=?", o.id)
        exec("DELETE FROM delivery_steps WHERE order_id=?", o.id)
        exec(
            insertSql("orders", listOf("id", "order_number", "customer_name", "customer_phone", "customer_address",
                "total_amount", "payment_method", "payment_status", "fulfillment_status", "order_date",
                "uploaded_receipt_url", "special_delivery_notes", "courier_name", "rider_name", "rider_phone",
                "rider_vehicle", "current_location", "estimated_arrival", "tracking_number", "is_received_by_user",
                "received_at", "received_by_recipient", "sort_order")),
            o.id, o.orderNumber, o.customerName, o.customerPhone, o.customerAddress, o.totalAmount, o.paymentMethod,
            o.paymentStatus, o.fulfillmentStatus, o.orderDate, o.uploadedReceiptUrl, o.specialDeliveryNotes,
            o.courierName, o.riderName, o.riderPhone, o.riderVehicle, o.currentLocation, o.estimatedArrival,
            o.trackingNumber, o.isReceivedByUser, o.receivedAt, o.receivedByRecipient, order,
        )
        o.items.forEach { exec("INSERT INTO order_items (order_id, product_name, qty, unit_price) VALUES (?,?,?,?)", o.id, it.productName, it.qty, it.unitPrice) }
        o.deliverySteps.forEachIndexed { i, s ->
            exec("INSERT INTO delivery_steps (order_id, step_index, title, location, timestamp, completed, notes) VALUES (?,?,?,?,?,?,?)",
                o.id, i, s.title, s.location, s.timestamp, s.completed, s.notes)
        }
    }

    fun orders(): List<FarmerOrder> {
        val items = query("SELECT * FROM order_items ORDER BY id") { r ->
            r.str("order_id")!! to OrderItem(r.str("product_name")!!, r.getInt("qty"), r.getDouble("unit_price"))
        }.groupBy({ it.first }, { it.second })
        val steps = query("SELECT * FROM delivery_steps ORDER BY order_id, step_index") { r ->
            r.str("order_id")!! to DeliveryCheckpoint(r.str("title")!!, r.str("location")!!, r.str("timestamp")!!, r.getInt("completed") == 1, r.str("notes"))
        }.groupBy({ it.first }, { it.second })
        return query("SELECT * FROM orders ORDER BY sort_order") { r ->
            val id = r.str("id")!!
            FarmerOrder(
                id, r.str("order_number")!!, r.str("customer_name")!!, r.str("customer_phone")!!,
                r.str("customer_address")!!, items[id].orEmpty(), r.getDouble("total_amount"), r.str("payment_method")!!,
                r.str("payment_status")!!, r.str("fulfillment_status")!!, r.str("order_date")!!,
                r.str("uploaded_receipt_url")!!, r.str("special_delivery_notes"), r.str("courier_name"),
                r.str("rider_name"), r.str("rider_phone"), r.str("rider_vehicle"), r.str("current_location"),
                r.str("estimated_arrival"), r.str("tracking_number"), steps[id].orEmpty(),
                r.getInt("is_received_by_user") == 1, r.str("received_at"), r.str("received_by_recipient"),
            )
        }
    }

    // ------------------------------------------------------------------ notifications
    fun saveNotification(n: AppNotification, sortOrder: Int? = null) {
        val order = sortOrder ?: existingSort("notifications", n.id) ?: (minSort("notifications") - 1)
        exec(
            insertSql("notifications", listOf("id", "title", "description", "full_detail", "time_label", "is_read", "type",
                "target_role", "booking_id", "attendance_status", "sort_order")),
            n.id, n.title, n.desc, n.fullDetail, n.time, n.read, n.type, n.targetRole, n.bookingId, n.attendanceStatus, order,
        )
    }

    fun notifications(): List<AppNotification> = query("SELECT * FROM notifications ORDER BY sort_order") { r ->
        AppNotification(
            r.getLong("id"), r.str("title")!!, r.str("description")!!, r.str("full_detail")!!, r.str("time_label")!!,
            r.getInt("is_read") == 1, r.str("type")!!, r.str("target_role")!!, r.longOrNull("booking_id"),
            r.str("attendance_status"),
        )
    }

    // ------------------------------------------------------------------ reviews
    private fun saveReview(v: CustomerReview) = exec(
        insertSql("reviews", listOf("id", "author", "role_tag", "rating", "review_date", "farm_or_crop", "comment")),
        v.id, v.author, v.roleTag, v.rating, v.date, v.farmOrCrop, v.comment,
    )

    fun reviews(): List<CustomerReview> = query("SELECT * FROM reviews ORDER BY id") { r ->
        CustomerReview(r.getInt("id"), r.str("author")!!, r.str("role_tag")!!, r.getInt("rating"),
            r.str("review_date")!!, r.str("farm_or_crop")!!, r.str("comment")!!)
    }

    // ------------------------------------------------------------------ cart / favorites
    fun setCartItem(productId: Long, quantity: Int, sortOrder: Int) {
        if (quantity <= 0) exec("DELETE FROM cart_items WHERE product_id=?", productId)
        else exec("INSERT OR REPLACE INTO cart_items (product_id, quantity, sort_order) VALUES (?,?,?)", productId, quantity, sortOrder)
    }

    fun clearCart() = exec("DELETE FROM cart_items")

    fun cart(): List<Pair<Long, Int>> =
        query("SELECT product_id, quantity FROM cart_items ORDER BY sort_order") { it.getLong(1) to it.getInt(2) }

    fun setFavorite(id: Long, fav: Boolean) {
        if (fav) exec("INSERT OR IGNORE INTO favorites (item_id) VALUES (?)", id)
        else exec("DELETE FROM favorites WHERE item_id=?", id)
    }

    fun favorites(): Set<Long> = query("SELECT item_id FROM favorites") { it.getLong(1) }.toSet()

    // ------------------------------------------------------------------ SQL studio
    data class QueryResult(val columns: List<String>, val rows: List<List<String>>, val message: String)

    fun runSql(sql: String): QueryResult = conn.createStatement().use { st ->
        val hasRs = st.execute(sql)
        if (!hasRs) return QueryResult(emptyList(), emptyList(), "${st.updateCount} row(s) affected")
        st.resultSet.use { rs ->
            val md = rs.metaData
            val cols = (1..md.columnCount).map { md.getColumnLabel(it) }
            val rows = buildList { while (rs.next() && size < 500) add(cols.indices.map { rs.getString(it + 1) ?: "NULL" }) }
            QueryResult(cols, rows, "${rows.size} row(s)")
        }
    }

    fun tableNames(): List<String> =
        query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name") { it.getString(1) }

    fun schemaSql(): String =
        query("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL ORDER BY name") { it.getString(1) + ";" }
            .joinToString("\n\n")

    fun close() = conn.close()
}
