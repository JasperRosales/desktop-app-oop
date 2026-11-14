package ph.agritourism.ui

import androidx.compose.runtime.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ph.agritourism.data.Database
import ph.agritourism.model.*
import java.io.File
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.random.Random

enum class Page {
    DASHBOARD, HOME, FARM_DETAIL, FRUIT_PICKING, MARKET, FARMERS_STORIES, MY_BOOKINGS, CART_CHECKOUT,
    ORDER_TRACKING, FARMER_ORDERS, FARMER_PRODUCTS, FARMER_PROFILE, SIGNUP, LOGIN, SQL_STUDIO
}

enum class ShowcaseCategory { ALL, PLACES, PRODUCTS, ORCHARDS }

const val DELIVERY_FEE = 70.0
const val PESO = "₱"

val TOUR_TIME_SLOTS = listOf(
    "08:00 AM - Morning Agro-Walk", "10:30 AM - Canopy & Cacao Trail",
    "02:00 PM - Afternoon Farm Experience", "04:00 PM - Sunset Overlook",
)
val FRUIT_TIME_SLOTS = listOf(
    "07:30 AM - Cool Morning Orchard Harvest", "09:30 AM - Prime Picking Session",
    "02:30 PM - Afternoon Family Picking", "04:00 PM - Golden Hour Farm Harvest",
)
val RESCHEDULE_SLOTS = listOf(
    "08:30 AM" to "08:30 AM - Morning Eco Trail", "10:00 AM" to "10:00 AM - Honeycomb & Orchard Tour",
    "01:30 PM" to "01:30 PM - Cacao Forest Experience", "03:00 PM" to "03:00 PM - Afternoon Farm Excursion",
)
val BOOKING_LIST_GUIDES = listOf(
    "Ate Rosa (Master Beekeeper)", "Kuya Dennis (Senior Pomologist)",
    "Mang Rigor (Heritage Agro Guide)", "Kuya Elmer (Trail Captain)",
)
val DOSSIER_GUIDES = listOf(
    "Kuya Noel (Master Horticulturist)", "Ate Luisa (Organic Trail Guide)",
    "Mang Ben (Orchard Elder)", "Ramon (Bee & Honey Specialist)",
)

fun money(v: Number): String {
    val d = v.toDouble()
    return if (d == Math.floor(d)) "%,d".format(d.toLong()) else "%,.2f".format(d)
}

class AppState(val db: Database, private val scope: CoroutineScope) {
    // static catalog (from SQLite)
    val images: AppImages = Database.loadSeed().config
    val tours: List<FarmTour> = db.tours()
    val fruitPicking: List<FruitPickingItem> = db.fruitPicking()
    val farmers: List<FarmerProfile> = db.farmers()
    val reviews: List<CustomerReview> = db.reviews()

    // navigation & role
    var activePage by mutableStateOf(Page.DASHBOARD)
    var userRole by mutableStateOf(Role.ADMIN)
    var isLoggedIn by mutableStateOf(true)
    var showcaseCategory by mutableStateOf(ShowcaseCategory.ALL)
    var isSidebarCollapsed by mutableStateOf(false)

    // login
    var loginEmail by mutableStateOf("maria.santos@gmail.com")
    var loginPassword by mutableStateOf("password")
    var loginRoleSelect by mutableStateOf(Role.USER)

    // selections
    var selectedTour by mutableStateOf(tours.first())
    var selectedFruit by mutableStateOf(fruitPicking.first())
    var isTourModalOpen by mutableStateOf(false)
    var isFruitModalOpen by mutableStateOf(false)

    // tour/fruit reservation inputs
    var tourDate by mutableStateOf("2026-11-20")
    var tourTime by mutableStateOf(TOUR_TIME_SLOTS[0])
    var tourGuests by mutableStateOf(2)
    var tourPaymentMethod by mutableStateOf("GCash")
    var fruitDate by mutableStateOf("2026-11-20")
    var fruitTime by mutableStateOf(FRUIT_TIME_SLOTS[1])
    var fruitGuests by mutableStateOf(2)
    var fruitPaymentMethod by mutableStateOf("GCash")

    // persisted collections
    var products by mutableStateOf(db.products())
    var bookings by mutableStateOf(db.bookings())
    var farmerOrders by mutableStateOf(db.orders())
    var notifications by mutableStateOf(db.notifications())
    var favoriteIds by mutableStateOf(db.favorites())
    var cart by mutableStateOf(loadCart())

    // checkout
    var checkoutStep by mutableStateOf(1)
    var recipientName by mutableStateOf("Maria Santos")
    var contactPhone by mutableStateOf("+63 917 555 0192")
    var deliveryAddress by mutableStateOf("Unit 402 Greenbelt Residences, Legazpi St, Makati City")
    var deliveryNotes by mutableStateOf("Please leave with building reception if unavailable.")
    var paymentMethod by mutableStateOf("GCash")
    var lastOrderTotal by mutableStateOf(550.0)
    var lastOrderReference by mutableStateOf("AGT-782491")
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
    var deletingBookingId by mutableStateOf<Long?>(null)
    var selectedOrderForView by mutableStateOf<FarmerOrder?>(null)
    var selectedOrderForTracking by mutableStateOf<FarmerOrder?>(null)
    var selectedFarmerForModal by mutableStateOf<FarmerProfile?>(null)
    var selectedReceipt by mutableStateOf<Receipt?>(null)
    var toastMessage by mutableStateOf<String?>(null)
    private var toastJob: Job? = null

    // filters
    var marketFilter by mutableStateOf("All")
    var searchQuery by mutableStateOf("")
    var bookingsFilter by mutableStateOf("All")
    var ordersFilter by mutableStateOf("All")
    var activeTrackingOrderId by mutableStateOf("ord-1")
    var farmerStoriesFilter by mutableStateOf("All")
    var farmerSearchQuery by mutableStateOf("")
    var currentSlide by mutableStateOf(0)

    // walk-in booking form
    var newBookingCustomer by mutableStateOf("Anna Addyson")
    var newBookingPhone by mutableStateOf("+63 918 333 4455")
    var newBookingActivity by mutableStateOf(tours.first().name)
    var newBookingDate by mutableStateOf("2026-11-25")
    var newBookingTime by mutableStateOf("08:00 AM - Morning Agro-Walk")
    var newBookingGuests by mutableStateOf(2)
    var newBookingPayment by mutableStateOf("Cash on Arrival")

    // add product form
    var newProductName by mutableStateOf("")
    var newProductCategory by mutableStateOf("Vegetables")
    var newProductPrice by mutableStateOf("100")
    var newProductUnit by mutableStateOf("kg")
    var newProductStock by mutableStateOf("25")
    var newProductDesc by mutableStateOf("")
    var newProductImage by mutableStateOf(images.presetTomatoImage.ifBlank { "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80" })

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
        return db.cart().mapNotNull { (id, q) -> byId[id]?.let { CartItem(it, q) } }
    }

    private fun persistCart(items: List<CartItem>) {
        db.tx {
            db.clearCart()
            items.forEachIndexed { i, c -> db.setCartItem(c.product.id, c.quantity, i) }
        }
        cart = items
    }

    // ---------------------------------------------------------------- derived
    val roleFilteredNotifications: List<AppNotification>
        get() {
            if (!isLoggedIn) return emptyList()
            return when (userRole) {
                Role.FARMER -> notifications.filter { it.targetRole == "farmer" || it.type in setOf("farmer_attendance_alert", "farmer_order", "farmer_booking_alert") }
                Role.USER -> notifications.filter { it.targetRole == "tourist" || it.type in setOf("attendance_reminder", "booking", "market") }
                Role.ADMIN -> notifications
            }
        }

    val unreadCount get() = roleFilteredNotifications.count { !it.read }

    val cartSubtotal: Double get() = cart.sumOf { it.product.discountedPrice * it.quantity }
    val cartTotal: Double get() = if (cart.isNotEmpty()) cartSubtotal + DELIVERY_FEE else 0.0

    val filteredProducts: List<Product>
        get() = products.filter { p ->
            (marketFilter == "All" || p.category == marketFilter) &&
                (p.name.contains(searchQuery, true) || p.farmOrigin.contains(searchQuery, true))
        }

    val avatar: String
        get() = when (userRole) { Role.ADMIN -> images.adminAvatar; Role.FARMER -> images.juanAvatar; Role.USER -> images.mariaAvatar }

    // ---------------------------------------------------------------- generic
    fun showToast(msg: String) {
        toastMessage = msg
        toastJob?.cancel()
        toastJob = scope.launch { delay(3200); toastMessage = null }
    }

    fun navigate(p: Page) { activePage = p }

    fun openShowcase(c: ShowcaseCategory) { showcaseCategory = c; activePage = Page.HOME }

    fun reloadFromDb() {
        products = db.products(); bookings = db.bookings(); farmerOrders = db.orders()
        notifications = db.notifications(); favoriteIds = db.favorites(); cart = loadCart()
        showToast("Reloaded data from SQLite database.")
    }

    fun toggleFavorite(id: Long, name: String) {
        val exists = id in favoriteIds
        db.setFavorite(id, !exists)
        favoriteIds = if (exists) favoriteIds - id else favoriteIds + id
        showToast(if (exists) "Removed \"$name\" from your favorites." else "Saved \"$name\" to your favorites.")
    }

    fun signOut() {
        isLoggedIn = false
        isNotificationsOpen = false
        selectedNotification = null
        activePage = Page.HOME
        showToast("Signed out successfully. Welcome to AgriTourism Philippines!")
    }

    fun login() {
        isLoggedIn = true
        userRole = loginRoleSelect
        db.upsertUser(loginRoleSelect.displayName, loginEmail, "+63 917 555 0192", loginRoleSelect.key)
        showToast("Welcome back! Logged in as ${loginRoleSelect.key.uppercase()}.")
        activePage = if (loginRoleSelect == Role.FARMER) Page.FARMER_PROFILE else Page.DASHBOARD
    }

    fun selectLoginRole(r: Role) {
        loginRoleSelect = r
        loginEmail = r.email
    }

    fun signup(fullName: String, email: String, phone: String, role: Role) {
        userRole = role
        isLoggedIn = true
        db.upsertUser(fullName, email, phone, role.key)
        showToast("Account created successfully! Welcome to AgriTourism.")
        activePage = Page.DASHBOARD
    }

    // ---------------------------------------------------------------- cart
    fun addToCart(product: Product) {
        if (!isLoggedIn) {
            showToast("Log in or Sign Up is required before adding products to your cart.")
            activePage = Page.LOGIN
            return
        }
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
        val newQty = target.quantity + delta
        if (delta > 0 && newQty > target.product.stock) {
            showToast("Cannot exceed farmer's stock limit! Only ${target.product.stock} ${target.product.unit} available.")
            return
        }
        persistCart(cart.mapNotNull { if (it.product.id == productId) (if (newQty > 0) it.copy(quantity = newQty) else null) else it })
    }

    fun placeOrder() {
        val orderAmt = if (cartTotal > 0) cartTotal else 550.0
        val refCode = "ORD-2026-${Random.nextInt(100, 1000)}"
        val newOrderId = "ord-${System.currentTimeMillis()}"
        val order = FarmerOrder(
            id = newOrderId,
            orderNumber = refCode,
            customerName = recipientName.ifBlank { "Maria Santos" },
            customerPhone = contactPhone.ifBlank { "+63 917 555 0192" },
            customerAddress = deliveryAddress.ifBlank { "Unit 12B Green Residences, Taft Ave, Malate, Manila" },
            items = if (cart.isNotEmpty()) cart.map { OrderItem(it.product.name, it.quantity, it.product.discountedPrice) }
            else listOf(OrderItem("Carabao Mangoes", 2, 120.0), OrderItem("Pure Wild Honey", 1, 250.0)),
            totalAmount = orderAmt,
            paymentMethod = paymentMethod,
            paymentStatus = if (paymentMethod == "Cash on Delivery") "COD" else "Paid via GCash",
            fulfillmentStatus = "Dispatched",
            orderDate = "Nov 19, 2026 · Just now",
            uploadedReceiptUrl = images.receiptSamplePhoto,
            specialDeliveryNotes = deliveryNotes.ifBlank { "Please deliver fresh with protective foam padding." },
            courierName = "AgriExpress Direct Logistics",
            riderName = "Kuya Jun-Jun Ramos",
            riderPhone = "+63 920 112 3456",
            riderVehicle = "Yamaha NMAX (Insulated Box) · Plate DA 7192",
            currentLocation = "STAR Tollway approaching SLEX Corridor · En route to customer",
            estimatedArrival = "Today, ~11:30 AM (20-30 mins away)",
            trackingNumber = "AGX-${Random.nextInt(100000, 1000000)}",
            isReceivedByUser = false,
            deliverySteps = listOf(
                DeliveryCheckpoint("Order Placed & Payment Verified", "AgriTourism Gateway", "Just now", true),
                DeliveryCheckpoint("Fresh Farm Harvest & Packed", "Sunnyvale Farm, Lipa City", "Just now", true),
                DeliveryCheckpoint("Picked Up by Courier Rider", "Lipa Express Logistics Center", "Just now", true),
                DeliveryCheckpoint("Out for Delivery", "Corridor en route to delivery address", "Estimated 11:30 AM", true, "Rider on the road"),
                DeliveryCheckpoint("Delivered & Confirmed by Tourist", "Customer Delivery Address", "Pending arrival", false),
            ),
        )
        db.tx {
            db.saveOrder(order)
            cart.forEach { c ->
                products.firstOrNull { it.id == c.product.id }?.let { db.updateStock(it.id, max(0, it.stock - c.quantity)) }
            }
            db.clearCart()
        }
        farmerOrders = listOf(order) + farmerOrders
        if (cart.isNotEmpty()) {
            val bought = cart.associate { it.product.id to it.quantity }
            products = products.map { p -> bought[p.id]?.let { p.copy(stock = max(0, p.stock - it)) } ?: p }
        }
        lastPlacedOrder = order
        activeTrackingOrderId = newOrderId
        lastOrderTotal = orderAmt
        lastOrderPaymentMethod = paymentMethod
        lastOrderReference = refCode
        checkoutStep = 4
        cart = emptyList()
        showToast("Order placed successfully! Amount: $PESO${money(orderAmt)}")
    }

    // ---------------------------------------------------------------- bookings
    private fun updateBooking(id: Long, f: (Booking) -> Booking) {
        bookings = bookings.map { if (it.id == id) f(it).also(db::saveBooking) else it }
    }

    private fun updateNotifications(list: List<AppNotification>) {
        notifications = list
    }

    private fun addNotification(n: AppNotification) {
        db.saveNotification(n)
        notifications = listOf(n) + notifications
    }

    fun bookingAction(id: Long, newStatus: String) {
        updateBooking(id) { it.copy(status = newStatus) }
        showToast("Booking ${if (newStatus == "Confirmed") "ACCEPTED" else "DECLINED"} successfully!")
    }

    fun cancelBooking(id: Long) {
        updateBooking(id) { it.copy(status = "Cancelled", attendanceStatus = "Cancelled by Tourist") }
        showToast("Booking appointment has been CANCELLED.")
    }

    fun deleteBooking(id: Long) {
        db.deleteBooking(id)
        bookings = bookings.filterNot { it.id == id }
        deletingBookingId = null
        showToast("Booking deleted from your records.")
    }

    fun saveEditedBooking() {
        val e = editingBooking ?: return
        db.saveBooking(e)
        bookings = bookings.map { if (it.id == e.id) e else it }
        editingBooking = null
        showToast("Booking #${e.bookingCode} updated successfully!")
    }

    fun attendanceConfirmation(bookingId: Long, willAttend: Boolean) {
        val b = bookings.firstOrNull { it.id == bookingId } ?: return
        val now = System.currentTimeMillis()
        if (willAttend) {
            updateBooking(bookingId) { it.copy(attendanceStatus = "Confirmed Attending") }
            updateNotifications(notifications.map {
                if (it.bookingId == bookingId) it.copy(read = true, attendanceStatus = "Confirmed Attending",
                    title = "Confirmed: Tour Attendance Locked In",
                    desc = "You confirmed you are proceeding tomorrow at ${b.tourTime}!").also(db::saveNotification) else it
            })
            addNotification(AppNotification(now, "Visitor Confirmed Arrival: ${b.customerName}",
                "${b.customerName} confirmed arrival for ${b.activity} on ${b.tourDate} (${b.tourTime})!",
                "Tourist ${b.customerName} responded YES to 1-day confirmation. Booking #${b.bookingCode}. Group size: ${b.participants} guests. Contact: ${b.customerPhone ?: "+63 917 555 0192"}. Fresh farm refreshments and local guide are confirmed.",
                "Just now", false, "farmer_attendance_alert", "farmer"))
            showToast("Your attendance for ${b.farmName} tomorrow is confirmed.")
        } else {
            updateBooking(bookingId) { it.copy(attendanceStatus = "Cancelled by Tourist", status = "Cancelled") }
            updateNotifications(notifications.map {
                if (it.bookingId == bookingId) it.copy(read = true, attendanceStatus = "Cancelled by Tourist",
                    title = "Tour Visit Cancelled",
                    desc = "You cancelled your tour appointment for ${b.farmName}.").also(db::saveNotification) else it
            })
            addNotification(AppNotification(now, "Tourist Cancelled Visit: ${b.customerName}",
                "${b.customerName} responded NO for ${b.activity} on ${b.tourDate}.",
                "Tourist ${b.customerName} responded NO to 1-day confirmation. Booking #${b.bookingCode} is now marked as Cancelled.",
                "Just now", false, "farmer_attendance_alert", "farmer"))
            showToast("Tour appointment cancelled. We hope to see you next time.")
        }
        selectedBookingForView = selectedBookingForView?.let { v -> bookings.firstOrNull { it.id == v.id } }
    }

    fun checkInBooking(id: Long) {
        val nowTime = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"))
        updateBooking(id) { it.copy(attendanceStatus = "Arrived & Checked In", status = "Confirmed", checkedInAt = nowTime) }
        selectedBookingForView = selectedBookingForView?.let { v -> bookings.firstOrNull { it.id == v.id } }
        showToast("Tourist guest checked in at farm gate ($nowTime)!")
    }

    fun assignGuide(id: Long, guide: String) {
        updateBooking(id) { it.copy(assignedGuide = guide) }
        selectedBookingForView = selectedBookingForView?.let { v -> bookings.firstOrNull { it.id == v.id } }
        showToast("Tour guide \"$guide\" assigned to reservation.")
    }

    private fun newBookingCode() = "BK-2026-${Random.nextInt(100, 1000)}"

    fun bookSelectedTour() {
        if (!isLoggedIn) { showToast("Please log in using the Log In button at the top header to confirm your booking."); return }
        val t = selectedTour
        val nb = Booking(
            id = System.currentTimeMillis(), bookingCode = newBookingCode(), farmId = t.id, farmName = t.name,
            customerName = "Maria Santos", customerPhone = "+63 917 555 0192", customerEmail = "maria.santos@gmail.com",
            activity = t.name, tourDate = tourDate, tourTime = tourTime.ifBlank { "09:00 AM" }, participants = tourGuests,
            totalAmount = t.pricePerPerson * tourGuests, paymentMethod = tourPaymentMethod, status = "Confirmed",
            assignedGuide = if (t.farmerName.isNotBlank()) "${t.farmerName} (Farm Host & Guide)" else "Ate Rosa (Master Guide)",
        )
        db.saveBooking(nb)
        bookings = listOf(nb) + bookings
        isTourModalOpen = false
        selectedBookingForTicket = nb
        showToast("Tour Confirmed! Your official Online Ticket Pass is ready below.")
        activePage = Page.MY_BOOKINGS
    }

    fun bookSelectedFruit() {
        if (!isLoggedIn) { showToast("Please log in using the Log In button at the top header to confirm your booking."); return }
        val f = selectedFruit
        val nb = Booking(
            id = System.currentTimeMillis(), bookingCode = newBookingCode(), farmId = f.id, farmName = f.farmName,
            customerName = "Maria Santos", customerPhone = "+63 917 555 0192", customerEmail = "maria.santos@gmail.com",
            activity = f.title, tourDate = fruitDate, tourTime = fruitTime.split(" - ").first().ifBlank { "09:30 AM" },
            participants = fruitGuests, totalAmount = f.pricePerPerson * fruitGuests, paymentMethod = fruitPaymentMethod,
            attendanceStatus = "Pending Confirmation", status = "Confirmed", assignedGuide = "Kuya Dennis (Senior Orchardist)",
        )
        db.saveBooking(nb)
        bookings = listOf(nb) + bookings
        isFruitModalOpen = false
        selectedBookingForTicket = nb
        showToast("Fruit picking booked! Your Online Ticket Pass is ready below.")
        activePage = Page.MY_BOOKINGS
    }

    fun saveFarmerBooking() {
        if (newBookingCustomer.isBlank()) return
        val t = tours.firstOrNull { it.name == newBookingActivity } ?: tours.first()
        val total = t.pricePerPerson * newBookingGuests
        val nb = Booking(
            id = System.currentTimeMillis(), bookingCode = newBookingCode(), farmId = t.id, farmName = t.name,
            customerName = newBookingCustomer, customerPhone = newBookingPhone.ifBlank { "+63 917 555 0192" },
            customerEmail = "tourist@agritourism.ph", activity = t.name, tourDate = newBookingDate,
            tourTime = newBookingTime.ifBlank { "09:00 AM" }, participants = newBookingGuests, totalAmount = total,
            paymentMethod = newBookingPayment, attendanceStatus = "Pending Confirmation", status = "Confirmed",
        )
        db.saveBooking(nb)
        bookings = listOf(nb) + bookings
        isAddBookingModalOpen = false
        showToast("Tour booking created for $newBookingCustomer ($PESO$total)!")
        newBookingCustomer = ""
    }

    // ---------------------------------------------------------------- products
    fun saveProduct() {
        if (newProductName.isBlank()) return
        val stock = newProductStock.toIntOrNull() ?: 20
        val item = Product(
            id = System.currentTimeMillis(), name = newProductName, category = newProductCategory,
            price = newProductPrice.toDoubleOrNull() ?: 80.0,
            unit = if (newProductUnit.startsWith("/")) newProductUnit else "/${newProductUnit.ifBlank { "kg" }}",
            discountPercent = 10, stock = stock, rating = 5.0, reviewsCount = 1,
            imageUrl = newProductImage.ifBlank { images.defaultProductFallbackImage },
            description = newProductDesc.ifBlank { "Freshly harvested organic produce from Sunnyvale Farm." },
            farmOrigin = "Sunnyvale Farm (Batangas)",
        )
        db.saveProduct(item, db.minSort("products") - 1)
        products = listOf(item) + products
        isAddProductModalOpen = false
        newProductName = ""; newProductDesc = ""; newProductStock = "25"
        showToast("Successfully added \"${item.name}\" (Stock limit: $stock ${item.unit}) to your catalog!")
    }

    /** Copies a picked image into the app data folder so the catalog keeps working offline. */
    fun uploadProductImage(file: File) {
        runCatching {
            val dir = File(Database.defaultFile().parentFile, "uploads").apply { mkdirs() }
            val dest = File(dir, "${System.currentTimeMillis()}-${file.name}")
            file.copyTo(dest, overwrite = true)
            newProductImage = "file:${dest.absolutePath}"
            showToast("Photo uploaded & saved for offline catalog!")
        }.onFailure { showToast("Could not load that photo: ${it.message}") }
    }

    // ---------------------------------------------------------------- orders
    private fun updateOrder(id: String, f: (FarmerOrder) -> FarmerOrder) {
        farmerOrders = farmerOrders.map { if (it.id == id) f(it).also { o -> db.saveOrder(o) } else it }
        selectedOrderForView = selectedOrderForView?.let { v -> farmerOrders.firstOrNull { it.id == v.id } }
        selectedOrderForTracking = selectedOrderForTracking?.let { v -> farmerOrders.firstOrNull { it.id == v.id } }
    }

    fun orderStatusUpdate(id: String, status: String) {
        updateOrder(id) { it.copy(fulfillmentStatus = status) }
        showToast("Order #$id status updated to: $status")
    }

    fun confirmOrderReceived(id: String) {
        val ts = "Nov 19, 2026 · 11:45 AM"
        updateOrder(id) { o ->
            o.copy(
                fulfillmentStatus = "Delivered", isReceivedByUser = true, receivedAt = ts,
                receivedByRecipient = "${o.customerName} (Confirmed Delivery Handover)",
                currentLocation = "Delivered at ${o.customerAddress}",
                deliverySteps = o.deliverySteps.map { s ->
                    if (s.title.contains("delivered", true) || s.title.contains("confirmed", true))
                        s.copy(completed = true, timestamp = ts, notes = "Verified & received by ${o.customerName}") else s
                },
            )
        }
        addNotification(AppNotification(System.currentTimeMillis(), "Order Delivered & Received by Tourist!",
            "Customer confirmed receiving Order #$id in good condition.",
            "Eco-tourist customer confirmed receiving the delivered organic farm produce in fresh condition. Reference #$id. Handover verified.",
            "Just now", false, "farmer_order", "farmer"))
        showToast("Package marked as Received! Thank you for supporting our local farmers.")
    }

    fun updateDeliveryLocation(id: String, location: String, status: String? = null) {
        updateOrder(id) { it.copy(currentLocation = location, fulfillmentStatus = status ?: it.fulfillmentStatus) }
        showToast("Delivery location updated for order #$id.")
    }

    // ---------------------------------------------------------------- notifications
    fun openNotification(n: AppNotification) {
        updateNotifications(notifications.map { if (it.id == n.id) it.copy(read = true).also(db::saveNotification) else it })
        selectedNotification = n
    }

    // ---------------------------------------------------------------- receipts / tickets
    fun printTourReceipt(b: Booking) {
        val unit = (b.totalAmount.toDouble() / max(1, b.participants)).roundToInt().toDouble()
        selectedReceipt = Receipt(
            "RCP-${b.bookingCode}", "${b.tourDate} · Paid via ${b.paymentMethod ?: "GCash"}", b.customerName,
            b.customerPhone ?: "+63 917 555 0192", b.customerEmail ?: "tourist@agritourism.ph", b.farmName,
            b.assignedGuide ?: "Mang Juan Dela Cruz (Farm Host)",
            listOf(ReceiptItem("${b.activity} (${b.tourTime})", b.participants, unit, b.totalAmount.toDouble())),
            b.totalAmount.toDouble(), 0.0, b.totalAmount.toDouble(), b.paymentMethod ?: "GCash", "PAID & CONFIRMED",
            "AUTH-TK-${b.id}88", "tour_booking",
        )
    }

    fun printOrderReceipt(o: FarmerOrder) {
        val items = o.items.map { ReceiptItem(it.productName, it.qty, it.unitPrice, it.qty * it.unitPrice) }
        val sub = items.sumOf { it.total }
        val fee = if (o.totalAmount > sub) o.totalAmount - sub else if (o.totalAmount > 0) DELIVERY_FEE else 0.0
        selectedReceipt = Receipt(
            "RCP-${o.orderNumber}", o.orderDate, o.customerName, o.customerPhone, o.customerAddress,
            "Sunnyvale Farm & Partner Agro-Estates", "Mang Juan Dela Cruz", items, sub, fee, sub + fee,
            o.paymentMethod, o.paymentStatus.ifBlank { "PAID & VERIFIED" }, "TXN-${o.orderNumber}-PH", "produce_order",
        )
    }

    fun currentTrackedOrder(): FarmerOrder? =
        farmerOrders.firstOrNull { it.id == activeTrackingOrderId || it.orderNumber == activeTrackingOrderId } ?: farmerOrders.firstOrNull()
}
