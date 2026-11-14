package ph.agritourism.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.ui.*

@Composable
fun StatCard(label: String, value: String, sub: String, bg: Color, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    Column(modifier.clip(RoundedCornerShape(18.dp)).background(bg).then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(20.dp)) {
        Text(label, fontSize = 13.sp, color = Color(0xFF334155), fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(6.dp))
        Text(value, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        Text(sub, fontSize = 11.sp, color = Palette.Muted)
    }
}

/** Draws an SVG-style cubic spline chart. Segments are given in a fixed viewBox coordinate space. */
@Composable
fun SplineChart(
    viewW: Float, viewH: Float, start: Offset, curves: List<List<Float>>, baseY: Float,
    gridY: List<Pair<Float, String>>, gridX: List<Float>, labels: List<Pair<Float, String>>, labelY: Float,
    line: Color, fill: Color, modifier: Modifier,
) {
    val tm = rememberTextMeasurer()
    androidx.compose.foundation.Canvas(modifier) {
        val sx = size.width / viewW; val sy = size.height / viewH
        fun o(x: Float, y: Float) = Offset(x * sx, y * sy)
        val ts = TextStyle(fontSize = 11.sp, color = Color(0xFF64748B), fontWeight = FontWeight.SemiBold)
        gridY.forEach { (y, l) ->
            drawLine(Color(0xFFD8E2DA), o(50f, y), o(viewW - 30f, y))
            drawText(tm, l, o(6f, y - 8f), ts)
        }
        gridX.forEach { x -> drawLine(Color(0xFFD8E2DA), o(x, gridY.first().first), o(x, baseY), pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 4f))) }
        val path = Path().apply {
            moveTo(start.x * sx, start.y * sy)
            curves.forEach { c -> cubicTo(c[0] * sx, c[1] * sy, c[2] * sx, c[3] * sy, c[4] * sx, c[5] * sy) }
        }
        val area = Path().apply { addPath(path); val last = curves.last(); lineTo(last[4] * sx, baseY * sy); lineTo(start.x * sx, baseY * sy); close() }
        drawPath(area, Brush.verticalGradient(listOf(fill.copy(alpha = 0.45f), fill.copy(alpha = 0f))))
        drawPath(path, line, style = Stroke(width = 3.5f * minOf(sx, sy).coerceAtLeast(1f), cap = StrokeCap.Round, join = StrokeJoin.Round))
        labels.forEach { (x, l) -> val r = tm.measure(l, ts); drawText(r, topLeft = Offset(x * sx - r.size.width / 2, labelY * sy - r.size.height)) }
    }
}

@Composable
fun AdminDashboard(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1("Platform Overview"); Sub("Real-time platform metrics, booking trends, and system telemetry") }
        Pill("● System Healthy · Live", Color(0xFFDCFCE7), Color(0xFF166534))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        StatCard("Total Users", "1,248", "↑ +14% from last month", Color(0xFFE0F2FE), Modifier.weight(1f))
        StatCard("Total Farms", "86", "Active accredited estates", Color(0xFFE3F1E7), Modifier.weight(1f))
        StatCard("Total Bookings", "342", "98.4% fulfillment rate", Color(0xFFFEF3E2), Modifier.weight(1f))
        StatCard("Total Products", "1,560", "Organic vegetables & fruits", Color(0xFFEDE9FE), Modifier.weight(1f))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
        GlassCard(Modifier.weight(1.6f)) {
            SectionHeader("Bookings Overview", "Monthly reservation volume across all accredited tourist farms") {
                TextButton({ s.navigate(Page.MY_BOOKINGS); s.showToast("Opened Farm Bookings management!") }) { Text("View Reports", fontWeight = FontWeight.Bold) }
            }
            Spacer(Modifier.height(12.dp))
            SplineChart(
                650f, 250f, Offset(50f, 190f),
                listOf(listOf(100f, 155f, 120f, 160f, 150f, 160f), listOf(180f, 160f, 200f, 145f, 230f, 135f),
                    listOf(260f, 120f, 280f, 155f, 310f, 160f), listOf(340f, 165f, 360f, 145f, 390f, 145f),
                    listOf(430f, 145f, 470f, 95f, 510f, 70f), listOf(540f, 50f, 570f, 90f, 600f, 105f)),
                220f, listOf(25f to "300", 65f to "200", 105f to "150", 145f to "100", 185f to "50", 220f to "0"),
                listOf(75f, 150f, 225f, 300f, 375f, 450f, 525f, 600f),
                listOf(50f to "Jan", 130f to "Feb", 210f to "Mar", 290f to "Apr", 370f to "May", 450f to "Jun", 530f to "Jul", 600f to "Aug"), 248f,
                Palette.Teal, Color(0xFF14B8A6), Modifier.fillMaxWidth().height(260.dp),
            )
            TextButton({ s.navigate(Page.MY_BOOKINGS) }, Modifier.align(Alignment.End)) { Text("View All Bookings Table →", fontWeight = FontWeight.Bold) }
        }
        GlassCard(Modifier.weight(1f)) {
            H2("Recent Activities")
            Spacer(Modifier.height(12.dp))
            listOf(
                Triple(Icons.Outlined.Person, "New user registered", "Anna Addyson - (Tourist)") to "5 minutes ago",
                Triple(Icons.Outlined.Description, "New product added", "Exotic Mangoes (Sunnyvale Farm)") to "55 minutes ago",
                Triple(Icons.Outlined.EventAvailable, "Booking confirmed", "Jasmine Siddiqui (Green Valley Farm)") to "12 minutes ago",
                Triple(Icons.Outlined.BarChart, "Report generated", "Monthly_report (May_2026)") to "1 hour ago",
            ).forEach { (t, time) ->
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
        Column(Modifier.weight(1f)) { H1("Welcome, Juan Dela Cruz"); Sub("Sunnyvale Farm · Accredited AgriTourism Host (Bauan, Batangas)") }
        PrimaryButton("List New Produce", icon = Icons.Filled.Add) { s.isAddProductModalOpen = true }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        StatCard("Total Products", "12", "Active in marketplace", Color(0xFFDFF1E6), Modifier.weight(1f))
        StatCard("New Orders", "8", "Ready for packing & delivery", Color(0xFFDDEAF8), Modifier.weight(1f))
        StatCard("Active Bookings", "15", "Upcoming weekend visitors", Color(0xFFFCEBD6), Modifier.weight(1f))
    }
    GlassCard {
        SectionHeader("Farm Sales & Revenue Graph", "Monthly harvest sales and visitor tour revenues (PHP)") { Pill("Year 2026: ₱148,500 Total") }
        Spacer(Modifier.height(10.dp))
        SplineChart(
            650f, 200f, Offset(50f, 150f),
            listOf(listOf(120f, 130f, 180f, 140f, 230f, 110f), listOf(290f, 80f, 360f, 120f, 420f, 70f), listOf(490f, 30f, 550f, 65f, 600f, 50f)),
            175f, listOf(20f to "₱40k", 60f to "₱30k", 100f to "₱20k", 140f to "₱10k", 175f to "₱0"), emptyList(),
            listOf(50f to "Jan", 140f to "Feb", 230f to "Mar", 320f to "Apr", 410f to "May", 500f to "Jun", 600f to "Jul"), 198f,
            Color(0xFF15803D), Color(0xFF16A34A), Modifier.fillMaxWidth().height(210.dp),
        )
    }
    GlassCard {
        SectionHeader("Recent Tour Bookings", "Accept or manage visitor requests for Sunnyvale Farm") {
            Pill("${s.bookings.count { it.status == "Pending" }} Pending Requests", Color(0xFFFEF3C7), Color(0xFF92400E))
        }
        Spacer(Modifier.height(12.dp))
        val headers = listOf("Date" to 1.1f, "Time" to 1.3f, "Tourist Guest" to 1.3f, "Activity" to 1.5f, "Guests" to 0.8f, "1-Day Confirmation" to 1f, "Amount" to 0.7f, "Status" to 0.9f, "Action" to 1.3f)
        Row(Modifier.fillMaxWidth().background(Palette.Mint, RoundedCornerShape(10.dp)).padding(10.dp)) {
            headers.forEach { (h, w) -> Text(h, Modifier.weight(w), fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep) }
        }
        s.bookings.forEach { b ->
            Row(Modifier.fillMaxWidth().clickable { s.selectedBookingForView = b }.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(b.tourDate, Modifier.weight(1.1f), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text(b.tourTime, Modifier.weight(1.3f), fontSize = 12.sp, maxLines = 2)
                Column(Modifier.weight(1.3f)) { Text(b.customerName, fontSize = 12.sp, fontWeight = FontWeight.Bold); Text(b.customerPhone ?: "+63 917 555 0192", fontSize = 10.sp, color = Palette.Muted) }
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
            listOf(
                Triple("Carabao Mangoes", "₱120 /kg", Icons.Outlined.AutoAwesome) to Color(0xFFFDE68A),
                Triple("Farm Fresh Eggs", "₱150 /dozen", Icons.Outlined.EmojiEvents) to Color(0xFFF5DEB3),
                Triple("Organic Vegetables", "₱80 /kg", Icons.Outlined.Agriculture) to Color(0xFFBBF7D0),
                Triple("Pure Wild Honey", "₱250 /bottle", Icons.Outlined.WaterDrop) to Color(0xFFFCD9A8),
            ).forEach { (p, c) ->
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
        Column(Modifier.weight(1f)) { H1("Hello, Maria!"); Sub("Where do you want to go today?") }
        PrimaryButton("Book a Tour", icon = Icons.Outlined.Explore) { s.navigate(Page.FARM_DETAIL) }
    }
    s.bookings.firstOrNull { it.id == 101L }?.let { t ->
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
                confirmed -> "Your tour reservation at ${t.farmName} is confirmed. Farm host Mang Juan and your guide are preparing for your arrival at ${t.tourTime}."
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
        MiniStat(Icons.Outlined.CalendarMonth, "2", "Active Bookings", Modifier.weight(1f)) { s.navigate(Page.MY_BOOKINGS) }
        MiniStat(Icons.Outlined.Star, "1", "Submitted Reviews", Modifier.weight(1f)) { s.showToast("You have 1 posted review. Thank you for supporting local farmers!") }
        MiniStat(Icons.Outlined.FavoriteBorder, "5", "Wishlisted Farms", Modifier.weight(1f)) { s.showToast("5 farms wishlisted: Sunflower Farm, Laurel View, Banaue, Sunnyvale, Riverside.") }
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
