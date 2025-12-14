const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const mongoose = require("mongoose"); // <-- YA NO LO NECESITAMOS
const Producto = require("../models/Producto"); // <-- Tu nuevo modelo MySQL

// Multer configuración (ESTO SE QUEDA IGUAL)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ================================
// CREAR PRODUCTO (MySQL)
// ================================
router.post("/", upload.single("imagen"), async (req, res) => {
  try {
    console.log("📝 Intentando crear producto...");
    
    // Preparamos el objeto con los datos
    const datosProducto = {
      nombre: req.body.nombre,
      precio: parseFloat(req.body.precio),
      categoria: req.body.categoria,
      stock: parseInt(req.body.stock),
      descripcion: req.body.descripcion,
      imagenUrl: req.file ? req.file.filename : null
    };

    // Usamos el método .create() de tu modelo MySQL
    const nuevoProducto = await Producto.create(datosProducto);
    
    console.log("✅ Producto creado ID:", nuevoProducto.id);
    res.json(nuevoProducto);

  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// ================================
// OBTENER TODOS LOS PRODUCTOS (MySQL)
// ================================
router.get("/", async (req, res) => {
  try {
    console.log('🔍 Buscando todos los productos en MySQL...');
    
    // Usamos .findAll() del modelo SQL
    const productos = await Producto.findAll();
    
    console.log(`✅ Encontrados ${productos.length} productos`);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// ================================
// OBTENER UN PRODUCTO POR ID (MySQL)
// ================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando producto ID: ${id}`);
    
    // Validación MySQL: El ID debe ser un número
    if (isNaN(id)) {
      console.log('❌ ID inválido (no es número):', id);
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Usamos .findById() del modelo SQL
    const producto = await Producto.findById(id);
    
    if (!producto) {
      console.log(`❌ Producto no encontrado: ${id}`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log(`✅ Producto encontrado: ${producto.nombre}`);
    res.json(producto);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// ================================
// ACTUALIZAR PRODUCTO (MySQL)
// ================================
router.put("/:id", upload.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando producto ID: ${id}`);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Primero verificamos que exista para mantener la imagen vieja si no suben una nueva
    const productoExistente = await Producto.findById(id);
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { nombre, categoria, precio, stock, descripcion } = req.body;
    
    const datosActualizar = {
      nombre,
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      descripcion,
      // Si hay archivo nuevo usa ese, si no, mantén la URL vieja de la BD
      imagenUrl: req.file ? req.file.filename : productoExistente.imagenUrl
    };

    // Si se subió nueva imagen, borrar la vieja del servidor (Opcional pero recomendado)
    if (req.file && productoExistente.imagenUrl) {
       const rutaVieja = path.join(__dirname, "..", "uploads", productoExistente.imagenUrl);
       if (fs.existsSync(rutaVieja)) {
          fs.unlinkSync(rutaVieja); // Borra la foto vieja para ahorrar espacio
       }
    }

    // Usamos .update() del modelo SQL
    const productoActualizado = await Producto.update(id, datosActualizar);

    console.log(`✅ Producto actualizado: ${productoActualizado.nombre}`);
    res.json(productoActualizado);
    
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ================================
// ELIMINAR PRODUCTO (MySQL)
// ================================
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🔄 DELETE solicitado para ID:", productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: "ID de producto no válido" });
    }
    
    // 1. Buscamos el producto para obtener el nombre de la imagen
    const producto = await Producto.findById(productId);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 2. Eliminar imagen del sistema de archivos si existe
    if (producto.imagenUrl) {
      const rutaImagen = path.join(__dirname, "..", "uploads", producto.imagenUrl);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
        console.log("✅ Imagen eliminada del servidor");
      }
    }

    // 3. Eliminar de la base de datos MySQL
    await Producto.delete(productId);
    console.log("✅ Producto eliminado de MySQL");

    res.json({ 
      msg: "Producto eliminado correctamente",
      productoEliminado: producto.nombre 
    });

  } catch (error) {
    console.error("❌ Error al eliminar:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;