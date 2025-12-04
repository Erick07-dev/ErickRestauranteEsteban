const express = require("express");
const router = express.Router();
const pool = require("../mysql");

// Usuario que más ha entrado
router.get("/usuario-mas-activo", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT usuario_id, COUNT(*) AS total_logins
       FROM usuarios_logins
       GROUP BY usuario_id
       ORDER BY total_logins DESC
       LIMIT 1`
    );

    res.json(rows[0]);
  } catch (error) {
    console.log("❌ Error consultando usuario más activo:", error);
    res.status(500).json({ error: "Error consultando MySQL" });
  }
});

// OBTENER USUARIO MÁS FRECUENTE
router.get("/usuario_mas_activo", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT usuario, COUNT(*) AS total
      FROM usuarios_logins
      GROUP BY usuario
      ORDER BY total DESC
      LIMIT 1
    `);

    res.json(rows[0]);
  } catch (error) {
    console.log("❌ Error obteniendo usuario más activo:", error);
    res.status(500).json({ error: "Error consultando MySQL" });
  }
});


module.exports = router;
