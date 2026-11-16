package ph.agritourism.model

import kotlinx.serialization.Serializable

enum class Role(val key: String, val displayName: String, val subtitle: String, val email: String) {
    ADMIN("admin", "Administrator", "Platform Manager", "admin@agritourism.ph"),
    USER("user", "Maria Santos", "Eco Tourist", "maria.santos@gmail.com"),
    FARMER("farmer", "Juan Dela Cruz", "Accredited Farmer", "juan.delacruz@sunnyvalefarm.ph");

    companion object {
        fun of(key: String) = entries.firstOrNull { it.key == key } ?: USER
    }
}

/** Parses ISO (2026-11-20) or display (Nov 20, 2026) dates. */
fun parseDate(d: String): java.time.LocalDate? {
    val t = d.trim()
    return runCatching { java.time.LocalDate.parse(t) }.getOrNull()
        ?: runCatching { java.time.LocalDate.parse(t, java.time.format.DateTimeFormatter.ofPattern("MMM d, yyyy", java.util.Locale.ENGLISH)) }.getOrNull()
}

/** Start time of a slot label, e.g. "08:00 AM - Morning Agro-Walk" -> "08:00 AM". */
fun slotTime(t: String): String = t.substringBefore(" - ").trim().uppercase()

/**
 * Identifies "the same person at the same date and time". A customer may hold only one active
 * booking per slot. Registered tourists are matched by email; walk-ins by name + phone digits.
 */
fun Booking.slotKey(): String {
    val who = customerEmail?.trim()?.lowercase()?.takeIf { it.isNotEmpty() && it != "tourist@agritourism.ph" } // old walk-in placeholder
        ?: "walkin:${customerName.trim().lowercase()}:${customerPhone.orEmpty().filter(Char::isDigit)}"
    return "$who|${parseDate(tourDate)?.toString() ?: tourDate.trim()}|${slotTime(tourTime)}"
}

data class User(val id: Long, val fullName: String, val email: String, val phone: String, val role: Role)

@Serializable
data class FarmTour(
    val id: Int,
    val name: String,
    val location: String,
    val rating: Double,
    val reviewsCount: Int,
    val pricePerPerson: Int,
    val operatingHours: String,
    val amenities: List<String>,
    val activities: List<String>,
    val imageUrl: String,
    val description: String,
    val highlightTag: String,
    val farmerName: String,
    val thumbnails: List<String>,
)

@Serializable
data class FruitPickingItem(
    val id: Int,
    val title: String,
    val farmName: String,
    val location: String,
    val fruitName: String,
    val pricePerPerson: Int,
    val rating: Double,
    val reviewsCount: Int,
    val duration: String,
    val seasonalFruits: String,
    val imageUrl: String,
    val description: String,
    val seasonAvailability: String,
    val thumbnails: List<String> = emptyList(),
)

@Serializable
data class Product(
    val id: Long,
    val name: String,
    val category: String,
    val price: Double,
    val unit: String,
    val discountPercent: Int,
    val stock: Int,
    val rating: Double,
    val reviewsCount: Int,
    val imageUrl: String,
    val description: String,
    val farmOrigin: String,
) {
    val discountedPrice: Double get() = price * (1 - discountPercent / 100.0)
}

data class CartItem(val product: Product, val quantity: Int)

@Serializable
data class Booking(
    val id: Long,
    val bookingCode: String,
    val farmId: Int,
    val farmName: String,
    val customerName: String,
    val customerPhone: String? = null,
    val customerEmail: String? = null,
    val activity: String,
    val tourDate: String,
    val tourTime: String,
    val participants: Int,
    val totalAmount: Int,
    val paymentMethod: String? = null,
    val status: String,
    val attendanceStatus: String? = null,
    val assignedGuide: String? = null,
    val specialRequests: String? = null,
    val uploadedIdDoc: String? = null,
    val uploadedReceiptDoc: String? = null,
    val checkedInAt: String? = null,
    /** "tour" (farmId is a tours.id) or "orchard" (farmId is a fruit_picking.id). */
    val activityType: String = "tour",
)

@Serializable
data class DeliveryCheckpoint(
    val title: String,
    val location: String,
    val timestamp: String,
    val completed: Boolean,
    val notes: String? = null,
)

@Serializable
data class OrderItem(val productName: String, val qty: Int, val unitPrice: Double)

@Serializable
data class FarmerOrder(
    val id: String,
    val orderNumber: String,
    val customerName: String,
    val customerPhone: String,
    val customerAddress: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val paymentMethod: String,
    val paymentStatus: String,
    val fulfillmentStatus: String,
    val orderDate: String,
    val uploadedReceiptUrl: String,
    val specialDeliveryNotes: String? = null,
    val courierName: String? = null,
    val riderName: String? = null,
    val riderPhone: String? = null,
    val riderVehicle: String? = null,
    val currentLocation: String? = null,
    val estimatedArrival: String? = null,
    val trackingNumber: String? = null,
    val deliverySteps: List<DeliveryCheckpoint> = emptyList(),
    val isReceivedByUser: Boolean = false,
    val receivedAt: String? = null,
    val receivedByRecipient: String? = null,
    val customerEmail: String? = null,
)

@Serializable
data class CustomerReview(
    val id: Int,
    val author: String,
    val roleTag: String,
    val rating: Int,
    val date: String,
    val farmOrCrop: String,
    val comment: String,
    val userEmail: String? = null,
    val bookingId: Long? = null,
    /** What was reviewed: "tour" / "orchard" plus its id, or null for general reviews. */
    val targetType: String? = null,
    val targetId: Int? = null,
)

@Serializable
data class FarmerProfile(
    val id: Int,
    val name: String,
    val roleTitle: String,
    val farmName: String,
    val location: String,
    val province: String,
    val yearsExperience: Int,
    val photoUrl: String,
    val farmBannerUrl: String,
    val storyQuote: String,
    val fullBiography: String,
    val farmingPhilosophy: String,
    val certifications: List<String>,
    val sustainablePractices: List<String>,
    val specialtyProduce: List<String>,
    val productIds: List<Long>,
    val tourId: Int,
    val rating: Double,
    val reviewsCount: Int,
    val generation: String,
    val hectares: String,
    val gallery: List<String>,
)

@Serializable
data class AppNotification(
    val id: Long,
    val title: String,
    val desc: String,
    val fullDetail: String,
    val time: String,
    val read: Boolean,
    val type: String,
    val targetRole: String,
    val bookingId: Long? = null,
    val attendanceStatus: String? = null,
    val recipientEmail: String? = null,
)

data class ReceiptItem(val name: String, val quantity: Int, val unitPrice: Double, val total: Double)

data class Receipt(
    val receiptNumber: String,
    val issueDate: String,
    val customerName: String,
    val customerPhone: String,
    val customerAddress: String,
    val farmName: String,
    val hostFarmerName: String,
    val items: List<ReceiptItem>,
    val subtotal: Double,
    val deliveryFee: Double,
    val totalAmount: Double,
    val paymentMethod: String,
    val paymentStatus: String,
    val authReference: String,
    val type: String,
)

@Serializable
data class AppImages(
    val globalFarmBackground: String,
    val farmLifeBannerPhoto: String,
    val mariaAvatar: String,
    val juanAvatar: String,
    val adminAvatar: String,
    val gcashQrMockup: String,
    val receiptSamplePhoto: String,
    val defaultProductFallbackImage: String,
    val farmerProfileBanner: String,
    val presetMangoImage: String,
    val presetTomatoImage: String,
    val presetPapayaImage: String,
    val presetStrawberryImage: String,
    val presetHoneyImage: String,
    val presetEggplantImage: String,
)

@Serializable
data class SeedData(
    val farmers: List<FarmerProfile>,
    val tours: List<FarmTour>,
    val fruitPicking: List<FruitPickingItem>,
    val products: List<Product>,
    val bookings: List<Booking>,
    val orders: List<FarmerOrder>,
    val reviews: List<CustomerReview>,
    val notifications: List<AppNotification>,
    val config: AppImages,
)
