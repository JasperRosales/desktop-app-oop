package ph.agritourism.ui.screens

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.ui.*

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun StatCard(label: String, value: String, sub: String, bg: Color, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    var hovered by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        if (hovered && onClick != null) 1.03f else 1f,
        animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
        label = "stat-scale",
    )
    Column(
        modifier
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .onPointerEvent(PointerEventType.Enter) { hovered = true }
            .onPointerEvent(PointerEventType.Exit) { hovered = false }
            .clip(RoundedCornerShape(18.dp)).background(bg)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(20.dp)
    ) {
        Text(label, fontSize = 13.sp, color = Color(0xFF334155), fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(6.dp))
        Text(value, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        Text(sub, fontSize = 11.sp, color = Palette.Muted)
    }
}

private fun niceCeil(v: Double): Double {
    if (v <= 0) return 4.0
    val mag = Math.pow(10.0, Math.floor(Math.log10(v)))
    return listOf(1.0, 2.0, 2.5, 5.0, 10.0).map { it * mag }.first { it >= v }
}

/** Smooth area chart drawn from real monthly values. */
@Composable
fun DataChart(points: List<MonthPoint>, line: Color, fill: Color, modifier: Modifier, formatY: (Double) -> String) {
    val tm = rememberTextMeasurer()
    val top = niceCeil(points.maxOfOrNull { it.value } ?: 0.0)
    androidx.compose.foundation.Canvas(modifier) {
        val ts = TextStyle(fontSize = 11.sp, color = Color(0xFF64748B), fontWeight = FontWeight.SemiBold)
        val left = 56.dp.toPx(); val right = size.width - 16.dp.toPx()
        val topY = 10.dp.toPx(); val baseY = size.height - 24.dp.toPx()
        val ticks = 4
        (0..ticks).forEach { i ->
            val y = baseY - (baseY - topY) * i / ticks
            drawLine(Color(0xFFD8E2DA), Offset(left, y), Offset(right, y))
            val r = tm.measure(formatY(top * i / ticks), ts)
            drawText(r, topLeft = Offset(left - r.size.width - 8f, y - r.size.height / 2))
        }
        if (points.isEmpty()) return@Canvas
        val step = if (points.size > 1) (right - left) / (points.size - 1) else 0f
        val pts = points.mapIndexed { i, p -> Offset(left + step * i, (baseY - (baseY - topY) * (p.value / top)).toFloat()) }
        val path = Path().apply {
            moveTo(pts[0].x, pts[0].y)
            for (i in 1 until pts.size) {
                val p0 = pts[maxOf(i - 2, 0)]; val p1 = pts[i - 1]; val p2 = pts[i]; val p3 = pts[minOf(i + 1, pts.lastIndex)]
                // Catmull-Rom to Bezier, clamped so the curve never dips below zero.
                cubicTo(p1.x + (p2.x - p0.x) / 6, minOf(baseY, p1.y + (p2.y - p0.y) / 6),
                    p2.x - (p3.x - p1.x) / 6, minOf(baseY, p2.y - (p3.y - p1.y) / 6), p2.x, p2.y)
            }
        }
        val area = Path().apply { addPath(path); lineTo(pts.last().x, baseY); lineTo(pts.first().x, baseY); close() }
        drawPath(area, Brush.verticalGradient(listOf(fill.copy(alpha = 0.45f), fill.copy(alpha = 0f))))
        drawPath(path, line, style = Stroke(width = 3.5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
        pts.forEachIndexed { i, o ->
            drawCircle(Color.White, 5f, o); drawCircle(line, 5f, o, style = Stroke(2.5f))
            val r = tm.measure(points[i].label, ts)
            drawText(r, topLeft = Offset(o.x - r.size.width / 2, size.height - r.size.height))
        }
    }
}

@Composable
fun AdminDashboard(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1("Platform Overview"); Sub("Real-time platform metrics, booking trends, and system telemetry") }
        Pill("● Live data from SQLite", Color(0xFFDCFCE7), Color(0xFF166534))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        StatCard("Total Users", money(s.db.userCount()), "Registered accounts", Color(0xFFE0F2FE), Modifier.weight(1f))
        StatCard("Total Farms", money(s.farmers.size), "${s.tours.size} tours · ${s.fruitPicking.size} orchards", Color(0xFFE3F1E7), Modifier.weight(1f))
        StatCard("Total Bookings", money(s.bookings.size), "%.1f%% fulfillment rate".format(s.fulfillmentRate), Color(0xFFFEF3E2), Modifier.weight(1f)) { s.navigate(Page.MY_BOOKINGS) }
        StatCard("Total Products", money(s.products.size), "${s.products.count { it.stock > 0 }} in stock", Color(0xFFEDE9FE), Modifier.weight(1f))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
        GlassCard(Modifier.weight(1.6f)) {
            SectionHeader("Bookings Overview", "Monthly reservations by tour date (last 6 months)") {
                TextButton({ s.navigate(Page.MY_BOOKINGS) }) { Text("View Reports", fontWeight = FontWeight.Bold) }
            }
            Spacer(Modifier.height(12.dp))
            DataChart(s.monthlyBookings, Palette.Teal, Color(0xFF14B8A6), Modifier.fillMaxWidth().height(260.dp)) { v ->
                if (v == Math.floor(v)) money(v) else "%.1f".format(v)
            }
            TextButton({ s.navigate(Page.MY_BOOKINGS) }, Modifier.align(Alignment.End)) { Text("View All Bookings Table →", fontWeight = FontWeight.Bold) }
        }
        GlassCard(Modifier.weight(1f)) {
            H2("Recent Activities")
            Spacer(Modifier.height(12.dp))
            if (s.notifications.isEmpty()) Sub("No recent activity.")
            s.notifications.take(4).map { n ->
                Triple(when (n.type) { "farmer_order", "market" -> Icons.Outlined.Description; "booking", "farmer_booking_alert" -> Icons.Outlined.EventAvailable; else -> Icons.Outlined.Person },
                    n.title, n.desc) to n.time
            }.forEach { (t, time) ->
                Row(Modifier.padding(vertical = 10.dp)) {
                    Box(Modifier.size(40.dp).clip(CircleShape).background(Palette.Mint), contentAlignment = Alignment.Center) { Icon(t.first, null, tint = Palette.Forest) }
                    Spacer(Modifier.width(12.dp))
                    Column { Text(t.second, fontWeight = FontWeight.Bold, fontSize = 14.sp); Sub(t.third); Text(time, fontSize = 11.sp, color = Palette.Muted) }
                }
            }
        }
    }
}

@Composable
fun FarmerDashboard(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1("Welcome, ${s.displayName}"); Sub(s.myFarm?.let { "${it.farmName} · ${it.location}" } ?: "No farm linked to this account") }
        PrimaryButton("List New Produce", icon = Icons.Filled.Add) { s.isAddProductModalOpen = true }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        StatCard("Total Products", "${s.farmProducts.size}", "Active in marketplace", Color(0xFFDFF1E6), Modifier.weight(1f)) { s.navigate(Page.FARMER_PRODUCTS) }
        StatCard("New Orders", "${s.openOrders.size}", "Ready for packing & delivery", Color(0xFFDDEAF8), Modifier.weight(1f)) { s.navigate(Page.FARMER_ORDERS) }
        StatCard("Active Bookings", "${s.activeBookings.size}", "Upcoming farm visitors", Color(0xFFFCEBD6), Modifier.weight(1f)) { s.navigate(Page.MY_BOOKINGS) }
    }
    GlassCard {
        SectionHeader("Farm Sales & Revenue Graph", "Monthly produce orders + tour booking revenue (PHP, last 6 months)") { Pill("Total: $PESO${money(s.totalRevenue)}") }
        Spacer(Modifier.height(10.dp))
        DataChart(s.monthlyRevenue, Color(0xFF15803D), Color(0xFF16A34A), Modifier.fillMaxWidth().height(210.dp)) { v ->
            if (v >= 1000) "$PESO${"%.1f".format(v / 1000).removeSuffix(".0")}k" else "$PESO${money(v)}"
        }
    }
    GlassCard {
        SectionHeader("Recent Tour Bookings", "Accept or manage visitor requests for ${s.myFarmLabel}") {
            Pill("${s.visibleBookings.count { it.status == "Pending" }} Pending Requests", Color(0xFFFEF3C7), Color(0xFF92400E))
        }
        Spacer(Modifier.height(12.dp))
        val headers = listOf("Date" to 1.1f, "Time" to 1.3f, "Tourist Guest" to 1.3f, "Activity" to 1.5f, "Guests" to 0.8f, "1-Day Confirmation" to 1f, "Amount" to 0.7f, "Status" to 0.9f, "Action" to 1.3f)
        Row(Modifier.fillMaxWidth().background(Palette.Mint, RoundedCornerShape(10.dp)).padding(10.dp)) {
            headers.forEach { (h, w) -> Text(h, Modifier.weight(w), fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep) }
        }
        if (s.visibleBookings.isEmpty()) Sub("No bookings for your farm yet.")
        s.visibleBookings.forEach { b ->
            Row(Modifier.fillMaxWidth().clickable { s.selectedBookingForView = b }.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(b.tourDate, Modifier.weight(1.1f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text(b.tourTime, Modifier.weight(1.3f), fontSize = 12.sp, maxLines = 2)
                Column(Modifier.weight(1.3f)) { Text(b.customerName, fontSize = 12.sp, fontWeight = FontWeight.Bold); Text(b.customerPhone ?: "—", fontSize = 10.sp, color = Palette.Muted) }
                Text(b.activity, Modifier.weight(1.5f), fontSize = 12.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text("${b.participants} ${if (b.participants == 1) "person" else "persons"}", Modifier.weight(0.8f), fontSize = 12.sp)
                Box(Modifier.weight(1f)) {
                    Pill(when (b.attendanceStatus) { "Arrived & Checked In" -> "Checked In"; "Confirmed Attending" -> "Attending"; "Cancelled by Tourist" -> "Cancelled"; else -> "Pending Check" })
                }
                Text("$PESO${money(b.totalAmount)}", Modifier.weight(0.7f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Box(Modifier.weight(0.9f)) { StatusPill(b.status) }
                Row(Modifier.weight(1.3f), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (b.status == "Pending") {
                        PrimaryButton("Accept") { s.bookingAction(b.id, "Confirmed") }
                        SecondaryButton("Decline", color = Palette.Red) { s.bookingAction(b.id, "Cancelled") }
                    } else SecondaryButton("View", icon = Icons.Outlined.Visibility) { s.selectedBookingForView = b }
                }
            }
            HorizontalDivider(color = Palette.Border)
        }
    }
    GlassCard {
        SectionHeader("My Farm Products") { TextButton({ s.navigate(Page.FARMER_PRODUCTS) }) { Text("View All in Catalog →", fontWeight = FontWeight.Bold) } }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            s.farmProducts.take(4).zip(listOf(
                Icons.Outlined.AutoAwesome to Color(0xFFFDE68A), Icons.Outlined.EmojiEvents to Color(0xFFF5DEB3),
                Icons.Outlined.Agriculture to Color(0xFFBBF7D0), Icons.Outlined.WaterDrop to Color(0xFFFCD9A8),
            )).map { (pr, ic) -> Triple(pr.name, "$PESO${money(pr.discountedPrice)} ${pr.unit}", ic.first) to ic.second }.forEach { (p, c) ->
                Column(Modifier.weight(1f).clip(RoundedCornerShape(16.dp)).border(1.dp, Palette.Border, RoundedCornerShape(16.dp))) {
                    Box(Modifier.fillMaxWidth().height(80.dp).background(Brush.linearGradient(listOf(c, c.copy(alpha = 0.5f)))), contentAlignment = Alignment.Center) {
                        Icon(p.third, null, Modifier.size(34.dp), tint = Palette.Deep)
                    }
                    Column(Modifier.background(Color.White).fillMaxWidth().padding(12.dp)) {
                        Text(p.first, fontWeight = FontWeight.Bold); Text(p.second, fontSize = 12.sp, color = Palette.Forest)
                    }
                }
            }
        }
    }
}

@Composable
fun TouristDashboard(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1("Hello, ${s.displayName.substringBefore(" ")}!"); Sub("Where do you want to go today?") }
        PrimaryButton("Book a Tour", icon = Icons.Outlined.Explore) { s.navigate(Page.FARM_DETAIL) }
    }
    s.pendingAttendanceBooking?.let { t ->
        val confirmed = t.attendanceStatus == "Confirmed Attending"
        val cancelled = t.attendanceStatus == "Cancelled by Tourist" || t.status == "Cancelled"
        val (bg, accent) = when { confirmed -> Color(0xFFF0FDF4) to Color(0xFF15803D); cancelled -> Color(0xFFFEF2F2) to Palette.Red; else -> Color(0xFFFFFBEB) to Color(0xFFB45309) }
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(bg).border(1.dp, accent.copy(alpha = 0.3f), RoundedCornerShape(20.dp)).padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(if (confirmed) Icons.Outlined.CheckBox else if (cancelled) Icons.Outlined.Block else Icons.Outlined.Notifications, null, tint = accent)
                Spacer(Modifier.width(8.dp))
                Text("1-DAY BEFORE TOUR CHECK", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = accent)
                Spacer(Modifier.width(10.dp))
                Pill("Tomorrow at ${t.tourTime}", Color.White, accent)
            }
            Spacer(Modifier.height(8.dp))
            Text(when { confirmed -> "Attendance Confirmed: See You Tomorrow!"; cancelled -> "Tour Visit Cancelled"; else -> "Will you proceed with your scheduled Farm Tour tomorrow?" },
                fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep)
            Spacer(Modifier.height(4.dp))
            Text(when {
                confirmed -> "Your tour reservation at ${t.farmName} is confirmed. The farm host and your guide are preparing for your arrival at ${t.tourTime}."
                cancelled -> "You have cancelled your tour reservation at ${t.farmName}. The farm host has been notified."
                else -> "Your tour to ${t.farmName} is scheduled for tomorrow, ${t.tourDate} at ${t.tourTime} (${t.participants} guests). Please confirm if you will proceed so the farm can prepare fresh refreshments and assign your guide."
            }, fontSize = 13.sp, color = Color(0xFF334155))
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (!confirmed && !cancelled) {
                    PrimaryButton("YES, I WILL ATTEND", icon = Icons.Outlined.CheckBox) { s.attendanceConfirmation(t.id, true) }
                    SecondaryButton("NO, CANCEL TOUR", icon = Icons.Outlined.Cancel, color = Palette.Red) { s.attendanceConfirmation(t.id, false) }
                } else SecondaryButton("View Booking Voucher →") { s.navigate(Page.MY_BOOKINGS) }
            }
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        val reviewCount = s.myReviews.size
        val favs = s.favoriteNames
        MiniStat(Icons.Outlined.CalendarMonth, "${s.activeBookings.size}", "Active Bookings", Modifier.weight(1f)) { s.navigate(Page.MY_BOOKINGS) }
        MiniStat(Icons.Outlined.Star, "$reviewCount", "Submitted Reviews", Modifier.weight(1f)) {
            val pending = s.visibleBookings.count(s::canReview)
            s.showToast(when {
                pending > 0 -> "You have $pending visit(s) waiting for a review. Open My Bookings and tap Write Review."
                reviewCount == 0 -> "You haven't posted any reviews yet. You can review a booking after your visit."
                else -> "You have $reviewCount posted review(s). Thank you for supporting local farmers!"
            })
            if (pending > 0) s.navigate(Page.MY_BOOKINGS)
        }
        MiniStat(Icons.Outlined.FavoriteBorder, "${favs.size}", "Wishlisted Farms", Modifier.weight(1f)) {
            s.showToast(if (favs.isEmpty()) "No farms wishlisted yet. Tap the heart on a farm to save it." else "${favs.size} farm(s) wishlisted: ${favs.joinToString()}.")
        }
    }
    Box(Modifier.fillMaxWidth().height(220.dp).clip(RoundedCornerShape(24.dp))) {
        AsyncImage(s.images.farmLifeBannerPhoto, Modifier.fillMaxSize())
        Box(Modifier.fillMaxSize().background(Brush.horizontalGradient(listOf(Color(0xE6144824), Color.Transparent))))
        Column(Modifier.align(Alignment.CenterStart).padding(32.dp).widthIn(max = 460.dp)) {
            Text("Experience Farm Life", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Spacer(Modifier.height(6.dp))
            Text("Join farm tours, try fresh produce, meet local farmers, and create unforgettable memories.", color = Color.White.copy(alpha = 0.9f))
            Spacer(Modifier.height(14.dp))
            PrimaryButton("Explore Tours Now", color = Color(0xFF22C55E)) { s.navigate(Page.FARM_DETAIL) }
        }
    }
    SectionHeader("Popular Destinations") { TextButton({ s.navigate(Page.FARM_DETAIL) }) { Text("View All Farms →", fontWeight = FontWeight.Bold) } }
    Grid(s.tours.take(3), 3) { t ->
        PhotoCard(t.imageUrl, t.name, t.location.substringBefore(","), t.rating, t.reviewsCount, t.pricePerPerson, t.id.toLong() in s.favoriteIds,
            { s.toggleFavorite(t.id.toLong(), t.name) }) { s.selectedTour = t; s.isTourModalOpen = true }
    }
}

@Composable
private fun MiniStat(icon: ImageVector, value: String, label: String, modifier: Modifier, onClick: () -> Unit) {
    GlassCard(modifier, onClick = onClick) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(46.dp).clip(RoundedCornerShape(14.dp)).background(Palette.Mint), contentAlignment = Alignment.Center) { Icon(icon, null, tint = Palette.Forest) }
            Spacer(Modifier.width(14.dp))
            Column { Text(value, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep); Sub(label) }
        }
    }
}
