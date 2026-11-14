package ph.agritourism.ui

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.onPointerEvent
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

object Palette {
    val Forest = Color(0xFF1E562F)
    val Deep = Color(0xFF144824)
    val Ink = Color(0xFF1E3A24)
    val Mint = Color(0xFFE8F3EB)
    val Cream = Color(0xFFF8F6F0)
    val Border = Color(0xFFDDE7DF)
    val Muted = Color(0xFF64748B)
    val Amber = Color(0xFFF59E0B)
    val Red = Color(0xFFDC2626)
    val Teal = Color(0xFF0D9488)
    val Glass = Color(0xF2FFFFFF)
}

val AppColors = lightColorScheme(
    primary = Palette.Forest, onPrimary = Color.White, secondary = Palette.Deep,
    background = Palette.Cream, surface = Color.White, onSurface = Color(0xFF1E1E1E),
    primaryContainer = Palette.Mint, onPrimaryContainer = Palette.Deep, error = Palette.Red,
)

@OptIn(androidx.compose.ui.ExperimentalComposeUiApi::class)
@Composable
fun GlassCard(modifier: Modifier = Modifier, padding: Dp = 20.dp, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    var hovered by remember { mutableStateOf(false) }
    val shape = RoundedCornerShape(20.dp)
    val elevation by androidx.compose.animation.core.animateDpAsState(if (hovered && onClick != null) 14.dp else 6.dp, label = "card-elev")
    val scale by androidx.compose.animation.core.animateFloatAsState(if (hovered && onClick != null) 1.015f else 1f, label = "card-scale")
    Column(
        modifier
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .onPointerEvent(androidx.compose.ui.input.pointer.PointerEventType.Enter) { hovered = true }
            .onPointerEvent(androidx.compose.ui.input.pointer.PointerEventType.Exit) { hovered = false }
            .shadow(elevation, shape, ambientColor = Color(0x22000000), spotColor = Color(0x22000000))
            .clip(shape)
            .background(Palette.Glass)
            .border(1.dp, if (hovered && onClick != null) Palette.Forest.copy(alpha = 0.25f) else Color(0xFFE5ECE6), shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(padding),
        content = content,
    )
}

@Composable
fun H1(text: String) = Text(text, fontSize = 26.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Deep)
@Composable
fun H2(text: String) = Text(text, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Palette.Deep)
@Composable
fun Sub(text: String, modifier: Modifier = Modifier, maxLines: Int = Int.MAX_VALUE) =
    Text(text, fontSize = 13.sp, color = Palette.Muted, modifier = modifier, maxLines = maxLines, overflow = TextOverflow.Ellipsis)
@Composable
fun Label(text: String) = Text(text.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Palette.Muted, letterSpacing = 0.6.sp)

@Composable
fun PrimaryButton(text: String, modifier: Modifier = Modifier, icon: ImageVector? = null, enabled: Boolean = true, color: Color = Palette.Forest, onClick: () -> Unit) {
    Button(onClick, modifier, enabled = enabled, shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = color), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp)) {
        if (icon != null) { Icon(icon, null, Modifier.size(16.dp)); Spacer(Modifier.width(6.dp)) }
        Text(text, fontWeight = FontWeight.Bold, fontSize = 13.sp)
    }
}

@Composable
fun SecondaryButton(text: String, modifier: Modifier = Modifier, icon: ImageVector? = null, color: Color = Palette.Forest, enabled: Boolean = true, onClick: () -> Unit) {
    OutlinedButton(onClick, modifier, enabled = enabled, shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, color.copy(alpha = 0.35f)), colors = ButtonDefaults.outlinedButtonColors(contentColor = color),
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)) {
        if (icon != null) { Icon(icon, null, Modifier.size(15.dp)); Spacer(Modifier.width(6.dp)) }
        Text(text, fontWeight = FontWeight.Bold, fontSize = 12.sp)
    }
}

@Composable
fun Pill(text: String, bg: Color = Palette.Mint, fg: Color = Palette.Deep, modifier: Modifier = Modifier) {
    Text(text, modifier.clip(RoundedCornerShape(50)).background(bg).padding(horizontal = 10.dp, vertical = 4.dp),
        fontSize = 11.sp, fontWeight = FontWeight.Bold, color = fg, maxLines = 1)
}

@Composable
fun FilterChipRow(options: List<String>, selected: String, label: (String) -> String = { it }, onSelect: (String) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { o ->
            val sel = o == selected
            Text(label(o), Modifier.clip(RoundedCornerShape(50))
                .background(if (sel) Palette.Forest else Color.White)
                .border(1.dp, if (sel) Palette.Forest else Palette.Border, RoundedCornerShape(50))
                .clickable { onSelect(o) }.padding(horizontal = 14.dp, vertical = 7.dp),
                color = if (sel) Color.White else Palette.Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

fun statusColors(status: String): Pair<Color, Color> = when (status) {
    "Confirmed", "Delivered", "Completed" -> Color(0xFFDCFCE7) to Color(0xFF166534)
    "Pending", "Pending Packing" -> Color(0xFFFEF3C7) to Color(0xFF92400E)
    "Cancelled" -> Color(0xFFFEE2E2) to Color(0xFF991B1B)
    "Dispatched" -> Color(0xFFDBEAFE) to Color(0xFF1E40AF)
    else -> Palette.Mint to Palette.Deep
}

@Composable
fun StatusPill(status: String) { val (bg, fg) = statusColors(status); Pill(status, bg, fg) }

@Composable
fun Field(label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier, placeholder: String = "",
          singleLine: Boolean = true, minLines: Int = 1, enabled: Boolean = true, password: Boolean = false, number: Boolean = false) {
    Column(modifier) {
        if (label.isNotEmpty()) { Label(label); Spacer(Modifier.height(4.dp)) }
        OutlinedTextField(value, onChange, Modifier.fillMaxWidth(), enabled = enabled, singleLine = singleLine, minLines = minLines,
            placeholder = { Text(placeholder, fontSize = 13.sp) }, textStyle = LocalTextStyle.current.copy(fontSize = 13.sp),
            shape = RoundedCornerShape(12.dp),
            visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
            keyboardOptions = if (number) KeyboardOptions(keyboardType = KeyboardType.Number) else KeyboardOptions.Default,
            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Palette.Forest, unfocusedBorderColor = Palette.Border,
                focusedContainerColor = Color.White, unfocusedContainerColor = Color.White))
    }
}

@Composable
fun <T> Dropdown(label: String, options: List<T>, selected: T, text: (T) -> String, modifier: Modifier = Modifier, onSelect: (T) -> Unit) {
    var open by remember { mutableStateOf(false) }
    Column(modifier) {
        if (label.isNotEmpty()) { Label(label); Spacer(Modifier.height(4.dp)) }
        Box {
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Color.White)
                .border(1.dp, Palette.Border, RoundedCornerShape(12.dp)).clickable { open = true }.padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Text(text(selected), Modifier.weight(1f), fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Icon(Icons.Filled.ExpandMore, null, tint = Palette.Muted)
            }
            DropdownMenu(open, { open = false }) {
                options.forEach { o -> DropdownMenuItem({ Text(text(o), fontSize = 13.sp) }, { onSelect(o); open = false }) }
            }
        }
    }
}

@Composable
fun Stepper(value: Int, suffix: String, onChange: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton({ onChange(maxOf(1, value - 1)) }, Modifier.size(34.dp).clip(CircleShape).background(Palette.Mint)) { Icon(Icons.Filled.Remove, "Decrease") }
        Text("$value $suffix", Modifier.padding(horizontal = 14.dp), fontWeight = FontWeight.ExtraBold, color = Palette.Deep)
        IconButton({ onChange(value + 1) }, Modifier.size(34.dp).clip(CircleShape).background(Palette.Forest)) { Icon(Icons.Filled.Add, "Increase", tint = Color.White) }
    }
}

@Composable
fun ChoiceRow(options: List<String>, selected: String, onSelect: (String) -> Unit) = FilterChipRow(options, selected, onSelect = onSelect)

@Composable
fun Modal(onDismiss: () -> Unit, width: Dp = 640.dp, content: @Composable ColumnScope.() -> Unit) {
    Dialog(onDismiss, DialogProperties(usePlatformDefaultWidth = false)) {
        Column(Modifier.widthIn(max = width).fillMaxWidth(0.92f).heightIn(max = 760.dp).clip(RoundedCornerShape(24.dp))
            .background(Color.White).verticalScroll(rememberScrollState()), content = content)
    }
}

@Composable
fun ModalHeader(title: String, subtitle: String? = null, icon: ImageVector? = null, onClose: () -> Unit) {
    Row(Modifier.fillMaxWidth().background(Palette.Deep).padding(horizontal = 22.dp, vertical = 16.dp), verticalAlignment = Alignment.CenterVertically) {
        if (icon != null) { Icon(icon, null, tint = Color(0xFF86EFAC)); Spacer(Modifier.width(10.dp)) }
        Column(Modifier.weight(1f)) {
            if (subtitle != null) Text(subtitle.uppercase(), color = Color(0xFF86EFAC), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
            Text(title, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold)
        }
        IconButton(onClose) { Icon(Icons.Filled.Close, "Close", tint = Color.White) }
    }
}

@Composable
fun InfoTile(label: String, value: String, icon: ImageVector? = null, modifier: Modifier = Modifier) {
    Column(modifier.clip(RoundedCornerShape(14.dp)).background(Color(0xFFF8FAFC)).border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(14.dp)).padding(12.dp)) {
        Label(label)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (icon != null) { Icon(icon, null, Modifier.size(14.dp), tint = Palette.Forest); Spacer(Modifier.width(6.dp)) }
            Text(value, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }
    }
}

@Composable
fun Avatar(src: String, size: Dp) = AsyncImage(src, Modifier.size(size).clip(CircleShape).border(2.dp, Color.White, CircleShape))

@Composable
fun SectionHeader(title: String, subtitle: String? = null, action: (@Composable () -> Unit)? = null) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) { H2(title); if (subtitle != null) Sub(subtitle) }
        action?.invoke()
    }
}

/** Simple responsive grid for use inside a vertically scrolling column. */
@Composable
fun <T> Grid(items: List<T>, columns: Int, spacing: Dp = 16.dp, cell: @Composable (T) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(spacing)) {
        items.chunked(columns).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(spacing)) {
                row.forEach { Box(Modifier.weight(1f)) { cell(it) } }
                repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
fun RatingText(rating: Double, count: Int) = Row(verticalAlignment = Alignment.CenterVertically) {
    Icon(Icons.Filled.Star, null, Modifier.size(15.dp), tint = Palette.Amber)
    Spacer(Modifier.width(4.dp))
    Text("$rating ($count)", fontSize = 12.sp, color = Palette.Muted, fontWeight = FontWeight.SemiBold)
}

@Composable
fun PhotoCard(image: String, title: String, locationTag: String, rating: Double, reviews: Int, price: Int, favorited: Boolean,
              onFavorite: () -> Unit, onClick: () -> Unit) {
    GlassCard(padding = 0.dp, onClick = onClick) {
        Box(Modifier.fillMaxWidth().height(200.dp)) {
            AsyncImage(image, Modifier.fillMaxSize())
            Pill(locationTag, Color.White.copy(alpha = 0.92f), Palette.Deep, Modifier.align(Alignment.TopStart).padding(12.dp))
            IconButton(onFavorite, Modifier.align(Alignment.TopEnd).padding(8.dp).size(36.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.9f))) {
                Icon(if (favorited) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder, "Save to favorites", tint = Color(0xFFEF4444))
            }
        }
        Column(Modifier.padding(16.dp)) {
            Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = Palette.Deep, maxLines = 2, minLines = 2, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                RatingText(rating, reviews)
                Spacer(Modifier.weight(1f))
                Text("$PESO$price", fontWeight = FontWeight.ExtraBold, color = Palette.Forest)
                Text(" /person", fontSize = 11.sp, color = Palette.Muted)
            }
        }
    }
}
