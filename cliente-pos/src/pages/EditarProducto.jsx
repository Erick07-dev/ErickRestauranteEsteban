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
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Función para probar la conexión con el backend
  const probarConexion = async () => {
    try {
      console.log('🔍 Probando conexión con el backend...');
      const response = await axios.get('http://localhost:4000/api/test');
      console.log('✅ Backend respondió:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  };

  // Traer producto con mejor manejo de errores
  const obtenerProducto = async () => {
    try {
      setCargando(true);
      setError("");

      console.log('🔄 Obteniendo producto ID:', id);
      
      // Primero probar si el backend responde
      const backendActivo = await probarConexion();
      if (!backendActivo) {
        setError("El servidor no está respondiendo. Verifica que el backend esté corriendo en el puerto 4000.");
        setCargando(false);
        return;
      }

      const res = await axios.get(`http://localhost:4000/api/productos/${id}`);
      const producto = res.data;
      
      console.log('✅ Producto recibido:', producto);
      
      setForm({
        nombre: producto.nombre || "",
        categoria: producto.categoria || "",
        precio: producto.precio?.toString() || "",
        stock: producto.stock?.toString() || "0",
        imagenUrl: producto.imagenUrl || ""
      });
      
      setCargando(false);
    } catch (error) {
      console.error('❌ Error completo:', error);
      setCargando(false);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError("❌ Error de conexión. Verifica que el servidor esté corriendo en http://localhost:4000");
      } else if (error.response?.status === 404) {
        setError("❌ Producto no encontrado. Puede que haya sido eliminado.");
      } else if (error.response?.data?.error) {
        setError(`❌ Error del servidor: ${error.response.data.error}`);
      } else {
        setError("❌ Error inesperado al cargar el producto");
      }
    }
  };

  useEffect(() => { 
    if (id) {
      obtenerProducto(); 
    } else {
      setError("❌ ID de producto no proporcionado");
      setCargando(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB");
        return;
      }
      
      setImagenFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(prev => ({ ...prev, imagenPreview: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!form.nombre?.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.categoria) {
      setError("La categoría es obligatoria");
      return;
    }

    const precioNum = parseFloat(form.precio);
    if (!form.precio || isNaN(precioNum) || precioNum <= 0) {
      setError("El precio debe ser un número mayor a 0");
      return;
    }

    const stockNum = parseInt(form.stock);
    if (!form.stock || isNaN(stockNum) || stockNum < 0) {
      setError("El stock debe ser un número mayor o igual a 0");
      return;
    }

    setGuardando(true);

    try {
      console.log('🔄 Actualizando producto...');
      
      const formData = new FormData();
      formData.append('nombre', form.nombre.trim());
      formData.append('categoria', form.categoria);
      formData.append('precio', precioNum);
      formData.append('stock', stockNum);
      
      if (imagenFile) {
        formData.append('imagen', imagenFile);
        console.log('📸 Nueva imagen agregada');
      }

      const res = await axios.put(`http://localhost:4000/api/productos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000 // 10 segundos timeout
      });

      console.log('✅ Producto actualizado:', res.data);
      alert("✅ Producto actualizado correctamente");
      navigate("/admin");
      
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError("❌ Error de conexión. Verifica que el servidor esté corriendo.");
      } else if (error.response?.status === 404) {
        setError("❌ Producto no encontrado. Puede que haya sido eliminado.");
      } else if (error.response?.data?.error) {
        setError(`❌ Error: ${error.response.data.error}`);
      } else if (error.code === 'ECONNABORTED') {
        setError("❌ Tiempo de espera agotado. El servidor no respondió.");
      } else {
        setError("❌ Error inesperado al actualizar el producto");
      }
    } finally {
      setGuardando(false);
    }
  };

  const recargarProducto = () => {
    setError("");
    obtenerProducto();
  };

  const regresarAdmin = () => {
    navigate("/admin");
  };

  if (cargando) {
    return (
      <div className="editar-container">
        <div className="cargando">
          <div className="spinner"></div>
          <p>Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  if (error && !cargando) {
    return (
      <div className="editar-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar el producto</h3>
          <p className="error-message-text">{error}</p>
          <div className="error-actions">
            <button onClick={recargarProducto} className="btn-reintentar">
              <FiRefreshCw /> Reintentar
            </button>
            <button onClick={regresarAdmin} className="btn-volver">
              <FiArrowLeft /> Volver al Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-container">
      <div className="editar-card">

        <div className="editar-header">
          <FiEdit3 className="icon-title" />
          <h2>Editar Producto</h2>
          <span className="product-id">ID: {id}</span>
        </div>

        {/* Sección de imagen */}
        <div className="imagen-section">
          <label className="imagen-label">
            <FiImage /> Imagen del Producto
          </label>
          <div className="imagen-preview">
            {form.imagenUrl || form.imagenPreview ? (
              <img 
                src={form.imagenPreview || `http://localhost:4000/uploads/${form.imagenUrl}`} 
                alt="Vista previa del producto" 
                className="imagen-actual"
                onError={(e) => {
                  console.log('❌ Error cargando imagen');
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="no-imagen">
                <FiImage size={40} />
                <p>Sin imagen</p>
              </div>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            className="input-file"
            id="imagen-input"
          />
          <label htmlFor="imagen-input" className="btn-seleccionar-imagen">
            📁 Seleccionar Nueva Imagen
          </label>
          <small className="texto-ayuda">
            Formatos: JPG, PNG, GIF • Máx: 5MB
          </small>
        </div>

        <form className="formulario" onSubmit={guardarCambios}>

          {/* Nombre */}
          <div className="form-group">
            <label className="label">
              <FiTag /> Nombre del Producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="input"
              placeholder="Ej: Hamburguesa Especial"
              required
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label className="label">
              <FiLayers /> Categoría *
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="Barra Fría">Barra Fría</option>
              <option value="Barra Caliente">Barra Caliente</option>
              <option value="Bebidas sin alcohol">Bebidas sin alcohol</option>
              <option value="Bebidas con alcohol">Bebidas con alcohol</option>
              <option value="Entradas">Entradas</option>
              <option value="Platos Fuertes">Platos Fuertes</option>
              <option value="Postres">Postres</option>
            </select>
          </div>

          {/* Precio */}
          <div className="form-group">
            <label className="label">
              <FiDollarSign /> Precio *
            </label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              className="input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Stock */}
          <div className="form-group">
            <label className="label">
              <FiPackage /> Stock Disponible *
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="input"
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Botones */}
          <div className="botones-container">
            <button 
              className="btn-guardar" 
              type="submit"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <div className="spinner-mini"></div>
                  Guardando...
                </>
              ) : (
                "💾 Guardar Cambios"
              )}
            </button>

            <button
              type="button"
              className="btn-cancelar"
              onClick={regresarAdmin}
              disabled={guardando}
            >
              <FiArrowLeft /> Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}