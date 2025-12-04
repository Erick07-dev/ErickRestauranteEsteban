// IngredientesModal.jsx
import "./ingredientesModal.css";

function IngredientesModal({ producto, onConfirmar, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content ingredientes-modal">
        <h3>{producto.nombre}</h3>
        <p>¿Este producto lleva todos los ingredientes?</p>

        <div className="ingredientes-buttons">
          <button className="btn-si" onClick={() => onConfirmar("completo")}>
            ✔️ Sí, todos los ingredientes
          </button>

          <button className="btn-no" onClick={() => onConfirmar("personalizado")}>
            ✏️ No, personalizar
          </button>
        </div>

        <button className="btn-cerrar" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default IngredientesModal;
