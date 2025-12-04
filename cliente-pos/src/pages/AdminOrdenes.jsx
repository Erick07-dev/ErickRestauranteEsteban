import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrdenes.css";

function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await axios.get("http://https://erickrestauranteesteban-3.onrender.com/api/ordenes");
        setOrdenes(res.data);
      } catch (error) {
        console.error("Error cargando órdenes:", error);
      }
    };
    cargar();
  }, []);

  return (
    <div className="admin-container">
      <h1>Órdenes Recibidas</h1>

      {ordenes.length === 0 && <p>No hay órdenes todavía.</p>}

      {ordenes.map(o => (
        <div className="orden-card" key={o._id}>
          <h3>Mesa {o.mesaId || "Sin mesa"}</h3>

          <p><strong>Mesero:</strong> {o.mesero || "N/A"}</p>
          <p><strong>Total:</strong> ${o.total}</p>
          <p><strong>Fecha:</strong> {new Date(o.fecha).toLocaleString()}</p>

          <h4>Productos:</h4>
          <ul>
            {o.productos.map((p, index) => (
              <li key={index}>
                {p.nombre} x {p.cantidad}
                <br />
                <small>Ingredientes: {p.ingredientes}</small>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default AdminOrdenes;
