import axios from "axios";

export const finalizarCompra = async (carrito, total) => {
  try {
    const res = await axios.post(
      "http://localhost:4000/api/ordenes/finalizar", // Cambiado a 4000
      { carrito, total },
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ticket.pdf");
    document.body.appendChild(link);
    link.click();

  } catch (error) {
    console.log("❌ Error:", error);
  }
};
