require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const mysqlReportesRoutes = require("./routes/mysqlReportes");




const app = express();
app.use(cors());
app.use(express.json());
 

// Conexión con tu URI EXACTA
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("📌 Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error MongoDB:", err));

// Logs para revisar solicitudes
app.use((req, res, next) => {
  console.log("📩", req.method, req.originalUrl);
  console.log("📦 Body:", req.body);
  next();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  console.log('✅ Ruta de prueba accedida');
  res.json({ 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas
const productosRoutes = require("./routes/productos");
const ordenesRoutes = require("./routes/ordenes");
const authRoutes = require("./routes/auth");
const usuariosMysqlRoutes = require("./routes/mysqlUsuarios");
//const usuariosRoutes = require("./routes/user"); // <--- AGREGAR ESTO


// Usar rutas
app.use("/api/productos", productosRoutes);
app.use("/api/ordenes", ordenesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ordenes", require("./routes/ordenes"));
app.use("/api/mysql", mysqlReportesRoutes);
app.use("/api/mysql", usuariosMysqlRoutes);
// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//app.use("/api/user", usuariosRoutes); // <--- AGREGAR ESTO

// PUERTO
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server en puerto ${PORT}`));