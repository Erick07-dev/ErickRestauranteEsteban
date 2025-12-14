import { useState } from "react";
import axios from "axios";
import "./AgregarProducto.css";

function AgregarProducto() {
  // Estado inicial para poder resetearlo después
  const initialFormState = {
    nombre: "",
    precio: "",
    categoria: "",
    stock: "",
    descripcion: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validacion simple
    if (!formData.nombre || !formData.precio || !formData.categoria) {
      setMensaje("Por favor llena los campos obligatorios ⚠️");
      return;
    }

    try {
      const data = new FormData();
      data.append("nombre", formData.nombre);
      data.append("precio", formData.precio);
      data.append("categoria", formData.categoria);
      data.append("stock", formData.stock);
      data.append("descripcion", formData.descripcion);
      if (imagen) {
        data.append("imagen", imagen);
      }

      const res = await axios.post(
        "http://localhost:4000/api/productos",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMensaje("Producto agregado correctamente ✔️");
      console.log("Respuesta del servidor:", res.data);

      // --- MEJORA: Limpiar formulario tras éxito ---
      setFormData(initialFormState);
      setImagen(null);
      setPreview(null);
      
      // Limpiar el input de tipo file visualmente
      e.target.reset(); 

      // Borrar mensaje de éxito después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);

    } catch (error) {
      console.log(error);
      setMensaje("Error al guardar producto ❌");
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-card">
        <h2 className="titulo">Agregar Producto (MySQL)</h2>

        <form onSubmit={handleSubmit}>
          <label>Nombre del producto</label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej. Camaron Empanizado"
            className="input"
            value={formData.nombre} // Vinculado al estado
            onChange={handleChange}
          />

          <label>Precio</label>
          <input
            type="number"
            name="precio"
            placeholder="Ej. 25"
            className="input"
            value={formData.precio} // Vinculado al estado
            onChange={handleChange}
          />

          <label>Categoría</label>
          <select
            name="categoria"
            className="input"
            value={formData.categoria} // Vinculado al estado
            onChange={handleChange}
          >
            <option value="">Seleccionar Categoría</option>
            {/* Asegúrate que estas categorías coincidan con las que usas en Python/MySQL */}
            <option value="Entradas">Entradas</option>
            <option value="Platos Fuertes">Platos Fuertes</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Postres">Postres</option>
            <option value="Barra Fría">Barra Fría</option>
            <option value="Barra Caliente">Barra Caliente</option>
          </select>

          <label>Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="Ej. 10"
            className="input"
            value={formData.stock} // Vinculado al estado
            onChange={handleChange}
          />

          <label>Descripción</label>
          <textarea
            name="descripcion"
            placeholder="Descripción del producto"
            className="textarea"
            value={formData.descripcion} // Vinculado al estado
            onChange={handleChange}
          ></textarea>

          <label>Imagen del producto</label>
          <input
            type="file"
            className="input"
            onChange={handleImagen}
            // Nota: El value de un input file no se puede controlar completamente con React por seguridad
          />

          {preview && (
            <img src={preview} className="preview-img" alt="preview" />
          )}

          <button className="btn-guardar">Guardar Producto</button>
        </form>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
    </div>
  );
}

export default AgregarProducto;