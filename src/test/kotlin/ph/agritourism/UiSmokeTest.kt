package ph.agritourism

import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.runComposeUiTest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import ph.agritourism.data.Database
import ph.agritourism.model.Role
import ph.agritourism.ui.*
import java.io.File
import kotlin.test.*

/** Renders every page and overlay for every role headlessly to catch composition crashes. */
@OptIn(ExperimentalTestApi::class)
class UiSmokeTest {
    private val file = File.createTempFile("agri-ui", ".db").also { it.delete() }
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private lateinit var db: Database

    @BeforeTest fun setUp() { db = Database(file) }
    @AfterTest fun tearDown() { scope.cancel(); db.close(); file.delete() }

    private fun AppState.loginAs(role: Role) {
        selectLoginRole(role); loginEmail = role.email; loginPassword = Database.DEFAULT_PASSWORD
        assertTrue(login(), "login as $role failed: $loginError")
    }

    private fun renderAll(role: Role?) = runComposeUiTest {
        val s = AppState(db, scope)
        if (role != null) s.loginAs(role)
        // Image shimmer animates forever, so drive the clock manually instead of waiting for idle.
        mainClock.autoAdvance = false
        fun step(action: () -> Unit) { runOnUiThread(action); mainClock.advanceTimeBy(100) }
        setContent { MaterialTheme(colorScheme = AppColors) { AppShell(s) } }
        mainClock.advanceTimeBy(100)
        for (p in Page.entries) {
            step { s.activePage = p }
        }
        if (s.isTourist) {
            ShowcaseCategory.entries.forEach { c -> step { s.openShowcase(c) } }
            step { s.activePage = Page.CART_CHECKOUT }
            for (n in 1..4) step { s.checkoutStep = n }
            step { s.checkoutStep = 1; s.isTourModalOpen = true }
            step { s.isTourModalOpen = false; s.isFruitModalOpen = true }
            step { s.isFruitModalOpen = false }
        }
        val b = s.visibleBookings.firstOrNull()
        val o = s.visibleOrders.firstOrNull()
        val overlays: List<() -> Unit> = listOfNotNull(
            { s.isNotificationsOpen = true },
            { s.roleFilteredNotifications.firstOrNull()?.let(s::openNotification) },
            { s.isProfileModalOpen = true },
            { s.isMockupDrawerOpen = true },
            { s.selectedFarmerForModal = s.farmers.first() },
            if (s.isStaff) ({ s.isAddProductModalOpen = true }) else null,
            s.farmProducts.firstOrNull()?.let { p -> { s.openEditProduct(p) } },
            s.myTours.firstOrNull()?.takeIf { s.isStaff }?.let { t -> { s.editingTour = t } },
            s.myOrchards.firstOrNull()?.takeIf { s.isStaff }?.let { o -> { s.editingOrchard = o } },
            { s.confirm("Delete?", "Sure?") {} },
            if (s.isStaff) ({ s.isAddBookingModalOpen = true }) else null,
            b?.let { { s.selectedBookingForView = it } },
            b?.let { { s.selectedBookingForTicket = it } },
            b?.let { { s.editingBooking = it } },
            b?.let { { s.reviewingBooking = it } },
            b?.let { { s.deletingBookingId = it.id } },
            b?.let { { s.printTourReceipt(it) } },
            o?.let { { s.selectedOrderForView = it } },
            o?.let { { s.selectedOrderForTracking = it } },
            o?.let { { s.printOrderReceipt(it) } },
            { s.catalogPreview = CatalogPreview(s.tours[0].imageUrl, "Tag", s.tours[0].name, s.tours[0].description, listOf("Price" to "1")) },
            if (s.isFarmer) ({ s.isAddTourModalOpen = true }) else null,
            if (s.isFarmer) ({ s.isAddOrchardModalOpen = true }) else null,
            if (s.isFarmer) ({ s.isEditStoryOpen = true }) else null,
        )
        overlays.forEach { open ->
            step { open() }
            step {
                s.isNotificationsOpen = false; s.selectedNotification = null; s.isProfileModalOpen = false
                s.isMockupDrawerOpen = false; s.selectedFarmerForModal = null; s.isAddProductModalOpen = false
                s.isAddBookingModalOpen = false; s.selectedBookingForView = null; s.selectedBookingForTicket = null
                s.editingBooking = null; s.reviewingBooking = null; s.deletingBookingId = null
                s.selectedOrderForView = null; s.selectedOrderForTracking = null; s.selectedReceipt = null
                s.catalogPreview = null; s.isAddTourModalOpen = false; s.isAddOrchardModalOpen = false; s.isEditStoryOpen = false
            }
        }
        if (role != null) { step { s.signOut() } }
    }

    @Test fun guestScreensRender() = renderAll(null)
    @Test fun touristScreensRender() = renderAll(Role.USER)
    @Test fun farmerScreensRender() = renderAll(Role.FARMER)
    @Test fun adminScreensRender() = renderAll(Role.ADMIN)
}
