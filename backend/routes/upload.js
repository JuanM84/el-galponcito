const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('imagen'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se envió ninguna imagen' });
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'elgalponcito_articulos',
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            },
            (error, result) => {
                if (error) {
                    console.error("Error de Cloudinary:", error);
                    return res.status(500).json({ error: 'Error en la nube al subir' });
                }
                res.json({ url: result.secure_url });
            }
        );

        stream.end(req.file.buffer);

    } catch (error) {
        console.error("Error general en upload:", error);
        res.status(500).json({ error: 'Error del servidor al procesar la imagen' });
    }
});

module.exports = router;