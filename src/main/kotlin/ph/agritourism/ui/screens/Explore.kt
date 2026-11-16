package ph.agritourism.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.model.Product
import ph.agritourism.ui.*
import kotlin.math.roundToInt

@Composable
private fun PageHeader(title: String, sub: String, tag: String? = null) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1(title); Sub(sub) }
        if (tag != null) Pill(tag)
    }
}

@Composable
fun ExploreTours(s: AppState) {
    PageHeader("Explore Philippine Farm Tours",
        "Handpicked eco-sanctuaries, heritage agro-trails, and scenic mountain farms across Batangas, Benguet, Laguna, and Pampanga",
        "${s.tours.size} Verified Destinations")
    Grid(s.tours, 3) { t ->
        PhotoCard(t.imageUrl, t.name, t.location.substringBefore(","), t.rating, t.reviewsCount, t.pricePerPerson, t.id.toLong() in s.favoriteIds,
            { s.toggleFavorite(t.id.toLong(), t.name) }) { s.selectedTour = t; s.isTourModalOpen = true }
    }
}

@Composable
fun FruitPickingPage(s: AppState) {
    PageHeader("Fruit Picking Experiences",
        "Pluck fresh tree-ripened Valencia oranges, strawberries, mangoes, dragonfruits, and rambutan direct from the branch",
        "${s.fruitPicking.size} Harvest Groves")
    Grid(s.fruitPicking, 3) { f ->
        val favId = f.id + 100L
        PhotoCard(f.imageUrl, f.title, f.location.substringBefore(","), f.rating, f.reviewsCount, f.pricePerPerson, favId in s.favoriteIds,
            { s.toggleFavorite(favId, f.title) }) { s.selectedFruit = f; s.isFruitModalOpen = true }
    }
}

@Composable
fun MarketPage(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            H1("Fresh Local Vegetables & Organic Harvest")
            Sub("100% natural, farm-to-table organic vegetables harvested directly from Batangas, Benguet, and Laguna")
        }
        FilterChipRow(listOf("All", "Vegetables", "Fruits", "Others"), s.marketFilter, { if (it == "All") "All Products" else it }) { s.marketFilter = it }
    }
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Brush.horizontalGradient(listOf(Color(0xFFFEF3C7), Color(0xFFDCFCE7)))).padding(16.dp),
        verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Outlined.Discount, null, tint = Color(0xFFB45309))
        Spacer(Modifier.width(10.dp))
        Text("Seasonal Harvest Promo: 10% OFF automatically applied on all local vegetables and fruits!", Modifier.weight(1f), fontWeight = FontWeight.Bold, color = Palette.Deep)
        Pill("Direct Farm-to-Table", Color.White)
    }
    if (s.filteredProducts.isEmpty()) Sub("No products match your search.")
    Grid(s.filteredProducts, 4) { p -> ProductCard(s, p) }
}

@Composable
fun ProductCard(s: AppState, p: Product) {
    val inCart = s.cart.firstOrNull { it.product.id == p.id }?.quantity ?: 0
    val soldOut = p.stock <= 0
    val limit = inCart >= p.stock
    GlassCard(padding = 0.dp) {
        Box(Modifier.fillMaxWidth().height(160.dp)) {
            AsyncImage(p.imageUrl, Modifier.fillMaxSize())
            Pill("${p.discountPercent}% OFF", Color(0xFFDC2626), Color.White, Modifier.align(Alignment.TopStart).padding(10.dp))
            Pill(p.category, Color.White.copy(alpha = 0.92f), Palette.Deep, Modifier.align(Alignment.TopEnd).padding(10.dp))
        }
        Column(Modifier.padding(14.dp)) {
            Text(p.name, fontWeight = FontWeight.ExtraBold, color = Palette.Deep, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(p.farmOrigin, Modifier.weight(1f), fontSize = 11.sp, color = Palette.Forest, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(if (soldOut) "Sold Out" else "Stock: ${p.stock} left", fontSize = 10.sp, fontWeight = FontWeight.Bold,
                    color = if (soldOut) Palette.Red else Palette.Muted)
            }
            Spacer(Modifier.height(4.dp))
            Sub(p.description, maxLines = 2)
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("$PESO${p.discountedPrice.roundToInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 17.sp, color = Palette.Forest)
                Spacer(Modifier.width(4.dp))
                Text("$PESO${money(p.price)}", fontSize = 11.sp, color = Palette.Muted, textDecoration = TextDecoration.LineThrough)
                Text(" ${p.unit}", fontSize = 11.sp, color = Palette.Muted)
                Spacer(Modifier.weight(1f))
                PrimaryButton(when { soldOut -> "Sold Out"; limit -> "Limit Reached"; inCart > 0 -> "Add ($inCart/${p.stock})"; else -> "Add" },
                    icon = Icons.Filled.Add, enabled = !soldOut && !limit) { s.addToCart(p) }
            }
        }
    }
}

@Composable
fun FarmersStoriesPage(s: AppState) {
    Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Brush.linearGradient(listOf(Palette.Deep, Color(0xFF2D7A45)))).padding(28.dp)) {
        Column {
            Pill("Heart of Philippine Agro-Heritage", Color.White.copy(alpha = 0.15f), Color(0xFFBBF7D0))
            Spacer(Modifier.height(10.dp))
            Text("Meet Our Local Farmers & Agro-Stewards", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
            Spacer(Modifier.height(6.dp))
            Text("Behind every basket of fresh strawberries, sweet carabao mangoes, pure raw honeycomb, and artisanal tablea is a dedicated Filipino farmer. Explore their generational stories, learn about their sustainable soil practices, and support them directly.",
                color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp)
            Spacer(Modifier.height(14.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                PrimaryButton("Shop All Harvests", icon = Icons.Outlined.ShoppingBag, color = Color(0xFF22C55E)) { s.navigate(Page.MARKET) }
                PrimaryButton("Book Farm Tours", icon = Icons.Outlined.Explore, color = Color.White.copy(alpha = 0.18f)) { s.navigate(Page.FARM_DETAIL) }
            }
        }
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
        val provinces = listOf("All", "Batangas", "Benguet", "Bukidnon", "Davao")
        FilterChipRow(provinces, s.farmerStoriesFilter, { p -> "$p (${if (p == "All") s.farmers.size else s.farmers.count { it.province == p }})" }) { s.farmerStoriesFilter = it }
        Spacer(Modifier.weight(1f))
        SearchField(s.farmerSearchQuery, { s.farmerSearchQuery = it }, "Search farmer or crop…", Modifier.width(260.dp))
    }
    val q = s.farmerSearchQuery
    val list = s.farmers.filter { s.farmerStoriesFilter == "All" || it.province == s.farmerStoriesFilter }
        .filter { f -> q.isBlank() || f.name.contains(q, true) || f.farmName.contains(q, true) || f.specialtyProduce.any { it.contains(q, true) } }
    Grid(list, 2) { f ->
        val harvests = s.products.filter { it.id in f.productIds }
        GlassCard(padding = 0.dp) {
            Box(Modifier.fillMaxWidth().height(170.dp)) {
                AsyncImage(f.farmBannerUrl, Modifier.fillMaxSize())
                Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xCC0B2512)))))
                Row(Modifier.align(Alignment.TopStart).padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Pill("📍 ${f.location}", Color.White.copy(alpha = 0.9f)); Pill(f.generation, Color(0xFFFEF3C7), Color(0xFF92400E))
                }
                Row(Modifier.align(Alignment.BottomStart).padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Avatar(f.photoUrl, 64.dp)
                    Spacer(Modifier.width(12.dp))
                    Column { Text(f.name, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp); Text(f.farmName, color = Color(0xFFBBF7D0), fontSize = 12.sp) }
                }
            }
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { Pill(f.roleTitle); Pill("🏅 ${f.yearsExperience} Years Farming", Color(0xFFFEF3C7), Color(0xFF92400E)) }
                Text("\"${f.storyQuote}\"", fontStyle = FontStyle.Italic, fontSize = 13.sp, color = Color(0xFF334155), maxLines = 3, overflow = TextOverflow.Ellipsis)
                Label("Certified Sustainable Practices:")
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) { f.sustainablePractices.take(3).forEach { Pill("✓ $it", Color(0xFFF0FDF4), Color(0xFF166534)) } }
                Row { Label("Harvested Products (${harvests.size} crops):"); Spacer(Modifier.weight(1f)); Text("Direct from Farm", fontSize = 10.sp, color = Palette.Forest) }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    harvests.take(2).forEach { p ->
                        Row(Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(Color(0xFFF8FAFC)).padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                            AsyncImage(p.imageUrl, Modifier.size(42.dp).clip(RoundedCornerShape(10.dp)))
                            Spacer(Modifier.width(8.dp))
                            Column(Modifier.weight(1f)) {
                                Text(p.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text("$PESO${money(p.price)} ${p.unit}", fontSize = 11.sp, color = Palette.Forest)
                            }
                            IconButton({ s.addToCart(p) }, Modifier.size(30.dp).clip(CircleShape).background(Palette.Forest)) { Icon(Icons.Filled.Add, "Add ${p.name} to cart", tint = Color.White, modifier = Modifier.size(16.dp)) }
                        }
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    SecondaryButton("Read Full Story & Profile", Modifier.weight(1f), Icons.AutoMirrored.Outlined.MenuBook) { s.selectedFarmerForModal = f }
                    PrimaryButton("Book Farm Tour", Modifier.weight(1f), Icons.Outlined.Explore) {
                        s.selectedTour = s.tours.firstOrNull { it.id == f.tourId } ?: s.tours.first(); s.isTourModalOpen = true
                    }
                }
            }
        }
    }
}

@Composable
fun CatalogHome(s: AppState) {
    GlassCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) { H1("AgriTourism Desktop Catalog"); Sub("Browse farm destinations, local farm products, and fruit orchards (Picture & Description View)") }
            FilterChipRow(listOf("ALL", "PLACES", "PRODUCTS", "ORCHARDS"), s.showcaseCategory.name,
                { mapOf("ALL" to "All", "PLACES" to "Destinations", "PRODUCTS" to "Products", "ORCHARDS" to "Orchards")[it]!! }) { s.showcaseCategory = ShowcaseCategory.valueOf(it) }
            Spacer(Modifier.width(12.dp))
            SearchField(s.searchQuery, { s.searchQuery = it }, "Filter farms or products…", Modifier.width(240.dp))
        }
    }
    val q = s.searchQuery.trim()
    val cat = s.showcaseCategory
    if (cat == ShowcaseCategory.ALL || cat == ShowcaseCategory.PLACES) {
        SectionHeader("Farm Destinations", "Sustainable agro-estates and eco-sanctuaries across the Philippines")
        Grid(s.tours.filter { q.isEmpty() || it.name.contains(q, true) || it.location.contains(q, true) || it.description.contains(q, true) }, 3) { t ->
            ShowcaseCard(t.imageUrl, t.location, t.name, t.description)
        }
    }
    if (cat == ShowcaseCategory.ALL || cat == ShowcaseCategory.PRODUCTS) {
        SectionHeader("Fresh Produce from Local Farms", "Naturally cultivated organic crops and artisanal agricultural products")
        Grid(s.products.filter { q.isEmpty() || it.name.contains(q, true) || it.farmOrigin.contains(q, true) || it.description.contains(q, true) }, 4) { p ->
            ShowcaseCard(p.imageUrl, p.farmOrigin, p.name, p.description, 140)
        }
    }
    if (cat == ShowcaseCategory.ALL || cat == ShowcaseCategory.ORCHARDS) {
        SectionHeader("Tree-to-Basket Fruit Orchards", "Lush Philippine fruit orchards for seasonal harvesting")
        Grid(s.fruitPicking.filter { q.isEmpty() || it.farmName.contains(q, true) || it.fruitName.contains(q, true) || it.description.contains(q, true) }, 3) { o ->
            ShowcaseCard(o.imageUrl, o.fruitName.ifBlank { o.title }, o.farmName, "${o.location}\n${o.description}")
        }
    }
}

@Composable
private fun ShowcaseCard(image: String, tag: String, title: String, desc: String, h: Int = 180) {
    GlassCard(padding = 0.dp) {
        Box(Modifier.fillMaxWidth().height(h.dp)) {
            AsyncImage(image, Modifier.fillMaxSize())
            Pill(tag, Color.White.copy(alpha = 0.92f), Palette.Deep, Modifier.align(Alignment.BottomStart).padding(10.dp))
        }
        Column(Modifier.padding(14.dp)) {
            Text(title, fontWeight = FontWeight.ExtraBold, color = Palette.Deep, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.height(4.dp))
            Sub(desc, maxLines = 4)
        }
    }
}

@Composable
fun FarmerRestrictionNotice(s: AppState) {
    GlassCard(Modifier.fillMaxWidth(), padding = 32.dp) {
        Icon(Icons.Outlined.VerifiedUser, null, Modifier.size(48.dp), tint = Palette.Forest)
        Spacer(Modifier.height(10.dp))
        Pill("Farmer Host Workspace Active")
        Spacer(Modifier.height(8.dp))
        H1("Consumer Browsing Restricted for Farm Hosts")
        Spacer(Modifier.height(6.dp))
        Text("You are signed in as ${s.displayName} (Registered Farm Host at ${s.myFarmLabel}). Consumer tourist discovery pages (Explore Tours, Fruit Picking, Market, Farmers & Stories) are exclusive to Eco-Tourist visitors.",
            color = Color(0xFF334155))
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            PrimaryButton("Manage Tourist Bookings & Gate Check-In", icon = Icons.Outlined.CalendarMonth) { s.navigate(Page.MY_BOOKINGS) }
            SecondaryButton("Manage Tourist Produce Orders", icon = Icons.Outlined.Inventory2) { s.navigate(Page.FARMER_ORDERS) }
            SecondaryButton("My Produce Catalog", icon = Icons.Outlined.ShoppingBag) { s.navigate(Page.FARMER_PRODUCTS) }
        }
    }
}
