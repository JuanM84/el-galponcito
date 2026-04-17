const express = require('express');
const router = express.Router();

// Importamos las funciones del controlador
const {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
} = require('../controllers/categoriasController');

// Importamos el candado de seguridad
const { verificarToken } = require('../middleware/authMiddleware');

// Definimos las rutas
router.get('/', getCategorias); // Pública
router.post('/', verificarToken, createCategoria); // Admin
router.put('/:id', verificarToken, updateCategoria); // Admin
router.delete('/:id', verificarToken, deleteCategoria); // Admin

module.exports = router;