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

    @Test fun seedMatchesOriginalData() {
        assertEquals(6, s.tours.size); assertEquals(6, s.fruitPicking.size); assertEquals(5, s.farmers.size)
        assertEquals(16, s.products.size); assertEquals(4, s.bookings.size); assertEquals(3, s.farmerOrders.size)
        assertEquals(7, s.notifications.size); assertEquals(3, s.cart.size)
        assertEquals(setOf(1L, 2L, 3L), s.favoriteIds)
        assertEquals(Page.DASHBOARD, s.activePage); assertEquals(Role.ADMIN, s.userRole)
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
        s.selectLoginRole(Role.FARMER); s.login()
        assertEquals(Role.FARMER, s.userRole); assertEquals(Page.FARMER_PROFILE, s.activePage)
        assertTrue(s.roleFilteredNotifications.all { it.targetRole == "farmer" })
        s.signOut(); s.selectLoginRole(Role.USER); s.login()
        assertEquals(Page.DASHBOARD, s.activePage)
        assertTrue(s.roleFilteredNotifications.all { it.targetRole == "tourist" })
        s.signup("New Tourist", "new@x.ph", "0917", Role.USER)
        assertEquals("user", db.runSql("SELECT role FROM users WHERE email='new@x.ph'").rows.single().single())
    }

    @Test fun cartCheckoutPersistsOrderAndStock() {
        s.selectLoginRole(Role.USER); s.login()
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
        val p = s.products.first { it.stock in 1..60 }
        s.cart.filter { it.product.id == p.id }.forEach { s.updateCartQty(p.id, -it.quantity) }
        repeat(p.stock + 5) { s.addToCart(p) }
        assertEquals(p.stock, s.cart.first { it.product.id == p.id }.quantity)
    }

    @Test fun tourAndFruitBookingFlow() {
        s.selectLoginRole(Role.USER); s.login()
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
        s.attendanceConfirmation(id, true)
        assertEquals("Confirmed Attending", s.bookings.first { it.id == id }.attendanceStatus)
        assertTrue(s.notifications.first().title.startsWith("Visitor Confirmed Arrival"))
        s.checkInBooking(id); assertEquals("Arrived & Checked In", s.bookings.first { it.id == id }.attendanceStatus)
        s.assignGuide(id, "Mang Ben (Orchard Elder)")
        s.editingBooking = s.bookings.first { it.id == id }.copy(participants = 4, tourDate = "2026-12-01"); s.saveEditedBooking()
        s.cancelBooking(id); assertEquals("Cancelled", s.bookings.first { it.id == id }.status)
        val s2 = reopen()
        val b = s2.bookings.first { it.id == id }
        assertEquals("Mang Ben (Orchard Elder)", b.assignedGuide); assertEquals(4, b.participants); assertEquals("Cancelled", b.status)
        s2.deleteBooking(id); assertNull(reopen().bookings.firstOrNull { it.id == id })
    }

    @Test fun farmerOperations() {
        s.selectLoginRole(Role.FARMER); s.login()
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
        s.printOrderReceipt(s.farmerOrders.first())
        val r = s.selectedReceipt!!
        assertEquals(r.subtotal + r.deliveryFee, r.totalAmount, 0.001)
        assertTrue(ph.agritourism.ui.Printing.receiptHtml(r).contains(r.receiptNumber))
        s.printTourReceipt(s.bookings.first())
        assertEquals(0.0, s.selectedReceipt!!.deliveryFee)
        assertTrue(ph.agritourism.ui.Printing.ticketHtml(s.bookings.first()).contains(s.bookings.first().bookingCode))
    }

    @Test fun favoritesPersist() {
        s.toggleFavorite(5, "x"); s.toggleFavorite(1, "y")
        assertEquals(setOf(2L, 3L, 5L), reopen().favoriteIds)
    }
}
