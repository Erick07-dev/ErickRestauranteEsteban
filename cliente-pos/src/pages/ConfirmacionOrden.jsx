import React from "react";
import "./ConfirmacionOrden.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

function ConfirmacionOrden({ 
  mesaId, 
  carrito, 
  total, 
  nombreMesero, 
  setNombreMesero, 
  onConfirmar, 
  onNuevaOrden, 
  onClose 
}) {

  const generarPDF = (ancho = 80) => {
    // Convertir mm → puntos del PDF (1 mm = 2.835 pts)
    const pdfWidth = ancho * 2.835;

    const doc = new jsPDF({
      unit: "mm",
      format: [ancho, 300] // largo variable
    });

    // ----- ENCABEZADO -----
    doc.setFontSize(14);
    doc.text("BARBACOA ARI", ancho / 2, 10, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Mesa: ${mesaId}`, 5, 20);
    doc.text(`Mesero: ${nombreMesero || "No especificado"}`, 5, 26);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, 32);

    // Dirección
    doc.text("Estamos ubicados:", 5, 42);
    doc.text("Viernes y Sábados:", 5, 48);
    doc.text("Blvrd Ramón G. Bonfil & Av. 2", 5, 54);
    doc.text("Domingos:", 5, 60);
    doc.text("Av. Cerezo Col. Luz Del Carmen", 5, 66);
    doc.text("(Tianquis)", 5, 72);

    doc.line(3, 78, ancho - 3, 78);

    // -------------------------------
    // TABLA AUTOMÁTICA
    // -------------------------------

    const filas = carrito.map(item => [
      `${item.nombre} x${item.cantidad}`,
      `$${(item.precio * item.cantidad).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 82,
      head: [["Producto", "Total"]],
      body: filas,
      theme: "striped",
      styles: { fontSize: 9, cellPadding: 1 },
      tableWidth: ancho - 6
    });

    let finalY = doc.lastAutoTable.finalY + 6;

    // Total
    doc.setFontSize(12);
    doc.text(`Total: $${total.toFixed(2)}`, 5, finalY);

    // Mensaje final
    doc.setFontSize(10);
    doc.text("¡Gracias por su visita!", 5, finalY + 10);

    // Descargar PDF
    doc.save(`recibo_mesa_${mesaId}.pdf`);
  };

  return (
    <div className="modal-overlay confirmacion-overlay">
      <div className="modal-confirmacion">

        <h1>Confirmar Orden</h1>

        <div className="recibo-productos">
          {carrito.length === 0 ? (
            <p>No hay productos</p>
          ) : (
            carrito.map((item, index) => (
              <div key={index} className="recibo-item">
                <div>{item.nombre} x{item.cantidad}</div>
                <div>${(item.precio * item.cantidad).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>

        <strong>Total: ${total.toFixed(2)}</strong>

        <div className="recibo-mesero-input">
          <label>Nombre del Mesero:</label>
          <input
            type="text"
            value={nombreMesero}
            onChange={(e) => setNombreMesero(e.target.value)}
            placeholder="Ingresa tu nombre"
          />
        </div>

        <div className="recibo-botones">

          {/* PDF 80 mm */}
          <button 
            className="btn-descargar"
            onClick={() => generarPDF(80)}
          >
            🧾 PDF Ticket 80mm
          </button>

          {/* PDF Tamaño Carta */}
          <button 
            className="btn-descargar"
            onClick={() => generarPDF(210)}
          >
            📄 PDF Tamaño Carta
          </button>

          <button 
            className="btn-confirmar-orden"
            onClick={onConfirmar}
            disabled={!nombreMesero.trim() || carrito.length === 0}
          >
            Confirmar Orden
          </button>

          <button className="btn-nueva-orden" onClick={onNuevaOrden}>
            Nueva Orden
          </button>

          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>

        </div>
      </div>
    </div>
  );
}

export default ConfirmacionOrden;
