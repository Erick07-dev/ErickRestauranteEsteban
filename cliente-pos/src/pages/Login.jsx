import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../auth.css";

export default function Login() {
  const [form, setForm] = useState({ correo: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      // 1️⃣ LOGIN
      const res = await axios.post("http://localhost:4000/api/auth/login", form);

      // 2️⃣ GUARDAR TOKEN Y ROL
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("rol", res.data.rol);

      // 3️⃣ REGISTRAR LOGINS EN MYSQL
      await fetch("http://localhost:4000/api/mysql/login_registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: form.correo }),
      });

      // 4️⃣ REDIRECCIÓN
      if (res.data.rol === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/Mesas";
      }

    } catch (err) {
      alert(err.response?.data?.msg || "Error en el inicio de sesión");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Iniciar Sesión</h2>

        <input
          name="correo"
          placeholder="Correo"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          onChange={handleChange}
        />

        <button onClick={login}>Entrar</button>

        <p>
          ¿No tienes cuenta?{" "}
          <Link className="link" to="/registro">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}
