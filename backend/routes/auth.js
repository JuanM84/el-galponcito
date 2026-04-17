const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { SECRETO } = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const ADMIN_EMAIL = 'admin@elgalponcito.com';
    const ADMIN_PASS = 'admin';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        const token = jwt.sign({ rol: 'admin', email: ADMIN_EMAIL }, SECRETO, { expiresIn: '6h' });
        res.json({ mensaje: 'Login exitoso', token });
    } else {
        res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    }
});

router.get('/crear-admin', async (req, res) => {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await pool.query(
            "INSERT INTO usuarios (email, password, rol) VALUES ('juan@elgalponcito.com', $1, 'admin')",
            [hash]
        );
        res.json({ mensaje: "Admin Juan creado con éxito con clave admin123" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;