package ph.agritourism

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyShortcut
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.*
import ph.agritourism.data.Database
import ph.agritourism.ui.*

fun main() {
    val db = Database()
    application {
        val windowState = rememberWindowState(placement = WindowPlacement.Floating, size = androidx.compose.ui.unit.DpSize(1440.dp, 900.dp))
        Window(
            onCloseRequest = { db.close(); exitApplication() },
            state = windowState,
            title = "AgriTourism Philippines · Farm. Connect. Experience.",
            icon = painterResource("icons/pwa-512x512.png"),
        ) {
            val scope = rememberCoroutineScope()
            val state = remember { AppState(db, scope) }
            MenuBar {
                Menu("File", mnemonic = 'F') {
                    Item("Print Window…", shortcut = KeyShortcut(Key.P, ctrl = true)) { Printing.printWindow(window) }
                    Item("Save Window Snapshot (PNG)…", shortcut = KeyShortcut(Key.S, ctrl = true)) {
                        Printing.saveSnapshot(window)?.let { state.showToast("Saved snapshot to: ${it.absolutePath}") }
                    }
                    Item("Reload Data from SQLite", shortcut = KeyShortcut(Key.R, ctrl = true)) { state.reloadFromDb() }
                    Separator()
                    Item("Exit Desktop App") { db.close(); exitApplication() }
                }
                Menu("Catalog", mnemonic = 'C') {
                    Item("All Showcase Catalog") { state.openShowcase(ShowcaseCategory.ALL) }
                    Item("Farm Destinations (Places)") { state.openShowcase(ShowcaseCategory.PLACES) }
                    Item("Fresh Produce Catalog") { state.openShowcase(ShowcaseCategory.PRODUCTS) }
                    Item("Fruit Orchards Catalog") { state.openShowcase(ShowcaseCategory.ORCHARDS) }
                }
                Menu("View", mnemonic = 'V') {
                    Item(if (state.isSidebarCollapsed) "Expand Left Dock" else "Collapse Left Dock") { state.isSidebarCollapsed = !state.isSidebarCollapsed }
                    if (state.isLoggedIn) Item("Go to Workspace Dashboard") { state.navigate(Page.DASHBOARD) }
                    Item("Reset Search & Filters") { state.searchQuery = ""; state.marketFilter = "All"; state.showToast("Filters cleared.") }
                    Item("Design Mockups Gallery") { state.isMockupDrawerOpen = true }
                    if (state.isAdmin) Item("SQL Database Studio") { state.navigate(Page.SQL_STUDIO) }
                }
                Menu("Account", mnemonic = 'A') {
                    if (state.isLoggedIn) {
                        Item("My Desktop Profile") { state.isProfileModalOpen = true }
                        Item("Sign Out") { state.signOut() }
                    } else {
                        Item("Log In to Account") { state.navigate(Page.LOGIN) }
                        Item("Create New Account") { state.navigate(Page.SIGNUP) }
                    }
                }
            }
            MaterialTheme(colorScheme = AppColors) { AppShell(state) }
        }
    }
}
