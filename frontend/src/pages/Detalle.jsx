import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, ArrowLeft, Phone, Mail, Edit3, Save, X, CheckCircle, XCircle } from 'lucide-react';

export default function Detalle() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const esAdmin = searchParams.get('modo') === 'admin';

    const [articulo, setArticulo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalNotificacion, setModalNotificacion] = useState({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' });
    const [emailContacto, setEmailContacto] = useState('');
    const [estadoContacto, setEstadoContacto] = useState({ cargando: false, mensaje: '', error: '' });

    // Estados para el MODO EDICIÓN
    const [editando, setEditando] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const urlFetch = esAdmin ? `http://localhost:3001/api/articulos/admin/${id}` : `http://localhost:3001/api/articulos/${id}`;
        const opcionesFetch = {};

        if (esAdmin) {
            const token = localStorage.getItem('token_galponcito');
            opcionesFetch.headers = { 'Authorization': `Bearer ${token}` };

            // Si es admin, también traemos las categorías por si quiere cambiarla
            fetch('http://localhost:3001/api/categorias')
                .then(res => res.json())
                .then(data => setCategorias(data));
        }

        fetch(urlFetch, opcionesFetch)
            .then(res => {
                if (res.status === 401 || res.status === 403) throw new Error("Acceso denegado. Tu sesión expiró.");
                if (!res.ok) throw new Error("Artículo no encontrado");
                return res.json();
            })
            .then(datos => {
                setArticulo(datos);
                // Preparamos el formulario con los datos actuales
                setFormData({
                    titulo: datos.titulo,
                    precio: datos.precio,
                    descripcion: datos.descripcion,
                    condicion: datos.condicion,
                    categoria_id: datos.categoria_id,
                    estado: datos.estado
                });
                setCargando(false);
            })
            .catch(err => {
                setArticulo({ error: err.message });
                setCargando(false);
            });
    }, [id, esAdmin]);

    const manejarCambio = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const guardarCambios = async () => {
        const token = localStorage.getItem('token_galponcito');
        try {
            const response = await fetch(`http://localhost:3001/api/articulos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const articuloActualizado = await response.json();
                setArticulo(prev => ({ ...prev, ...articuloActualizado }));
                setEditando(false);
                setModalNotificacion({
                    abierto: true,
                    titulo: '¡Cambios Guardados!',
                    mensaje: 'El artículo ha sido actualizado correctamente en la base de datos.',
                    tipo: 'exito'
                });
            } else {
                setModalNotificacion({
                    abierto: true,
                    titulo: 'Error',
                    mensaje: 'No se pudieron guardar los cambios. Intenta nuevamente.',
                    tipo: 'error'
                });
            }
        } catch (error) {
            console.error("Error:", error);
            setModalNotificacion({
                abierto: true,
                titulo: 'Error de Conexión',
                mensaje: 'No se pudo establecer conexión con el servidor. Revisa tu red.',
                tipo: 'error'
            });
        }
    };
    const manejarContacto = async (e) => {
        e.preventDefault();
        setEstadoContacto({ cargando: true, mensaje: '', error: '' });

        try {
            const response = await fetch(`http://localhost:3001/api/articulos/${id}/interesar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailContacto })
            });

            const data = await response.json();

            if (response.ok) {
                setEstadoContacto({ cargando: false, mensaje: data.mensaje, error: '' });
                setEmailContacto(''); // Limpiamos el input
            } else {
                setEstadoContacto({ cargando: false, mensaje: '', error: data.error });
            }
        } catch (error) {
            setEstadoContacto({ cargando: false, mensaje: '', error: 'Error de conexión.' });
        }
    };

    if (cargando) return <main className="max-w-7xl mx-auto px-4 py-12 text-center animate-pulse text-gray-500">Cargando tesoro...</main>;
    if (articulo?.error) return <main className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500 font-bold">{articulo.error}</main>;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            <Link to={esAdmin ? "/admin" : "/"} className="inline-flex items-center text-emerald-800 hover:text-emerald-600 font-medium mb-8 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                {esAdmin ? "Volver al Panel de Control" : "Volver a la tienda"}
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                    {/* COLUMNA IZQUIERDA: IMÁGENES */}
                    <div className="bg-gray-50 p-8 flex items-center justify-center border-r border-gray-100">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-white">
                            <img src={articulo.imagenes[0]} alt={articulo.titulo} className="w-full h-full object-contain" />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: INFO Y EDICIÓN */}
                    <div className="p-8 md:p-12 flex flex-col">

                        {/* CONTROLES DE EDICIÓN ADMIN */}
                        {esAdmin && (
                            <div className="mb-6 flex justify-end">
                                {!editando ? (
                                    <button onClick={() => setEditando(true)} className="flex items-center text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-100 transition">
                                        <Edit3 className="h-4 w-4 mr-2" /> Editar Artículo
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditando(false)} className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition">
                                            <X className="h-4 w-4 mr-1" /> Cancelar
                                        </button>
                                        <button onClick={guardarCambios} className="flex items-center text-white bg-emerald-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-800 transition">
                                            <Save className="h-4 w-4 mr-1" /> Guardar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                                {articulo.condicion}
                            </span>

                            {/* TÍTULO */}
                            {editando ? (
                                <input type="text" name="titulo" value={formData.titulo} onChange={manejarCambio} className="w-full text-3xl font-extrabold text-gray-900 border-b-2 border-emerald-500 focus:outline-none mb-2" />
                            ) : (
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{articulo.titulo}</h1>
                            )}

                            {/* PRECIO */}
                            {editando ? (
                                <div className="flex items-center mt-4">
                                    <span className="text-2xl font-bold text-emerald-900 mr-2">$</span>
                                    <input type="number" name="precio" value={formData.precio} onChange={manejarCambio} className="w-1/2 text-2xl font-bold text-emerald-900 border-b-2 border-emerald-500 focus:outline-none" />
                                </div>
                            ) : (
                                <div className="text-4xl font-black text-emerald-900 mt-4">${new Intl.NumberFormat('es-AR').format(articulo.precio)}</div>
                            )}
                        </div>

                        <div className="prose prose-emerald text-gray-600 mb-8">
                            {/* DESCRIPCIÓN */}
                            {editando ? (
                                <textarea name="descripcion" value={formData.descripcion} onChange={manejarCambio} rows="5" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-emerald-500" />
                            ) : (
                                <p>{articulo.descripcion}</p>
                            )}
                        </div>

                        {/* CAJA AMARILLA DEL ADMIN (DATOS PRIVADOS) */}
                        {esAdmin && articulo.telefono_vendedor && (
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 mb-8 shadow-sm">
                                <h3 className="font-bold text-amber-900 mb-4 flex items-center border-b border-amber-200 pb-2">
                                    <ShieldCheck className="h-5 w-5 mr-2" /> Datos Internos (Solo Admin)
                                </h3>
                                <div className="space-y-3 text-sm text-amber-800">
                                    <p className="flex items-center"><Phone className="h-4 w-4 mr-2" /> <strong>Tel: </strong> {articulo.telefono_vendedor}</p>
                                    <p className="flex items-center"><Mail className="h-4 w-4 mr-2" /> <strong>Email: </strong> {articulo.email_vendedor}</p>
                                    <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> <strong>Zona: </strong> {articulo.zona_retiro}</p>

                                    {editando && (
                                        <div className="mt-4 pt-4 border-t border-amber-200">
                                            <label className="block text-xs font-bold mb-1">Cambiar Categoría:</label>
                                            <select name="categoria_id" value={formData.categoria_id} onChange={manejarCambio} className="w-full p-2 rounded border border-amber-300 bg-white">
                                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!esAdmin && (
                            <div className="mt-auto">
                                <button
                                    onClick={() => { setModalAbierto(true); setEstadoContacto({ cargando: false, mensaje: '', error: '' }); }}
                                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Contactar al Vendedor
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            {modalAbierto && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in-up">

                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setModalAbierto(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contactar Vendedor</h2>

                        {estadoContacto.mensaje ? (
                            <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center">
                                <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                                <p className="font-bold mb-1">¡Solicitud recibida!</p>
                                <p className="text-sm">{estadoContacto.mensaje}</p>
                                <button onClick={() => setModalAbierto(false)} className="mt-6 w-full border border-emerald-600 text-emerald-800 font-bold py-2 rounded-lg hover:bg-emerald-100">Cerrar</button>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 text-sm mb-6">
                                    Déjanos tu email y te enviaremos de forma segura los datos de contacto del dueño de <strong>{articulo.titulo}</strong>.
                                </p>

                                {estadoContacto.error && (
                                    <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{estadoContacto.error}</p>
                                )}

                                <form onSubmit={manejarContacto} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tu correo electrónico</label>
                                        <input
                                            type="email"
                                            required
                                            value={emailContacto}
                                            onChange={(e) => setEmailContacto(e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={estadoContacto.cargando}
                                        className={`w-full text-white font-bold py-3 rounded-xl transition-colors ${estadoContacto.cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-900 hover:bg-emerald-800'}`}
                                    >
                                        {estadoContacto.cargando ? 'Procesando...' : 'Solicitar Datos'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
            {modalNotificacion.abierto && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-6">

                            {/* Ícono dinámico */}
                            <div className={`p-4 rounded-full mb-4 ${modalNotificacion.tipo === 'exito' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {modalNotificacion.tipo === 'exito' ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{modalNotificacion.titulo}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">{modalNotificacion.mensaje}</p>
                        </div>

                        <button
                            onClick={() => setModalNotificacion({ ...modalNotificacion, abierto: false })}
                            className={`w-full text-white font-bold py-3 rounded-xl transition-colors shadow-lg ${modalNotificacion.tipo === 'exito' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}