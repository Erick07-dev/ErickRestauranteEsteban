const express = require("express");
const router = express.Router();
const Orden = require("../models/Orden");
const Producto = require("../models/Producto"); // Ahora este es tu modelo MySQL
const PDFDocument = require("pdfkit");

// 📌 REGISTRAR ORDEN Y GENERAR TICKET (Pago inmediato)
router.post("/finalizar", async (req, res) => {
  const { carrito, total, mesaId, mesero } = req.body;

  console.log("📩 Body recibido:", req.body);

  try {
    // 1. VALIDAR Y REDUCIR STOCK EN MYSQL
    // Recorremos el carrito item por item
    for (const item of carrito) {
      // Intentamos descontar. Si no hay stock, esto devuelve false.
      const stockDescontado = await Producto.descontarStock(item.id, item.cantidad);

      if (!stockDescontado) {
        // Si falla, detenemos todo y avisamos
        return res.status(400).json({ 
            error: `No hay suficiente stock para el producto: ${item.nombre}` 
        });
      }
    }

    // 2. GUARDAR ORDEN EN MONGO (Solo si el stock se descontó bien)
    const nuevaOrden = new Orden({
      productos: carrito,
      total,
      mesaId,
      mesero
    });

    await nuevaOrden.save();
    console.log("✔ Orden guardada en la BD");

    // 3. CREAR TICKET PDF
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

// 📌 GUARDAR ORDEN SIN TICKET (Botón "Mandar Orden al Administrador")
router.post("/", async (req, res) => {
  try {
    // 1. Recibimos los datos del frontend
    const { productos, mesaId, mesero, total } = req.body;

    console.log("📩 Procesando orden para Mesa:", mesaId);

    // ============================================================
    // PASO CRÍTICO: DESCONTAR STOCK EN MYSQL ANTES DE GUARDAR
    // ============================================================
    for (const item of productos) {
        // item.id viene del frontend (MySQL ID)
        // item.cantidad es lo que pidió el cliente
        
        // Llamamos a tu modelo blindado que usa "AND stock >= ?"
        const descuentoExitoso = await Producto.descontarStock(item.id, item.cantidad);

        if (!descuentoExitoso) {
            // Si esto falla, es porque alguien ganó el stock hace milisegundos
            console.log(`❌ Stock insuficiente para producto ID ${item.id}`);
            return res.status(400).json({ 
                error: `Error: No hay suficiente stock para "${item.nombre}". Venta cancelada.` 
            });
        }
    }

    // ============================================================
    // PASO 2: SI HUBO STOCK, GUARDAMOS LA ORDEN EN MONGO
    // ============================================================
    const orden = new Orden({
        mesaId,      
        productos,
        total,
        mesero,
        fecha: new Date() // Opcional si usas timestamps
    });
    
    await orden.save();
    console.log("✅ Orden guardada y stock descontado.");
    
    res.json({ ok: true, mensaje: "Orden enviada correctamente y stock actualizado" });

  } catch (error) {
    console.error("❌ Error grave al procesar orden:", error);
    res.status(500).json({ error: "Error interno guardando la orden" });
  }
});

// 📌 OBTENER TODAS LAS ÓRDENES
router.get("/", async (req, res) => {
  try {
      const ordenes = await Orden.find().sort({ createdAt: -1 }); // Usar createdAt si tienes timestamps
      res.json(ordenes);
  } catch (error) {
      res.status(500).json({ error: "Error obteniendo ordenes" });
  }
});

// 📌 CANCELAR ORDEN (Devuelve stock a MySQL)
router.put("/:id/cancelar", async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });

    if (orden.estado === "Cancelada") {
      return res.status(400).json({ error: "Esta orden ya estaba cancelada" });
    }

    // DEVOLVER STOCK A MYSQL
    for (const item of orden.productos) {
      // Usamos una query directa para sumar el stock
      // UPDATE productos SET stock = stock + cantidad WHERE id = item.id
      const query = 'UPDATE productos SET stock = stock + ? WHERE id = ?';
      await require('../mysql').execute(query, [item.cantidad, item.id]);
    }

    // Actualizar estado en Mongo
    orden.estado = "Cancelada";
    await orden.save();

    res.json({ msg: "Orden cancelada y stock restaurado", orden });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cancelar orden" });
  }
});

// 📌 FINALIZAR ORDEN (Marcar como pagada/entregada)
router.put("/:id/finalizar", async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });

    orden.estado = "Finalizada";
    await orden.save();

    res.json({ msg: "Orden finalizada", orden });
  } catch (error) {
    res.status(500).json({ error: "Error al finalizar orden" });
  }
});

module.exports = router;