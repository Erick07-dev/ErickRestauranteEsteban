import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit3, FiTag, FiDollarSign, FiLayers, FiArrowLeft, FiImage, FiPackage, FiRefreshCw } from "react-icons/fi";
import "./EditarProducto.css";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    imagenUrl: ""
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null); // Estado separado para preview
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------------------------------
  // 1. CARGAR PRODUCTO (MySQL)
  // -----------------------------------------------------------------------
  const obtenerProducto = async () => {
    try {
      setCargando(true);
      setError("");
      console.log('🔄 Obteniendo producto ID:', id);
      
      const res = await axios.get(`http://localhost:4000/api/productos/${id}`);
      const producto = res.data;
      
      // Mapeo de datos (MySQL devuelve los nombres de columnas exactos)
      setForm({
        nombre: producto.nombre || "",
        categoria: producto.categoria || "",
        precio: producto.precio || "",
        stock: producto.stock || "0",
        imagenUrl: producto.imagenUrl || ""
      });
      
      setCargando(false);

    } catch (error) {
      console.error('❌ Error cargando producto:', error);
      setCargando(false);
      
      if (error.response?.status === 404) {
        setError("❌ Producto no encontrado en la base de datos MySQL.");
      } else {
        setError("❌ Error de conexión. Asegúrate que el servidor (puerto 4000) esté encendido.");
      }
    }
  };

  useEffect(() => { 
    if (id) obtenerProducto(); 
  }, [id]);

  // -----------------------------------------------------------------------
  // 2. MANEJAR CAMBIOS EN INPUTS
  // -----------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      // Crear preview local instantáneo
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  // -----------------------------------------------------------------------
  // 3. GUARDAR CAMBIOS (PUT)
  // -----------------------------------------------------------------------
  const guardarCambios = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('categoria', form.categoria);
      formData.append('precio', form.precio);
      formData.append('stock', form.stock);
      formData.append('descripcion', form.descripcion || ""); // Añadido por si acaso

      // Solo adjuntamos imagen si el usuario seleccionó una nueva
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      console.log('📤 Enviando actualización a MySQL...');

      // NOTA IMPORTANTE: Al enviar 'formData', Axios detecta automáticamente
      // el Content-Type correcto. No hace falta ponerlo manual.
      await axios.put(`http://localhost:4000/api/productos/${id}`, formData);

      alert("✅ Producto actualizado correctamente");
      navigate("/admin"); // O la ruta donde tengas tu tabla de productos

    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      setGuardando(false);
      setError("No se pudo actualizar el producto. Revisa la consola.");
    }
  };

  if (cargando) return <div className="loading-msg">Cargando producto...</div>;

  return (
    <div className="editar-container">
      <div className="editar-card">

        <div className="editar-header">
          <FiEdit3 className="icon-title" />
          <h2>Editar Producto</h2>
          <span className="product-id">ID: {id}</span>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Sección de Imagen */}
        <div className="imagen-section">
          <div className="imagen-preview">
            {/* Prioridad: 1. Preview Local (nueva foto), 2. URL del Servidor (foto vieja), 3. Placeholder */}
            {imagenPreview ? (
              <img src={imagenPreview} alt="Preview nueva" className="imagen-actual" />
            ) : form.imagenUrl ? (
              <img 
                src={`http://localhost:4000/uploads/${form.imagenUrl}`} 
                alt="Actual" 
                className="imagen-actual"
                onError={(e) => e.target.style.display = 'none'} 
              />
            ) : (
              <div className="no-imagen"><FiImage size={30} /> Sin imagen</div>
            )}
          </div>
          
          <label htmlFor="imagen-input" className="btn-seleccionar-imagen">
            <FiImage /> Cambiar Imagen
          </label>
          <input
            id="imagen-input"
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            style={{ display: 'none' }}
          />
        </div>

        <form className="formulario" onSubmit={guardarCambios}>
          
          <div className="form-group">
            <label><FiTag /> Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required className="input" />
          </div>

          <div className="form-group">
            <label><FiLayers /> Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} required className="select">
              <option value="">Seleccionar...</option>
              <option value="Entradas">Entradas</option>
              <option value="Platos Fuertes">Platos Fuertes</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Postres">Postres</option>
              <option value="Barra Fría">Barra Fría</option>
              <option value="Barra Caliente">Barra Caliente</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label><FiDollarSign /> Precio</label>
              <input type="number" name="precio" value={form.precio} onChange={handleChange} required className="input" step="0.50" />
            </div>

            <div className="form-group half">
              <label><FiPackage /> Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} required className="input" />
            </div>
          </div>

          <div className="botones-container">
            <button type="submit" className="btn-guardar" disabled={guardando}>
              {guardando ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
            <button type="button" className="btn-cancelar" onClick={() => navigate('/admin')}>
              <FiArrowLeft /> Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}