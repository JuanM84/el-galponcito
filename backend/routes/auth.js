const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.post('/login', async (req, res) => {
    try {
        // 1. Asegurarnos de que extraemos las variables exactas
        const { email, password } = req.body;

        // MICRÓFONO: Esto nos va a imprimir en la consola de Render qué está recibiendo
        console.log("Intento de login con email:", email, "y password:", password);

        // 2. Buscar al usuario
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log("Fallo: Usuario no existe");
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = result.rows[0];

        // 3. Comparar las contraseñas
        const validPassword = await bcrypt.compare(password, usuario.password);

        if (!validPassword) {
            console.log("Fallo: Contraseña incorrecta");
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 4. Si todo está bien, generar el token (asegurate de tener jwt importado)
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        console.log("¡Éxito! Token generado");
        res.json({ token, usuario: { email: usuario.email } });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;