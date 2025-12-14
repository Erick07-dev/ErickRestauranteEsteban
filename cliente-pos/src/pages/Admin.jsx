import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// Importamos iconos para el acordeón
import { FiChevronDown, FiChevronUp, FiEdit3, FiTrash2, FiPlusCircle, FiBox } from "react-icons/fi"; 
import "./Admin.css";

function Admin() {
  const [productos, setProductos] = useState([]);
  // Estado para controlar qué categorías están desplegadas
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});

  // -----------------------------------------------
  // GENERAR REPORTE
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
      alert("Error guardando el reporte");
    }
  };

  // -----------------------------------------------
  // CARGAR PRODUCTOS
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
  // ELIMINAR PRODUCTO
  // -----------------------------------------------
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await axios.delete(`http://localhost:4000/api/productos/${id}`);
      alert(`Producto eliminado: ${res.data.productoEliminado || "Correctamente"}`);
      cargarProductos(); 
    } catch (error) {
      console.log(error);
      alert("Error eliminando el producto");
    }
  };

  // -----------------------------------------------
  // NUEVA LÓGICA: Agrupar y Desplegar
  // -----------------------------------------------
  const toggleCategoria = (categoria) => {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  // Agrupar productos por categoría
  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || "Sin Categoría";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  return (
    <div className="admin-container">
      <div className="admin-header-main">
        <h1 className="admin-title">Panel de Administración</h1>
        <p className="admin-subtitle">Gestión de inventario y reportes</p>
      </div>

      {/* BARRA DE ACCIONES SUPERIOR */}
      <div className="admin-toolbar">
        <div className="toolbar-left">
          <Link to="/admin/agregar-producto" className="btn-action btn-add">
            <FiPlusCircle /> Nuevo Producto
          </Link>
          <Link to="/admin/admin-ordenes" className="btn-action btn-orders">
            <FiBox /> Ver Órdenes
          </Link>
        </div>

        <div className="toolbar-right">
          <button onClick={generarReporte} className="btn-action btn-report">
            📊 Reporte Diario
          </button>
          <button
            onClick={async () => {
              try {
                const resp = await fetch("http://localhost:4000/api/mysql/usuario_mas_activo");
                const data = await resp.json();
                alert(`🏆 Usuario Top: ${data.usuario} (${data.total} visitas)`);
              } catch (error) { alert("Error obteniendo datos"); }
            }}
            className="btn-action btn-user-top"
          >
            🏆 Top Usuario
          </button>
        </div>
      </div>

      <h2 className="section-title">Inventario Actual</h2>

      {productos.length === 0 ? (
        <div className="empty-state">
           <p>No hay productos cargados o no hay conexión.</p>
        </div>
      ) : (
        <div className="admin-inventory-list">
          {/* MAPEO POR CATEGORÍAS (ACORDEÓN) */}
          {Object.entries(productosPorCategoria).map(([categoria, lista]) => {
            const estaAbierta = categoriasExpandidas[categoria];

            return (
              <div key={categoria} className="admin-category-group">
                {/* CABECERA DE CATEGORÍA */}
                <button 
                  className={`admin-cat-header ${estaAbierta ? 'active' : ''}`} 
                  onClick={() => toggleCategoria(categoria)}
                >
                  <span className="cat-name">
                    {categoria} <span className="cat-count">({lista.length})</span>
                  </span>
                  {estaAbierta ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                {/* GRILLA DE PRODUCTOS (Solo si está abierta) */}
                {estaAbierta && (
                  <div className="admin-products-grid fade-in">
                    {lista.map((p) => (
                      <div key={p.id} className="admin-product-card">
                        <div className="card-img-wrapper">
                          <img
                            src={p.imagenUrl ? `http://localhost:4000/uploads/${p.imagenUrl}` : "/no-image.png"}
                            alt={p.nombre}
                          />
                          <div className="card-badge-stock">Stock: {p.stock}</div>
                        </div>

                        <div className="card-details">
                          <h4>{p.nombre}</h4>
                          <p className="card-price">${p.precio}</p>
                        </div>

                        <div className="card-actions">
                          <Link to={`/admin/editar-producto/${p.id}`} className="btn-icon edit" title="Editar">
                            <FiEdit3 />
                          </Link>
                          <button onClick={() => eliminarProducto(p.id)} className="btn-icon delete" title="Eliminar">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Admin;