import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Admin.css";

function Admin() {
  const [productos, setProductos] = useState([]);

  // -----------------------------------------------
  // GENERAR REPORTE (GUARDAR EN MYSQL)
  // -----------------------------------------------
  const generarReporte = async () => {
    try {
      await axios.post("http://localhost:4000/api/mysql/reportes", {
        fecha: new Date().toISOString().slice(0, 10),
        total: 1234,
        cantidad_ordenes: 18,
        producto_mas_vendido: "Mojarra Al Mojo"
      });

      alert("Reporte guardado en MySQL");
    } catch (error) {
      console.log(error);
      alert("Error guardando el reporte en MySQL");
    }
  };

  // -----------------------------------------------
  // CARGAR PRODUCTOS DESDE MONGO
  // -----------------------------------------------
  const cargarProductos = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/productos");
      setProductos(res.data);
    } catch (error) {
      console.log("❌ Error cargando productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // -----------------------------------------------
  // ELIMINAR PRODUCTO (MONGO)
  // -----------------------------------------------
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      const res = await axios.delete(
        `http://https://erickrestauranteesteban-3.onrender.com/api/productos/${id}`
      );

      alert(`Producto eliminado: ${res.data.productoEliminado}`);
      cargarProductos();
    } catch (error) {
      console.log(error);
      alert("Error eliminando el producto");
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Administración</h1>

      {/* BOTÓN PARA GUARDAR REPORTE EN MYSQL */}
      <button onClick={generarReporte} className="btn-report">
        📊 Generar Reporte (MySQL)
      </button>

      <button
  onClick={async () => {
    const resp = await fetch("http://localhost:4000/api/mysql/usuario_mas_activo");
    const data = await resp.json();
    alert(`Usuario más activo: ${data.usuario} (${data.total} ingresos)`);
  }}
  className="btn btn-primary"
>
  Generar Reporte
</button>


      <Link to="/admin/agregar-producto" className="btn-add">
        ➕ Agregar Producto
      </Link>

      <Link to="/admin/admin-ordenes" className="btn-add">
        📦 Órdenes
      </Link>

      <h2 className="subtitle">Productos Registrados</h2>

      {productos.length === 0 ? (
        <p>No hay productos aún.</p>
      ) : (
        <div className="products-grid">
          {productos.map((p) => (
            <div key={p._id} className="product-card">
              <img
                src={
                  p.imagenUrl
                    ? `http://localhost:4000/uploads/${p.imagenUrl}`
                    : "/no-image.png"
                }
                alt={p.nombre}
                className="product-image"
              />

              <div className="product-info">
                <h3>{p.nombre}</h3>
                <p><strong>Precio:</strong> ${p.precio}</p>
                <p><strong>Categoría:</strong> {p.categoria}</p>
                <p><strong>Stock:</strong> {p.stock}</p>
              </div>

              <div className="product-actions">
                <Link to={`/admin/editar-producto/${p._id}`} className="btn-edit">
                  ✏️ Editar
                </Link>

                <button
                  onClick={() => eliminarProducto(p._id)}
                  className="btn-delete"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
