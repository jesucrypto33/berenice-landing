const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middlewares ──────────────────────────────────────────────
app.use(cors({ origin: "*" })); // En producción, reemplazá "*" por tu dominio
app.use(express.json());

// ── Ruta de contacto ─────────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Validación básica
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Contacto Web <onboarding@resend.dev>", // Cambiá esto por tu dominio verificado
        to: [process.env.TO_EMAIL],                   // Tu email donde recibís los mensajes
        subject: `Nuevo mensaje de ${name}`,
        html: `
          <h2>Nuevo mensaje desde tu sitio web</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
        reply_to: email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Resend:", data);
      return res.status(500).json({ error: "No se pudo enviar el correo." });
    }

    res.status(200).json({ success: true, message: "¡Correo enviado!" });
  } catch (error) {
    console.error("Error del servidor:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── Levantar servidor ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
