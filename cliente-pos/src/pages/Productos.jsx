import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "./Productos.css";
import ConfirmacionOrden from "./ConfirmacionOrden";
import IngredientesModal from "./IngredientesModal";

function Productos() {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [ordenGuardada, setOrdenGuardada] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [nombreMesero, setNombreMesero] = useState("");

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarIngredientesModal, setMostrarIngredientesModal] = useState(false);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState({});

  // -----------------------------------------------------
  // Cargar productos
  // -----------------------------------------------------
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get("http://https://erickrestauranteesteban-3.onrender.com/api/productos");
      setProductos(res.data);

      const inicial = {};
      res.data.forEach((p) => (inicial[p._id] = 0));
      setCantidades(inicial);
    } catch (error) {
      console.log("Error cargando productos:", error);
    }
  };

  // -----------------------------------------------------
  // Cambiar cantidad
  // -----------------------------------------------------
  const cambiarCantidad = (id, delta) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) + delta, 0),
    }));
  };

  // -----------------------------------------------------
  // Obtener carrito
  // -----------------------------------------------------
  const obtenerCarrito = () => {
    return productos
      .filter((p) => cantidades[p._id] > 0)
      .map((p) => ({
        id: p._id,
        nombre: p.nombre,
        precio: Number(p.precio),
        cantidad: cantidades[p._id],
        ingredientes: ingredientesSeleccionados[p._id] || "normal"
      }));
  };

  const totalFooter = productos.reduce(
    (acc, p) => acc + (cantidades[p._id] || 0) * Number(p.precio || 0),
    0
  );

  // -----------------------------------------------------
  // Guardar Orden en LocalStorage
  // -----------------------------------------------------
  const guardarOrden = () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      alert("No hay productos en la orden");
      return;
    }

    const orden = {
      mesaId,
      productos: carrito,
      total: totalFooter,
      fecha: new Date().toISOString(),
    };

    localStorage.setItem(`ordenMesa_${mesaId}`, JSON.stringify(orden));
    setOrdenGuardada(true);
    alert("Orden guardada correctamente.");
  };

  // -----------------------------------------------------
  // Cargar orden guardada
  // -----------------------------------------------------
  const cargarOrdenGuardada = () => {
    const guardada = localStorage.getItem(`ordenMesa_${mesaId}`);
    if (!guardada) return;

    const orden = JSON.parse(guardada);
    const nuevasCantidades = { ...cantidades };

    orden.productos.forEach((p) => {
      nuevasCantidades[p.id] = p.cantidad;
      ingredientesSeleccionados[p.id] = p.ingredientes;
    });

    setCantidades(nuevasCantidades);
    setOrdenGuardada(true);
  };

  // -----------------------------------------------------
  // Abrir / cerrar confirmación
  // -----------------------------------------------------
  const abrirConfirmacion = () => {
    if (obtenerCarrito().length === 0) {
      alert("No hay productos en la orden");
      return;
    }
    setMostrarConfirmacion(true);
  };

  const cerrarConfirmacion = () => {
    setMostrarConfirmacion(false);
  };

  // -----------------------------------------------------
  // Mandar Orden al Administrador
  // -----------------------------------------------------
  const confirmarOrdenFinal = async () => {
    try {
      const datos = {
        mesaId,
        productos: obtenerCarrito(),
        total: totalFooter,
        mesero: nombreMesero,
      };

      await axios.post("http://localhost:4000/api/ordenes", datos);

      alert("Orden enviada al administrador correctamente.");

      localStorage.removeItem(`ordenMesa_${mesaId}`);
      setCantidades({});
      setOrdenGuardada(false);
      setNombreMesero("");
      setMostrarConfirmacion(false);
    } catch (e) {
      console.log(e);
      alert("Error enviando orden");
    }
  };

  // -----------------------------------------------------
  // Confirmar ingredientes
  // -----------------------------------------------------
  const confirmarIngredientes = (tipo) => {
    const id = productoSeleccionado._id;

    setIngredientesSeleccionados((prev) => ({
      ...prev,
      [id]: tipo,
    }));

    cambiarCantidad(id, +1);
    setMostrarIngredientesModal(false);
  };

  // -----------------------------------------------------
  // Agrupar por categoría
  // -----------------------------------------------------
  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || "Sin Categoría";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  const tieneProductos = obtenerCarrito().length > 0;

  return (
    <div className="productos-wrapper">
      {/* Header */}
      <div className="header-productos">
        <div className="header-left">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
            alt="mesa"
            className="header-img"
          />
          <h2>Mesa {mesaId} - Menú del Día</h2>

          {ordenGuardada && (
            <span className="badge-orden-guardada">Orden Guardada</span>
          )}
        </div>

        <div className="header-buttons">
          <button
            className="btn-cargar-orden"
            onClick={cargarOrdenGuardada}
            disabled={!localStorage.getItem(`ordenMesa_${mesaId}`)}
          >
            Cargar Orden
          </button>

          <button className="btn-cambiar" onClick={() => navigate("/mesas")}>
            Cambiar Mesa
          </button>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="lista-productos">
        {Object.entries(productosPorCategoria).map(([categoria, lista]) => (
          <div key={categoria} className="categoria-section">
            <h3 className="categoria-titulo">{categoria}</h3>

            <div className="productos-categoria">
              {lista.map((prod) => (
                <div key={prod._id} className="producto-card">
                  <img
                    src={`http://localhost:4000/uploads/${prod.imagenUrl}`}
                    alt={prod.nombre}
                    className="producto-img"
                  />

                  <div className="producto-info">
                    <h4>{prod.nombre}</h4>
                    <p className="precio">${prod.precio}.00</p>
                  </div>

                  <div className="producto-controles">
                    <button onClick={() => cambiarCantidad(prod._id, -1)}>-</button>

                    <span>{cantidades[prod._id] || 0}</span>

                    <button
                      onClick={() => {
                        setProductoSeleccionado(prod);
                        setMostrarIngredientesModal(true);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="total-footer">Total: ${totalFooter.toFixed(2)}</div>

      {/* Botones Inferiores */}
      <div className="botones-inferiores">
        <button
          className="btn-guardar"
          onClick={guardarOrden}
          disabled={!tieneProductos}
        >
          {ordenGuardada ? "Actualizar Orden" : "Guardar Orden"}
        </button>

        <button className="btn-finalizar" onClick={abrirConfirmacion}>
          Mandar Orden al Administrador
        </button>
      </div>

      {/* Modal Confirmación */}
      {mostrarConfirmacion && (
        <ConfirmacionOrden
          mesaId={mesaId}
          carrito={obtenerCarrito()}
          total={totalFooter}
          nombreMesero={nombreMesero}
          setNombreMesero={setNombreMesero}
          onConfirmar={confirmarOrdenFinal}
          onClose={cerrarConfirmacion}
        />
      )}

      {/* Modal Ingredientes */}
      {mostrarIngredientesModal && productoSeleccionado && (
        <IngredientesModal
          producto={productoSeleccionado}
          onConfirmar={confirmarIngredientes}
          onClose={() => setMostrarIngredientesModal(false)}
        />
      )}
    </div>
  );
}

export default Productos;
