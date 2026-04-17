const pool = require('../config/db');

// Trae todos los articulos aprobados
const getArticulos = async (req, res) => {
    try {
        const { categoria, pagina = 1, busqueda } = req.query;
        const limite = 12;
        const offset = (pagina - 1) * limite;

        // MAGIA SQL: COUNT(*) OVER() as total_count cuenta los registros sin romper el LIMIT
        let query = `
      SELECT id, titulo, descripcion, precio, condicion, imagenes, fecha_creacion, categoria_id,
             COUNT(*) OVER() as total_count
      FROM articulos 
      WHERE estado = 'aprobado'
    `;
        const params = [];

        if (categoria) {
            params.push(categoria);
            query += ` AND categoria_id = (SELECT id FROM categorias WHERE slug = $${params.length})`;
        }

        if (busqueda) {
            params.push(`%${busqueda}%`);
            query += ` AND (titulo ILIKE $${params.length} OR descripcion ILIKE $${params.length})`;
        }

        query += ` ORDER BY fecha_creacion DESC LIMIT ${limite} OFFSET ${offset}`;

        const result = await pool.query(query, params);

        // Si hay resultados, extraemos el total. Si no, es 0.
        const totalItems = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
        const totalPaginas = Math.ceil(totalItems / limite); // Calculamos cuántas páginas de 12 entran

        // Limpiamos la columna "total_count" para no enviarle basura al Frontend
        const articulosLimpios = result.rows.map(row => {
            const { total_count, ...articulo } = row;
            return articulo;
        });

        // Ahora devolvemos un objeto completo, no solo el arreglo
        res.json({
            datos: articulosLimpios,
            paginacion: {
                totalItems,
                totalPaginas,
                paginaActual: parseInt(pagina)
            }
        });

    } catch (err) {
        console.error("Error obteniendo artículos:", err);
        res.status(500).json({ error: 'Error al obtener artículos' });
    }
};
// Crea un articulo nuevo
const createArticulo = async (req, res) => {
    try {
        const { titulo, descripcion, precio, condicion, categoria_id, imagenes, telefono_vendedor, email_vendedor, zona_retiro } = req.body;

        const vendedor_id = 2; // Simulado por ahora

        const query = `
      INSERT INTO articulos (vendedor_id, categoria_id, titulo, descripcion, precio, condicion, imagenes, estado, telefono_vendedor, email_vendedor, zona_retiro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8, $9, $10)
      RETURNING id, titulo, estado; 
      -- OJO: No devolvemos todos los datos por seguridad
    `;

        // Aseguramos que 'imagenes' sea un array (en el frontend le mandaremos un array)
        const values = [vendedor_id, categoria_id, titulo, descripcion, precio, condicion, imagenes, telefono_vendedor, email_vendedor, zona_retiro];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error guardando artículo:", err);
        res.status(500).json({ error: 'Error interno al crear la publicación' });
    }
};
// Trae un articulo aprobado por id
const getArticuloById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
      SELECT a.id, a.titulo, a.descripcion, a.precio, a.condicion, a.imagenes, a.fecha_creacion, c.nombre as categoria_nombre
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.id = $1 AND a.estado = 'aprobado'
    `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error buscando artículo:", err);
        res.status(500).json({ error: 'Error al obtener el detalle' });
    }
};
// Trae un articulo pendiente de aprobacion por id
const getArticuloAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        // Pedimos a.* (incluye email, teléfono, zona) y no filtramos por estado
        const query = `
      SELECT a.*, c.nombre as categoria_nombre
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.id = $1
    `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error buscando artículo para admin:", err);
        res.status(500).json({ error: 'Error al obtener el detalle' });
    }
};
// Trae los articulos pendientes de aprobacion
const getPendientes = async (req, res) => {
    try {
        const query = `
      SELECT a.*, c.nombre as categoria_nombre 
      FROM articulos a 
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.estado = 'pendiente' 
      ORDER BY a.fecha_creacion ASC
    `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error buscando pendientes:", err);
        res.status(500).json({ error: 'Error al obtener artículos pendientes' });
    }
};
// Trae los articulos publicados
const getPublicados = async (req, res) => {
    try {
        // Cambiamos 'fecha_actualizacion' por 'fecha_creacion'
        const query = `
      SELECT a.*, c.nombre as categoria_nombre 
      FROM articulos a 
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.estado = 'aprobado' 
      ORDER BY a.fecha_creacion DESC
    `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        // IMPORTANTE: Esto imprimirá el error real en tu terminal de Docker
        console.error("Error detallado en getPublicados:", err);
        res.status(500).json({ error: 'Error al obtener inventario' });
    }
};
// Edita un articulo
const editarArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, precio, condicion, categoria_id, estado } = req.body;

        const query = `
      UPDATE articulos 
      SET titulo = $1, descripcion = $2, precio = $3, condicion = $4, 
          categoria_id = $5, estado = $6, fecha_actualizacion = CURRENT_TIMESTAMP 
      WHERE id = $7 
      RETURNING *
    `;
        const values = [titulo, descripcion, precio, condicion, categoria_id, estado, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al editar' });
    }
};

// Cambia el estado de un artículo (Aprobar/Rechazar)
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // 1. EL GUARDIA: Agregamos 'vendido' a la lista VIP
        const estadosPermitidos = ['aprobado', 'rechazado', 'vendido'];

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido. Solo se permite: aprobado, rechazado o vendido.' });
        }

        // 2. Ejecutamos la actualización
        const query = 'UPDATE articulos SET estado = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [estado, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: 'Error del servidor al cambiar el estado' });
    }
};
// Registra un interesado
const registrarInteresado = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Ingresa un email válido (ej: nombre@dominio.com o .com.ar)'
            });
        }

        const query = 'INSERT INTO interesados (email, articulo_id) VALUES ($1, $2) RETURNING id';
        await pool.query(query, [email, id]);

        res.json({ mensaje: '¡Genial! Hemos registrado tu interés. Te enviaremos los datos del vendedor pronto.' });
    } catch (err) {
        console.error("Error al registrar interesado:", err);
        res.status(500).json({ error: 'Error del servidor al procesar la solicitud.' });
    }
};
// Trae los interesados de un articulo
const getInteresados = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
      SELECT email, fecha_registro 
      FROM interesados 
      WHERE articulo_id = $1 
      ORDER BY fecha_registro DESC
    `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener interesados' });
    }
};
// Trae los articulos vendidos
const getVendidos = async (req, res) => {
    try {
        const query = `
      SELECT a.*, c.nombre as categoria_nombre 
      FROM articulos a 
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.estado = 'vendido' 
      ORDER BY a.fecha_creacion DESC
    `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener archivo de ventas' });
    }
};

// Elimina definitivamente (Hard Delete)
const eliminarArticulo = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM articulos WHERE id = $1', [id]);
        res.json({ mensaje: 'Artículo eliminado permanentemente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el artículo' });
    }
};

module.exports = { getArticulos, createArticulo, getPendientes, actualizarEstado, getArticuloById, getArticuloAdminById, getPublicados, editarArticulo, registrarInteresado, getInteresados, getVendidos, eliminarArticulo };