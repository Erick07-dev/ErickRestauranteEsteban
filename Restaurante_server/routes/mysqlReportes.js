const express = require("express");
const router = express.Router();
const pool = require("../mysql");

// GUARDAR REPORTE
router.post("/reportes", async (req, res) => {
  const { fecha, total, cantidad_ordenes, producto_mas_vendido } = req.body;

  console.log("📩 Guardando reporte en MySQL:", req.body);

  try {
    const [result] = await pool.query(
      `INSERT INTO reportes_ventas (fecha, total, cantidad_ordenes, producto_mas_vendido)
       VALUES (?, ?, ?, ?)`,
      [fecha, total, cantidad_ordenes, producto_mas_vendido]
    );

    res.json({ ok: true, insertId: result.insertId });
  } catch (error) {
    console.log("❌ Error guardando reporte:", error);
    res.status(500).json({ error: "Error guardando reporte en MySQL" });
  }
});

// OBTENER REPORTES
router.get("/reportes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM `reportes_ventas` ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.log("❌ Error obteniendo reportes:", error);
    res.status(500).json({ error: "Error consultando MySQL" });
  }
});

module.exports = router;
