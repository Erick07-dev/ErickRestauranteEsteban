const express = require("express");
const router = express.Router();
const Orden = require("../models/Orden");
const Producto = require("../models/Producto");
const PDFDocument = require("pdfkit");

// 📌 REGISTRAR ORDEN Y GENERAR TICKET
router.post("/finalizar", async (req, res) => {
  const { carrito, total, mesaId, mesero } = req.body;

  console.log("📩 Body recibido:", req.body);

  try {
    // Reducir stock
    for (const item of carrito) {
      await Producto.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.cantidad }
      });
    }

    // Guardar orden en la BD
    const nuevaOrden = new Orden({
      productos: carrito,
      total,
      mesaId,
      mesero
    });

    await nuevaOrden.save();

    console.log("✔ Orden guardada en la BD");

    // Crear ticket PDF
    const doc = new PDFDocument();
    res.setHeader("Content-disposition", "attachment; filename=ticket.pdf");
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(22).text("🧾 Ticket de Pago", { align: "center" });
    doc.moveDown();

    carrito.forEach((p) => {
      doc.fontSize(14).text(`${p.nombre} x${p.cantidad} — $${p.precio * p.cantidad}`);
    });

    doc.moveDown();
    doc.fontSize(18).text(`TOTAL: $${total}`, { align: "right" });

    doc.end();

  } catch (error) {
    console.log("❌ Error:", error);
    res.status(500).json({ error: "No se pudo finalizar la orden" });
  }
});

// 📌 GUARDAR ORDEN SIN TICKET (OPCIONAL)
router.post("/", async (req, res) => {
  try {
    const orden = new Orden(req.body);
    await orden.save();
    res.json({ ok: true, mensaje: "Orden enviada al administrador" });
  } catch (error) {
    res.status(500).json({ error: "Error guardando la orden" });
  }
});

// 📌 OBTENER TODAS LAS ÓRDENES
router.get("/", async (req, res) => {
  const ordenes = await Orden.find().sort({ fecha: -1 });
  res.json(ordenes);
});

module.exports = router;
