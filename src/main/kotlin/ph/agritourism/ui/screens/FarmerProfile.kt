package ph.agritourism.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.ui.*

@Composable
fun FarmerProfilePage(s: AppState) {
    Box(Modifier.fillMaxWidth().height(280.dp).clip(RoundedCornerShape(24.dp))) {
        AsyncImage(s.images.farmerProfileBanner, Modifier.fillMaxSize(), contentDescription = "Sunnyvale Farm Landscape")
        Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xE60B2512)))))
        Pill("🛡 DA-ATI Accredited Farm #PH-2024-91", Color.White.copy(alpha = 0.92f), Palette.Deep, Modifier.align(Alignment.TopEnd).padding(16.dp))
        Row(Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(24.dp), verticalAlignment = Alignment.Bottom) {
            Avatar(s.images.juanAvatar, 96.dp)
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Juan Dela Cruz", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color.White); Spacer(Modifier.width(10.dp))
                    Pill("Master Farmer", Color(0xFFFEF3C7), Color(0xFF92400E))
                }
                Text("📍 Sunnyvale Heritage Farm · Bauan, Batangas", color = Color(0xFFBBF7D0), fontSize = 13.sp)
                Text("3rd generation family agro-farm specializing in organic heirloom vegetables, carabao mango orchards, and immersive eco-tours.",
                    color = Color.White.copy(alpha = 0.85f), fontSize = 12.sp)
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PrimaryButton("Add Farm Product with Photo", icon = Icons.Filled.Add, color = Color(0xFF22C55E)) { s.isAddProductModalOpen = true }
                PrimaryButton("New Tour Reservation", icon = Icons.Outlined.CalendarMonth, color = Color(0xFF2D7A45)) { s.isAddBookingModalOpen = true }
            }
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        listOf(
            listOf("Tourist Rating", "4.9 / 5.0", "145 verified reviews"),
            listOf("Listed Products", "${s.products.size} Items", "Fresh organic produce"),
            listOf("Active Tours", "${s.tours.size} Tours", "Agro-trail & Fruit Picking"),
            listOf("Tour Bookings", "${s.bookings.size} Bookings", "₱148,200 revenue"),
        ).zip(listOf(Icons.Outlined.Star, Icons.Outlined.Spa, Icons.Outlined.Explore, Icons.Outlined.EmojiEvents)).forEach { (st, ic) ->
            GlassCard(Modifier.weight(1f)) {
                Icon(ic, null, tint = Palette.Forest); Spacer(Modifier.height(6.dp))
                Label(st[0]); Text(st[1], fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep); Sub(st[2])
            }
        }
    }
    SectionHeader("Farmer's Tour & Fruit Picking Experiences", "Direct booking schedules operated at Sunnyvale Farm") {
        PrimaryButton("Create Tour Booking", icon = Icons.Filled.Add) { s.isAddBookingModalOpen = true }
    }
    Grid(s.tours.take(3), 3) { t ->
        GlassCard(padding = 0.dp) {
            Box(Modifier.fillMaxWidth().height(170.dp)) {
                AsyncImage(t.imageUrl, Modifier.fillMaxSize())
                Pill(t.location, Color.White.copy(alpha = 0.92f), Palette.Deep, Modifier.align(Alignment.TopStart).padding(10.dp))
                Pill(t.highlightTag, Color(0xFFFEF3C7), Color(0xFF92400E), Modifier.align(Alignment.TopEnd).padding(10.dp))
            }
            Column(Modifier.padding(14.dp)) {
                Row { Text(t.name, Modifier.weight(1f), fontWeight = FontWeight.ExtraBold, color = Palette.Deep, maxLines = 1, overflow = TextOverflow.Ellipsis); Text("★ ${t.rating}", fontSize = 12.sp, color = Palette.Amber) }
                Sub(t.description, maxLines = 3)
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("$PESO${t.pricePerPerson}", fontWeight = FontWeight.ExtraBold, color = Palette.Forest); Text(" /guest", fontSize = 11.sp, color = Palette.Muted)
                    Spacer(Modifier.weight(1f)); PrimaryButton("Book & Schedule") { s.selectedTour = t; s.isTourModalOpen = true }
                }
            }
        }
    }
    SectionHeader("Harvest Catalog & Available Produce", "Fresh vegetables, fruits, and processed farm goods") {
        PrimaryButton("Add New Farm Product", icon = Icons.Filled.Add) { s.isAddProductModalOpen = true }
    }
    Grid(s.products.take(8), 4) { p ->
        GlassCard(padding = 0.dp) {
            Box(Modifier.fillMaxWidth().height(130.dp)) {
                AsyncImage(p.imageUrl, Modifier.fillMaxSize())
                Pill(p.category, Color.White.copy(alpha = 0.92f), Palette.Deep, Modifier.align(Alignment.TopStart).padding(8.dp))
            }
            Column(Modifier.padding(12.dp)) {
                Text(p.name, fontWeight = FontWeight.ExtraBold, color = Palette.Deep, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(p.farmOrigin, fontSize = 11.sp, color = Palette.Forest, maxLines = 1)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("$PESO${money(p.price)} ", fontWeight = FontWeight.ExtraBold); Text(p.unit, fontSize = 11.sp, color = Palette.Muted)
                    Spacer(Modifier.weight(1f)); TextButton({ s.addToCart(p) }) { Text("+ Add to Basket", fontSize = 11.sp, fontWeight = FontWeight.Bold) }
                }
            }
        }
    }
    GlassCard {
        H2("About Sunnyvale Heritage Farm")
        Spacer(Modifier.height(6.dp))
        Text("Located at the foot of Mount Maculot in Bauan, Batangas, Sunnyvale Farm was established in 1984 as a small coffee and fruit orchard. Today, under Mang Juan Dela Cruz, the farm employs 24 local agrarian families, utilizing vermicompost soil enrichment, rainwater harvesting, and native stingless bee pollination to grow chemical-free produce.",
            fontSize = 13.sp, color = Color(0xFF334155))
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            InfoTile("Certification", "DA-ATI Certified Good Agricultural Practices (GAP)", Icons.Outlined.VerifiedUser, Modifier.weight(1f))
            InfoTile("Direct Farm Tours", "Tuesdays to Sundays · 7:00 AM - 5:00 PM", Icons.Outlined.Schedule, Modifier.weight(1f))
            InfoTile("Contact & Inquiries", "+63 917 555 0192 · juan.delacruz@sunnyvalefarm.ph", Icons.Outlined.Call, Modifier.weight(1f))
        }
    }
}
