const mongoose = require("mongoose");
const mysql = require("mysql2/promise"); // Usamos la versión con promesas
require("dotenv").config();

// --- 1. Configuración de MongoDB ---
const connectMongo = async () => {
  try {
    // Es buena práctica verificar que la variable exista antes
    if (!process.env.MONGODB_URI) {
      throw new Error("La variable MONGODB_URI no está definida");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado exitosamente");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    // No hacemos process.exit(1) aquí para no matar la app si solo falla Mongo pero MySQL funciona
    // Pero depende de cuán crítica sea Mongo para tu app.
  }

};

// Agrega esto temporalmente en db.js para debuggear
console.log("--- INTENTO DE CONEXIÓN MYSQL ---");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Port:", process.env.DB_PORT);
console.log("Database:", process.env.DB_NAME);
console.log("---------------------------------");

// --- 2. Configuración de MySQL (Railway) ---
const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Agrega esto temporalmente en db.js para debuggear
console.log("--- INTENTO DE CONEXIÓN MYSQL ---");
console.log("Host:", process.env.DB_HOST);
console.log("User:", process.env.DB_USER);
console.log("Port:", process.env.DB_PORT);
console.log("Database:", process.env.DB_NAME);
console.log("---------------------------------");

// Prueba opcional de conexión a MySQL al iniciar (solo para log)
mysqlPool.getConnection()
  .then(connection => {
    mysqlPool.releaseConnection(connection);
    console.log('✅ MySQL (Railway) conectado exitosamente.');
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

// --- Exportamos ambas cosas ---
module.exports = { 
  connectMongo, 
  mysqlPool 
};