const jwt = require('jsonwebtoken');

const SECRETO = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Necesitas iniciar sesión.' });
    }

    try {
        const usuarioVerificado = jwt.verify(token, SECRETO);
        req.usuario = usuarioVerificado;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken, SECRETO };