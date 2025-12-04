import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../auth.css";

export default function Registro() {
  const [form, setForm] = useState({ nombre: "", correo: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registrar = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/registrar", form);
      alert(res.data.msg);

    } catch (err) {
      alert(err.response.data.msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Crear Cuenta</h2>

        <input name="nombre" placeholder="Nombre completo" onChange={handleChange} />
        <input name="correo" placeholder="Correo" onChange={handleChange} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />

        <button onClick={registrar}>Registrarse</button>

        <p>¿Ya tienes cuenta? <Link className="link" to="/login">Iniciar sesión</Link></p>
      </div>
    </div>
  );
}
