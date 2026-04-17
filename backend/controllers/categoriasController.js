const pool = require('../config/db');

const getCategorias = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

const createCategoria = async (req, res) => {
    try {
        const { nombre, slug } = req.body;
        const result = await pool.query(
            'INSERT INTO categorias (nombre, slug) VALUES ($1, $2) RETURNING *',
            [nombre, slug]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, slug } = req.body;
        const result = await pool.query(
            'UPDATE categorias SET nombre = $1, slug = $2 WHERE id = $3 RETURNING *',
            [nombre, slug, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        // Ojo: Esto fallará si hay artículos usando la categoría (Integridad referencial)
        await pool.query('DELETE FROM categorias WHERE id = $1', [id]);
        res.json({ mensaje: 'Categoría eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'No se puede eliminar la categoría porque tiene artículos asociados.' });
    }
};

module.exports = { getCategorias, createCategoria, updateCategoria, deleteCategoria };