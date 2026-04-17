const express = require('express');
const cors = require('cors');
require('dotenv').config();
const articulosRoutes = require('./routes/articulos');
const categoriasRoutes = require('./routes/categorias');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/articulos', articulosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor de El Galponcito corriendo en puerto ${PORT}`);
});