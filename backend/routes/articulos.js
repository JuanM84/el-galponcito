const express = require('express');
const router = express.Router();
const {
    getArticulos,
    createArticulo,
    getPendientes,
    actualizarEstado,
    getArticuloById,
    getArticuloAdminById,
    getPublicados,
    editarArticulo,
    registrarInteresado,
    getVendidos,
    eliminarArticulo
} = require('../controllers/articulosController');
const { getInteresados } = require('../controllers/articulosController');
const { verificarToken } = require('../middleware/authMiddleware');

// 1. Rutas públicas generales
router.get('/', getArticulos);
router.post('/', createArticulo);
router.post('/:id/interesar', registrarInteresado);

// 2. Rutas específicas / estáticas (¡VAN ANTES QUE EL COMODÍN!)
router.get('/pendientes', verificarToken, getPendientes);
router.get('/publicados', verificarToken, getPublicados);
router.get('/:id/interesados', verificarToken, getInteresados);
router.get('/vendidos', verificarToken, getVendidos);

// 3. Rutas con parámetros / comodines (EL COMODÍN VA AL FINAL)
router.get('/:id', getArticuloById);
router.get('/admin/:id', verificarToken, getArticuloAdminById);
router.patch('/:id/estado', verificarToken, actualizarEstado);
router.put('/:id', verificarToken, editarArticulo);
router.delete('/:id', verificarToken, eliminarArticulo);

module.exports = router;