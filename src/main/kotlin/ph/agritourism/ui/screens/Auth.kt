package ph.agritourism.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.tween
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Login
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import ph.agritourism.model.Role
import ph.agritourism.ui.*

@Composable
private fun AuthLayout(s: AppState, form: @Composable ColumnScope.() -> Unit) {
    Row(Modifier.fillMaxWidth().height(720.dp).clip(RoundedCornerShape(28.dp)).background(Color.White)) {
        Box(Modifier.weight(1.1f).fillMaxHeight()) {
            Crossfade(s.currentSlide, animationSpec = tween(900)) { i ->
                AsyncImage(s.farmers[i].farmBannerUrl, Modifier.fillMaxSize(), contentDescription = s.farmers[i].farmName, fallback = s.images.farmerProfileBanner)
            }
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0x55000000), Color.Transparent, Color(0x66000000)))))
            Row(Modifier.align(Alignment.TopStart).padding(20.dp).clip(RoundedCornerShape(50)).background(Color.White.copy(alpha = 0.9f)).padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.Eco, null, Modifier.size(16.dp), tint = Palette.Forest); Spacer(Modifier.width(6.dp))
                Text("AgriTourism Philippines", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Palette.Deep)
            }
            Row(Modifier.align(Alignment.BottomCenter).padding(20.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                s.farmers.indices.forEach { i ->
                    val w by androidx.compose.animation.core.animateDpAsState(if (i == s.currentSlide) 24.dp else 8.dp, spring(dampingRatio = 0.7f, stiffness = Spring.StiffnessMediumLow), label = "dot-w")
                    val c by animateColorAsState(if (i == s.currentSlide) Color.White else Color.White.copy(alpha = 0.5f), tween(300), label = "dot-c")
                    Box(Modifier.height(8.dp).width(w).clip(CircleShape).background(c).handCursor().clickable { s.currentSlide = i })
                }
            }
        }
        Column(Modifier.weight(1f).fillMaxHeight().verticalScroll(rememberScrollState()).padding(horizontal = 48.dp, vertical = 36.dp),
            verticalArrangement = Arrangement.Center, content = form)
    }
}

@Composable
private fun Brand() = Row(verticalAlignment = Alignment.CenterVertically) {
    AsyncImage("res:icons/pwa-192x192.png", Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)))
    Spacer(Modifier.width(10.dp)); Text("AgriTourism Philippines", fontWeight = FontWeight.ExtraBold, color = Palette.Deep)
}

@Composable
private fun RoleTile(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, selected: Boolean, modifier: Modifier, onClick: () -> Unit) {
    val interaction = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    val hovered by interaction.collectIsHoveredAsState()
    val pressed by interaction.collectIsPressedAsState()
    val bg by animateColorAsState(if (selected) Palette.Forest else if (hovered) Palette.Mint else Color.White, tween(200), label = "role-bg")
    val fg by animateColorAsState(if (selected) Color.White else Palette.Ink, tween(200), label = "role-fg")
    val border by animateColorAsState(if (selected || hovered) Palette.Forest else Palette.Border, tween(200), label = "role-border")
    val scale by animateFloatAsState(when { pressed -> 0.95f; selected -> 1.03f; else -> 1f }, spring(dampingRatio = 0.5f, stiffness = Spring.StiffnessMedium), label = "role-s")
    val iconScale by animateFloatAsState(if (selected) 1.2f else 1f, spring(dampingRatio = 0.4f, stiffness = Spring.StiffnessMedium), label = "role-i")
    Column(modifier.graphicsLayer { scaleX = scale; scaleY = scale }.clip(RoundedCornerShape(14.dp)).background(bg)
        .border(1.dp, border, RoundedCornerShape(14.dp)).hoverable(interaction).handCursor()
        .clickable(interaction, LocalIndication.current, onClick = onClick).padding(horizontal = 4.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, null, Modifier.graphicsLayer { scaleX = iconScale; scaleY = iconScale }, tint = if (selected) Color.White else Palette.Forest)
        Spacer(Modifier.height(4.dp))
        Text(label, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = fg, maxLines = 1, softWrap = false)
    }
}

private val EMAIL_RE = Regex("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")

@Composable
fun SignupPage(s: AppState) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var farmName by remember { mutableStateOf("") }
    var province by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var pw by remember { mutableStateOf("") }
    var pw2 by remember { mutableStateOf("") }
    var role by remember { mutableStateOf(if (s.userRole == Role.ADMIN) Role.USER else s.userRole) }
    var error by remember { mutableStateOf<String?>(null) }
    var attempted by remember { mutableStateOf(false) }
    // Field-level errors appear once the user has tried to submit, then update live as they type.
    val nameErr = if (attempted && name.isBlank()) "Enter your full name" else null
    val emailErr = when { !attempted -> null; email.isBlank() -> "Enter your email"; !EMAIL_RE.matches(email.trim()) -> "That email doesn't look right"; else -> null }
    val phoneErr = if (attempted && phone.isNotBlank() && phone.count(Char::isDigit) < 7) "Enter a valid phone number" else null
    val pwErr = when { !attempted -> null; pw.isBlank() -> "Create a password"; pw.length < 6 -> "At least 6 characters"; else -> null }
    val pw2Err = if (attempted && pw2 != pw) "Passwords don't match" else null
    val farmErr = if (attempted && role == Role.FARMER && farmName.isBlank()) "Enter your farm name" else null
    val submit = {
        attempted = true
        val valid = name.isNotBlank() && EMAIL_RE.matches(email.trim()) && (phone.isBlank() || phone.count(Char::isDigit) >= 7) &&
            pw.length >= 6 && pw == pw2 && (role != Role.FARMER || farmName.isNotBlank())
        error = if (valid) s.signup(name, email, phone, pw, role, farmName, province) else null
    }
    AuthLayout(s) {
        Brand(); Spacer(Modifier.height(18.dp))
        H1("Create Your Account"); Sub("Join our community and support local farmers!")
        Spacer(Modifier.height(18.dp))
        Column(Modifier.animateContentSize(spring(stiffness = Spring.StiffnessMediumLow)), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("Full Name", name, { name = it }, placeholder = "Juan Dela Cruz", icon = Icons.Outlined.Person, error = nameErr, onSubmit = submit)
            Field("Email Address", email, { email = it.trim() }, placeholder = "you@email.com", icon = Icons.Outlined.Mail, error = emailErr, onSubmit = submit)
            Field("Phone Number", phone, { v -> phone = v.filter { it.isDigit() || it in "+ -()" } }, placeholder = "Optional",
                icon = Icons.Outlined.Phone, error = phoneErr, onSubmit = submit)
            Field("Password", pw, { pw = it }, placeholder = "At least 6 characters", password = true, icon = Icons.Outlined.Lock, error = pwErr, onSubmit = submit)
            Field("Confirm Password", pw2, { pw2 = it }, placeholder = "Re-enter password", password = true, icon = Icons.Outlined.Lock, error = pw2Err, onSubmit = submit)
            Dropdown("I am a…", listOf(Role.USER, Role.FARMER), role, {
                when (it) { Role.USER -> "Tourist (Book Tours & Buy Fruits)"; Role.FARMER -> "Farmer (Manage Farm & List Produce)"; Role.ADMIN -> "Administrator (Platform Overview)" }
            }) { role = it }
            AnimatedVisibility(role == Role.FARMER, enter = fadeIn(tween(200)) + expandVertically(spring(stiffness = Spring.StiffnessMediumLow)), exit = fadeOut(tween(120)) + shrinkVertically()) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Field("Farm Name", farmName, { farmName = it }, Modifier.fillMaxWidth(), "e.g. Sunrise Orchard", icon = Icons.Outlined.Agriculture, error = farmErr, onSubmit = submit)
                    Field("Province", province, { province = it }, Modifier.fillMaxWidth(), "e.g. Batangas", icon = Icons.Outlined.Place, onSubmit = submit)
                }
            }
        }
        ErrorBanner(error)
        Spacer(Modifier.height(16.dp))
        PrimaryButton("Create Account", Modifier.fillMaxWidth(), Icons.Outlined.PersonAdd) { submit() }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            Sub("Already have an account?"); TextButton({ s.navigate(Page.LOGIN) }, Modifier.handCursor()) { Text("Log In", fontWeight = FontWeight.ExtraBold) }
        }
    }
}

@Composable
fun LoginPage(s: AppState) {
    val canSubmit = s.loginEmail.isNotBlank() && s.loginPassword.isNotBlank()
    val submit = { if (canSubmit) s.login() }
    AuthLayout(s) {
        Brand(); Spacer(Modifier.height(18.dp))
        H1("Welcome Back"); Sub("Log in to manage bookings, harvest produce, or book farm tours")
        Spacer(Modifier.height(18.dp))
        Field("Email Address", s.loginEmail, { s.loginEmail = it.trim() }, placeholder = "you@email.com", icon = Icons.Outlined.Mail, onSubmit = submit)
        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Label("Password"); Spacer(Modifier.weight(1f))
            Text("Forgot password?", fontSize = 11.sp, color = Palette.Forest, fontWeight = FontWeight.Bold,
                modifier = Modifier.clip(RoundedCornerShape(6.dp)).handCursor().clickable {
                    s.showToast(if (s.db.findUser(s.loginEmail) != null) "Please contact an administrator to reset the password for ${s.loginEmail}."
                        else if (s.loginEmail.isBlank()) "Enter your email first, then tap Forgot password."
                        else "No account is registered with ${s.loginEmail}.")
                }.padding(horizontal = 4.dp, vertical = 2.dp))
        }
        Spacer(Modifier.height(5.dp))
        Field("", s.loginPassword, { s.loginPassword = it }, placeholder = "Enter your password", password = true, icon = Icons.Outlined.Lock, onSubmit = submit)
        Spacer(Modifier.height(16.dp))
        Label("Log in as"); Spacer(Modifier.height(6.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf(Triple(Role.USER, "Tourist", Icons.Outlined.Explore), Triple(Role.FARMER, "Farmer", Icons.Outlined.Spa), Triple(Role.ADMIN, "Admin", Icons.Outlined.VerifiedUser)).forEach { (r, l, ic) ->
                RoleTile(l, ic, s.loginRoleSelect == r, Modifier.weight(1f)) { s.selectLoginRole(r) }
            }
        }
        ErrorBanner(s.loginError)
        Spacer(Modifier.height(18.dp))
        PrimaryButton("Log In to Dashboard", Modifier.fillMaxWidth(), Icons.AutoMirrored.Outlined.Login, enabled = canSubmit) { submit() }
        Spacer(Modifier.height(6.dp))
        Text("Tip: press Enter to log in", Modifier.fillMaxWidth(), fontSize = 11.sp, color = Palette.Muted, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        Spacer(Modifier.height(6.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            Sub("Don't have an account yet?"); TextButton({ s.navigate(Page.SIGNUP) }, Modifier.handCursor()) { Text("Create Account", fontWeight = FontWeight.ExtraBold) }
        }
    }
}
