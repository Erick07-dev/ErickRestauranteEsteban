import { useState } from "react";
import axios from "axios";
import "./AgregarProducto.css";

function AgregarProducto() {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    stock: "",
    descripcion: "",
  });

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
    setImagen(file);
    setPreview(URL.createObjectURL(file)); // Previsualización
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("nombre", formData.nombre);
      data.append("precio", formData.precio);
      data.append("categoria", formData.categoria);
      data.append("stock", formData.stock);
      data.append("descripcion", formData.descripcion);
      data.append("imagen", imagen);

      const res = await axios.post(
        "http://localhost:4000/api/productos",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMensaje("Producto agregado correctamente ✔️");
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setMensaje("Error al guardar producto ❌");
    }
  };

  return (
    <div className="form-wrapper">

      <div className="form-card">
        <h2 className="titulo">Agregar Producto</h2>

        <form onSubmit={handleSubmit}>

          <label>Nombre del producto</label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej. Camaron Empanizado"
            className="input"
            onChange={handleChange}
          />

          <label>Precio</label>
          <input
            type="number"
            name="precio"
            placeholder="Ej. 25"
            className="input"
            onChange={handleChange}
          />

          <label>Categoría</label>
          <select
            name="categoria"
            className="input"
            onChange={handleChange}
          >
            <option value="">Seleccionar Categoría</option>
            <option value="Barra Fría">Barra Fría</option>
            <option value="Barra Caliente">Barra Caliente</option>
            <option value="Bebidas sin alcohol">Bebidas sin alcohol</option>
            <option value="Bebidas con alcohol">Bebidas con alcohol</option>
          </select>

          <label>Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="Ej. 10"
            className="input"
            onChange={handleChange}
          />

          <label>Descripción</label>
          <textarea
            name="descripcion"
            placeholder="Descripción del producto"
            className="textarea"
            onChange={handleChange}
          ></textarea>

          <label>Imagen del producto</label>
          <input
            type="file"
            className="input"
            onChange={handleImagen}
          />

          {/* Previsualización de la imagen */}
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
