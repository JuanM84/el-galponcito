import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Tag, Heart, ShoppingCart, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'; // Sumamos las flechitas

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const terminoBusqueda = searchParams.get('busqueda');
    const categoriaSeleccionada = searchParams.get('categoria');
    const paginaActual = parseInt(searchParams.get('pagina')) || 1; // NUEVO: Leemos la página

    const [categorias, setCategorias] = useState([]);
    const [articulos, setArticulos] = useState([]);
    const [totalPaginas, setTotalPaginas] = useState(1); // NUEVO: Estado para el total de páginas
    const [cargando, setCargando] = useState(true);

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio);
    };

    useEffect(() => {
        setCargando(true);

        let urlArticulos = new URL('http://localhost:3001/api/articulos');
        if (terminoBusqueda) urlArticulos.searchParams.append('busqueda', terminoBusqueda);
        if (categoriaSeleccionada) urlArticulos.searchParams.append('categoria', categoriaSeleccionada);
        urlArticulos.searchParams.append('pagina', paginaActual); // NUEVO: Mandamos la página al backend

        Promise.all([
            fetch('http://localhost:3001/api/categorias').then(res => res.json()),
            fetch(urlArticulos.toString()).then(res => res.json())
        ])
            .then(([datosCategorias, respuestaArticulos]) => {
                setCategorias(datosCategorias);
                // OJO ACÁ: La respuesta cambió de formato
                setArticulos(respuestaArticulos.datos || []);
                setTotalPaginas(respuestaArticulos.paginacion?.totalPaginas || 1);
                setCargando(false);
                if (searchParams.get('scroll') === 'categorias') {
                    setTimeout(() => {
                        document.getElementById('seccion-categorias')?.scrollIntoView({ behavior: 'smooth' });
                    }, 300); // Le damos 300ms a React para que dibuje la pantalla primero
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            })
            .catch((error) => {
                console.error("Error buscando datos:", error);
                setCargando(false);
            });
    }, [terminoBusqueda, categoriaSeleccionada, paginaActual]); // Reacciona si cambia la página

    const filtrarPorCategoria = (slug) => {
        const nuevosParametros = new URLSearchParams(searchParams);
        if (categoriaSeleccionada === slug) {
            nuevosParametros.delete('categoria');
        } else {
            nuevosParametros.set('categoria', slug);
        }
        // Si cambiamos de categoría, SIEMPRE volvemos a la página 1
        nuevosParametros.set('pagina', '1');
        setSearchParams(nuevosParametros);
    };

    const cambiarPagina = (nuevaPagina) => {
        const nuevosParametros = new URLSearchParams(searchParams);
        nuevosParametros.set('pagina', nuevaPagina);
        setSearchParams(nuevosParametros);
    };

    let tituloSeccion = "Recién llegados";
    if (terminoBusqueda && categoriaSeleccionada) {
        const nombreCat = categorias.find(c => c.slug === categoriaSeleccionada)?.nombre;
        tituloSeccion = `Resultados para "${terminoBusqueda}" en ${nombreCat}`;
    } else if (terminoBusqueda) {
        tituloSeccion = `Resultados para "${terminoBusqueda}"`;
    } else if (categoriaSeleccionada) {
        tituloSeccion = `Explorando ${categorias.find(c => c.slug === categoriaSeleccionada)?.nombre}`;
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* HERO SECTION (Se oculta si hay filtros o si NO estamos en la página 1) */}
            {(!terminoBusqueda && !categoriaSeleccionada && paginaActual === 1) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    {/* ... Código de tu Hero (Mismo de siempre) ... */}
                    <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold tracking-wider mb-6">MERCADO CURADO</span>
                        <h1 className="text-5xl lg:text-6xl font-extrabold text-emerald-950 leading-tight mb-6">Dale una segunda vida a lo que ya no usas.</h1>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg">Encuentra tesoros únicos cerca tuyo. Un marketplace pensado para quienes valoran la calidad y la historia de cada objeto.</p>
                    </div>
                    <div className="relative">
                        <div className="aspect-[4/5] bg-emerald-800 rounded-[2rem] overflow-hidden relative shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900 to-emerald-700 opacity-60"></div>
                            <div className="absolute bottom-8 left-8 right-8 bg-white p-4 rounded-xl shadow-lg flex items-center space-x-4">
                                <div className="bg-emerald-100 p-3 rounded-full"><ShieldCheck className="h-6 w-6 text-emerald-700" /></div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Compra protegida</p>
                                    <p className="text-xs text-gray-500">Garantía de devolución por 10 días</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CATEGORÍAS (Se ocultan si hay búsqueda, pero se mantienen al paginar) */}
            {!terminoBusqueda && (
                <div id="seccion-categorias" className="mb-16 scroll-mt-24">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorías</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {categorias.map((cat) => (
                            <button key={cat.id} onClick={() => filtrarPorCategoria(cat.slug)} className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border transition-all group ${categoriaSeleccionada === cat.slug ? 'bg-emerald-900 border-emerald-900 text-white shadow-emerald-200' : 'bg-white border-gray-100 text-gray-800 hover:shadow-md'}`}>
                                <div className={`p-4 rounded-full mb-3 transition-colors ${categoriaSeleccionada === cat.slug ? 'bg-emerald-800' : 'bg-gray-50 group-hover:bg-emerald-50'}`}>
                                    <Tag className={`h-6 w-6 ${categoriaSeleccionada === cat.slug ? 'text-emerald-100' : 'text-emerald-800'}`} />
                                </div>
                                <span className="font-medium text-sm">{cat.nombre}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* SECCIÓN DE PRODUCTOS */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{tituloSeccion}</h2>
                    </div>
                    {(terminoBusqueda || categoriaSeleccionada) && (
                        <button onClick={() => setSearchParams({})} className="text-emerald-700 hover:text-emerald-800 font-medium text-sm">Limpiar filtros ✕</button>
                    )}
                </div>

                {cargando ? (
                    <p className="text-gray-500 animate-pulse">Buscando tesoros...</p>
                ) : articulos.length === 0 ? (
                    <div className="bg-gray-50 py-16 text-center rounded-2xl border border-gray-100">
                        <SearchX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No encontramos nada por aquí</h3>
                        <p className="text-gray-500">Intenta con otra categoría o limpia los filtros.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {articulos.map((articulo) => (
                                <Link to={`/articulo/${articulo.id}`} key={articulo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all group cursor-pointer block">
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        <img src={articulo.imagenes[0]} alt={articulo.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=Sin+Imagen' }} />
                                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-800 uppercase tracking-wider">{articulo.condicion}</span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{articulo.titulo}</h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-lg font-bold text-emerald-900">{formatearPrecio(articulo.precio)}</span>
                                            <ShoppingCart className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* NUEVO: CONTROLES DE PAGINACIÓN */}
                        {totalPaginas > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-8">
                                <button
                                    onClick={() => cambiarPagina(paginaActual - 1)}
                                    disabled={paginaActual === 1}
                                    className={`p-2 rounded-full border ${paginaActual === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-emerald-900 hover:bg-emerald-50 transition-colors'}`}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                <span className="text-sm font-medium text-gray-600">
                                    Página <strong className="text-gray-900">{paginaActual}</strong> de {totalPaginas}
                                </span>

                                <button
                                    onClick={() => cambiarPagina(paginaActual + 1)}
                                    disabled={paginaActual === totalPaginas}
                                    className={`p-2 rounded-full border ${paginaActual === totalPaginas ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-emerald-900 hover:bg-emerald-50 transition-colors'}`}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}