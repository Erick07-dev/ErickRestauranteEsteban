const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // Generar token
    const token = jwt.sign(
      { uid: user._id, rol: user.rol },
      "CLAVE_SECRETA",
      { expiresIn: "2h" }
    );

    //Devuelve el rol del usario
    res.json({
      msg: "Login correcto",
      token,
      rol: user.rol
    });

  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

module.exports = login;
//comentarios y mas comentarios