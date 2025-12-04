const express = require("express");
const router = express.Router();
const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =======================
//    REGISTRO
// =======================
router.post("/registrar", async (req, res) => {
    console.log("⚠️ RUTA /registrar EJECUTADA");

    const { nombre, correo, password } = req.body;

    try {
        const existe = await Usuario.findOne({ correo });
        if (existe) return res.status(400).json({ msg: "El correo ya está registrado" });

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        let rol = "usuario";

        if (correo.toLowerCase().includes("admin")) {
            rol = "admin";
        }

        const nuevo = new Usuario({
            nombre,
            correo,
            password: hash,
            rol
        });

        await nuevo.save();

        res.json({ msg: "Usuario registrado correctamente", rol });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error en servidor", error });
    }
});

// =======================
//        LOGIN
// =======================
router.post("/login", async (req, res) => {
    const { correo, password } = req.body;

    try {
        const user = await Usuario.findOne({ correo });
        if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(400).json({ msg: "Contraseña incorrecta" });

        const token = jwt.sign(
            { uid: user._id, rol: user.rol },
            "CLAVE_SECRETA",
            { expiresIn: "2h" }
        );

        res.json({
            msg: "Login correcto",
            token,
            rol: user.rol
        });

    } catch (err) {
        res.status(500).json({ msg: "Error en el servidor" });
    }
});

module.exports = router;
