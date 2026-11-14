package ph.agritourism.ui.screens

import androidx.compose.animation.Crossfade
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
                AsyncImage(s.farmers[i].farmBannerUrl, Modifier.fillMaxSize(), contentDescription = s.farmers[i].farmName)
            }
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0x55000000), Color.Transparent, Color(0x66000000)))))
            Row(Modifier.align(Alignment.TopStart).padding(20.dp).clip(RoundedCornerShape(50)).background(Color.White.copy(alpha = 0.9f)).padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.Eco, null, Modifier.size(16.dp), tint = Palette.Forest); Spacer(Modifier.width(6.dp))
                Text("AgriTourism Philippines", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Palette.Deep)
            }
            Row(Modifier.align(Alignment.BottomCenter).padding(20.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                s.farmers.indices.forEach { i ->
                    Box(Modifier.height(8.dp).width(if (i == s.currentSlide) 24.dp else 8.dp).clip(CircleShape)
                        .background(if (i == s.currentSlide) Color.White else Color.White.copy(alpha = 0.5f)).clickable { s.currentSlide = i })
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
fun SignupPage(s: AppState) {
    var name by remember { mutableStateOf("Maria Santos") }
    var email by remember { mutableStateOf("maria.santos@gmail.com") }
    var phone by remember { mutableStateOf("+63 917 555 0192") }
    var pw by remember { mutableStateOf("password") }
    var pw2 by remember { mutableStateOf("password") }
    var role by remember { mutableStateOf(if (s.userRole == Role.ADMIN) Role.USER else s.userRole) }
    var error by remember { mutableStateOf<String?>(null) }
    AuthLayout(s) {
        Brand(); Spacer(Modifier.height(18.dp))
        H1("Create Your Account"); Sub("Join our community and support local farmers!")
        Spacer(Modifier.height(18.dp))
        Field("", name, { name = it }, placeholder = "Full Name"); Spacer(Modifier.height(10.dp))
        Field("", email, { email = it }, placeholder = "Email Address"); Spacer(Modifier.height(10.dp))
        Field("", phone, { phone = it }, placeholder = "Phone Number"); Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("", pw, { pw = it }, Modifier.weight(1f), "Password", password = true)
            Field("", pw2, { pw2 = it }, Modifier.weight(1f), "Confirm Password", password = true)
        }
        Spacer(Modifier.height(10.dp))
        Dropdown("Select Role", Role.entries.toList(), role, {
            when (it) { Role.USER -> "Tourist (Book Tours & Buy Fruits)"; Role.FARMER -> "Farmer (Manage Farm & List Produce)"; Role.ADMIN -> "Administrator (Platform Overview)" }
        }) { role = it }
        error?.let { Spacer(Modifier.height(8.dp)); Text(it, color = Palette.Red, fontSize = 12.sp) }
        Spacer(Modifier.height(16.dp))
        PrimaryButton("Sign Up", Modifier.fillMaxWidth()) {
            error = when {
                name.isBlank() || email.isBlank() || pw.isBlank() -> "Please fill in your name, email, and password."
                !email.contains("@") -> "Please enter a valid email address."
                pw != pw2 -> "Passwords do not match."
                else -> null
            }
            if (error == null) s.signup(name, email, phone, role)
        }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            Sub("Already have an account?"); TextButton({ s.navigate(Page.LOGIN) }) { Text("Login", fontWeight = FontWeight.ExtraBold) }
        }
    }
}

@Composable
fun LoginPage(s: AppState) {
    AuthLayout(s) {
        Brand(); Spacer(Modifier.height(18.dp))
        H1("Welcome Back"); Sub("Log in to manage bookings, harvest produce, or book farm tours")
        Spacer(Modifier.height(18.dp))
        Field("Email Address", s.loginEmail, { s.loginEmail = it }, placeholder = "you@email.com")
        Spacer(Modifier.height(10.dp))
        Row { Label("Password"); Spacer(Modifier.weight(1f)); Text("Forgot?", fontSize = 11.sp, color = Palette.Forest, fontWeight = FontWeight.Bold,
            modifier = Modifier.clickable { s.showToast("Password reset link sent to ${s.loginEmail}.") }) }
        Spacer(Modifier.height(4.dp))
        Field("", s.loginPassword, { s.loginPassword = it }, placeholder = "••••••••", password = true)
        Spacer(Modifier.height(14.dp))
        Label("Log in as:"); Spacer(Modifier.height(6.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf(Triple(Role.USER, "Tourist", Icons.Outlined.Explore), Triple(Role.FARMER, "Farmer", Icons.Outlined.Spa), Triple(Role.ADMIN, "Admin", Icons.Outlined.VerifiedUser)).forEach { (r, l, ic) ->
                val sel = s.loginRoleSelect == r
                Column(Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(if (sel) Palette.Forest else Color.White)
                    .border(1.dp, if (sel) Palette.Forest else Palette.Border, RoundedCornerShape(14.dp)).clickable { s.selectLoginRole(r) }.padding(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(ic, null, tint = if (sel) Color.White else Palette.Forest)
                    Text(l, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = if (sel) Color.White else Palette.Ink)
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        PrimaryButton("Log In to Dashboard", Modifier.fillMaxWidth(), Icons.AutoMirrored.Outlined.Login, enabled = s.loginEmail.isNotBlank() && s.loginPassword.isNotBlank()) { s.login() }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            Sub("Don't have an account yet?"); TextButton({ s.navigate(Page.SIGNUP) }) { Text("Create Account", fontWeight = FontWeight.ExtraBold) }
        }
    }
}
