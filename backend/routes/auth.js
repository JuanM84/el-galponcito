const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { SECRETO } = require('../middleware/authMiddleware');

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

module.exports = router;