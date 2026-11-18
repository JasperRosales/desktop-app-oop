package ph.agritourism.ui

import androidx.compose.runtime.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ph.agritourism.data.Database
import ph.agritourism.model.*
import java.io.File
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.random.Random

enum class Page {
    DASHBOARD, HOME, FARM_DETAIL, FRUIT_PICKING, MARKET, FARMERS_STORIES, MY_BOOKINGS, CART_CHECKOUT,
    ORDER_TRACKING, FARMER_ORDERS, FARMER_PRODUCTS, FARMER_PROFILE, SIGNUP, LOGIN, SQL_STUDIO, FARM_SETUP, PLATFORM_SETTINGS, HELP
}

/** Picture-and-description preview of a catalog item, shown to guests on the opening page. */
data class CatalogPreview(val image: String, val tag: String, val title: String, val description: String, val details: List<Pair<String, String>> = emptyList())

enum class ShowcaseCategory { ALL, PLACES, PRODUCTS, ORCHARDS }

const val PESO = "₱"

/** Fulfillment statuses a farm moves an order through, with their button labels. */
val ORDER_STATUSES = listOf("Pending Packing" to "Packing", "Packed" to "Packed", "Dispatched" to "Dispatch",
    "Out for Delivery" to "Out for Delivery", "Delivered" to "Delivered")

private val STAMP = DateTimeFormatter.ofPattern("MMM d, yyyy · hh:mm a", Locale.ENGLISH)
fun nowStamp(): String = LocalDateTime.now().format(STAMP)

/** Parses ISO (2026-11-20) or display (Nov 20, 2026) booking dates. */
fun parseTourDate(d: String): LocalDate? = parseDate(d)

/** Parses an order date such as "Nov 19, 2026 · 10:15 AM". */
fun parseOrderDate(d: String): LocalDate? = parseTourDate(d.substringBefore("·"))

data class MonthPoint(val label: String, val value: Double)

/** Buckets dated values into the last [months] calendar months, ending at the later of today or the newest entry. */
fun monthlySeries(entries: List<Pair<LocalDate, Double>>, months: Int = 6): List<MonthPoint> {
    val now = java.time.YearMonth.now()
    val end = entries.maxOfOrNull { java.time.YearMonth.from(it.first) }?.takeIf { it.isAfter(now) } ?: now
    val sums = entries.groupBy({ java.time.YearMonth.from(it.first) }, { it.second }).mapValues { it.value.sum() }
    return (months - 1 downTo 0).map { i ->
        val ym = end.minusMonths(i.toLong())
        MonthPoint(ym.month.getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH), sums[ym] ?: 0.0)
    }
}

fun money(v: Number): String {
    val d = v.toDouble()
    return if (d == Math.floor(d)) "%,d".format(d.toLong()) else "%,.2f".format(d)
}

class AppState(val db: Database, private val scope: CoroutineScope) {
    // static catalog (from SQLite)
    var images by mutableStateOf(db.images())
    var settings by mutableStateOf(db.settings())
    var guides by mutableStateOf(db.guides())
    var couriers by mutableStateOf(db.couriers())
    var timeSlots by mutableStateOf(db.timeSlots())
    var tours by mutableStateOf(db.tours())
    var fruitPicking by mutableStateOf(db.fruitPicking())
    var farmers by mutableStateOf(db.farmers())
    var reviews by mutableStateOf(db.reviews())
    var faqs by mutableStateOf(db.faqs())

    // navigation & role
    // The app starts signed out; every role-specific page and action needs a verified login.
    var activePage by mutableStateOf(Page.HOME)
    var userRole by mutableStateOf(Role.USER)
    var isLoggedIn by mutableStateOf(false)
    var currentUser by mutableStateOf<User?>(null)
    var showcaseCategory by mutableStateOf(ShowcaseCategory.ALL)
    var isSidebarCollapsed by mutableStateOf(false)

    // login
    var loginEmail by mutableStateOf("")
    var loginPassword by mutableStateOf("")
    var loginRoleSelect by mutableStateOf(Role.USER)
    var loginError by mutableStateOf<String?>(null)

    // selections
    var selectedTour by mutableStateOf(tours.first())
    var selectedFruit by mutableStateOf(fruitPicking.first())
    var isTourModalOpen by mutableStateOf(false)
    var isFruitModalOpen by mutableStateOf(false)

    // tour/fruit reservation inputs
    var tourDate by mutableStateOf(LocalDate.now().plusDays(7).toString())
    var tourTime by mutableStateOf("")
    var tourGuests by mutableStateOf(2)
    var tourPaymentMethod by mutableStateOf("GCash")
    var fruitDate by mutableStateOf(LocalDate.now().plusDays(7).toString())
    var fruitTime by mutableStateOf("")
    var fruitGuests by mutableStateOf(2)
    var fruitPaymentMethod by mutableStateOf("GCash")

    // persisted collections
    var products by mutableStateOf(db.products())
    var bookings by mutableStateOf(db.bookings())
    var farmerOrders by mutableStateOf(db.orders())
    var notifications by mutableStateOf(db.notifications())
    var favoriteIds by mutableStateOf(emptySet<Long>())
    var cart by mutableStateOf(emptyList<CartItem>())
    /** Cart items the tourist unticked; everything else is bought at checkout (new items start ticked). */
    var cartUnselected by mutableStateOf(emptySet<Long>())

    // checkout
    var checkoutStep by mutableStateOf(1)
    var recipientName by mutableStateOf("")
    var contactPhone by mutableStateOf("")
    var deliveryAddress by mutableStateOf("")
    var deliveryNotes by mutableStateOf("")
    var paymentMethod by mutableStateOf("GCash")
    var lastOrderTotal by mutableStateOf(0.0)
    var lastOrderReference by mutableStateOf("")
    var lastOrderPaymentMethod by mutableStateOf("GCash")
    var lastPlacedOrder by mutableStateOf<FarmerOrder?>(null)

    // overlays
    var isNotificationsOpen by mutableStateOf(false)
    var selectedNotification by mutableStateOf<AppNotification?>(null)
    var isProfileModalOpen by mutableStateOf(false)
    var isAddProductModalOpen by mutableStateOf(false)
    var isAddBookingModalOpen by mutableStateOf(false)
    var isMockupDrawerOpen by mutableStateOf(false)
    var selectedBookingForView by mutableStateOf<Booking?>(null)
    var selectedBookingForTicket by mutableStateOf<Booking?>(null)
    var editingBooking by mutableStateOf<Booking?>(null)
    var reviewingBooking by mutableStateOf<Booking?>(null)
    var deletingBookingId by mutableStateOf<Long?>(null)
    var selectedOrderForView by mutableStateOf<FarmerOrder?>(null)
    var selectedOrderForTracking by mutableStateOf<FarmerOrder?>(null)
    var selectedFarmerForModal by mutableStateOf<FarmerProfile?>(null)
    var selectedReceipt by mutableStateOf<Receipt?>(null)
    var catalogPreview by mutableStateOf<CatalogPreview?>(null)
    var isAddTourModalOpen by mutableStateOf(false)
    var isAddOrchardModalOpen by mutableStateOf(false)
    var isEditStoryOpen by mutableStateOf(false)
    var toastMessage by mutableStateOf<String?>(null)
    private var toastJob: Job? = null

    // filters
    var marketFilter by mutableStateOf("All")
    var searchQuery by mutableStateOf("")
    var bookingsFilter by mutableStateOf("All")
    var ordersFilter by mutableStateOf("All")
    var activeTrackingOrderId by mutableStateOf("")
    var farmerStoriesFilter by mutableStateOf("All")
    var farmerSearchQuery by mutableStateOf("")
    var currentSlide by mutableStateOf(0)

    // walk-in booking form
    var newBookingCustomer by mutableStateOf("")
    var newBookingPhone by mutableStateOf("")
    var newBookingActivity by mutableStateOf(tours.first().name)
    var newBookingDate by mutableStateOf(LocalDate.now().plusDays(7).toString())
    var newBookingTime by mutableStateOf("")
    var newBookingGuests by mutableStateOf(2)
    var newBookingPayment by mutableStateOf("Cash on Arrival")

    // add product form
    var newProductName by mutableStateOf("")
    var newProductCategory by mutableStateOf("Vegetables")
    var newProductPrice by mutableStateOf("100")
    var newProductUnit by mutableStateOf("kg")
    var newProductStock by mutableStateOf("25")
    var newProductDesc by mutableStateOf("")
    var newProductImage by mutableStateOf(images.presetTomatoImage.ifBlank { "res:images/photo-1598170845058-32b9d6a5da37-w600.jpg" })

    init {
        newProductImage = products.firstOrNull { it.id == 101L }?.imageUrl ?: newProductImage
        scope.launch {
            while (true) {
                delay(3800)
                currentSlide = (currentSlide + 1) % farmers.size
            }
        }
    }

    private fun loadCart(): List<CartItem> {
        val byId = db.products().associateBy { it.id }
        val user = currentUser?.email ?: return emptyList()
        return db.cart(user).mapNotNull { (id, q) -> byId[id]?.let { CartItem(it, q) } }
    }

    private fun persistCart(items: List<CartItem>) {
        val user = currentUser?.email ?: return
        db.tx {
            db.clearCart(user)
            items.forEachIndexed { i, c -> db.setCartItem(user, c.product.id, c.quantity, i) }
        }
        cart = items
    }

    // ---------------------------------------------------------------- reference data (from SQLite)
    fun setting(key: String): String = settings[key].orEmpty()
    val deliveryFee: Double get() = settings["delivery_fee"]?.toDoubleOrNull() ?: 0.0

    /** Time slots a tour ("tour") or orchard ("orchard") offers. */
    fun slotsFor(type: String, id: Int): List<String> = timeSlots.filter { it.activityType == type && it.activityId == id }.map { it.label }
    fun slotsFor(b: Booking): List<String> = slotsFor(b.activityType, b.farmId)

    /** Guides of a farm (admins choosing for an unknown farm see every guide). */
    fun guidesFor(farmId: Int?): List<String> =
        (if (farmId == null) guides else guides.filter { it.farmerId == farmId }).map { it.name }
    fun guidesFor(b: Booking): List<String> = guidesFor(farmOf(b))

    /** Product categories configured in settings plus any already used by products. */
    val productCategories: List<String>
        get() = (setting("product_categories").split(",").map { it.trim() } + products.map { it.category }).filter { it.isNotBlank() }.distinct()
    val provinces: List<String> get() = farmers.map { it.province.trim() }.filter { it.isNotBlank() }.distinct().sorted()
    val maxDiscount: Int get() = products.filter { it.stock > 0 }.maxOfOrNull { it.discountPercent } ?: 0

    private fun defaultGuide(farmId: Int?, host: String): String? =
        guidesFor(farmId).firstOrNull() ?: host.takeIf { it.isNotBlank() }?.let { "$it (Farm Host & Guide)" }

    // ---------------------------------------------------------------- derived
    val roleFilteredNotifications: List<AppNotification>
        get() {
            if (!isLoggedIn) return emptyList()
            val mine = visibleBookings.map { it.id }.toSet()
            return when (userRole) {
                Role.FARMER -> notifications.filter { it.targetRole == "farmer" && it.recipientEmail.equals(userEmail, true) }
                // Tourists see broadcasts plus notifications addressed to them or about their own bookings.
                Role.USER -> notifications.filter { n ->
                    n.targetRole == "tourist" && when {
                        n.recipientEmail != null -> n.recipientEmail.equals(userEmail, true)
                        n.bookingId != null -> n.bookingId in mine
                        else -> true
                    }
                }
                Role.ADMIN -> notifications
            }
        }

    val unreadCount get() = roleFilteredNotifications.count { !it.read }

    /** Cart items ticked for checkout. */
    val checkoutItems: List<CartItem> get() = cart.filter { it.product.id !in cartUnselected }
    val cartValue: Double get() = cart.sumOf { it.product.discountedPrice * it.quantity }
    val cartSubtotal: Double get() = checkoutItems.sumOf { it.product.discountedPrice * it.quantity }
    val cartTotal: Double get() = if (checkoutItems.isNotEmpty()) cartSubtotal + deliveryFee else 0.0

    fun toggleCartItem(id: Long) { cartUnselected = if (id in cartUnselected) cartUnselected - id else cartUnselected + id }
    fun selectAllCart(selected: Boolean) { cartUnselected = if (selected) emptySet() else cart.map { it.product.id }.toSet() }

    val filteredProducts: List<Product>
        get() = products.filter { p ->
            (marketFilter == "All" || p.category == marketFilter) &&
                (p.name.contains(searchQuery, true) || p.farmOrigin.contains(searchQuery, true))
        }

    val displayName: String get() = currentUser?.fullName ?: "Guest"
    val userEmail: String get() = currentUser?.email.orEmpty()
    val userPhone: String get() = currentUser?.phone.orEmpty()

    // ---------------------------------------------------------------- farm ownership
    /** The farm a farmer account manages (null for tourists/admins or unlinked farmers). */
    val myFarmId: Int? get() = if (isFarmer) currentUser?.farmerId else null
    val myFarm: FarmerProfile? get() = myFarmId?.let { id -> farmers.firstOrNull { it.id == id } }
    val myFarmLabel: String get() = myFarm?.farmName ?: if (isAdmin) "All Partner Farms" else "Your Farm"

    /** Which farm runs the tour/orchard a booking is for. */
    fun farmOf(b: Booking): Int? =
        if (b.activityType == "orchard") fruitPicking.firstOrNull { it.id == b.farmId }?.farmerId
        else tours.firstOrNull { it.id == b.farmId }?.farmerId

    /** Farms whose products are in an order. */
    fun farmsOf(o: FarmerOrder): Set<Int> {
        val byId = products.associateBy { it.id }
        return o.items.mapNotNull { it.productId?.let(byId::get)?.farmerId }.toSet()
    }

    /** Part of an order's value that belongs to the current farmer (whole order for admins). */
    fun farmShare(o: FarmerOrder): Double {
        if (!isFarmer) return o.totalAmount
        val mine = farmProducts.map { it.id }.toSet()
        return o.items.filter { it.productId in mine }.sumOf { it.qty * it.unitPrice }
    }

    fun canManageBooking(b: Booking) = isAdmin || (myFarmId != null && farmOf(b) == myFarmId)
    fun canManageOrder(o: FarmerOrder) = isAdmin || (myFarmId != null && myFarmId in farmsOf(o))

    val myTours: List<FarmTour> get() = if (isAdmin) tours else tours.filter { myFarmId != null && it.farmerId == myFarmId }
    val myOrchards: List<FruitPickingItem> get() = if (isAdmin) fruitPicking else fruitPicking.filter { myFarmId != null && it.farmerId == myFarmId }

    /** Tourists see their own reservations, farmers their farm's, admins all. */
    val visibleBookings: List<Booking>
        get() = when {
            !isLoggedIn -> emptyList()
            userRole == Role.USER -> bookings.filter(::ownsBooking)
            else -> bookings.filter(::canManageBooking)
        }

    /** Tourists see their own orders, farmers orders containing their produce, admins all. */
    val visibleOrders: List<FarmerOrder>
        get() = when {
            !isLoggedIn -> emptyList()
            userRole == Role.USER -> farmerOrders.filter(::ownsOrder)
            else -> farmerOrders.filter(::canManageOrder)
        }

    /** Booking awaiting the tourist's 1-day attendance answer (linked through an attendance_reminder notification). */
    val pendingAttendanceBooking: Booking?
        get() {
            val mine = visibleBookings.filter { it.status != "Cancelled" }
            val reminded = notifications.filter { it.type == "attendance_reminder" }.mapNotNull { it.bookingId }.toSet()
            return mine.firstOrNull { it.id in reminded }
        }

    // ---------------------------------------------------------------- dashboard metrics (live from SQLite)
    val farmProducts: List<Product>
        get() = when { isAdmin -> products; myFarmId != null -> products.filter { it.farmerId == myFarmId }; else -> emptyList() }
    val activeBookings: List<Booking> get() = visibleBookings.filter { it.status != "Cancelled" }
    val openOrders: List<FarmerOrder> get() = visibleOrders.filter { it.fulfillmentStatus != "Delivered" }
    val totalRevenue: Double get() = visibleOrders.sumOf(::farmShare) + activeBookings.sumOf { it.totalAmount }
    val fulfillmentRate: Double get() = if (bookings.isEmpty()) 0.0 else bookings.count { it.status != "Cancelled" } * 100.0 / bookings.size
    val monthlyBookings: List<MonthPoint>
        get() = monthlySeries(bookings.mapNotNull { b -> parseTourDate(b.tourDate)?.let { it to 1.0 } })
    val monthlyRevenue: List<MonthPoint>
        get() = monthlySeries(
            visibleOrders.mapNotNull { o -> parseOrderDate(o.orderDate)?.let { it to farmShare(o) } } +
                activeBookings.mapNotNull { b -> parseTourDate(b.tourDate)?.let { it to b.totalAmount.toDouble() } }
        )
    val myReviews: List<CustomerReview> get() = reviews.filter { r -> r.userEmail?.equals(userEmail, true) ?: r.author.equals(displayName, true) }
    val favoriteNames: List<String>
        get() = favoriteIds.mapNotNull { id ->
            tours.firstOrNull { it.id.toLong() == id }?.name ?: fruitPicking.firstOrNull { it.id + 100L == id }?.title
        }

    val avatar: String
        get() = currentUser?.avatarUrl?.takeIf { it.isNotBlank() }
            ?: myFarm?.photoUrl?.takeIf { it.isNotBlank() }
            ?: when (userRole) { Role.ADMIN -> images.adminAvatar; Role.FARMER -> images.juanAvatar; Role.USER -> images.mariaAvatar }

    // ---------------------------------------------------------------- generic
    fun showToast(msg: String) {
        toastMessage = msg
        toastJob?.cancel()
        toastJob = scope.launch { delay(3200); toastMessage = null }
    }

    // ---------------------------------------------------------------- access control
    val isTourist get() = isLoggedIn && userRole == Role.USER
    val isFarmer get() = isLoggedIn && userRole == Role.FARMER
    val isAdmin get() = isLoggedIn && userRole == Role.ADMIN
    /** Farm staff (farmer hosts and admins) manage bookings, orders and the catalog. */
    val isStaff get() = isFarmer || isAdmin

    fun ownsBooking(b: Booking) = isTourist && b.customerEmail.equals(userEmail, true)
    fun ownsOrder(o: FarmerOrder) = isTourist && o.customerEmail.equals(userEmail, true)
    fun canViewBooking(b: Booking) = canManageBooking(b) || ownsBooking(b)
    fun canViewOrder(o: FarmerOrder) = canManageOrder(o) || ownsOrder(o)

    /** Admin-only raw SQL; reloads app state afterwards so the screens match the database. */
    fun runAdminSql(sql: String): Database.QueryResult {
        check(isAdmin) { "Only administrators can run SQL." }
        val r = db.runSql(sql)
        if (r.columns.isEmpty()) reloadFromDb()
        return r
    }

    /** Which pages each role may open. */
    fun canAccess(p: Page): Boolean = when (p) {
        Page.HOME, Page.LOGIN, Page.SIGNUP, Page.HELP -> true
        // Tourist pages need a login; guests only see the public catalog on the home page.
        Page.FARM_DETAIL, Page.FRUIT_PICKING, Page.MARKET, Page.FARMERS_STORIES -> isTourist || isAdmin
        Page.DASHBOARD, Page.MY_BOOKINGS -> isLoggedIn
        Page.CART_CHECKOUT -> isTourist
        Page.ORDER_TRACKING -> isTourist || isAdmin
        Page.FARMER_ORDERS, Page.FARMER_PRODUCTS -> isStaff
        Page.FARMER_PROFILE -> isFarmer
        Page.SQL_STUDIO, Page.PLATFORM_SETTINGS -> isAdmin
        Page.FARM_SETUP -> isAdmin || myFarmId != null
    }

    /** Returns true (and explains why) when the current user may NOT perform an action. */
    private fun denied(allowed: Boolean, what: String): Boolean {
        if (!isLoggedIn) { showToast("Please log in to $what."); activePage = Page.LOGIN; return true }
        if (!allowed) { showToast("Your ${userRole.subtitle} account is not allowed to $what."); return true }
        return false
    }

    private fun booking(id: Long) = bookings.firstOrNull { it.id == id }
    private fun order(id: String) = farmerOrders.firstOrNull { it.id == id }

    fun navigate(p: Page) {
        when {
            canAccess(p) -> activePage = p
            !isLoggedIn -> { showToast("Please log in to open that page."); activePage = Page.LOGIN }
            else -> showToast("Your ${userRole.subtitle} account cannot open that page.")
        }
    }

    fun openShowcase(c: ShowcaseCategory) { showcaseCategory = c; activePage = Page.HOME }

    /** Opens a catalog item from the home page; guests and farmers get a picture & description preview. */
    private fun fromCatalog(preview: CatalogPreview, open: () -> Unit) {
        if (isTourist || isAdmin) open() else catalogPreview = preview
    }

    fun openCatalogTour(t: FarmTour) = fromCatalog(CatalogPreview(t.imageUrl, t.location, t.name, t.description, listOf(
        "Price" to "$PESO${money(t.pricePerPerson)} per person", "Hours" to t.operatingHours, "Rating" to "★ ${t.rating} (${t.reviewsCount} reviews)",
        "Activities" to t.activities.joinToString(), "Amenities" to t.amenities.joinToString(),
    ).filter { it.second.isNotBlank() })) { selectedTour = t; isTourModalOpen = true }

    fun openCatalogOrchard(f: FruitPickingItem) = fromCatalog(CatalogPreview(f.imageUrl, f.fruitName.ifBlank { f.farmName }, f.title, f.description, listOf(
        "Farm" to "${f.farmName} · ${f.location}", "Price" to "$PESO${money(f.pricePerPerson)} per picker", "Duration" to f.duration,
        "Season" to f.seasonAvailability, "Fruits" to f.seasonalFruits, "Rating" to "★ ${f.rating} (${f.reviewsCount} reviews)",
    ).filter { it.second.isNotBlank() })) { selectedFruit = f; isFruitModalOpen = true }

    fun openCatalogProduct(p: Product) = fromCatalog(CatalogPreview(p.imageUrl, p.category, p.name, p.description, listOf(
        "From" to p.farmOrigin, "Price" to "$PESO${money(p.discountedPrice)} ${p.unit}", "Stock" to if (p.stock > 0) "${p.stock} available" else "Sold out",
    ))) { marketFilter = "All"; searchQuery = p.name; activePage = Page.MARKET }

    fun reloadFromDb() {
        products = db.products(); bookings = db.bookings(); farmerOrders = db.orders()
        notifications = db.notifications(); reviews = db.reviews(); tours = db.tours(); fruitPicking = db.fruitPicking()
        farmers = db.farmers(); faqs = db.faqs(); settings = db.settings(); images = db.images(); guides = db.guides(); couriers = db.couriers(); timeSlots = db.timeSlots()
        currentUser = currentUser?.let { db.findUser(it.email) }
        if (currentUser == null && isLoggedIn) { signOut(); return }
        currentUser?.let { userRole = it.role }
        favoriteIds = currentUser?.let { db.favorites(it.email) } ?: emptySet(); cart = loadCart()
        if (!canAccess(activePage)) activePage = Page.DASHBOARD
        showToast("Reloaded data from SQLite database.")
    }

    fun toggleFavorite(id: Long, name: String) {
        val user = currentUser?.email
        if (user == null) { showToast("Log in to save favorites."); activePage = Page.LOGIN; return }
        val exists = id in favoriteIds
        db.setFavorite(user, id, !exists)
        favoriteIds = if (exists) favoriteIds - id else favoriteIds + id
        showToast(if (exists) "Removed \"$name\" from your favorites." else "Saved \"$name\" to your favorites.")
    }

    fun signOut() {
        isLoggedIn = false
        currentUser = null
        userRole = Role.USER
        cart = emptyList(); cartUnselected = emptySet(); favoriteIds = emptySet()
        loginPassword = ""
        checkoutStep = 1; lastPlacedOrder = null
        isNotificationsOpen = false
        selectedNotification = null
        isProfileModalOpen = false; isAddProductModalOpen = false; isAddBookingModalOpen = false
        selectedBookingForView = null; selectedBookingForTicket = null; editingBooking = null; deletingBookingId = null; reviewingBooking = null
        selectedOrderForView = null; selectedOrderForTracking = null; selectedReceipt = null
        isAddTourModalOpen = false; isAddOrchardModalOpen = false; isEditStoryOpen = false; catalogPreview = null
        activePage = Page.HOME
        showToast("Signed out successfully. Welcome to AgriTourism Philippines!")
    }

    private fun startSession(u: User) {
        currentUser = u
        userRole = u.role
        isLoggedIn = true
        loginError = null
        loginPassword = ""
        favoriteIds = db.favorites(u.email)
        myTours.firstOrNull()?.let { newBookingActivity = it.name }
        cart = loadCart(); cartUnselected = emptySet()
        checkoutStep = 1
        activeTrackingOrderId = visibleOrders.firstOrNull()?.id ?: ""
        recipientName = u.fullName
        contactPhone = u.phone
        deliveryAddress = u.address
        newBookingTime = myTours.firstOrNull()?.let { slotsFor("tour", it.id).firstOrNull() }.orEmpty()
    }

    /** Verifies the email/password against the users table; returns true on success. */
    fun login(): Boolean {
        val u = db.authenticate(loginEmail, loginPassword)
        loginError = when {
            u == null -> "Incorrect email or password."
            u.role != loginRoleSelect -> "This account is registered as ${u.role.subtitle}. Select that role to log in."
            else -> null
        }
        if (u == null || loginError != null) return false
        startSession(u)
        showToast("Welcome back, ${u.fullName}! Logged in as ${u.role.key.uppercase()}.")
        activePage = if (u.role == Role.FARMER) Page.FARMER_PROFILE else Page.DASHBOARD
        return true
    }

    fun selectLoginRole(r: Role) {
        loginRoleSelect = r
        loginError = null
    }

    /** Creates the account in the users table; returns an error message or null on success. */
    fun signup(fullName: String, email: String, phone: String, password: String, role: Role,
               farmName: String = "", province: String = ""): String? {
        if (role == Role.ADMIN) return "Administrator accounts cannot be self-registered."
        if (role == Role.FARMER && (farmName.isBlank() || province.isBlank())) return "Farmers must enter their farm name and province."
        if (db.findUser(email) != null) return "An account with this email already exists."
        val u = db.tx {
            val created = db.createUser(fullName, email, phone, password, role.key)!!
            if (role == Role.FARMER) db.createFarm(created.id, fullName, farmName, province, images.defaultProductFallbackImage, images.farmerProfileBanner)
            db.findUser(email)!!
        }
        farmers = db.farmers()
        startSession(u)
        showToast("Account created successfully! Welcome to AgriTourism, ${u.fullName}.")
        activePage = Page.DASHBOARD
        return null
    }

    fun updateProfile(fullName: String, phone: String): String? {
        val u = currentUser ?: return "You are not logged in."
        if (fullName.isBlank()) return "Name cannot be empty."
        db.updateUserProfile(u.id, fullName, phone)
        currentUser = db.findUser(u.email)
        showToast("Profile settings updated!")
        return null
    }

    // ---------------------------------------------------------------- cart
    fun addToCart(product: Product) {
        if (!isLoggedIn) {
            showToast("Log in or Sign Up is required before adding products to your cart.")
            activePage = Page.LOGIN
            return
        }
        if (!isTourist) { showToast("Only tourist accounts can buy produce."); return }
        val maxStock = product.stock
        val currentQty = cart.firstOrNull { it.product.id == product.id }?.quantity ?: 0
        if (maxStock <= 0) { showToast("Sorry, \"${product.name}\" is currently sold out!"); return }
        if (currentQty >= maxStock) {
            showToast("Cannot add more: Farmer's limit reached ($maxStock ${product.unit} max in stock)."); return
        }
        val next = if (currentQty > 0) cart.map { if (it.product.id == product.id) it.copy(quantity = it.quantity + 1) else it }
        else cart + CartItem(product, 1)
        persistCart(next)
        showToast("Added ${product.name} to cart! (Stock remaining: ${maxStock - (currentQty + 1)})")
    }

    fun updateCartQty(productId: Long, delta: Int) {
        val target = cart.firstOrNull { it.product.id == productId } ?: return
        val live = products.firstOrNull { it.id == productId } ?: target.product
        val newQty = target.quantity + delta
        if (delta > 0 && newQty > live.stock) {
            showToast("Cannot exceed farmer's stock limit! Only ${live.stock} ${live.unit} available.")
            return
        }
        persistCart(cart.mapNotNull { if (it.product.id == productId) (if (newQty > 0) it.copy(quantity = newQty) else null) else it })
    }

    /** Returns an error if the delivery details are incomplete. */
    fun deliveryDetailsError(): String? = when {
        recipientName.isBlank() -> "Please enter the recipient's name."
        contactPhone.count(Char::isDigit) < 7 -> "Please enter a valid contact number."
        deliveryAddress.isBlank() -> "Please enter a delivery address."
        else -> null
    }

    fun placeOrder() {
        if (!isTourist) { showToast("Only tourist accounts can place orders."); return }
        if (cart.isEmpty()) { showToast("Your cart is empty."); checkoutStep = 1; return }
        val buying = checkoutItems
        if (buying.isEmpty()) { showToast("Tick at least one item in your cart to check out."); checkoutStep = 1; return }
        deliveryDetailsError()?.let { showToast(it); checkoutStep = 2; return }
        val byId = products.associateBy { it.id }
        buying.firstOrNull { (byId[it.product.id]?.stock ?: 0) < it.quantity }?.let { c ->
            val left = byId[c.product.id]?.stock ?: 0
            showToast("Only $left ${c.product.unit} of \"${c.product.name}\" left in stock. Please update your cart.")
            checkoutStep = 1; return
        }
        val orderAmt = cartTotal
        val existingNumbers = farmerOrders.map { it.orderNumber }.toSet()
        var refCode: String
        do { refCode = "ORD-${LocalDate.now().year}-${Random.nextInt(1000, 10000)}" } while (refCode in existingNumbers)
        val stamp = nowStamp()
        val originFarm = buying.first().product.farmOrigin
        // Couriers from the database take turns; the order still works if none are set up yet.
        val courier = couriers.takeIf { it.isNotEmpty() }?.let { it[farmerOrders.size % it.size] }
        val newOrderId = "ord-${System.currentTimeMillis()}"
        val order = FarmerOrder(
            id = newOrderId,
            orderNumber = refCode,
            customerEmail = userEmail,
            customerName = recipientName.trim(),
            customerPhone = contactPhone.trim(),
            customerAddress = deliveryAddress.trim(),
            items = buying.map { OrderItem(it.product.name, it.quantity, byId[it.product.id]!!.discountedPrice, it.product.id) },
            totalAmount = orderAmt,
            paymentMethod = paymentMethod,
            paymentStatus = if (paymentMethod == "Cash on Delivery") "COD" else "Paid via $paymentMethod",
            fulfillmentStatus = "Pending Packing",
            orderDate = stamp,
            uploadedReceiptUrl = "", // no payment proof uploaded through the desktop checkout
            specialDeliveryNotes = deliveryNotes.trim().ifBlank { null },
            courierName = courier?.company,
            riderName = courier?.riderName,
            riderPhone = courier?.riderPhone,
            riderVehicle = courier?.vehicle,
            currentLocation = "${originFarm} packing house · Awaiting dispatch",
            estimatedArrival = setting("delivery_eta").ifBlank { null },
            trackingNumber = "AGX-${Random.nextInt(100000, 1000000)}",
            isReceivedByUser = false,
            deliverySteps = listOf(
                DeliveryCheckpoint(if (paymentMethod == "Cash on Delivery") "Order Placed (Cash on Delivery)" else "Order Placed & Payment Verified", "AgriTourism Gateway", stamp, true),
                DeliveryCheckpoint("Fresh Farm Harvest & Packed", originFarm, "Pending", false),
                DeliveryCheckpoint("Picked Up by Courier Rider", courier?.hub?.ifBlank { null } ?: "Courier hub", "Pending", false),
                DeliveryCheckpoint("Out for Delivery", "En route to delivery address", "Pending", false),
                DeliveryCheckpoint("Delivered & Confirmed by Tourist", "Customer Delivery Address", "Pending arrival", false),
            ),
        )
        val remaining = cart - buying.toSet()
        db.tx {
            db.saveOrder(order)
            buying.forEach { c -> db.updateStock(c.product.id, max(0, byId[c.product.id]!!.stock - c.quantity)) }
            persistCart(remaining)
        }
        // Remember the delivery address on the account for next time.
        currentUser?.let { u -> if (u.address != order.customerAddress) { db.updateUserAddress(u.id, order.customerAddress); currentUser = u.copy(address = order.customerAddress) } }
        farmerOrders = listOf(order) + farmerOrders
        val bought = buying.associate { it.product.id to it.quantity }
        products = products.map { p -> bought[p.id]?.let { p.copy(stock = max(0, p.stock - it)) } ?: p }
        lastPlacedOrder = order
        activeTrackingOrderId = newOrderId
        lastOrderTotal = orderAmt
        lastOrderPaymentMethod = paymentMethod
        lastOrderReference = refCode
        checkoutStep = 4
        cartUnselected = emptySet()
        notifyFarms(farmsOf(order), AppNotification(System.currentTimeMillis(), "New Produce Order: ${order.customerName}",
            "Order #$refCode · $PESO${money(orderAmt)} · ${order.items.sumOf { it.qty }} item(s) to pack.",
            "${order.customerName} placed order #$refCode (${order.items.joinToString { "${it.qty}× ${it.productName}" }}). Payment: ${order.paymentStatus}. Deliver to ${order.customerAddress}.",
            nowStamp(), false, "farmer_order", "farmer"))
        showToast("Order placed successfully! Amount: $PESO${money(orderAmt)}")
    }

    // ---------------------------------------------------------------- bookings
    /** Saves a booking unless it would double-book the customer; returns false (with a message) if rejected. */
    private fun trySaveBooking(b: Booking): Boolean = try {
        db.saveBooking(b); true
    } catch (e: Database.DoubleBookingException) {
        val x = e.existing
        showToast("Double booking: ${b.customerName} already has #${x.bookingCode} (${x.activity}) on ${x.tourDate} at ${slotTime(x.tourTime)}.")
        false
    } catch (e: java.sql.SQLException) {
        if (e.message?.contains("UNIQUE", true) == true) { showToast("Double booking: that time slot is already reserved for this customer."); false } else throw e
    }

    private fun updateBooking(id: Long, f: (Booking) -> Booking) {
        val updated = booking(id)?.let(f) ?: return
        if (trySaveBooking(updated)) bookings = bookings.map { if (it.id == id) updated else it }
    }

    private fun updateNotifications(list: List<AppNotification>) {
        notifications = list
    }

    /** Sends a farmer alert to the account of each farm involved (admins always see farmer alerts). */
    private fun notifyFarms(farms: Set<Int?>, n: AppNotification) {
        val emails = farms.filterNotNull().mapNotNull { db.farmerAccount(it)?.email }.distinct()
        if (emails.isEmpty()) addNotification(n) else emails.forEach { addNotification(n.copy(recipientEmail = it)) }
    }

    private fun addNotification(n0: AppNotification) {
        // Keep ids unique even when several alerts are created in the same millisecond.
        val n = n0.copy(id = max(n0.id, (notifications.maxOfOrNull { it.id } ?: 0) + 1))
        db.saveNotification(n)
        notifications = listOf(n) + notifications
    }

    fun bookingAction(id: Long, newStatus: String) {
        if (denied(booking(id)?.let(::canManageBooking) == true, "accept or decline this booking")) return
        updateBooking(id) { it.copy(status = newStatus, attendanceStatus = if (newStatus == "Cancelled") "Declined by Farm" else it.attendanceStatus) }
        booking(id)?.let { b ->
            val ok = newStatus == "Confirmed"
            addNotification(AppNotification(System.currentTimeMillis(), if (ok) "Booking Accepted: ${b.farmName}" else "Booking Declined: ${b.farmName}",
                "Your reservation #${b.bookingCode} for ${b.tourDate} was ${if (ok) "accepted" else "declined"} by the farm host.",
                "Reservation #${b.bookingCode} (${b.activity}, ${b.tourDate} ${b.tourTime}, ${b.participants} guests) was ${if (ok) "accepted. See you at the farm!" else "declined by the farm host."}",
                nowStamp(), false, "booking", "tourist", b.id, recipientEmail = b.customerEmail))
        }
        showToast("Booking ${if (newStatus == "Confirmed") "ACCEPTED" else "DECLINED"} successfully!")
    }

    fun cancelBooking(id: Long) {
        if (denied(booking(id)?.let(::canViewBooking) == true, "cancel this booking")) return
        updateBooking(id) { it.copy(status = "Cancelled", attendanceStatus = "Cancelled by Tourist") }
        showToast("Booking appointment has been CANCELLED.")
    }

    fun deleteBooking(id: Long) {
        if (denied(isAdmin || booking(id)?.let(::ownsBooking) == true, "delete this booking")) return
        db.tx {
            db.deleteBooking(id)
            db.deleteNotificationsForBooking(id)
        }
        bookings = bookings.filterNot { it.id == id }
        notifications = notifications.filterNot { it.bookingId == id }
        deletingBookingId = null
        showToast("Booking deleted from your records.")
    }

    fun saveEditedBooking() {
        if (denied(editingBooking?.let { e -> booking(e.id)?.let(::canViewBooking) } == true, "edit this booking")) return
        val e0 = editingBooking ?: return
        if (e0.participants < 1) { showToast("A booking needs at least 1 guest."); return }
        if (parseTourDate(e0.tourDate) == null) { showToast("Please enter a valid date (YYYY-MM-DD)."); return }
        val original = bookings.firstOrNull { it.id == e0.id } ?: return
        // Keep the total consistent with the per-person rate when the group size changes.
        val perPerson = original.totalAmount.toDouble() / max(1, original.participants)
        val e = e0.copy(totalAmount = (perPerson * e0.participants).roundToInt())
        if (!trySaveBooking(e)) return
        bookings = bookings.map { if (it.id == e.id) e else it }
        editingBooking = null
        showToast("Booking #${e.bookingCode} updated successfully!")
    }

    fun attendanceConfirmation(bookingId: Long, willAttend: Boolean) {
        if (denied(booking(bookingId)?.let(::ownsBooking) == true, "answer attendance for this booking")) return
        val b = bookings.firstOrNull { it.id == bookingId } ?: return
        val now = System.currentTimeMillis()
        if (willAttend) {
            updateBooking(bookingId) { it.copy(attendanceStatus = "Confirmed Attending") }
            updateNotifications(notifications.map {
                if (it.bookingId == bookingId) it.copy(read = true, attendanceStatus = "Confirmed Attending",
                    title = "Confirmed: Tour Attendance Locked In",
                    desc = "You confirmed you are proceeding tomorrow at ${b.tourTime}!").also(db::saveNotification) else it
            })
            notifyFarms(setOf(farmOf(b)), AppNotification(now, "Visitor Confirmed Arrival: ${b.customerName}",
                "${b.customerName} confirmed arrival for ${b.activity} on ${b.tourDate} (${b.tourTime})!",
                "Tourist ${b.customerName} responded YES to 1-day confirmation. Booking #${b.bookingCode}. Group size: ${b.participants} guests. Contact: ${b.customerPhone ?: "not provided"}. Fresh farm refreshments and local guide are confirmed.",
                nowStamp(), false, "farmer_attendance_alert", "farmer"))
            showToast("Your attendance for ${b.farmName} tomorrow is confirmed.")
        } else {
            updateBooking(bookingId) { it.copy(attendanceStatus = "Cancelled by Tourist", status = "Cancelled") }
            updateNotifications(notifications.map {
                if (it.bookingId == bookingId) it.copy(read = true, attendanceStatus = "Cancelled by Tourist",
                    title = "Tour Visit Cancelled",
                    desc = "You cancelled your tour appointment for ${b.farmName}.").also(db::saveNotification) else it
            })
            notifyFarms(setOf(farmOf(b)), AppNotification(now, "Tourist Cancelled Visit: ${b.customerName}",
                "${b.customerName} responded NO for ${b.activity} on ${b.tourDate}.",
                "Tourist ${b.customerName} responded NO to 1-day confirmation. Booking #${b.bookingCode} is now marked as Cancelled.",
                nowStamp(), false, "farmer_attendance_alert", "farmer"))
            showToast("Tour appointment cancelled. We hope to see you next time.")
        }
        selectedBookingForView = selectedBookingForView?.let { v -> bookings.firstOrNull { it.id == v.id } }
    }

    fun checkInBooking(id: Long) {
        if (denied(booking(id)?.let(::canManageBooking) == true, "check in guests for this booking")) return
        if (bookings.firstOrNull { it.id == id }?.status == "Cancelled") { showToast("Cancelled bookings cannot be checked in."); return }
        val nowTime = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        updateBooking(id) { it.copy(attendanceStatus = "Arrived & Checked In", status = "Confirmed", checkedInAt = nowTime) }
        selectedBookingForView = selectedBookingForView?.let { v -> bookings.firstOrNull { it.id == v.id } }
        showToast("Tourist guest checked in at farm gate ($nowTime)!")
    }

    fun assignGuide(id: Long, guide: String) {
        if (denied(booking(id)?.let(::canManageBooking) == true, "assign a guide to this booking")) return
        updateBooking(id) { it.copy(assignedGuide = guide) }
        selectedBookingForView = selectedBookingForView?.let { v -> bookings.firstOrNull { it.id == v.id } }
        showToast("Tour guide \"$guide\" assigned to reservation.")
    }

    private fun newBookingCode(): String {
        val used = bookings.map { it.bookingCode }.toSet()
        var code: String
        do { code = "BK-${LocalDate.now().year}-${Random.nextInt(1000, 10000)}" } while (code in used)
        return code
    }

    private fun newId(): Long = max(System.currentTimeMillis(), (bookings.maxOfOrNull { it.id } ?: 0) + 1)

    /** Validates a reservation date (must parse and not be in the past). */
    private fun dateError(d: String): String? {
        val date = parseTourDate(d) ?: return "Please enter a valid date (YYYY-MM-DD)."
        return if (date.isBefore(LocalDate.now())) "Please choose a date from today onwards." else null
    }

    fun bookSelectedTour() {
        if (!isLoggedIn) { showToast("Please log in using the Log In button at the top header to confirm your booking."); activePage = Page.LOGIN; return }
        if (!isTourist) { showToast("Only tourist accounts can book tours."); return }
        dateError(tourDate)?.let { showToast(it); return }
        if (tourGuests < 1) { showToast("Please add at least 1 guest."); return }
        val t = selectedTour
        if (tourTime.isBlank()) tourTime = slotsFor("tour", t.id).firstOrNull().orEmpty()
        if (tourTime !in slotsFor("tour", t.id)) { showToast("Please choose one of this tour's time slots."); return }
        val nb = Booking(
            id = newId(), bookingCode = newBookingCode(), farmId = t.id, farmName = t.name,
            customerName = displayName, customerPhone = userPhone, customerEmail = userEmail,
            activity = t.name, tourDate = tourDate, tourTime = tourTime, participants = tourGuests,
            totalAmount = t.pricePerPerson * tourGuests, paymentMethod = tourPaymentMethod, status = "Confirmed",
            attendanceStatus = "Pending Confirmation",
            assignedGuide = defaultGuide(t.farmerId, t.farmerName),
        )
        if (!trySaveBooking(nb)) return
        bookings = listOf(nb) + bookings
        isTourModalOpen = false
        selectedBookingForTicket = nb
        showToast("Tour Confirmed! Your official Online Ticket Pass is ready below.")
        activePage = Page.MY_BOOKINGS
    }

    fun bookSelectedFruit() {
        if (!isLoggedIn) { showToast("Please log in using the Log In button at the top header to confirm your booking."); activePage = Page.LOGIN; return }
        if (!isTourist) { showToast("Only tourist accounts can book tours."); return }
        dateError(fruitDate)?.let { showToast(it); return }
        if (fruitGuests < 1) { showToast("Please add at least 1 guest."); return }
        val f = selectedFruit
        if (fruitTime.isBlank()) fruitTime = slotsFor("orchard", f.id).firstOrNull().orEmpty()
        if (fruitTime !in slotsFor("orchard", f.id)) { showToast("Please choose one of this orchard's time slots."); return }
        val nb = Booking(
            id = newId(), bookingCode = newBookingCode(), farmId = f.id, farmName = f.farmName,
            customerName = displayName, customerPhone = userPhone, customerEmail = userEmail,
            activity = f.title, tourDate = fruitDate, tourTime = fruitTime,
            participants = fruitGuests, totalAmount = f.pricePerPerson * fruitGuests, paymentMethod = fruitPaymentMethod,
            attendanceStatus = "Pending Confirmation", status = "Confirmed", assignedGuide = defaultGuide(f.farmerId, farmers.firstOrNull { it.id == f.farmerId }?.name.orEmpty()),
            activityType = "orchard",
        )
        if (!trySaveBooking(nb)) return
        bookings = listOf(nb) + bookings
        isFruitModalOpen = false
        selectedBookingForTicket = nb
        showToast("Fruit picking booked! Your Online Ticket Pass is ready below.")
        activePage = Page.MY_BOOKINGS
    }

    fun saveFarmerBooking() {
        if (denied(isStaff, "create walk-in bookings")) return
        if (myTours.isEmpty()) { showToast("Your farm has no tours to book yet."); return }
        if (newBookingCustomer.isBlank()) { showToast("Please enter the guest's name."); return }
        dateError(newBookingDate)?.let { showToast(it); return }
        if (newBookingGuests < 1) { showToast("Please add at least 1 guest."); return }
        val t = myTours.firstOrNull { it.name == newBookingActivity } ?: myTours.first()
        if (newBookingTime.isBlank()) newBookingTime = slotsFor("tour", t.id).firstOrNull().orEmpty()
        if (newBookingTime !in slotsFor("tour", t.id)) { showToast("Please choose one of this tour's time slots."); return }
        val total = t.pricePerPerson * newBookingGuests
        val nb = Booking(
            id = newId(), bookingCode = newBookingCode(), farmId = t.id, farmName = t.name,
            customerName = newBookingCustomer, customerPhone = newBookingPhone.trim().ifBlank { null },
            customerEmail = null, activity = t.name, tourDate = newBookingDate,
            tourTime = newBookingTime, participants = newBookingGuests, totalAmount = total,
            paymentMethod = newBookingPayment, attendanceStatus = "Pending Confirmation", status = "Confirmed",
            assignedGuide = defaultGuide(t.farmerId, t.farmerName),
        )
        if (!trySaveBooking(nb)) return
        bookings = listOf(nb) + bookings
        isAddBookingModalOpen = false
        showToast("Tour booking created for $newBookingCustomer ($PESO$total)!")
        newBookingCustomer = ""
    }

    // ---------------------------------------------------------------- reviews
    fun reviewForBooking(id: Long): CustomerReview? = reviews.firstOrNull { it.bookingId == id }

    /** Tourists can review their own visit once it has happened (checked in, or the date has passed), once per booking. */
    fun canReview(b: Booking): Boolean = ownsBooking(b) && b.status != "Cancelled" && reviewForBooking(b.id) == null &&
        (b.attendanceStatus == "Arrived & Checked In" || parseTourDate(b.tourDate)?.let { !it.isAfter(LocalDate.now()) } == true)

    fun reviewsFor(type: String, id: Int): List<CustomerReview> =
        reviews.filter { it.targetType == type && it.targetId == id }.sortedByDescending { it.id }

    /** Saves a tourist's review for one of their bookings; returns an error message or null on success. */
    fun submitReview(bookingId: Long, rating: Int, comment: String): String? {
        val b = booking(bookingId) ?: return "Booking not found."
        if (!isTourist || !ownsBooking(b)) return "You can only review your own bookings."
        if (reviewForBooking(bookingId) != null) return "You have already reviewed this booking."
        if (!canReview(b)) return "You can review this booking after your visit."
        if (rating !in 1..5) return "Please choose a rating from 1 to 5 stars."
        if (comment.trim().length < 10) return "Please write at least 10 characters about your visit."
        val review = CustomerReview(
            db.nextReviewId(), displayName, "Eco-Tourist", rating,
            LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH)), b.activity, comment.trim(),
            userEmail, b.id, b.activityType, b.farmId,
        )
        try { db.addReview(review) } catch (e: Exception) { return e.message ?: "Could not save the review." }
        reviews = db.reviews(); tours = db.tours(); fruitPicking = db.fruitPicking(); farmers = db.farmers()
        selectedTour = tours.firstOrNull { it.id == selectedTour.id } ?: selectedTour
        selectedFruit = fruitPicking.firstOrNull { it.id == selectedFruit.id } ?: selectedFruit
        notifyFarms(setOf(farmOf(b)), AppNotification(System.currentTimeMillis(), "New $rating★ Review: ${b.activity}",
            "${review.author} reviewed booking #${b.bookingCode}.", "\"${review.comment}\" — ${review.author}",
            nowStamp(), false, "farmer_review", "farmer"))
        reviewingBooking = null
        showToast("Thank you! Your $rating-star review was posted.")
        return null
    }

    // ---------------------------------------------------------------- farm setup (guides & time slots)
    private fun canManageFarm(farmId: Int?) = isAdmin || (farmId != null && farmId == myFarmId)

    private fun activityFarm(type: String, id: Int): Int? =
        if (type == "orchard") fruitPicking.firstOrNull { it.id == id }?.farmerId else tours.firstOrNull { it.id == id }?.farmerId

    /** Adds a guide to a farm; returns an error message or null on success. */
    fun addGuide(farmId: Int?, name: String): String? {
        if (!canManageFarm(farmId)) return "You can only manage guides for your own farm."
        val n = name.trim()
        if (n.length < 2) return "Enter the guide's name."
        if (guidesFor(farmId).any { it.equals(n, true) }) return "That guide is already listed."
        db.addGuide(farmId, n); guides = db.guides()
        showToast("Guide \"$n\" added.")
        return null
    }

    fun removeGuide(g: Guide) {
        if (denied(canManageFarm(g.farmerId), "remove this guide")) return
        db.deleteGuide(g.id); guides = db.guides()
        showToast("Guide \"${g.name}\" removed.")
    }

    /** Adds a time slot such as "08:00 AM - Morning Walk" to a tour or orchard; returns an error or null. */
    fun addTimeSlot(type: String, activityId: Int, label: String): String? {
        if (!canManageFarm(activityFarm(type, activityId))) return "You can only manage time slots for your own farm."
        val normalized = normalizeSlot(label).getOrElse { return it.message }
        if (slotsFor(type, activityId).any { slotTime(it) == slotTime(normalized) }) return "There is already a slot at ${slotTime(normalized)}."
        db.addTimeSlot(type, activityId, normalized); timeSlots = db.timeSlots()
        showToast("Time slot \"$normalized\" added.")
        return null
    }

    fun removeTimeSlot(t: TimeSlot) {
        if (denied(canManageFarm(activityFarm(t.activityType, t.activityId)), "remove this time slot")) return
        db.deleteTimeSlot(t.id); timeSlots = db.timeSlots()
        showToast("Time slot \"${t.label}\" removed. Existing bookings keep their time.")
    }

    // ---------------------------------------------------------------- platform settings (admin)
    /** Adds a delivery courier; returns an error message or null on success. */
    fun addCourier(c: Courier): String? {
        if (!isAdmin) return "Only administrators can manage couriers."
        if (c.company.isBlank() || c.riderName.isBlank()) return "Enter the courier company and rider name."
        if (c.riderPhone.count(Char::isDigit) < 7) return "Enter a valid rider phone number."
        db.addCourier(c); couriers = db.couriers()
        showToast("Courier ${c.riderName.trim()} (${c.company.trim()}) added.")
        return null
    }

    fun removeCourier(c: Courier) {
        if (denied(isAdmin, "remove couriers")) return
        db.deleteCourier(c.id); couriers = db.couriers()
        showToast("Courier ${c.riderName} removed. Past orders keep their courier details.")
    }

    /** Saves a platform setting; returns an error message or null on success. */
    fun saveSetting(key: String, value: String): String? {
        if (!isAdmin) return "Only administrators can change settings."
        val v = value.trim()
        if (key == "delivery_fee" && (v.toDoubleOrNull() ?: -1.0) < 0) return "Delivery fee must be a number of 0 or more."
        if (key == "product_categories" && v.split(",").none { it.isNotBlank() }) return "Enter at least one category."
        if (v.isBlank()) return "This setting cannot be empty."
        db.setSetting(key, v); settings = db.settings(); images = db.images()
        return null
    }

    // ---------------------------------------------------------------- products
    fun saveProduct() {
        if (denied(isAdmin || myFarmId != null, "add products")) return
        if (newProductName.isBlank()) { showToast("Please enter a product name."); return }
        val price = newProductPrice.toDoubleOrNull()
        if (price == null || price <= 0) { showToast("Please enter a valid price."); return }
        val stock = newProductStock.toIntOrNull()
        if (stock == null || stock < 0) { showToast("Please enter a valid stock limit."); return }
        val item = Product(
            id = System.currentTimeMillis(), name = newProductName, category = newProductCategory,
            price = price,
            unit = if (newProductUnit.startsWith("/")) newProductUnit else "/${newProductUnit.ifBlank { "kg" }}",
            discountPercent = 0, stock = stock, rating = 0.0, reviewsCount = 0,
            imageUrl = newProductImage.ifBlank { images.defaultProductFallbackImage },
            description = newProductDesc.ifBlank { "Freshly harvested produce from ${myFarm?.farmName ?: "our partner farms"}." },
            farmOrigin = myFarm?.let { "${it.farmName.split(" & ").first()} (${it.province})" } ?: "AgriTourism Partner Farms",
            farmerId = myFarmId,
        )
        db.saveProduct(item, db.minSort("products") - 1)
        products = listOf(item) + products
        isAddProductModalOpen = false
        newProductName = ""; newProductDesc = ""; newProductStock = "25"
        showToast("Successfully added \"${item.name}\" (Stock limit: $stock ${item.unit}) to your catalog!")
    }

    /** Copies a picked image into the app data folder (next to the database) so it keeps working offline; null on failure. */
    fun storeUpload(file: File): String? = runCatching {
        val dir = File(db.file.absoluteFile.parentFile, "uploads").apply { mkdirs() }
        val dest = File(dir, "${System.currentTimeMillis()}-${file.name}")
        file.copyTo(dest, overwrite = true)
        "file:${dest.absolutePath}"
    }.onFailure { showToast("Could not load that photo: ${it.message}") }.getOrNull()

    fun uploadProductImage(file: File) {
        if (denied(isStaff, "upload product photos")) return
        storeUpload(file)?.let { newProductImage = it; showToast("Photo uploaded & saved for offline catalog!") }
    }

    // ---------------------------------------------------------------- profile photos & farm story
    /** Sets the signed-in user's profile photo; a farmer's photo is also their public farm profile photo. */
    fun changeAvatar(file: File) {
        val u = currentUser ?: run { denied(false, "change your photo"); return }
        val url = storeUpload(file) ?: return
        db.tx {
            db.updateUserAvatar(u.id, url)
            myFarmId?.let { db.updateFarmerPhoto(it, url) }
        }
        currentUser = db.findUser(u.email); farmers = db.farmers()
        showToast("Profile photo updated!")
    }

    /** Changes a farmer's profile photo (own farm, or any farm for admins); the farmer's account uses it too. */
    fun changeFarmerPhoto(farmId: Int, file: File) {
        if (denied(canManageFarm(farmId), "change this farmer's photo")) return
        val url = storeUpload(file) ?: return
        db.tx {
            db.updateFarmerPhoto(farmId, url)
            db.farmerAccount(farmId)?.let { db.updateUserAvatar(it.id, url) }
        }
        farmers = db.farmers(); currentUser = currentUser?.let { db.findUser(it.email) }
        showToast("Farmer photo updated!")
    }

    /** Changes a farm's banner photo (own farm, or any farm for admins). */
    fun changeFarmBanner(farmId: Int, file: File) {
        if (denied(canManageFarm(farmId), "change this farm's photo")) return
        val url = storeUpload(file) ?: return
        db.updateFarmerBanner(farmId, url); farmers = db.farmers()
        showToast("Farm cover photo updated!")
    }

    /** Saves a farm's short story and description; returns an error or null on success. */
    fun saveFarmStory(farmId: Int, story: String, description: String): String? {
        if (!canManageFarm(farmId)) return "You can only edit your own farm's story."
        if (story.trim().length > 280) return "Keep the short story under 280 characters."
        db.updateFarmerStory(farmId, story, description); farmers = db.farmers()
        showToast("Farm story saved!")
        return null
    }

    // ---------------------------------------------------------------- farmer-created tours & orchards
    data class ActivityDraft(val name: String, val price: String, val description: String, val image: String, val slot: String,
                             val hours: String = "", val activities: String = "", val fruit: String = "", val duration: String = "", val season: String = "")

    private fun draftError(d: ActivityDraft): String? = when {
        myFarm == null -> "Only farmer accounts linked to a farm can add experiences."
        d.name.isBlank() -> "Enter a name."
        (d.price.toIntOrNull() ?: 0) <= 0 -> "Enter a price per person above 0."
        d.description.trim().length < 10 -> "Write a short description (at least 10 characters)."
        else -> null
    }

    /** Validates "08:00 AM - Name" style slot labels; returns the normalized label or an error. */
    private fun normalizeSlot(label: String): Result<String> {
        val l = label.trim().replace(Regex("\\s+"), " ")
        val m = Regex("^(\\d{1,2}):(\\d{2}) ?([AaPp][Mm])(\\s*-\\s*(.+))?$").find(l)
            ?: return Result.failure(IllegalArgumentException("Use a time like \"08:00 AM\" or \"08:00 AM - Morning Walk\"."))
        val (h, min, ap) = m.destructured
        if (h.toInt() !in 1..12 || min.toInt() !in 0..59) return Result.failure(IllegalArgumentException("That time isn't valid."))
        val name = m.groupValues[5].trim()
        return Result.success("%02d:%s %s".format(h.toInt(), min, ap.uppercase()) + if (name.isNotEmpty()) " - $name" else "")
    }

    /** Adds a farm tour to the farmer's own farm; returns an error or null on success. */
    fun createTour(d: ActivityDraft): String? {
        draftError(d)?.let { return it }
        val f = myFarm!!
        val slot = normalizeSlot(d.slot).getOrElse { return it.message }
        val tour = FarmTour(0, d.name.trim(), f.location, 0.0, 0, d.price.toInt(), d.hours.trim().ifBlank { "8:00 AM - 5:00 PM" },
            emptyList(), d.activities.split(",").map { it.trim() }.filter { it.isNotEmpty() },
            d.image.ifBlank { f.farmBannerUrl }, d.description.trim(), "New", f.name, emptyList(), f.id)
        val id = db.tx { db.createTour(tour).also { db.addTimeSlot("tour", it, slot) } }
        tours = db.tours(); farmers = db.farmers(); timeSlots = db.timeSlots()
        isAddTourModalOpen = false
        showToast("Tour \"${tour.name}\" is now listed (#$id).")
        return null
    }

    /** Adds a fruit-picking experience to the farmer's own farm; returns an error or null on success. */
    fun createOrchard(d: ActivityDraft): String? {
        draftError(d)?.let { return it }
        if (d.fruit.isBlank()) return "Enter the fruit tourists will pick."
        val f = myFarm!!
        val slot = normalizeSlot(d.slot).getOrElse { return it.message }
        val item = FruitPickingItem(0, d.name.trim(), f.farmName, f.location, d.fruit.trim(), d.price.toInt(), 0.0, 0,
            d.duration.trim().ifBlank { "2 hours" }, d.fruit.trim(), d.image.ifBlank { f.farmBannerUrl }, d.description.trim(),
            d.season.trim().ifBlank { "Year-round" }, emptyList(), f.id)
        val id = db.tx { db.createOrchard(item).also { db.addTimeSlot("orchard", it, slot) } }
        fruitPicking = db.fruitPicking(); timeSlots = db.timeSlots()
        isAddOrchardModalOpen = false
        showToast("Fruit picking \"${item.title}\" is now listed (#$id).")
        return null
    }

    // ---------------------------------------------------------------- orders
    private fun updateOrder(id: String, f: (FarmerOrder) -> FarmerOrder) {
        farmerOrders = farmerOrders.map { if (it.id == id) f(it).also { o -> db.saveOrder(o) } else it }
        selectedOrderForView = selectedOrderForView?.let { v -> farmerOrders.firstOrNull { it.id == v.id } }
        selectedOrderForTracking = selectedOrderForTracking?.let { v -> farmerOrders.firstOrNull { it.id == v.id } }
    }

    /** Keeps the tracking timeline in step with the fulfillment status (the last step is the tourist's own confirmation). */
    private fun syncSteps(o: FarmerOrder, status: String): FarmerOrder {
        if (o.isReceivedByUser) return o.copy(fulfillmentStatus = "Delivered")
        val reached = when (status) { "Pending Packing" -> 0; "Packed" -> 1; "Dispatched" -> 2; "Out for Delivery" -> 3; "Delivered" -> 3; else -> return o.copy(fulfillmentStatus = status) }
        val stamp = nowStamp()
        val last = o.deliverySteps.lastIndex
        return o.copy(fulfillmentStatus = status, deliverySteps = o.deliverySteps.mapIndexed { i, st ->
            when {
                i == last -> st
                i <= reached && !st.completed -> st.copy(completed = true, timestamp = stamp)
                i > reached && st.completed && i > 0 -> st.copy(completed = false, timestamp = "Pending")
                else -> st
            }
        })
    }

    fun orderStatusUpdate(id: String, status: String) {
        if (denied(order(id)?.let(::canManageOrder) == true, "update this order")) return
        updateOrder(id) { syncSteps(it, status) }
        showToast("Order #$id status updated to: $status")
    }

    fun confirmOrderReceived(id: String) {
        if (denied(order(id)?.let(::canViewOrder) == true, "confirm this order")) return
        if (farmerOrders.firstOrNull { it.id == id }?.isReceivedByUser != false) return
        val ts = nowStamp()
        updateOrder(id) { o ->
            o.copy(
                fulfillmentStatus = "Delivered", isReceivedByUser = true, receivedAt = ts,
                receivedByRecipient = "${o.customerName} (Confirmed Delivery Handover)",
                currentLocation = "Delivered at ${o.customerAddress}",
                deliverySteps = o.deliverySteps.mapIndexed { i, s ->
                    when {
                        i == o.deliverySteps.lastIndex -> s.copy(completed = true, timestamp = ts, notes = "Verified & received by ${o.customerName}")
                        !s.completed -> s.copy(completed = true, timestamp = ts)
                        else -> s
                    }
                },
            )
        }
        notifyFarms(order(id)?.let(::farmsOf).orEmpty(), AppNotification(System.currentTimeMillis(), "Order Delivered & Received by Tourist!",
            "Customer confirmed receiving Order #$id in good condition.",
            "Eco-tourist customer confirmed receiving the delivered organic farm produce in fresh condition. Reference #$id. Handover verified.",
            nowStamp(), false, "farmer_order", "farmer"))
        showToast("Package marked as Received! Thank you for supporting our local farmers.")
    }

    fun updateDeliveryLocation(id: String, location: String, status: String? = null) {
        if (denied(order(id)?.let(::canManageOrder) == true, "update this delivery")) return
        updateOrder(id) { o -> (if (status != null) syncSteps(o, status) else o).copy(currentLocation = location) }
        showToast("Delivery location updated for order #$id.")
    }

    // ---------------------------------------------------------------- notifications
    fun openNotification(n: AppNotification) {
        if (n !in roleFilteredNotifications) return
        updateNotifications(notifications.map { if (it.id == n.id) it.copy(read = true).also(db::saveNotification) else it })
        selectedNotification = n
    }

    // ---------------------------------------------------------------- receipts / tickets
    fun printTourReceipt(b: Booking) {
        if (denied(canViewBooking(b), "view this receipt")) return
        val unit = (b.totalAmount.toDouble() / max(1, b.participants)).roundToInt().toDouble()
        selectedReceipt = Receipt(
            "RCP-${b.bookingCode}", "${b.tourDate} · ${b.paymentMethod ?: "GCash"}", b.customerName,
            b.customerPhone ?: "—", b.customerEmail ?: "Walk-in guest", b.farmName,
            farmOf(b)?.let { id -> farmers.firstOrNull { it.id == id }?.name } ?: b.assignedGuide ?: "Farm Host",
            listOf(ReceiptItem("${b.activity} (${b.tourTime})", b.participants, unit, b.totalAmount.toDouble())),
            b.totalAmount.toDouble(), 0.0, b.totalAmount.toDouble(), b.paymentMethod ?: "GCash",
            when { b.status == "Cancelled" -> "CANCELLED"; isPayOnSite(b.paymentMethod) -> "TO BE PAID AT THE FARM"; else -> "PAID & CONFIRMED" },
            "AUTH-TK-${b.id}88", "tour_booking",
        )
    }

    fun printOrderReceipt(o: FarmerOrder) {
        if (denied(canViewOrder(o), "view this receipt")) return
        val items = o.items.map { ReceiptItem(it.productName, it.qty, it.unitPrice, it.qty * it.unitPrice) }
        val sub = items.sumOf { it.total }
        val fee = (o.totalAmount - sub).coerceAtLeast(0.0)
        selectedReceipt = Receipt(
            "RCP-${o.orderNumber}", o.orderDate, o.customerName, o.customerPhone, o.customerAddress,
            farmsOf(o).mapNotNull { id -> farmers.firstOrNull { it.id == id }?.farmName }.ifEmpty { listOf("AgriTourism Partner Farms") }.joinToString(" · "),
            farmsOf(o).mapNotNull { id -> farmers.firstOrNull { it.id == id }?.name }.ifEmpty { listOf("AgriTourism Philippines") }.joinToString(", "),
            items, sub, fee, sub + fee,
            o.paymentMethod, o.paymentStatus.ifBlank { if (o.paymentMethod == "Cash on Delivery") "COD" else "PAID" }, "TXN-${o.orderNumber}-PH", "produce_order",
        )
    }

    private fun isPayOnSite(method: String?) = method in setOf("Pay at Farm", "Cash on Arrival")

    fun currentTrackedOrder(): FarmerOrder? = visibleOrders.let { list ->
        list.firstOrNull { it.id == activeTrackingOrderId || it.orderNumber == activeTrackingOrderId } ?: list.firstOrNull()
    }
}
