import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Admin from "./pages/Admin";
import AgregarProducto from "./pages/AgregarProducto";
import EditarProducto from "./pages/EditarProducto";
import Productos from "./pages/Productos";
import ConfirmacionOrden from "./pages/ConfirmacionOrden";
import IngredientesModal from "./pages/IngredientesModal";
import AdminOrdenes from "./pages/AdminOrdenes";

import Mesas from "./pages/Mesas"; // Ruta de mesas

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="admin/admin-ordenes" element={<AdminOrdenes/>}/>
        

        {/* Mesas */}
        <Route path="/mesas" element={<Mesas />} />

        {/* Productos según la mesa */}
        <Route path="/productos/:mesaId" element={<Productos />} />

        {/* Productos sin mesa (opcional) */}
        <Route path="/productos" element={<Productos />} />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/editar-producto/:id" element={<EditarProducto />} />
        <Route path="/admin/agregar-producto" element={<AgregarProducto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
