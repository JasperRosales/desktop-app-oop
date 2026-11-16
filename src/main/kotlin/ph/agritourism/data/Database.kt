package ph.agritourism.data

import kotlinx.serialization.builtins.MapSerializer
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
        // Older databases stored users without passwords; give them the documented default.
        exec("UPDATE users SET password_hash=? WHERE password_hash IS NULL OR password_hash=''", hashPassword(DEFAULT_PASSWORD))
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

        const val DEFAULT_PASSWORD = "password"

        /** Salted PBKDF2 hash stored as "salt:hash" (hex). */
        fun hashPassword(password: String, salt: ByteArray = ByteArray(16).also { java.security.SecureRandom().nextBytes(it) }): String {
            val spec = javax.crypto.spec.PBEKeySpec(password.toCharArray(), salt, 65_536, 256)
            val hash = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
            return salt.hex() + ":" + hash.hex()
        }

        fun verifyPassword(password: String, stored: String?): Boolean {
            val salt = stored?.substringBefore(":", "")?.takeIf { it.isNotEmpty() } ?: return false
            val bytes = salt.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
            return java.security.MessageDigest.isEqual(hashPassword(password, bytes).toByteArray(), stored.toByteArray())
        }

        private fun ByteArray.hex() = joinToString("") { "%02x".format(it) }

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
            """CREATE TABLE IF NOT EXISTS user_cart (
                user_email TEXT NOT NULL,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL, sort_order INTEGER,
                PRIMARY KEY (user_email, product_id))""",
            """CREATE TABLE IF NOT EXISTS user_favorites (
                user_email TEXT NOT NULL, item_id INTEGER NOT NULL,
                PRIMARY KEY (user_email, item_id))""",
        )
        conn.createStatement().use { st -> ddl.forEach(st::execute) }
        migrate()
    }

    private fun columns(table: String): Set<String> =
        query("PRAGMA table_info($table)") { it.getString("name") }.toSet()

    private fun tableExists(name: String) =
        query("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", name) { 1 }.isNotEmpty()

    /** Upgrades databases created by older versions (shared cart/favorites, orders without an owner). */
    private fun migrate() {
        if ("customer_email" !in columns("orders")) exec("ALTER TABLE orders ADD COLUMN customer_email TEXT")
        if ("recipient_email" !in columns("notifications")) {
            exec("ALTER TABLE notifications ADD COLUMN recipient_email TEXT")
            // Farmer alerts go to the farm they concern; the old generic ones were about the demo farmer's farm.
            exec("UPDATE notifications SET recipient_email=? WHERE target_role='farmer'", Role.FARMER.email)
        }
        listOf("users", "tours", "fruit_picking", "products").forEach { t ->
            if ("farmer_id" !in columns(t)) exec("ALTER TABLE $t ADD COLUMN farmer_id INTEGER")
        }
        if ("product_id" !in columns("order_items")) exec("ALTER TABLE order_items ADD COLUMN product_id INTEGER")
        exec("UPDATE users SET farmer_id=1 WHERE farmer_id IS NULL AND lower(email)=lower(?)", Role.FARMER.email)
        assignFarmOwnership()
        linkOrderItems()
        val bookingCols = columns("bookings")
        if ("activity_type" !in bookingCols) {
            exec("ALTER TABLE bookings ADD COLUMN activity_type TEXT NOT NULL DEFAULT 'tour'")
            classifyBookings()
        }
        if ("slot_key" !in bookingCols) exec("ALTER TABLE bookings ADD COLUMN slot_key TEXT")
        // Fill slot keys for older rows; legacy duplicates get a unique suffix so the index can be built.
        val seen = mutableSetOf<String>()
        bookings().forEach { b ->
            var key = b.slotKey()
            if (b.status != "Cancelled" && !seen.add(key)) key += "#legacy-${b.id}"
            exec("UPDATE bookings SET slot_key=? WHERE id=?", key, b.id)
        }
        // A customer can hold only one active (non-cancelled) booking per date + time slot.
        exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_slot ON bookings(slot_key) WHERE status <> 'Cancelled'")
        val reviewCols = columns("reviews")
        if ("user_email" !in reviewCols) exec("ALTER TABLE reviews ADD COLUMN user_email TEXT")
        if ("booking_id" !in reviewCols) exec("ALTER TABLE reviews ADD COLUMN booking_id INTEGER")
        if ("target_type" !in reviewCols) exec("ALTER TABLE reviews ADD COLUMN target_type TEXT")
        if ("target_id" !in reviewCols) exec("ALTER TABLE reviews ADD COLUMN target_id INTEGER")
        // One review per booking.
        exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id)")
        linkSeedReviews()
        localizeImages()
        // Link existing orders to the account with the same name.
        exec("""UPDATE orders SET customer_email=(SELECT email FROM users WHERE lower(users.full_name)=lower(orders.customer_name) LIMIT 1)
                WHERE customer_email IS NULL""")
        exec("""UPDATE notifications SET recipient_email=(SELECT customer_email FROM bookings WHERE bookings.id=notifications.booking_id)
                WHERE recipient_email IS NULL AND booking_id IS NOT NULL AND target_role='tourist'""")
        // The old single shared cart/favorites belonged to the demo tourist.
        val owner = Role.USER.email
        if (tableExists("cart_items")) {
            exec("INSERT OR IGNORE INTO user_cart (user_email, product_id, quantity, sort_order) SELECT ?, product_id, quantity, sort_order FROM cart_items", owner)
            exec("DROP TABLE cart_items")
        }
        if (tableExists("favorites")) {
            exec("INSERT OR IGNORE INTO user_favorites (user_email, item_id) SELECT ?, item_id FROM favorites", owner)
            exec("DROP TABLE favorites")
        }
    }

    /** Older databases point at remote (some now dead) image URLs; swap them for the bundled copies. */
    private fun localizeImages() {
        val cols = listOf("farmers" to "photo_url", "farmers" to "farm_banner_url", "tours" to "image_url", "tours" to "thumbnails",
            "fruit_picking" to "image_url", "fruit_picking" to "thumbnails", "products" to "image_url", "orders" to "uploaded_receipt_url")
        val stale = cols.any { (t, c) -> query("SELECT 1 FROM $t WHERE $c LIKE '%images.unsplash.com%' OR $c LIKE '%api.qrserver.com%' LIMIT 1") { 1 }.isNotEmpty() }
        if (!stale) return
        val text = Database::class.java.getResource("/images/legacy-urls.json")?.readText() ?: return
        val map = json.decodeFromString(MapSerializer(String.serializer(), String.serializer()), text)
        map.forEach { (old, new) -> cols.forEach { (t, c) -> exec("UPDATE $t SET $c=REPLACE($c, ?, ?) WHERE instr($c, ?) > 0", old, new, old) } }
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
            assignFarmOwnership()
            linkOrderItems()
            classifyBookings()
            linkSeedReviews()
            listOf(
                Triple("Maria Santos", "maria.santos@gmail.com", "user"),
                Triple("Juan Dela Cruz", "juan.delacruz@sunnyvalefarm.ph", "farmer"),
                Triple("Administrator", "admin@agritourism.ph", "admin"),
            ).forEach { (n, e, r) -> createUser(n, e, "+63 917 555 0192", DEFAULT_PASSWORD, r) }
            // Demo tourist's initial cart (mangoes x2, honey x1, banana chips x1) and favorites.
            val maria = Role.USER.email
            listOf(6 to 2, 8 to 1, 9 to 1).forEachIndexed { i, (idx, q) -> setCartItem(maria, s.products[idx].id, q, i) }
            listOf(1L, 2L, 3L).forEach { setFavorite(maria, it, true) }
            exec("UPDATE orders SET customer_email=? WHERE customer_name='Maria Santos'", maria)
            exec("UPDATE notifications SET recipient_email=? WHERE target_role='tourist'", maria)
            exec("UPDATE notifications SET recipient_email=? WHERE target_role='farmer'", Role.FARMER.email)
            exec("UPDATE users SET farmer_id=1 WHERE email=?", Role.FARMER.email)
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
    private fun mapUser(r: ResultSet) = User(r.getLong("id"), r.str("full_name")!!, r.str("email")!!, r.str("phone") ?: "",
        Role.of(r.str("role")!!), r.getInt("farmer_id").takeIf { !r.wasNull() })

    /** The account that manages a farm, if any. */
    fun farmerAccount(farmerId: Int): User? =
        query("SELECT * FROM users WHERE farmer_id=? AND role='farmer' LIMIT 1", farmerId, map = ::mapUser).firstOrNull()

    /** Creates a farm profile for a newly registered farmer and links the account to it. */
    fun createFarm(userId: Long, ownerName: String, farmName: String, province: String, fallbackImage: String, bannerImage: String = fallbackImage): Int = tx {
        val id = query("SELECT COALESCE(MAX(id),0)+1 FROM farmers") { it.getInt(1) }.first()
        saveFarmer(FarmerProfile(id, ownerName.trim(), "Farm Owner", farmName.trim(), province.trim(), province.trim(), 0,
            fallbackImage, bannerImage, "", "", "", emptyList(), emptyList(), emptyList(), emptyList(), 0, 0.0, 0,
            "1st generation", "—", emptyList()))
        exec("UPDATE users SET farmer_id=? WHERE id=?", id, userId)
        id
    }

    fun findUser(email: String): User? =
        query("SELECT * FROM users WHERE lower(email)=lower(?)", email.trim(), map = ::mapUser).firstOrNull()

    /** Inserts a new account; returns null if the email is already registered. */
    fun createUser(fullName: String, email: String, phone: String, password: String, role: String): User? {
        if (findUser(email) != null) return null
        exec("INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?,?,?,?,?)",
            fullName.trim(), email.trim(), phone.trim(), hashPassword(password), role)
        return findUser(email)
    }

    /** Returns the user if the email/password pair matches a stored account. */
    fun authenticate(email: String, password: String): User? {
        val hash = query("SELECT password_hash FROM users WHERE lower(email)=lower(?)", email.trim()) { it.getString(1) }.firstOrNull()
        return if (verifyPassword(password, hash)) findUser(email) else null
    }

    fun updateUserProfile(id: Long, fullName: String, phone: String) =
        exec("UPDATE users SET full_name=?, phone=? WHERE id=?", fullName.trim(), phone.trim(), id)

    fun userCount(): Int = count("users")

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

    /** Short farm label such as "Sunnyvale Farm" (first two words of the farm name). */
    private fun farmKey(farmName: String) = farmName.split(" ").take(2).joinToString(" ")

    /**
     * Links catalog rows to their farm: a farmer's tour (farmers.tour_id), orchards and products whose
     * farm name/origin starts with the farm's name. Unmatched rows stay platform-managed (admin only).
     */
    private fun assignFarmOwnership() = farmers().forEach { f ->
        val key = farmKey(f.farmName) + "%"
        if (f.tourId > 0) exec("UPDATE tours SET farmer_id=? WHERE id=? AND farmer_id IS NULL", f.id, f.tourId)
        exec("UPDATE fruit_picking SET farmer_id=? WHERE farmer_id IS NULL AND farm_name LIKE ?", f.id, key)
        exec("UPDATE products SET farmer_id=? WHERE farmer_id IS NULL AND farm_origin LIKE ?", f.id, key)
    }

    /** Older orders stored only product names; match each to the catalog product sharing the most words. */
    private fun linkOrderItems() {
        val words = { t: String -> t.lowercase().split(Regex("[^a-z0-9]+")).filter { it.length > 2 }.toSet() }
        val catalog = products().map { it.id to words(it.name) }
        query("SELECT id, product_name FROM order_items WHERE product_id IS NULL") { it.getLong(1) to it.getString(2) }.forEach { (rowId, name) ->
            val w = words(name)
            val best = catalog.map { (pid, pw) -> pid to (w intersect pw).size }.filter { it.second >= 2 }.maxByOrNull { it.second }
            if (best != null) exec("UPDATE order_items SET product_id=? WHERE id=?", best.first, rowId)
        }
    }

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
            r.str("farmer_name")!!, r.str("thumbnails")!!.decList(), r.getInt("farmer_id").takeIf { !r.wasNull() },
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
            r.str("thumbnails")!!.decList(), r.getInt("farmer_id").takeIf { !r.wasNull() },
        )
    }

    // ------------------------------------------------------------------ products
    fun saveProduct(p: Product, sortOrder: Int) = exec(
        insertSql("products", listOf("id", "name", "category", "price", "unit", "discount_percent", "stock", "rating",
            "reviews_count", "image_url", "description", "farm_origin", "sort_order", "farmer_id")),
        p.id, p.name, p.category, p.price, p.unit, p.discountPercent, p.stock, p.rating, p.reviewsCount, p.imageUrl,
        p.description, p.farmOrigin, sortOrder, p.farmerId,
    )

    fun updateStock(productId: Long, stock: Int) = exec("UPDATE products SET stock=? WHERE id=?", stock, productId)

    fun products(): List<Product> = query("SELECT * FROM products ORDER BY sort_order, id") { r ->
        Product(
            r.getLong("id"), r.str("name")!!, r.str("category")!!, r.getDouble("price"), r.str("unit")!!,
            r.getInt("discount_percent"), r.getInt("stock"), r.getDouble("rating"), r.getInt("reviews_count"),
            r.str("image_url")!!, r.str("description")!!, r.str("farm_origin")!!, r.getInt("farmer_id").takeIf { !r.wasNull() },
        )
    }

    // ------------------------------------------------------------------ bookings
    /** Thrown when a booking would give a customer two active reservations in the same slot. */
    class DoubleBookingException(val existing: Booking) : RuntimeException("Double booking with #${existing.bookingCode}")

    /** Another active booking by the same customer at the same date and time, if any. */
    fun conflictingBooking(b: Booking): Booking? {
        if (b.status == "Cancelled") return null
        val id = query("SELECT id FROM bookings WHERE slot_key=? AND status <> 'Cancelled' AND id <> ?", b.slotKey(), b.id) { it.getLong(1) }.firstOrNull()
        return id?.let { cid -> bookings().firstOrNull { it.id == cid } }
    }

    fun saveBooking(b: Booking, sortOrder: Int? = null) {
        conflictingBooking(b)?.let { throw DoubleBookingException(it) }
        val order = sortOrder ?: existingSort("bookings", b.id) ?: (minSort("bookings") - 1)
        val cols = listOf("id", "booking_code", "farm_id", "farm_name", "customer_name", "customer_phone",
            "customer_email", "activity", "tour_date", "tour_time", "participants", "total_amount", "payment_method",
            "status", "attendance_status", "assigned_guide", "special_requests", "uploaded_id_doc",
            "uploaded_receipt_doc", "checked_in_at", "sort_order", "activity_type", "slot_key")
        // Upsert on id only: INSERT OR REPLACE would silently delete a row that clashes on the slot index.
        exec(
            "INSERT INTO bookings (${cols.joinToString()}) VALUES (${cols.joinToString { "?" }}) " +
                "ON CONFLICT(id) DO UPDATE SET ${cols.drop(1).joinToString { "$it=excluded.$it" }}",
            b.id, b.bookingCode, b.farmId, b.farmName, b.customerName, b.customerPhone, b.customerEmail, b.activity,
            b.tourDate, b.tourTime, b.participants, b.totalAmount, b.paymentMethod, b.status, b.attendanceStatus,
            b.assignedGuide, b.specialRequests, b.uploadedIdDoc, b.uploadedReceiptDoc, b.checkedInAt, order,
            b.activityType, b.slotKey(),
        )
    }

    /** Older rows have no activity type: fruit-picking/harvest bookings point at fruit_picking ids. */
    private fun classifyBookings() = exec(
        """UPDATE bookings SET activity_type='orchard'
           WHERE activity LIKE '%Picking%' OR activity LIKE '%Harvest%'
              OR activity IN (SELECT title FROM fruit_picking WHERE fruit_picking.id=bookings.farm_id)""",
    )

    /** The bundled sample reviews are about specific tours. */
    private fun linkSeedReviews() {
        listOf(1 to 1, 2 to 2, 3 to 3).forEach { (reviewId, tourId) ->
            exec("UPDATE reviews SET target_type='tour', target_id=? WHERE id=? AND target_type IS NULL AND booking_id IS NULL", tourId, reviewId)
        }
    }

    fun deleteBooking(id: Long) = exec("DELETE FROM bookings WHERE id=?", id)

    fun deleteNotificationsForBooking(bookingId: Long) = exec("DELETE FROM notifications WHERE booking_id=?", bookingId)

    fun bookings(): List<Booking> = query("SELECT * FROM bookings ORDER BY sort_order, id") { r ->
        Booking(
            r.getLong("id"), r.str("booking_code")!!, r.getInt("farm_id"), r.str("farm_name")!!, r.str("customer_name")!!,
            r.str("customer_phone"), r.str("customer_email"), r.str("activity")!!, r.str("tour_date")!!,
            r.str("tour_time")!!, r.getInt("participants"), r.getInt("total_amount"), r.str("payment_method"),
            r.str("status")!!, r.str("attendance_status"), r.str("assigned_guide"), r.str("special_requests"),
            r.str("uploaded_id_doc"), r.str("uploaded_receipt_doc"), r.str("checked_in_at"),
            r.str("activity_type") ?: "tour",
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
                "received_at", "received_by_recipient", "sort_order", "customer_email")),
            o.id, o.orderNumber, o.customerName, o.customerPhone, o.customerAddress, o.totalAmount, o.paymentMethod,
            o.paymentStatus, o.fulfillmentStatus, o.orderDate, o.uploadedReceiptUrl, o.specialDeliveryNotes,
            o.courierName, o.riderName, o.riderPhone, o.riderVehicle, o.currentLocation, o.estimatedArrival,
            o.trackingNumber, o.isReceivedByUser, o.receivedAt, o.receivedByRecipient, order, o.customerEmail,
        )
        o.items.forEach { exec("INSERT INTO order_items (order_id, product_name, qty, unit_price, product_id) VALUES (?,?,?,?,?)", o.id, it.productName, it.qty, it.unitPrice, it.productId) }
        o.deliverySteps.forEachIndexed { i, s ->
            exec("INSERT INTO delivery_steps (order_id, step_index, title, location, timestamp, completed, notes) VALUES (?,?,?,?,?,?,?)",
                o.id, i, s.title, s.location, s.timestamp, s.completed, s.notes)
        }
    }

    fun orders(): List<FarmerOrder> {
        val items = query("SELECT * FROM order_items ORDER BY id") { r ->
            r.str("order_id")!! to OrderItem(r.str("product_name")!!, r.getInt("qty"), r.getDouble("unit_price"), r.longOrNull("product_id"))
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
                r.str("customer_email"),
            )
        }
    }

    // ------------------------------------------------------------------ notifications
    fun saveNotification(n: AppNotification, sortOrder: Int? = null) {
        val order = sortOrder ?: existingSort("notifications", n.id) ?: (minSort("notifications") - 1)
        exec(
            insertSql("notifications", listOf("id", "title", "description", "full_detail", "time_label", "is_read", "type",
                "target_role", "booking_id", "attendance_status", "sort_order", "recipient_email")),
            n.id, n.title, n.desc, n.fullDetail, n.time, n.read, n.type, n.targetRole, n.bookingId, n.attendanceStatus, order, n.recipientEmail,
        )
    }

    fun notifications(): List<AppNotification> = query("SELECT * FROM notifications ORDER BY sort_order") { r ->
        AppNotification(
            r.getLong("id"), r.str("title")!!, r.str("description")!!, r.str("full_detail")!!, r.str("time_label")!!,
            r.getInt("is_read") == 1, r.str("type")!!, r.str("target_role")!!, r.longOrNull("booking_id"),
            r.str("attendance_status"), r.str("recipient_email"),
        )
    }

    // ------------------------------------------------------------------ reviews
    fun saveReview(v: CustomerReview) = exec(
        insertSql("reviews", listOf("id", "author", "role_tag", "rating", "review_date", "farm_or_crop", "comment",
            "user_email", "booking_id", "target_type", "target_id")),
        v.id, v.author, v.roleTag, v.rating, v.date, v.farmOrCrop, v.comment, v.userEmail, v.bookingId, v.targetType, v.targetId,
    )

    fun nextReviewId(): Int = query("SELECT COALESCE(MAX(id),0)+1 FROM reviews") { it.getInt(1) }.first()

    /** Adds a review and folds its rating into the reviewed tour/orchard's average. */
    fun addReview(v: CustomerReview) = tx {
        if (v.bookingId != null && query("SELECT 1 FROM reviews WHERE booking_id=?", v.bookingId) { 1 }.isNotEmpty())
            error("This booking has already been reviewed.")
        saveReview(v)
        val table = when (v.targetType) { "tour" -> "tours"; "orchard" -> "fruit_picking"; else -> null }
        if (table != null && v.targetId != null) exec(
            "UPDATE $table SET rating=ROUND((rating*reviews_count + ?)*1.0/(reviews_count+1), 1), reviews_count=reviews_count+1 WHERE id=?",
            v.rating, v.targetId,
        )
    }

    fun reviews(): List<CustomerReview> = query("SELECT * FROM reviews ORDER BY id") { r ->
        CustomerReview(r.getInt("id"), r.str("author")!!, r.str("role_tag")!!, r.getInt("rating"),
            r.str("review_date")!!, r.str("farm_or_crop")!!, r.str("comment")!!,
            r.str("user_email"), r.longOrNull("booking_id"), r.str("target_type"), r.getInt("target_id").takeIf { !r.wasNull() })
    }

    // ------------------------------------------------------------------ cart / favorites
    fun setCartItem(user: String, productId: Long, quantity: Int, sortOrder: Int) {
        if (quantity <= 0) exec("DELETE FROM user_cart WHERE user_email=? AND product_id=?", user, productId)
        else exec("INSERT OR REPLACE INTO user_cart (user_email, product_id, quantity, sort_order) VALUES (?,?,?,?)", user, productId, quantity, sortOrder)
    }

    fun clearCart(user: String) = exec("DELETE FROM user_cart WHERE user_email=?", user)

    fun cart(user: String): List<Pair<Long, Int>> =
        query("SELECT product_id, quantity FROM user_cart WHERE user_email=? ORDER BY sort_order", user) { it.getLong(1) to it.getInt(2) }

    fun setFavorite(user: String, id: Long, fav: Boolean) {
        if (fav) exec("INSERT OR IGNORE INTO user_favorites (user_email, item_id) VALUES (?,?)", user, id)
        else exec("DELETE FROM user_favorites WHERE user_email=? AND item_id=?", user, id)
    }

    fun favorites(user: String): Set<Long> = query("SELECT item_id FROM user_favorites WHERE user_email=?", user) { it.getLong(1) }.toSet()

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
