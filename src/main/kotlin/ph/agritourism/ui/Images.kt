package ph.agritourism.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import androidx.compose.ui.layout.ContentScale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.skia.Image as SkiaImage
import org.jetbrains.skia.Rect
import org.jetbrains.skia.Surface
import org.jetbrains.skia.SamplingMode
import ph.agritourism.data.Database
import java.io.File
import java.net.HttpURLConnection
import java.net.URI
import java.security.MessageDigest
import java.util.Collections

/**
 * Loads images from: bundled resources ("res:path"), local files ("file:/abs/path"),
 * or http(s) URLs (downloaded once and cached under ~/.agritourism/cache for offline use).
 */
object ImageLoader {
    private const val MAX_DIM = 1400
    private val memory = Collections.synchronizedMap(object : LinkedHashMap<String, ImageBitmap>(64, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, ImageBitmap>?) = size > 120
    })
    private val cacheDir by lazy { File(Database.defaultFile().parentFile, "cache").apply { mkdirs() } }

    fun cached(src: String): ImageBitmap? = memory[src]

    suspend fun load(src: String): ImageBitmap? = memory[src] ?: withContext(Dispatchers.IO) {
        runCatching { bytes(src)?.let(::decode) }.getOrNull()?.also { memory[src] = it }
    }

    fun bytes(src: String): ByteArray? = when {
        src.startsWith("res:") -> ImageLoader::class.java.getResourceAsStream("/" + src.removePrefix("res:"))?.use { it.readBytes() }
        src.startsWith("file:") -> File(src.removePrefix("file:")).takeIf { it.exists() }?.readBytes()
        src.startsWith("http") -> {
            val key = MessageDigest.getInstance("SHA-1").digest(src.toByteArray()).joinToString("") { "%02x".format(it) }
            val f = File(cacheDir, key)
            if (f.exists() && f.length() > 0) f.readBytes() else {
                val c = URI(src).toURL().openConnection() as HttpURLConnection
                c.connectTimeout = 8000; c.readTimeout = 15000
                c.setRequestProperty("User-Agent", "AgriTourismDesktop/1.0")
                c.instanceFollowRedirects = true
                c.inputStream.use { it.readBytes() }.also { if (c.responseCode == 200) f.writeBytes(it) }
            }
        }
        else -> null
    }

    private fun decode(data: ByteArray): ImageBitmap {
        val img = SkiaImage.makeFromEncoded(data)
        val scale = minOf(1f, MAX_DIM.toFloat() / maxOf(img.width, img.height))
        if (scale >= 1f) return img.toComposeImageBitmap()
        val w = (img.width * scale).toInt(); val h = (img.height * scale).toInt()
        val surface = Surface.makeRasterN32Premul(w, h)
        surface.canvas.drawImageRect(img, Rect.makeWH(img.width.toFloat(), img.height.toFloat()), Rect.makeWH(w.toFloat(), h.toFloat()),
            SamplingMode.LINEAR, null, true)
        return surface.makeImageSnapshot().toComposeImageBitmap()
    }
}

@Composable
fun AsyncImage(src: String, modifier: Modifier = Modifier, contentScale: ContentScale = ContentScale.Crop, contentDescription: String? = null) {
    var bmp by remember(src) { mutableStateOf(ImageLoader.cached(src)) }
    var failed by remember(src) { mutableStateOf(false) }
    LaunchedEffect(src) {
        if (bmp == null) { bmp = ImageLoader.load(src); if (bmp == null) failed = true }
    }
    val b = bmp
    if (b != null) {
        Image(b, contentDescription, modifier, contentScale = contentScale)
    } else {
        Box(modifier.background(Brush.linearGradient(listOf(Color(0xFFDCEBDF), Color(0xFFF1F5EE)))), contentAlignment = Alignment.Center) {
            if (failed) Icon(Icons.Outlined.Image, null, tint = Color(0xFF8FB39A))
        }
    }
}
