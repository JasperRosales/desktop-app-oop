package ph.agritourism

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import ph.agritourism.data.Database
import ph.agritourism.model.Role
import ph.agritourism.ui.AppState
import ph.agritourism.ui.ImageLoader
import ph.agritourism.ui.Page
import ph.agritourism.ui.TOUR_TIME_SLOTS
import ph.agritourism.model.slotKey
import java.io.File
import kotlin.test.*

/** Exercises the same user flows as the original React app against a real temporary SQLite database. */
class FlowTest {
    private val file = File.createTempFile("agri", ".db").also { it.delete() }
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private lateinit var db: Database
    private lateinit var s: AppState

    @BeforeTest fun setUp() { db = Database(file); s = AppState(db, scope) }
    @AfterTest fun tearDown() { scope.cancel(); db.close(); file.delete() }

    private fun reopen(): AppState { db.close(); db = Database(file); return AppState(db, scope) }

    /** Logs [st] in as the seeded demo account for [role]. */
    private fun AppState.loginAs(role: Role): AppState {
        if (isLoggedIn) signOut()
        selectLoginRole(role); loginPassword = Database.DEFAULT_PASSWORD
        assertTrue(login(), "login as $role failed: $loginError")
        return this
    }

    @Test fun seedMatchesOriginalData() {
        assertEquals(6, s.tours.size); assertEquals(6, s.fruitPicking.size); assertEquals(5, s.farmers.size)
        assertEquals(16, s.products.size); assertEquals(4, s.bookings.size); assertEquals(3, s.farmerOrders.size)
        assertEquals(7, s.notifications.size)
        assertFalse(s.isLoggedIn); assertEquals(Page.HOME, s.activePage); assertTrue(s.cart.isEmpty())
        s.loginAs(Role.USER)
        assertEquals(3, s.cart.size); assertEquals(setOf(1L, 2L, 3L), s.favoriteIds)
    }

    @Test fun allBundledImagesLoad() {
        val refs = (s.farmers.flatMap { listOf(it.photoUrl) + it.gallery } + s.fruitPicking.flatMap { listOf(it.imageUrl) + it.thumbnails } +
            listOf(s.images.juanAvatar, s.images.mariaAvatar, s.images.adminAvatar, "res:icons/pwa-192x192.png", "res:icons/pwa-512x512.png") +
            ph.agritourism.ui.dialogs.MOCKUPS.map { "res:mockups/${it.second}" }).filter { it.startsWith("res:") }.distinct()
        assertTrue(refs.size >= 40, "expected many local images, got ${refs.size}")
        refs.forEach { assertNotNull(ImageLoader.bytes(it), "missing $it") }
        // every image file shipped in resources is referenced somewhere
        val shipped = listOf("farmers", "fruit_picking", "mockups").flatMap { d ->
            File("src/main/resources/$d").list()!!.map { "res:$d/$it" } }
        val unused = shipped - refs.toSet()
        assertTrue(unused.isEmpty(), "unused images: $unused")
    }

    @Test fun loginLogoutAndRoles() {
        s.signOut(); assertFalse(s.isLoggedIn); assertEquals(Page.HOME, s.activePage)
        assertTrue(s.roleFilteredNotifications.isEmpty())
        s.addToCart(s.products[0]); assertEquals(Page.LOGIN, s.activePage) // gated
        s.loginAs(Role.FARMER)
        assertEquals(Role.FARMER, s.userRole); assertEquals(Page.FARMER_PROFILE, s.activePage)
        assertTrue(s.roleFilteredNotifications.all { it.targetRole == "farmer" })
        s.loginAs(Role.USER)
        assertEquals(Page.DASHBOARD, s.activePage)
        assertTrue(s.roleFilteredNotifications.all { it.targetRole == "tourist" })
        assertNull(s.signup("New Tourist", "new@x.ph", "0917 555 1234", "secret1", Role.USER))
        assertEquals("user", db.runSql("SELECT role FROM users WHERE email='new@x.ph'").rows.single().single())
    }

    @Test fun cartCheckoutPersistsOrderAndStock() {
        s.loginAs(Role.USER)
        val mango = s.cart.first().product
        val stockBefore = s.products.first { it.id == mango.id }.stock
        s.updateCartQty(mango.id, 1)
        assertEquals(3, s.cart.first().quantity)
        val expectedTotal = s.cartSubtotal + 70.0
        s.paymentMethod = "Cash on Delivery"
        s.placeOrder()
        assertEquals(4, s.checkoutStep); assertTrue(s.cart.isEmpty())
        assertEquals(expectedTotal, s.lastOrderTotal, 0.001)
        val order = s.farmerOrders.first()
        assertEquals("COD", order.paymentStatus); assertEquals(s.activeTrackingOrderId, order.id)
        val s2 = reopen()
        assertEquals(4, s2.farmerOrders.size); assertTrue(s2.cart.isEmpty())
        assertEquals(stockBefore - 3, s2.products.first { it.id == mango.id }.stock)
        assertEquals(order.items, s2.farmerOrders.first().items)
    }

    @Test fun stockLimitEnforced() {
        s.loginAs(Role.USER)
        val p = s.products.first { it.stock in 1..60 }
        s.cart.filter { it.product.id == p.id }.forEach { s.updateCartQty(p.id, -it.quantity) }
        repeat(p.stock + 5) { s.addToCart(p) }
        assertEquals(p.stock, s.cart.first { it.product.id == p.id }.quantity)
    }

    @Test fun tourAndFruitBookingFlow() {
        s.loginAs(Role.USER)
        s.selectedTour = s.tours[1]; s.tourGuests = 3; s.isTourModalOpen = true
        s.bookSelectedTour()
        val b = s.bookings.first()
        assertEquals(s.tours[1].pricePerPerson * 3, b.totalAmount)
        assertEquals(b, s.selectedBookingForTicket); assertEquals(Page.MY_BOOKINGS, s.activePage); assertFalse(s.isTourModalOpen)
        s.selectedFruit = s.fruitPicking[0]; s.fruitGuests = 2; s.bookSelectedFruit()
        assertEquals("09:30 AM", s.bookings.first().tourTime)
        assertEquals(6, reopen().bookings.size)
    }

    @Test fun bookingLifecycle() {
        val id = 101L
        s.loginAs(Role.USER)
        s.attendanceConfirmation(id, true)
        assertEquals("Confirmed Attending", s.bookings.first { it.id == id }.attendanceStatus)
        assertTrue(s.notifications.first().title.startsWith("Visitor Confirmed Arrival"))
        s.loginAs(Role.FARMER) // booking 101 is at a farm Juan doesn't run
        s.checkInBooking(id); assertNotEquals("Arrived & Checked In", s.bookings.first { it.id == id }.attendanceStatus)
        s.loginAs(Role.ADMIN)
        s.checkInBooking(id); assertEquals("Arrived & Checked In", s.bookings.first { it.id == id }.attendanceStatus)
        s.assignGuide(id, "Mang Ben (Orchard Elder)")
        s.editingBooking = s.bookings.first { it.id == id }.copy(participants = 4, tourDate = "2026-12-01"); s.saveEditedBooking()
        s.cancelBooking(id); assertEquals("Cancelled", s.bookings.first { it.id == id }.status)
        val s2 = reopen()
        val b = s2.bookings.first { it.id == id }
        assertEquals("Mang Ben (Orchard Elder)", b.assignedGuide); assertEquals(4, b.participants); assertEquals("Cancelled", b.status)
        s2.loginAs(Role.ADMIN); s2.deleteBooking(id); assertNull(reopen().bookings.firstOrNull { it.id == id })
    }

    @Test fun farmerOperations() {
        s.loginAs(Role.FARMER)
        s.newProductName = "Test Kamote"; s.newProductStock = "12"; s.newProductImage = "res:fruit_picking/kamoteng_kahoy.jpg"
        s.saveProduct()
        assertEquals("Test Kamote", s.products.first().name); assertEquals("/kg", s.products.first().unit)
        s.newBookingCustomer = "Walk In"; s.newBookingGuests = 3; s.saveFarmerBooking()
        assertEquals("Walk In", s.bookings.first().customerName)
        val pending = s.bookings.firstOrNull { it.status == "Pending" }
        if (pending != null) { s.bookingAction(pending.id, "Confirmed"); assertEquals("Confirmed", s.bookings.first { it.id == pending.id }.status) }
        val o = s.farmerOrders.first()
        s.orderStatusUpdate(o.id, "Pending Packing")
        s.updateDeliveryLocation(o.id, "SLEX", "Dispatched")
        s.confirmOrderReceived(o.id)
        val s2 = reopen()
        val o2 = s2.farmerOrders.first { it.id == o.id }
        assertTrue(o2.isReceivedByUser); assertEquals("Delivered", o2.fulfillmentStatus)
        assertTrue(o2.deliverySteps.last().completed)
        assertEquals("Test Kamote", s2.products.first().name)
        assertEquals("Order Delivered & Received by Tourist!", s2.notifications.first().title)
    }

    @Test fun receiptsAndPrintHtml() {
        s.loginAs(Role.ADMIN)
        s.printOrderReceipt(s.farmerOrders.first())
        val r = s.selectedReceipt!!
        assertEquals(r.subtotal + r.deliveryFee, r.totalAmount, 0.001)
        assertTrue(ph.agritourism.ui.Printing.receiptHtml(r).contains(r.receiptNumber))
        s.printTourReceipt(s.bookings.first())
        assertEquals(0.0, s.selectedReceipt!!.deliveryFee)
        assertTrue(ph.agritourism.ui.Printing.ticketHtml(s.bookings.first()).contains(s.bookings.first().bookingCode))
    }

    @Test fun favoritesPersist() {
        s.loginAs(Role.USER)
        s.toggleFavorite(5, "x"); s.toggleFavorite(1, "y")
        assertEquals(setOf(2L, 3L, 5L), reopen().loginAs(Role.USER).favoriteIds)
        assertTrue(reopen().loginAs(Role.ADMIN).favoriteIds.isEmpty()) // favorites are per account
    }

    @Test fun authUsesDatabase() {
        s.signOut()
        s.selectLoginRole(Role.USER); s.loginPassword = "wrong"
        assertFalse(s.login()); assertFalse(s.isLoggedIn); assertNotNull(s.loginError)
        s.selectLoginRole(Role.FARMER); s.loginEmail = Role.USER.email; s.loginPassword = "password"
        assertFalse(s.login()) // role mismatch
        assertNotNull(s.signup("Dup", Role.USER.email, "", "secret1", Role.USER))
        assertNotNull(s.signup("Boss", "boss@x.ph", "", "secret1", Role.ADMIN))
        assertNull(s.signup("Ana Reyes", "ana@x.ph", "0917 000 1111", "secret1", Role.USER))
        assertEquals("Ana Reyes", s.displayName); assertEquals("Ana Reyes", s.recipientName)
        s.signOut(); s.selectLoginRole(Role.USER); s.loginEmail = "ana@x.ph"; s.loginPassword = "secret1"
        assertTrue(s.login())
        s.selectedTour = s.tours[0]; s.bookSelectedTour()
        assertEquals("ana@x.ph", s.bookings.first().customerEmail)
        assertEquals(listOf(s.bookings.first()), s.visibleBookings)
        assertNull(s.updateProfile("Ana R. Reyes", "0917 000 2222"))
        assertEquals("Ana R. Reyes", reopen().db.findUser("ana@x.ph")!!.fullName)
    }

    @Test fun orderValidationAndStatusSync() {
        s.loginAs(Role.USER)
        s.cart.forEach { c -> s.updateCartQty(c.product.id, -c.quantity) }
        val before = s.farmerOrders.size
        s.placeOrder(); assertEquals(before, s.farmerOrders.size)
        s.addToCart(s.products.first { it.stock > 0 }); s.deliveryAddress = ""
        s.placeOrder(); assertEquals(before, s.farmerOrders.size); assertEquals(2, s.checkoutStep)
        s.deliveryAddress = "Somewhere"; s.paymentMethod = "Bank Transfer"; s.placeOrder()
        val o = s.farmerOrders.first()
        assertEquals("Paid via Bank Transfer", o.paymentStatus); assertEquals("Pending Packing", o.fulfillmentStatus)
        s.loginAs(Role.FARMER); s.orderStatusUpdate(o.id, "Dispatched")
        assertTrue(s.farmerOrders.first().deliverySteps.take(4).all { it.completed })
        assertFalse(s.farmerOrders.first().deliverySteps.last().completed)
        s.loginAs(Role.USER); s.confirmOrderReceived(o.id)
        assertTrue(s.farmerOrders.first().deliverySteps.all { it.completed })
    }

    @Test fun deletingBookingRemovesItsNotifications() {
        assertTrue(s.notifications.any { it.bookingId == 101L })
        s.loginAs(Role.ADMIN); s.deleteBooking(101L)
        assertTrue(reopen().notifications.none { it.bookingId == 101L })
    }

    @Test fun chartsUseDatabaseValues() {
        s.loginAs(Role.ADMIN)
        val bookingsTotal = s.monthlyBookings.sumOf { it.value }
        assertEquals(s.bookings.size.toDouble(), bookingsTotal) // all seeded dates fall in the 6-month window
        val revenue = s.monthlyRevenue.sumOf { it.value }
        assertEquals(s.farmerOrders.sumOf { it.totalAmount } + s.bookings.filter { it.status != "Cancelled" }.sumOf { it.totalAmount }, revenue, 0.01)
        s.loginAs(Role.USER); s.selectedTour = s.tours[0]; s.tourGuests = 2; s.bookSelectedTour()
        assertEquals(bookingsTotal + 1, s.monthlyBookings.sumOf { it.value })
        assertEquals(6, s.monthlyBookings.size)
    }

    @Test fun roleBasedAccess() {
        // Signed out: only public pages; actions redirect to login.
        assertFalse(s.canAccess(Page.DASHBOARD)); s.navigate(Page.SQL_STUDIO); assertEquals(Page.LOGIN, s.activePage)
        s.bookingAction(102L, "Confirmed"); assertEquals("Pending", s.bookings.first { it.id == 102L }.status)

        // Tourist: own data only, no staff actions or admin pages.
        s.loginAs(Role.USER)
        assertTrue(s.visibleBookings.all { it.customerEmail == Role.USER.email })
        assertTrue(s.visibleOrders.isNotEmpty() && s.visibleOrders.all { it.customerEmail == Role.USER.email })
        assertTrue(s.roleFilteredNotifications.none { it.targetRole == "farmer" })
        listOf(Page.SQL_STUDIO, Page.FARMER_ORDERS, Page.FARMER_PRODUCTS).forEach { assertFalse(s.canAccess(it), "$it") }
        s.navigate(Page.SQL_STUDIO); assertEquals(Page.DASHBOARD, s.activePage)
        s.bookingAction(102L, "Confirmed"); assertEquals("Pending", s.bookings.first { it.id == 102L }.status)
        s.checkInBooking(103L); assertNotEquals("Arrived & Checked In", s.bookings.first { it.id == 103L }.attendanceStatus)
        s.cancelBooking(102L); assertEquals("Pending", s.bookings.first { it.id == 102L }.status) // someone else's booking
        s.deleteBooking(102L); assertNotNull(s.bookings.firstOrNull { it.id == 102L })
        val other = s.farmerOrders.first { it.customerEmail != Role.USER.email }
        s.confirmOrderReceived(other.id); assertFalse(s.farmerOrders.first { it.id == other.id }.isReceivedByUser)
        s.newProductName = "Hack"; s.saveProduct(); assertTrue(s.products.none { it.name == "Hack" })
        assertFails { s.runAdminSql("DELETE FROM users") }

        // Farmer: manages bookings/orders but cannot buy, book, or open admin pages.
        s.loginAs(Role.FARMER)
        assertFalse(s.canAccess(Page.SQL_STUDIO)); assertFalse(s.canAccess(Page.MARKET)); assertFalse(s.canAccess(Page.CART_CHECKOUT))
        val cartBefore = db.cart(Role.FARMER.email)
        s.addToCart(s.products.first { it.stock > 0 }); assertEquals(cartBefore, db.cart(Role.FARMER.email))
        val n = s.bookings.size; s.bookSelectedTour(); assertEquals(n, s.bookings.size)
        s.attendanceConfirmation(101L, true); assertNotEquals("Confirmed Attending", s.bookings.first { it.id == 101L }.attendanceStatus)
        s.bookingAction(102L, "Confirmed"); assertEquals("Confirmed", s.bookings.first { it.id == 102L }.status)
        // The tourist who owns booking 102 is notified; others are not.
        assertTrue(s.notifications.first().recipientEmail == "james.smith@outlook.com")
        s.loginAs(Role.USER); assertTrue(s.roleFilteredNotifications.none { it.bookingId == 102L })

        // Admin: everything, including SQL (which refreshes app state).
        s.loginAs(Role.ADMIN)
        Page.entries.forEach { assertTrue(s.canAccess(it) || it in setOf(Page.CART_CHECKOUT, Page.FARMER_PROFILE), "$it") }
        s.runAdminSql("UPDATE products SET stock=0 WHERE id=101")
        assertEquals(0, s.products.first { it.id == 101L }.stock)

        // Signing out clears the session's private data.
        s.signOut(); assertTrue(s.cart.isEmpty() && s.favoriteIds.isEmpty() && s.visibleBookings.isEmpty())
    }

    @Test fun noDoubleBookings() {
        s.loginAs(Role.USER)
        s.selectedTour = s.tours[0]; s.tourTime = TOUR_TIME_SLOTS[0]; s.bookSelectedTour()
        val n = s.bookings.size
        // Same tourist, same date + slot (even at a different farm) is rejected.
        s.selectedTour = s.tours[2]; s.bookSelectedTour(); assertEquals(n, s.bookings.size)
        s.selectedFruit = s.fruitPicking[0]; s.fruitDate = s.tourDate; s.fruitTime = "08:00 AM - Early"; s.bookSelectedFruit()
        assertEquals(n, s.bookings.size)
        // Different slot is fine; rescheduling into an occupied slot is rejected.
        s.tourTime = TOUR_TIME_SLOTS[1]; s.bookSelectedTour(); assertEquals(n + 1, s.bookings.size)
        val second = s.bookings.first()
        s.editingBooking = second.copy(tourTime = "08:00 AM"); s.saveEditedBooking()
        assertEquals(TOUR_TIME_SLOTS[1], s.bookings.first { it.id == second.id }.tourTime)
        // Cancelling frees the slot.
        s.cancelBooking(s.bookings.first { it.tourTime == TOUR_TIME_SLOTS[0] && it.customerEmail == Role.USER.email }.id)
        s.selectedTour = s.tours[2]; s.tourTime = TOUR_TIME_SLOTS[0]; s.bookSelectedTour(); assertEquals(n + 2, s.bookings.size)
        // The database itself refuses a duplicate even if the app check is bypassed.
        val dup = s.bookings.first().copy(id = 999_999L, bookingCode = "BK-DUP")
        assertFailsWith<Database.DoubleBookingException> { db.saveBooking(dup) }
        assertFails { db.runSql("INSERT INTO bookings (id, booking_code, status, slot_key) VALUES (999998, 'X', 'Confirmed', '${dup.slotKey()}')") }
        // A different customer can take the same slot.
        s.loginAs(Role.FARMER); s.newBookingCustomer = "Walk In"; s.newBookingDate = s.tourDate; s.newBookingTime = TOUR_TIME_SLOTS[0]
        s.saveFarmerBooking(); assertEquals("Walk In", s.bookings.first().customerName)
    }

    @Test fun touristReviews() {
        s.loginAs(Role.USER)
        val b = s.bookings.first { it.id == 101L }
        assertFalse(s.canReview(b)) // visit hasn't happened yet
        assertNotNull(s.submitReview(b.id, 5, "Wonderful farm visit!"))
        s.loginAs(Role.ADMIN); s.checkInBooking(b.id)
        assertNotNull(s.submitReview(b.id, 5, "Admins cannot review")) // not a tourist
        s.loginAs(Role.USER)
        assertTrue(s.canReview(s.bookings.first { it.id == b.id }))
        assertNotNull(s.submitReview(b.id, 0, "Bad rating value here")); assertNotNull(s.submitReview(b.id, 4, "short"))
        assertNotNull(s.submitReview(103L, 4, "Not my booking at all")) // someone else's booking
        val target = b.activityType to b.farmId
        val before = if (target.first == "tour") s.tours.first { it.id == target.second }.reviewsCount else s.fruitPicking.first { it.id == target.second }.reviewsCount
        assertNull(s.submitReview(b.id, 4, "Loved picking oranges with the kids!"))
        assertNotNull(s.submitReview(b.id, 5, "Trying to review a second time")) // once per booking
        val s2 = reopen().loginAs(Role.USER)
        val r = s2.reviewForBooking(b.id)!!
        assertEquals(4, r.rating); assertEquals(Role.USER.email, r.userEmail)
        assertTrue(r in s2.reviewsFor(target.first, target.second))
        val after = if (target.first == "tour") s2.tours.first { it.id == target.second }.reviewsCount else s2.fruitPicking.first { it.id == target.second }.reviewsCount
        assertEquals(before + 1, after)
        assertFalse(s2.canReview(s2.bookings.first { it.id == b.id }))
        assertFails { db.runSql("INSERT INTO reviews (id, author, booking_id) VALUES (9999, 'x', ${b.id})") } // DB enforces one per booking
    }

    @Test fun farmersOnlyManageTheirOwnFarm() {
        s.loginAs(Role.FARMER)
        val juanFarm = s.myFarmId!!
        assertEquals(setOf(102L, 104L), s.visibleBookings.map { it.id }.toSet()) // orchard 1 + tour 1
        assertTrue(s.farmProducts.isNotEmpty() && s.farmProducts.all { it.farmerId == juanFarm })
        assertTrue(s.visibleOrders.isNotEmpty() && s.visibleOrders.all { juanFarm in s.farmsOf(it) })
        assertTrue(s.myTours.all { it.farmerId == juanFarm } && s.myTours.isNotEmpty())
        s.checkInBooking(103L); assertNotEquals("Arrived & Checked In", s.bookings.first { it.id == 103L }.attendanceStatus)
        val foreignOrder = s.farmerOrders.first { juanFarm !in s.farmsOf(it) }
        s.orderStatusUpdate(foreignOrder.id, "Pending Packing"); assertEquals(foreignOrder.fulfillmentStatus, s.farmerOrders.first { it.id == foreignOrder.id }.fulfillmentStatus)
        s.newProductName = "Juan Kamote"; s.saveProduct()
        assertEquals(juanFarm, s.products.first { it.name == "Juan Kamote" }.farmerId)

        // A newly registered farmer gets their own empty farm.
        s.signOut()
        assertNotNull(s.signup("Ka Pedro", "pedro@farm.ph", "0917 111 2222", "secret1", Role.FARMER)) // farm details required
        assertNull(s.signup("Ka Pedro", "pedro@farm.ph", "0917 111 2222", "secret1", Role.FARMER, "Pedro Rice Farm", "Nueva Ecija"))
        assertEquals("Pedro Rice Farm", s.myFarm?.farmName)
        assertTrue(s.visibleBookings.isEmpty() && s.visibleOrders.isEmpty() && s.farmProducts.isEmpty() && s.myTours.isEmpty())
        s.newProductName = "Pedro Rice"; s.saveProduct()
        assertEquals(listOf("Pedro Rice"), s.farmProducts.map { it.name })
        s.loginAs(Role.FARMER); assertTrue(s.farmProducts.none { it.name == "Pedro Rice" })

        // A tourist buying Pedro's rice notifies Pedro, not Juan.
        s.loginAs(Role.USER)
        s.cart.forEach { c -> s.updateCartQty(c.product.id, -c.quantity) }
        s.addToCart(s.products.first { it.name == "Pedro Rice" }); s.deliveryAddress = "Manila"; s.placeOrder()
        assertEquals("pedro@farm.ph", s.notifications.first().recipientEmail)
        s.loginAs(Role.FARMER); assertTrue(s.roleFilteredNotifications.none { it.recipientEmail == "pedro@farm.ph" })
    }
}
