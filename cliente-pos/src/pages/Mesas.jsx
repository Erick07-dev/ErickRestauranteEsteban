import { useNavigate } from "react-router-dom";
import "./Mesas.css";

function Mesas() {
  const navigate = useNavigate();

  const mesas = [1, 2, 3, 4, 5];

  const handleClick = (idMesa) => {
    navigate(`/productos/${idMesa}`);
  };

  return (
    <div className="mesas-wrapper">

      {/* Texto de bienvenida moderno */}
      <div className="bienvenida">
        <h1>🍽️ Bienvenido al Restaurante</h1>
        <p>Selecciona una mesa para comenzar tu orden</p>
      </div>

      {/* Grid de mesas */}
      <div className="mesas-container">
        {mesas.map((num) => (
          <div key={num} className="mesa-card" onClick={() => handleClick(num)}>
            <div className="mesa-icon">🪑</div>
            <h3>Mesa {num}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mesas;
