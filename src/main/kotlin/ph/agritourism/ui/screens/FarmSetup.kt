package ph.agritourism.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.model.Courier
import ph.agritourism.ui.*

/** Farmers manage their farm's guides and time slots; admins can pick any farm. */
@Composable
fun FarmSetupPage(s: AppState) {
    var farmId by remember { mutableStateOf(s.myFarmId ?: s.farmers.firstOrNull()?.id) }
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1("Guides & Time Slots"); Sub("Who guides your visitors, and when tourists can book each tour or orchard") }
        if (s.isAdmin && s.farmers.isNotEmpty()) {
            Dropdown("Farm", s.farmers.map { it.id }, farmId ?: s.farmers.first().id, { id -> s.farmers.first { it.id == id }.farmName }, Modifier.width(320.dp)) { farmId = it }
        }
    }
    val id = farmId ?: run { Sub("No farm is linked to this account."); return }
    GuidesCard(s, id)
    val tours = s.tours.filter { it.farmerId == id }
    val orchards = s.fruitPicking.filter { it.farmerId == id }
    if (tours.isEmpty() && orchards.isEmpty()) Sub("This farm has no tours or orchards yet.")
    tours.forEach { SlotsCard(s, "tour", it.id, it.name) }
    orchards.forEach { SlotsCard(s, "orchard", it.id, it.title) }
}

@Composable
private fun GuidesCard(s: AppState, farmId: Int) {
    var name by remember(farmId) { mutableStateOf("") }
    var error by remember(farmId) { mutableStateOf<String?>(null) }
    val add = { error = s.addGuide(farmId, name); if (error == null) name = "" }
    GlassCard(Modifier.fillMaxWidth()) {
        SectionHeader("Tour Guides", "Assigned to new bookings and selectable when managing a booking")
        Spacer(Modifier.height(10.dp))
        val list = s.guides.filter { it.farmerId == farmId }
        if (list.isEmpty()) Sub("No guides yet. New bookings will list the farm host as guide.")
        list.forEach { g -> ListRow(g.name, Icons.Outlined.Person) { s.removeGuide(g) } }
        Spacer(Modifier.height(10.dp))
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("Add a guide", name, { name = it; error = null }, Modifier.weight(1f), "e.g. Ate Liza (Orchard Guide)", icon = Icons.Outlined.PersonAdd, onSubmit = add)
            PrimaryButton("Add Guide", icon = Icons.Outlined.Add, enabled = name.isNotBlank()) { add() }
        }
        ErrorBanner(error)
    }
}

@Composable
private fun SlotsCard(s: AppState, type: String, activityId: Int, title: String) {
    var label by remember(type, activityId) { mutableStateOf("") }
    var error by remember(type, activityId) { mutableStateOf<String?>(null) }
    val add = { error = s.addTimeSlot(type, activityId, label); if (error == null) label = "" }
    GlassCard(Modifier.fillMaxWidth()) {
        SectionHeader(title, if (type == "tour") "Farm tour time slots" else "Fruit picking time slots")
        Spacer(Modifier.height(10.dp))
        val slots = s.timeSlots.filter { it.activityType == type && it.activityId == activityId }
        if (slots.isEmpty()) Sub("No time slots yet. Tourists can't book this until you add one.")
        slots.forEach { t -> ListRow(t.label, Icons.Outlined.Schedule) { s.removeTimeSlot(t) } }
        Spacer(Modifier.height(10.dp))
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("Add a time slot", label, { label = it; error = null }, Modifier.weight(1f), "e.g. 08:00 AM - Morning Walk", icon = Icons.Outlined.Schedule, onSubmit = add)
            PrimaryButton("Add Slot", icon = Icons.Outlined.Add, enabled = label.isNotBlank()) { add() }
        }
        ErrorBanner(error)
    }
}

@Composable
private fun ListRow(text: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onRemove: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, Modifier.size(18.dp), tint = Palette.Forest)
        Spacer(Modifier.width(10.dp))
        Text(text, Modifier.weight(1f), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        IconButton(onRemove, Modifier.handCursor()) { Icon(Icons.Outlined.Delete, "Remove $text", tint = Palette.Red) }
    }
    HorizontalDivider(color = Palette.Border)
}

private val SETTING_LABELS = listOf(
    "delivery_fee" to "Delivery fee (₱)",
    "delivery_eta" to "Delivery time estimate",
    "product_categories" to "Product categories (comma-separated)",
    "gcash_merchant_name" to "GCash merchant name",
    "gcash_number" to "GCash mobile number",
    "bank_name" to "Bank name",
    "bank_account_name" to "Bank account name",
    "bank_account_number" to "Bank account number",
)

/** Admin: couriers and platform settings. */
@Composable
fun PlatformSettingsPage(s: AppState) {
    Column { H1("Platform Settings"); Sub("Delivery, payment details and courier partners used across the app") }
    GlassCard(Modifier.fillMaxWidth()) {
        SectionHeader("Delivery & Payment", "Shown at checkout and on new orders")
        Spacer(Modifier.height(10.dp))
        SETTING_LABELS.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                row.forEach { (key, label) -> SettingField(s, key, label, Modifier.weight(1f)) }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
            Spacer(Modifier.height(10.dp))
        }
    }
    GlassCard(Modifier.fillMaxWidth()) {
        SectionHeader("Courier Partners", "New orders are assigned to these couriers in turn")
        Spacer(Modifier.height(10.dp))
        if (s.couriers.isEmpty()) Sub("No couriers yet. New orders will show \"Courier not yet assigned\".")
        s.couriers.forEach { c -> ListRow("${c.riderName} · ${c.company} · ${c.riderPhone} · ${c.vehicle} · ${c.hub}", Icons.Outlined.LocalShipping) { s.removeCourier(c) } }
        Spacer(Modifier.height(12.dp))
        var company by remember { mutableStateOf("") }
        var rider by remember { mutableStateOf("") }
        var phone by remember { mutableStateOf("") }
        var vehicle by remember { mutableStateOf("") }
        var hub by remember { mutableStateOf("") }
        var error by remember { mutableStateOf<String?>(null) }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("Company", company, { company = it; error = null }, Modifier.weight(1f), "e.g. FarmLink Couriers")
            Field("Rider name", rider, { rider = it; error = null }, Modifier.weight(1f), "e.g. Kuya Arnel Cruz")
            Field("Rider phone", phone, { v -> phone = v.filter { it.isDigit() || it in "+ -()" }; error = null }, Modifier.weight(1f), "+63 9xx xxx xxxx")
        }
        Spacer(Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("Vehicle", vehicle, { vehicle = it }, Modifier.weight(1f), "e.g. Motorbike with cooler · Plate ABC 123")
            Field("Pickup hub", hub, { hub = it }, Modifier.weight(1f), "e.g. Calamba Farm Hub")
            PrimaryButton("Add Courier", icon = Icons.Outlined.Add) {
                error = s.addCourier(Courier(0, company, rider, phone, vehicle, hub))
                if (error == null) { company = ""; rider = ""; phone = ""; vehicle = ""; hub = "" }
            }
        }
        ErrorBanner(error)
    }
}

@Composable
private fun SettingField(s: AppState, key: String, label: String, modifier: Modifier) {
    val saved = s.setting(key)
    var value by remember(saved) { mutableStateOf(saved) }
    var error by remember { mutableStateOf<String?>(null) }
    val save = { error = s.saveSetting(key, value); if (error == null) s.showToast("Saved: $label") }
    Row(modifier, verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Field(label, value, { value = it; error = null }, Modifier.weight(1f), error = error, onSubmit = save)
        SecondaryButton("Save", enabled = value.trim() != saved) { save() }
    }
}
