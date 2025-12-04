const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Producto = require("../models/Producto");

// Multer configuración
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ================================
// CREAR PRODUCTO
// ================================
router.post("/", upload.single("imagen"), async (req, res) => {
  try {
    const nuevoProducto = new Producto({
      nombre: req.body.nombre,
      precio: req.body.precio,
      categoria: req.body.categoria,
      stock: req.body.stock,
      descripcion: req.body.descripcion,
      imagenUrl: req.file ? req.file.filename : null
    });

    await nuevoProducto.save();
    res.json(nuevoProducto);
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// ================================
// OBTENER TODOS LOS PRODUCTOS
// ================================
router.get("/", async (req, res) => {
  try {
    console.log('🔍 Buscando todos los productos...');
    const productos = await Producto.find().sort({ createdAt: -1 });
    console.log(`✅ Encontrados ${productos.length} productos`);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// ================================
// OBTENER UN PRODUCTO POR ID
// ================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando producto ID: ${id}`);
    
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ ID inválido:', id);
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

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
// ACTUALIZAR PRODUCTO (EDITAR)
// ================================
router.put("/:id", upload.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando producto ID: ${id}`);
    
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const { nombre, categoria, precio, stock } = req.body;
    console.log('📝 Datos recibidos:', { nombre, categoria, precio, stock });
    
    const datosActualizar = {
      nombre,
      categoria,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      updatedAt: new Date()
    };

    // Si se subió nueva imagen, actualizar la referencia
    if (req.file) {
      datosActualizar.imagenUrl = req.file.filename;
      console.log(`📸 Nueva imagen: ${req.file.filename}`);
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      datosActualizar,
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      console.log(`❌ Producto no encontrado para actualizar: ${id}`);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log(`✅ Producto actualizado: ${productoActualizado.nombre}`);
    res.json(productoActualizado);
    
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Datos de validación incorrectos' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ================================
// ELIMINAR PRODUCTO + IMAGEN
// ================================
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("🔄 DELETE solicitado para ID:", productId);
    
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("❌ ID no válido para MongoDB");
      return res.status(400).json({ error: "ID de producto no válido" });
    }

    console.log("✅ ID válido, buscando producto...");
    
    const producto = await Producto.findById(productId);
    console.log("🔍 Resultado de búsqueda:", producto);

    if (!producto) {
      console.log("❌ Producto NO encontrado en la base de datos");
      
      // Verificar si existe algún producto en la BD
      const totalProductos = await Producto.countDocuments();
      console.log("📊 Total de productos en BD:", totalProductos);
      
      // Listar todos los IDs existentes para debug
      const todosProductos = await Producto.find({}, '_id nombre');
      console.log("📋 Productos existentes:", todosProductos);
      
      return res.status(404).json({ 
        error: "Producto no encontrado",
        idBuscado: productId
      });
    }

    console.log("✅ Producto encontrado:", producto.nombre);
    
    // Eliminar imagen si existe
    if (producto.imagenUrl) {
      const rutaImagen = path.join(__dirname, "..", "uploads", producto.imagenUrl);
      
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
        console.log("✅ Imagen eliminada:", producto.imagenUrl);
      } else {
        console.log("⚠️ Imagen no encontrada en servidor:", producto.imagenUrl);
      }
    }

    // Eliminar de la base de datos
    await Producto.findByIdAndDelete(productId);
    console.log("✅ Producto eliminado de MongoDB");

    res.json({ 
      msg: "Producto eliminado correctamente",
      productoEliminado: producto.nombre 
    });

  } catch (error) {
    console.error("❌ Error completo al eliminar:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      detalle: error.message 
    });
  }
});

module.exports = router;  