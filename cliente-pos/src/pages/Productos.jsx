import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; 

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
  const [listaMeseros, setListaMeseros] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarIngredientesModal, setMostrarIngredientesModal] = useState(false);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState({});

  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});

  useEffect(() => {
    cargarProductos();
    cargarMeseros();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/productos");
      setProductos(res.data);
      const inicial = {};
      res.data.forEach((p) => (inicial[p.id] = 0)); 
      setCantidades(inicial);
    } catch (error) {
      console.log("Error cargando productos:", error);
    }
  };

  const cargarMeseros = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/usuarios");
      setListaMeseros(res.data);
    } catch (error) {
      console.log("Error cargando meseros:", error);
    }
  };

  const toggleCategoria = (categoria) => {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [categoria]: !prev[categoria] 
    }));
  };

  // -----------------------------------------------------
  // 1. Cambiar cantidad (Botones +/-)
  // -----------------------------------------------------
  const cambiarCantidad = (id, delta) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    setCantidades((prev) => {
      const cantidadActual = prev[id] || 0;
      const nuevaCantidad = cantidadActual + delta;

      if (nuevaCantidad < 0) return prev;

      if (delta > 0 && nuevaCantidad > producto.stock) {
        alert(`⚠️ Solo quedan ${producto.stock} unidades de "${producto.nombre}".`);
        return prev;
      }

      return { ...prev, [id]: nuevaCantidad };
    });
  };

  // -----------------------------------------------------
  // 2. NUEVA FUNCIÓN: Manejar Input Manual
  // -----------------------------------------------------
  const handleInputCantidad = (id, valorInput) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    // Si el usuario borra todo, dejamos vacío temporalmente (o 0)
    if (valorInput === "") {
        setCantidades((prev) => ({ ...prev, [id]: 0 }));
        return;
    }

    let nuevaCantidad = parseInt(valorInput, 10);

    // Evitar NaNs y negativos
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) nuevaCantidad = 0;

    // VALIDACIÓN DE STOCK
    if (nuevaCantidad > producto.stock) {
        alert(`⚠️ Stock insuficiente. Máximo disponible: ${producto.stock}`);
        nuevaCantidad = producto.stock; // Ajustamos al máximo posible
    }

    setCantidades((prev) => ({ ...prev, [id]: nuevaCantidad }));
  };

  const obtenerCarrito = () => {
    return productos
      .filter((p) => cantidades[p.id] > 0)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: Number(p.precio),
        cantidad: cantidades[p.id],
        ingredientes: ingredientesSeleccionados[p.id] || "normal"
      }));
  };

  const totalFooter = productos.reduce(
    (acc, p) => acc + (cantidades[p.id] || 0) * Number(p.precio || 0),
    0
  );

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

  const abrirConfirmacion = () => {
    if (obtenerCarrito().length === 0) {
      alert("No hay productos en la orden");
      return;
    }
    setMostrarConfirmacion(true);
  };

  const cerrarConfirmacion = () => setMostrarConfirmacion(false);

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
      if (e.response && e.response.data && e.response.data.error) {
         alert("❌ " + e.response.data.error);
      } else {
         alert("Error enviando orden");
      }
    }
  };

  const confirmarIngredientes = (tipo) => {
    const id = productoSeleccionado.id;
    setIngredientesSeleccionados((prev) => ({ ...prev, [id]: tipo }));
    cambiarCantidad(id, +1);
    setMostrarIngredientesModal(false);
  };

  const productosPorCategoria = productos.reduce((acc, producto) => {
    const categoria = producto.categoria || "Sin Categoría";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  const tieneProductos = obtenerCarrito().length > 0;

  return (
    <div className="productos-wrapper">
      <div className="header-productos">
        <div className="header-left">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
            alt="mesa"
            className="header-img"
          />
          <h2>Mesa {mesaId} - Menú del Día</h2>
          {ordenGuardada && <span className="badge-orden-guardada">Orden Guardada</span>}
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

      <div className="lista-productos">
        {Object.entries(productosPorCategoria).map(([categoria, lista]) => {
          const estaAbierta = categoriasExpandidas[categoria];

          return (
            <div key={categoria} className="categoria-section">
              <button 
                className={`categoria-header-btn ${estaAbierta ? 'activo' : ''}`}
                onClick={() => toggleCategoria(categoria)}
              >
                <span className="categoria-titulo-texto">{categoria} ({lista.length})</span>
                {estaAbierta ? <FiChevronUp size={24}/> : <FiChevronDown size={24}/>}
              </button>

              {estaAbierta && (
                <div className="productos-categoria fade-in">
                  {lista.map((prod) => (
                    <div key={prod.id} className="producto-card">
                      <img
                        src={`http://localhost:4000/uploads/${prod.imagenUrl}`}
                        alt={prod.nombre}
                        className="producto-img"
                      />
                      <div className="producto-info">
                        <h4>{prod.nombre}</h4>
                        <p className="precio">${prod.precio}</p>
                        <small className="stock-label">Stock: {prod.stock}</small>
                      </div>

                      <div className="producto-controles">
                        <button onClick={() => cambiarCantidad(prod.id, -1)}>-</button>

                        {/* --- CAMBIO: INPUT MANUAL --- */}
                        <input
                            type="number"
                            className="input-cantidad-manual"
                            value={cantidades[prod.id] || 0}
                            onChange={(e) => handleInputCantidad(prod.id, e.target.value)}
                            min="0"
                            max={prod.stock}
                        />
                        {/* --------------------------- */}

                        <button
                          onClick={() => {
                              if ((cantidades[prod.id] || 0) >= prod.stock) {
                                  return; 
                              }
                              setProductoSeleccionado(prod);
                              setMostrarIngredientesModal(true);
                          }}
                          disabled={(cantidades[prod.id] || 0) >= prod.stock}
                          style={{ 
                              opacity: (cantidades[prod.id] || 0) >= prod.stock ? 0.3 : 1,
                              cursor: (cantidades[prod.id] || 0) >= prod.stock ? 'not-allowed' : 'pointer'
                          }}
                        >
                          +
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

      <div className="total-footer">Total: ${totalFooter.toFixed(2)}</div>

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

      {mostrarConfirmacion && (
        <ConfirmacionOrden
          mesaId={mesaId}
          carrito={obtenerCarrito()}
          total={totalFooter}
          nombreMesero={nombreMesero}
          setNombreMesero={setNombreMesero}
          listaMeseros={listaMeseros}
          onConfirmar={confirmarOrdenFinal}
          onClose={cerrarConfirmacion}
        />
      )}

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