import React, { useState, useEffect } from 'react';
import { Lock, Camera, Info, X, UploadCloud } from 'lucide-react';

export default function Vender() {
    const [categorias, setCategorias] = useState([]);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);

    // 1. Estado para los archivos físicos y sus previsualizaciones
    const [archivos, setArchivos] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [formData, setFormData] = useState({
        titulo: '', descripcion: '', precio: '', condicion: 'Usado', categoria_id: '',
        telefono_vendedor: '', email_vendedor: '', zona_retiro: ''
    });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/categorias`)
            .then(res => res.json())
            .then(datos => {
                setCategorias(datos);
                if (datos.length > 0) setFormData(prev => ({ ...prev, categoria_id: datos[0].id }));
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // NUEVO: Manejador de selección de imágenes
    const manejarSeleccionImagenes = (e) => {
        const seleccionados = Array.from(e.target.files);

        if (archivos.length + seleccionados.length > 4) {
            setMensaje({ texto: 'Solo puedes subir hasta 4 fotos en total.', tipo: 'error' });
            return;
        }

        // Actualizamos los archivos físicos para enviarlos al backend luego
        const nuevosArchivos = [...archivos, ...seleccionados];
        setArchivos(nuevosArchivos);

        // Generamos URLs temporales para mostrar la miniatura instantánea en pantalla
        const nuevasPreviews = seleccionados.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...nuevasPreviews]);
    };

    const eliminarImagen = (index) => {
        const nuevosArchivos = archivos.filter((_, i) => i !== index);
        const nuevasPreviews = previews.filter((_, i) => i !== index);
        setArchivos(nuevosArchivos);
        setPreviews(nuevasPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (archivos.length === 0) {
            setMensaje({ texto: 'Debes incluir al menos una imagen.', tipo: 'error' });
            return;
        }

        setCargando(true);
        setMensaje({ texto: 'Subiendo imágenes y preparando tu publicación...', tipo: 'info' });

        try {
            // PASO 1: Subir las fotos a Node.js -> Cloudinary
            const urlsCloudinary = [];

            for (const archivo of archivos) {
                // FormData es el formato nativo para enviar archivos desde el navegador
                const dataArchivo = new FormData();
                dataArchivo.append('imagen', archivo);

                const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
                    method: 'POST',
                    body: dataArchivo
                });

                if (!uploadRes.ok) throw new Error("Fallo al subir una imagen");
                const jsonRes = await uploadRes.json();
                urlsCloudinary.push(jsonRes.url); // Guardamos la URL segura que nos devolvió Cloudinary
            }

            // PASO 2: Armamos el paquete final con las URLs reales para guardar en la Base de Datos
            const payload = {
                ...formData,
                imagenes: urlsCloudinary
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/articulos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMensaje({ texto: '¡Publicación enviada! Está pendiente de moderación.', tipo: 'exito' });
                // Limpiar el formulario
                setFormData({
                    titulo: '', descripcion: '', precio: '', condicion: 'Usado', categoria_id: categorias[0]?.id || '',
                    telefono_vendedor: '', email_vendedor: '', zona_retiro: ''
                });
                setArchivos([]);
                setPreviews([]);
            } else {
                setMensaje({ texto: 'Error al enviar la publicación.', tipo: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMensaje({ texto: 'Error de conexión con el servidor o fallo en la subida.', tipo: 'error' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-extrabold text-emerald-950 mb-4">Vender un tesoro</h1>
            <p className="text-gray-600 mb-8">Completa los datos de tu artículo. Nuestro equipo revisará la publicación antes de que aparezca en el Galponcito.</p>

            {mensaje.texto && (
                <div className={`p-4 mb-6 rounded-lg font-medium flex items-center gap-2 ${mensaje.tipo === 'exito' ? 'bg-emerald-100 text-emerald-800' : mensaje.tipo === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    <Info className="h-5 w-5" />
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* SECCIÓN 1: DATOS PÚBLICOS */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2">1. Detalles del Artículo</h2>
                    {/* ... inputs de titulo, precio, condicion, categoria, descripcion (Igual que antes) ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título del artículo</label>
                        <input type="text" name="titulo" required value={formData.titulo}
                            disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all" placeholder="Ej: Sillón de roble estilo Luis XV" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Precio (ARS)</label>
                            <input type="number" name="precio" required value={formData.precio} disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all" placeholder="15000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Condición</label>
                            <select name="condicion" value={formData.condicion} disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all">
                                <option value="Como Nuevo">Como Nuevo</option>
                                <option value="Usado">Usado</option>
                                <option value="Vintage">Vintage</option>
                                <option value="Para Restaurar">Para Restaurar</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                        <select name="categoria_id" value={formData.categoria_id} disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all">
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Historia / Descripción</label>
                        <textarea name="descripcion" required value={formData.descripcion} disabled={cargando} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all" placeholder="Cuenta la historia de tu objeto..."></textarea>
                    </div>
                </div>

                {/* SECCIÓN 2: FOTOS (TOTALMENTE NUEVA) */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <Camera className="h-6 w-6 text-emerald-800" />
                        <h2 className="text-xl font-bold text-gray-900">2. Galería de Fotos</h2>
                    </div>
                    <p className="text-sm text-gray-500">Sube hasta 4 imágenes claras de tu artículo. La primera será la portada.</p>

                    {/* Zona de previsualización */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => eliminarImagen(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {index === 0 && <span className="absolute bottom-2 left-2 bg-emerald-900 text-white text-[10px] px-2 py-1 rounded font-bold">PORTADA</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Botón de subida */}
                    {archivos.length < 4 && (
                        <div className={`relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors ${cargando ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'hover:bg-emerald-50 hover:border-emerald-500 cursor-pointer'}`}>
                            <UploadCloud className={`h-10 w-10 mx-auto mb-2 ${cargando ? 'text-gray-400' : 'text-emerald-600'}`} />
                            <p className="text-sm font-medium text-gray-700">Haz clic aquí para seleccionar imágenes</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG o WEBP</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                disabled={cargando}
                                onChange={manejarSeleccionImagenes}
                                className={`absolute inset-0 w-full h-full opacity-0 ${cargando ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            />
                        </div>
                    )}
                </div>

                {/* SECCIÓN 3: DATOS PRIVADOS */}
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-bl-lg">SOLO ADMIN</div>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Lock className="h-5 w-5 text-gray-600" />
                        <h2 className="text-xl font-bold text-gray-900">3. Datos de Contacto</h2>
                    </div>
                    {/* ... inputs de telefono, email, zona (Igual que antes) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono / WhatsApp</label>
                            <input type="tel" name="telefono_vendedor" required value={formData.telefono_vendedor} disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all" placeholder="Ej: 343 154..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email_vendedor" required value={formData.email_vendedor} disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all" placeholder="tu@email.com" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Zona de Retiro</label>
                            <input type="text" name="zona_retiro" required value={formData.zona_retiro} disabled={cargando} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all" placeholder="Ej: Centro de Paraná" />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={cargando}
                    className={`w-full text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-900 hover:bg-emerald-800 hover:shadow-xl transform hover:-translate-y-0.5'}`}
                >
                    {cargando ? 'Procesando tu tesoro...' : 'Enviar para Curaduría'}
                </button>
            </form>
        </main>
    );
}