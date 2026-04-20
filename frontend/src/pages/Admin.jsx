import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Trash2, Plus, X, Mail, CheckCircle, XCircle, Tag, ShoppingBag, Clock } from 'lucide-react';

export default function Admin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('pendientes'); // 'pendientes', 'publicados', 'categorias', 'vendidos'
    const [articulos, setArticulos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalConfirmacion, setModalConfirmacion] = useState({ abierto: false, titulo: '', mensaje: '', accion: null, tipo: 'peligro' });

    // Estados para Modales y Formularios
    const [modalInteresados, setModalInteresados] = useState({ abierto: false, lista: [], titulo: '' });
    const [nuevaCat, setNuevaCat] = useState({ nombre: '', slug: '' });

    const token = localStorage.getItem('token_galponcito');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        cargarDatos();
    }, [tab]);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const endpoint = tab === 'categorias' ? 'categorias' : `articulos/${tab}`;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const datos = await res.json();
            if (tab === 'categorias') setCategorias(datos);
            else setArticulos(datos);
        } catch (e) { console.error("Error cargando datos:", e); }
        setCargando(false);
    };

    // --- ACCIONES DE MODERACIÓN Y VENTA ---
    const manejarEstado = async (id, nuevoEstado) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articulos/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (res.ok) {
                // Removemos el artículo de la lista actual para dar feedback visual
                setArticulos(articulos.filter(a => a.id !== id));
            }
        } catch (e) { console.error("Error al actualizar estado:", e); }
    };

    const verInteresados = async (id, titulo) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articulos/${id}/interesados`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lista = await res.json();
            setModalInteresados({ abierto: true, lista, titulo });
        } catch (e) { console.error("Error cargando interesados:", e); }
    };

    // --- GESTIÓN DE CATEGORÍAS ---
    const crearCategoria = async (e) => {
        e.preventDefault();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(nuevaCat)
        });
        if (res.ok) { cargarDatos(); setNuevaCat({ nombre: '', slug: '' }); }
    };

    const confirmarBorrarCategoria = (id) => {
        setModalConfirmacion({
            abierto: true,
            titulo: 'Eliminar Categoría',
            mensaje: '¿Seguro que quieres eliminar esta categoría? Si hay artículos usándola, la base de datos no te dejará hacerlo por seguridad.',
            accion: () => ejecutarBorrarCategoria(id),
            tipo: 'peligro'
        });
    };

    const ejecutarBorrarCategoria = async (id) => {
        setModalConfirmacion({ ...modalConfirmacion, abierto: false }); // Cerramos modal
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categorias/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarDatos();
    };

    const confirmarBorrarPermanente = (id) => {
        setModalConfirmacion({
            abierto: true,
            titulo: 'Eliminar Definitivamente',
            mensaje: '⚠️ Esta acción es irreversible. Se eliminará el artículo, su historial y sus fotos de forma permanente.',
            accion: () => ejecutarBorrarPermanente(id),
            tipo: 'peligro'
        });
    };

    const ejecutarBorrarPermanente = async (id) => {
        setModalConfirmacion({ ...modalConfirmacion, abierto: false });
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articulos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setArticulos(articulos.filter(a => a.id !== id));
        }
    };
    return (
        <main className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-extrabold text-emerald-950">Panel de Administración</h1>
            </div>

            {/* SELECTOR DE PESTAÑAS */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
                <button onClick={() => setTab('pendientes')} className={`pb-4 px-4 font-bold whitespace-nowrap ${tab === 'pendientes' ? 'border-b-2 border-emerald-600 text-emerald-900' : 'text-white'}`}>
                    Nuevos por revisar
                </button>
                <button onClick={() => setTab('publicados')} className={`pb-4 px-4 font-bold whitespace-nowrap ${tab === 'publicados' ? 'border-b-2 border-emerald-600 text-emerald-900' : 'text-white'}`}>
                    Inventario Activo
                </button>
                <button onClick={() => setTab('vendidos')} className={`pb-4 px-4 font-bold whitespace-nowrap ${tab === 'vendidos' ? 'border-b-2 border-emerald-600 text-emerald-900' : 'text-white'}`}>
                    Vendidos (Archivo)
                </button>
                <button onClick={() => setTab('categorias')} className={`pb-4 px-4 font-bold whitespace-nowrap ${tab === 'categorias' ? 'border-b-2 border-emerald-600 text-emerald-900' : 'text-white'}`}>
                    Categorías
                </button>
            </div>

            {cargando ? (
                <div className="text-center py-20 text-gray-500 animate-pulse font-medium">Cargando datos del Galponcito...</div>
            ) : (
                <>
                    {/* VISTA DE CATEGORÍAS */}
                    {tab === 'categorias' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-900"><Plus className="h-6 w-6" /> Añadir Categoría</h2>
                                <form onSubmit={crearCategoria} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre (ej: Decoración)"
                                        value={nuevaCat.nombre}
                                        onChange={e => setNuevaCat({ ...nuevaCat, nombre: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        required
                                    />
                                    <input type="text" placeholder="slug-automatico" value={nuevaCat.slug} className="w-full border p-3 rounded-xl bg-gray-50 text-gray-400" readOnly />
                                    <button className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl transition-colors">Crear Categoría</button>
                                </form>
                            </div>
                            <div className="space-y-3">
                                {categorias.map(c => (
                                    <div key={c.id} className="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50 group hover:border-emerald-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Tag className="h-5 w-5 text-emerald-600" />
                                            <span className="font-bold text-gray-800">{c.nombre}</span>
                                        </div>
                                        <button onClick={() => confirmarBorrarCategoria(c.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VISTA DE ARTÍCULOS (PENDIENTES O PUBLICADOS) */}
                    {(tab === 'pendientes' || tab === 'publicados' || tab === 'vendidos') && (
                        <div className="space-y-4">
                            {articulos.map(art => (
                                <div key={art.id} className="bg-white p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm border border-gray-100 gap-6">

                                    {/* Info del artículo (Imagen, título, precio) */}
                                    <div className="flex items-center gap-5">
                                        <img src={art.imagenes[0]} className={`w-20 h-20 object-cover rounded-2xl ${tab === 'vendidos' ? 'grayscale opacity-50' : ''}`} alt="" />
                                        <div>
                                            <h3 className={`font-bold text-lg ${tab === 'vendidos' ? 'text-gray-400 line-through' : 'text-emerald-500'}`}>{art.titulo}</h3>
                                            <p className="text-emerald-700 font-black">${new Intl.NumberFormat('es-AR').format(art.precio)}</p>
                                        </div>
                                    </div>

                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="flex flex-wrap gap-2 w-full md:w-auto">

                                        {/* BOTONES PESTAÑA PENDIENTES */}
                                        {tab === 'pendientes' && (
                                            <>
                                                <button onClick={() => manejarEstado(art.id, 'aprobado')} className="flex-1 md:flex-none bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <CheckCircle className="h-4 w-4" /> Aprobar
                                                </button>
                                                <button onClick={() => manejarEstado(art.id, 'rechazado')} className="flex-1 md:flex-none bg-red-50 hover:bg-red-100 text-red-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <XCircle className="h-4 w-4" /> Rechazar
                                                </button>
                                            </>
                                        )}

                                        {/* BOTONES PESTAÑA PUBLICADOS (INVENTARIO) */}
                                        {tab === 'publicados' && (
                                            <>
                                                <button onClick={() => verInteresados(art.id, art.titulo)} className="flex-1 md:flex-none bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <Users className="h-4 w-4" /> Interesados
                                                </button>
                                                <button onClick={() => manejarEstado(art.id, 'vendido')} className="flex-1 md:flex-none bg-amber-100 hover:bg-amber-200 text-amber-800 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                                                    Marcar Vendido
                                                </button>
                                            </>
                                        )}

                                        {/* NUEVO: Botones para la pestaña VENDIDOS */}
                                        {tab === 'vendidos' && (
                                            <>
                                                <button
                                                    onClick={() => verInteresados(art.id, art.titulo)}
                                                    className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                                                >
                                                    <Users className="h-4 w-4" /> Ver Interesados
                                                </button>
                                                <button
                                                    onClick={() => confirmarBorrarPermanente(art.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" /> Eliminar Permanente
                                                </button>
                                            </>
                                        )}

                                        {tab !== 'vendidos' && (
                                            <Link to={`/articulo/${art.id}?modo=admin`} className="bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold border">
                                                Revisar / Editar
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* MODAL DE INTERESADOS */}
            {modalInteresados.abierto && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setModalInteresados({ ...modalInteresados, abierto: false })} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Lista de Interesados</h2>
                            <p className="text-emerald-700 font-medium text-sm mt-1">{modalInteresados.titulo}</p>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-4 custom-scrollbar">
                            {modalInteresados.lista.length === 0 ? (
                                <div className="text-center py-10">
                                    <Mail className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 italic">Todavía nadie ha solicitado datos para este tesoro.</p>
                                </div>
                            ) : (
                                modalInteresados.lista.map((i, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-full shadow-sm text-emerald-700">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{i.email}</span>
                                        </div>
                                        <span className="text-[10px] uppercase font-black text-gray-400 bg-gray-200 px-2 py-1 rounded">
                                            {new Date(i.fecha_registro).toLocaleDateString('es-AR')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        <button onClick={() => setModalInteresados({ ...modalInteresados, abierto: false })} className="mt-8 w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors">
                            Entendido
                        </button>
                    </div>
                </div>
            )}
            {/* MODAL DE CONFIRMACIÓN ESTÉTICO */}
            {modalConfirmacion.abierto && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">

                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="bg-red-50 p-4 rounded-full mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{modalConfirmacion.titulo}</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">{modalConfirmacion.mensaje}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setModalConfirmacion({ ...modalConfirmacion, abierto: false })}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={modalConfirmacion.accion}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-200"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}