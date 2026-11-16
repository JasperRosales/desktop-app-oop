package ph.agritourism.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.ui.*
import kotlin.math.roundToInt

@Composable
fun CheckoutPage(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H1("Your Cart & Checkout"); Sub("Secure payment via GCash, Bank Transfer, or Cash on Delivery") }
        SecondaryButton("Continue Shopping", icon = Icons.AutoMirrored.Outlined.ArrowBack) { s.navigate(Page.MARKET) }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        listOf("1 Cart", "2 Delivery", "3 Payment", "4 Confirmation").forEachIndexed { i, t ->
            val step = i + 1
            val active = step <= s.checkoutStep
            Text(t, Modifier.weight(1f).clip(RoundedCornerShape(50)).background(if (active) Palette.Forest else Color.White)
                .border(1.dp, if (active) Palette.Forest else Palette.Border, RoundedCornerShape(50))
                .clickable { if (step <= s.checkoutStep && s.checkoutStep != 4) s.checkoutStep = step }.padding(vertical = 10.dp),
                textAlign = TextAlign.Center, color = if (active) Color.White else Palette.Muted, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }
    }
    when (s.checkoutStep) {
        1 -> CartStep(s)
        2 -> GlassCard {
            H2("Shipping & Contact Information")
            Spacer(Modifier.height(14.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Field("Recipient Full Name", s.recipientName, { s.recipientName = it }, Modifier.weight(1f))
                Field("Mobile Contact Number", s.contactPhone, { s.contactPhone = it }, Modifier.weight(1f))
            }
            Spacer(Modifier.height(12.dp))
            Field("Delivery Address", s.deliveryAddress, { s.deliveryAddress = it }, singleLine = false, minLines = 3)
            Spacer(Modifier.height(12.dp))
            Field("Special Rider Instructions", s.deliveryNotes, { s.deliveryNotes = it })
            Spacer(Modifier.height(18.dp))
            Row { SecondaryButton("Back to Cart") { s.checkoutStep = 1 }; Spacer(Modifier.weight(1f)); PrimaryButton("Proceed to Payment Method →") { s.deliveryDetailsError()?.let(s::showToast) ?: run { s.checkoutStep = 3 } } }
        }
        3 -> PaymentStep(s)
        else -> ConfirmStep(s)
    }
}

@Composable
private fun CartStep(s: AppState) {
    if (s.cart.isEmpty()) {
        GlassCard(Modifier.fillMaxWidth(), padding = 40.dp) {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Outlined.ShoppingBag, null, Modifier.size(48.dp), tint = Palette.Muted)
                Spacer(Modifier.height(8.dp)); Sub("Your cart is currently empty.")
                Spacer(Modifier.height(12.dp)); PrimaryButton("Explore Fresh Vegetables & Produce") { s.navigate(Page.MARKET) }
            }
        }
        return
    }
    Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
        Column(Modifier.weight(2f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            s.cart.forEach { item ->
                val p = item.product
                val atMax = item.quantity >= p.stock
                GlassCard(padding = 14.dp) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(p.imageUrl, Modifier.size(72.dp).clip(RoundedCornerShape(14.dp)))
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(p.name, fontWeight = FontWeight.ExtraBold, color = Palette.Deep)
                            Text(p.farmOrigin, fontSize = 11.sp, color = Palette.Forest)
                            Text("$PESO${p.discountedPrice.roundToInt()} ${p.unit}", fontSize = 12.sp, color = Palette.Muted)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton({ s.updateCartQty(p.id, -1) }, Modifier.size(30.dp).clip(CircleShape).background(Palette.Mint)) { Icon(Icons.Filled.Remove, "Decrease quantity") }
                                Text("${item.quantity}", Modifier.padding(horizontal = 12.dp), fontWeight = FontWeight.ExtraBold)
                                IconButton({ s.updateCartQty(p.id, 1) }, Modifier.size(30.dp).clip(CircleShape).background(if (atMax) Color(0xFFE2E8F0) else Palette.Forest), enabled = !atMax) {
                                    Icon(Icons.Filled.Add, "Increase quantity", tint = Color.White)
                                }
                            }
                            Text(if (atMax) "Max stock reached" else "Limit: ${p.stock} max ${p.unit}", fontSize = 10.sp, color = if (atMax) Palette.Red else Palette.Muted)
                        }
                        Spacer(Modifier.width(16.dp))
                        Text("$PESO${(p.discountedPrice * item.quantity).roundToInt()}", Modifier.width(80.dp), fontWeight = FontWeight.ExtraBold, color = Palette.Forest, textAlign = TextAlign.End)
                        IconButton({ s.updateCartQty(p.id, -item.quantity) }) { Icon(Icons.Outlined.Delete, "Remove product from cart", tint = Palette.Red) }
                    }
                }
            }
        }
        GlassCard(Modifier.weight(1f)) {
            H2("Order Summary")
            Spacer(Modifier.height(12.dp))
            SummaryRow("Subtotal", "$PESO${money(s.cartSubtotal)}")
            SummaryRow("Delivery Fee (Refrigerated Van)", "$PESO${money(DELIVERY_FEE)}")
            HorizontalDivider(Modifier.padding(vertical = 10.dp), color = Palette.Border)
            SummaryRow("Total", "$PESO${money(s.cartTotal)}", true)
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Proceed to Delivery Details →", Modifier.fillMaxWidth()) { s.checkoutStep = 2 }
        }
    }
}

@Composable
private fun SummaryRow(l: String, v: String, bold: Boolean = false) = Row(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
    Text(l, Modifier.weight(1f), fontSize = if (bold) 16.sp else 13.sp, fontWeight = if (bold) FontWeight.ExtraBold else FontWeight.Normal)
    Text(v, fontSize = if (bold) 18.sp else 13.sp, fontWeight = FontWeight.ExtraBold, color = if (bold) Palette.Forest else Color.Unspecified)
}

private data class PayOption(val method: String, val label: String, val icon: ImageVector, val desc: String)

@Composable
private fun PaymentStep(s: AppState) {
    GlassCard {
        H2("Select Payment Method"); Sub("Pay securely via GCash, Bank Transfer, or Cash on Delivery")
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            listOf(
                PayOption("GCash", "GCash e-Wallet", Icons.Outlined.AccountBalanceWallet, "Instant QR code or mobile number transfer"),
                PayOption("Bank Transfer", "Bank Transfer", Icons.Outlined.AccountBalance, "BDO, BPI, or UnionBank online transfer"),
                PayOption("Cash on Delivery", "Cash on Delivery", Icons.Outlined.Payments, "Pay rider directly upon vegetable arrival"),
            ).forEach { o ->
                val sel = s.paymentMethod == o.method
                Column(Modifier.weight(1f).clip(RoundedCornerShape(16.dp)).background(if (sel) Palette.Mint else Color.White)
                    .border(2.dp, if (sel) Palette.Forest else Palette.Border, RoundedCornerShape(16.dp)).clickable { s.paymentMethod = o.method }.padding(16.dp)) {
                    Row { Icon(o.icon, null, tint = Palette.Forest); Spacer(Modifier.weight(1f)); if (sel) Icon(Icons.Filled.CheckCircle, null, tint = Palette.Forest) }
                    Spacer(Modifier.height(8.dp))
                    Text(o.label, fontWeight = FontWeight.ExtraBold); Sub(o.desc)
                    Text(if (sel) "Selected" else "Click to select", fontSize = 11.sp, color = Palette.Forest, fontWeight = FontWeight.Bold)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color(0xFFF8FAFC)).padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            when (s.paymentMethod) {
                "GCash" -> {
                    AsyncImage(s.images.gcashQrMockup, Modifier.size(130.dp).clip(RoundedCornerShape(12.dp)), contentDescription = "GCash QR Code")
                    Spacer(Modifier.width(16.dp))
                    Column {
                        Text("GCash Official Merchant Account", fontWeight = FontWeight.ExtraBold)
                        Text("Merchant Name: AgriTourism Philippines Co.", fontSize = 13.sp)
                        Text("Mobile: +63 917 890 1234", fontSize = 13.sp)
                        Text("Scan QR or enter mobile number. Amount: $PESO${money(s.cartTotal)}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Palette.Forest)
                    }
                }
                "Bank Transfer" -> Column {
                    Text("Bank Transfer Account Details", fontWeight = FontWeight.ExtraBold)
                    Text("Bank: BDO Unibank (Batangas City Branch)", fontSize = 13.sp)
                    Text("Account Name: AgriTourism Network PH Inc.", fontSize = 13.sp)
                    Text("Account Number: 0045-8912-3401", fontSize = 13.sp)
                }
                else -> Column {
                    Text("Cash on Delivery (COD) Selected", fontWeight = FontWeight.ExtraBold)
                    Text("Please prepare exact cash amount of $PESO${money(s.cartTotal)} upon arrival of the delivery rider.", fontSize = 13.sp)
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        Row {
            SecondaryButton("Back to Delivery") { s.checkoutStep = 2 }
            Spacer(Modifier.weight(1f))
            PrimaryButton("Confirm and Place Order · $PESO${money(s.cartTotal)}") { s.placeOrder() }
        }
    }
}

@Composable
private fun ConfirmStep(s: AppState) {
    GlassCard(Modifier.fillMaxWidth(), padding = 36.dp) {
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Filled.CheckCircle, null, Modifier.size(64.dp), tint = Color(0xFF16A34A))
            Spacer(Modifier.height(10.dp))
            H1("Mabuhay! Order Confirmed")
            Spacer(Modifier.height(6.dp))
            Text("Thank you for directly supporting local farmers! Your fresh organic vegetables and products have been queued for dispatch.", textAlign = TextAlign.Center, color = Color(0xFF334155))
            Spacer(Modifier.height(12.dp))
            Pill("Order Reference: #${s.lastOrderReference}")
            Spacer(Modifier.height(6.dp))
            Text("Payment Method: ${s.lastOrderPaymentMethod} • Total Paid: $PESO${money(s.lastOrderTotal)}", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(18.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                PrimaryButton("Track Delivery Route Now →", icon = Icons.Outlined.LocalShipping) { s.checkoutStep = 1; s.navigate(Page.ORDER_TRACKING) }
                SecondaryButton("Print Official Receipt", icon = Icons.Outlined.Print) { (s.lastPlacedOrder ?: s.visibleOrders.firstOrNull())?.let(s::printOrderReceipt) }
                SecondaryButton("Return to Marketplace") { s.checkoutStep = 1; s.navigate(Page.MARKET) }
                SecondaryButton("View All Bookings") { s.navigate(Page.MY_BOOKINGS) }
            }
        }
    }
}

@Composable
fun OrderTrackingPage(s: AppState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Pill("Real-Time Farm Logistics Tracker")
            Spacer(Modifier.height(6.dp)); H1("Delivery Tracking")
            Sub("Monitor the live route of your fresh organic farm harvest directly from Batangas to your doorstep.")
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SecondaryButton("Print Receipt", icon = Icons.Outlined.Print) { s.currentTrackedOrder()?.let(s::printOrderReceipt) }
            SecondaryButton("Marketplace") { s.navigate(Page.MARKET) }
            SecondaryButton("My Bookings") { s.navigate(Page.MY_BOOKINGS) }
        }
    }
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.horizontalScroll(rememberScrollState())) {
        Label("Select Order to Track:"); Spacer(Modifier.width(10.dp))
        if (s.visibleOrders.isEmpty()) Sub("You have no orders yet.")
        s.visibleOrders.forEach { o ->
            val sel = s.activeTrackingOrderId == o.id || s.activeTrackingOrderId == o.orderNumber
            Row(Modifier.padding(end = 8.dp).clip(RoundedCornerShape(12.dp)).background(if (sel) Palette.Forest else Color.White)
                .border(1.dp, Palette.Border, RoundedCornerShape(12.dp)).clickable { s.activeTrackingOrderId = o.id }.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Text("#${o.orderNumber}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = if (sel) Color.White else Palette.Deep)
                Spacer(Modifier.width(8.dp)); StatusPill(o.fulfillmentStatus)
            }
        }
    }
    val o = s.currentTrackedOrder() ?: return
    GlassCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("#${o.orderNumber}", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep)
                    Spacer(Modifier.width(10.dp)); Sub(o.orderDate); Spacer(Modifier.width(10.dp))
                    Pill(if (o.fulfillmentStatus == "Delivered") "Delivered" else "● Live Tracking Active", Color(0xFFDCFCE7), Color(0xFF166534))
                }
                Text("📍 Destination: ${o.customerAddress}", fontSize = 13.sp, color = Color(0xFF334155))
            }
            Column(Modifier.clip(RoundedCornerShape(14.dp)).background(if (o.isReceivedByUser) Color(0xFFDCFCE7) else Color(0xFFFEF3C7)).padding(12.dp)) {
                Text(if (o.isReceivedByUser) "Package Confirmed Received" else "In Transit to Your Doorstep", fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                Text(if (o.isReceivedByUser) (o.receivedAt ?: "Handed over in good condition") else (o.estimatedArrival ?: "ETA ~11:30 AM"), fontSize = 11.sp)
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Column(Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(Color(0xFFF8FAFC)).padding(14.dp)) {
                Row { Label("Assigned Courier & Rider"); Spacer(Modifier.weight(1f)); Text(o.courierName ?: "AgriExpress Direct", fontSize = 11.sp, color = Palette.Forest) }
                Spacer(Modifier.height(6.dp))
                Text("🚚 ${o.riderName ?: "Kuya Jun-Jun Ramos"}", fontWeight = FontWeight.ExtraBold)
                Sub(o.riderVehicle ?: "Yamaha NMAX (Insulated Box) · Plate DA 7192")
                Row(verticalAlignment = Alignment.CenterVertically) { Text("📞 ${o.riderPhone ?: "+63 920 112 3456"}", fontSize = 12.sp); Spacer(Modifier.width(8.dp)); Pill("Verified Carrier") }
            }
            Column(Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(Color(0xFFF0FDF4)).padding(14.dp)) {
                Label("Current Courier Coordinates")
                Spacer(Modifier.height(6.dp))
                Text("🧭 ${o.currentLocation ?: "In Transit: Approaching delivery destination"}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text("Tracking No: ${o.trackingNumber ?: "AGX-2026-88194"}", fontSize = 12.sp)
                Text("Estimated Arrival: ${o.estimatedArrival ?: "15-20 mins away"}", fontSize = 12.sp, color = Palette.Forest)
            }
        }
        Spacer(Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Label("Live Route: Sunnyvale Farm (Batangas) → ${o.customerAddress.split(",").getOrNull(1)?.trim() ?: "Destination"}"); Spacer(Modifier.weight(1f)); Pill("Express Farm Corridor")
        }
        Spacer(Modifier.height(10.dp))
        Box(Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)).background(Color(0xFFE2E8F0))) {
            Box(Modifier.fillMaxWidth(if (o.fulfillmentStatus == "Delivered") 1f else 0.75f).fillMaxHeight().background(Palette.Forest))
        }
        Spacer(Modifier.height(8.dp))
        Row {
            listOf("Farm Packed" to "Lipa, Batangas", "STAR / SLEX" to "Dispatched", "Out for Delivery" to "En Route",
                "Customer Received" to if (o.isReceivedByUser) "Confirmed" else "Pending").forEachIndexed { i, (t, sub) ->
                val done = i < 3 || o.isReceivedByUser
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.size(28.dp).clip(CircleShape).background(if (done) Palette.Forest else Color(0xFFE2E8F0)), contentAlignment = Alignment.Center) {
                        if (done) Icon(Icons.Filled.Check, null, Modifier.size(16.dp), tint = Color.White) else Text("4", fontWeight = FontWeight.Bold)
                    }
                    Text(t, fontSize = 12.sp, fontWeight = FontWeight.Bold); Text(sub, fontSize = 10.sp, color = Palette.Muted)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        H2("Logistics Milestones & Checkpoints")
        o.deliverySteps.forEachIndexed { i, st ->
            Row(Modifier.padding(vertical = 6.dp)) {
                Box(Modifier.size(26.dp).clip(CircleShape).background(if (st.completed) Palette.Forest else Color(0xFFE2E8F0)), contentAlignment = Alignment.Center) {
                    if (st.completed) Icon(Icons.Filled.Check, null, Modifier.size(14.dp), tint = Color.White) else Text("${i + 1}", fontSize = 11.sp)
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Row { Text(st.title, Modifier.weight(1f), fontWeight = FontWeight.Bold, fontSize = 13.sp); Text(st.timestamp, fontSize = 11.sp, color = Palette.Muted) }
                    Sub(st.location)
                    st.notes?.let { Pill(it, Color(0xFFF0FDF4), Color(0xFF166534)) }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        if (o.isReceivedByUser) {
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Color(0xFFDCFCE7)).padding(16.dp)) {
                Text("✓ You have confirmed receipt of this order", fontWeight = FontWeight.ExtraBold, color = Color(0xFF166534))
                Text("Verified received on ${o.receivedAt ?: "—"}. Farm host Mang Juan has been notified of the successful delivery!", fontSize = 12.sp)
            }
        } else {
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Color(0xFFFFFBEB)).padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Have you received your fresh produce?", fontWeight = FontWeight.ExtraBold)
                    Sub("Once the courier delivers your package, click the button to verify receipt and notify the farmer.")
                }
                if (s.ownsOrder(o)) PrimaryButton("Confirm Order Received", icon = Icons.Filled.Check) { s.confirmOrderReceived(o.id) }
            }
        }
    }
}
