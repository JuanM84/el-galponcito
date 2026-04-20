import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, User, Menu, X } from 'lucide-react';
import Home from './pages/Home';
import Vender from './pages/Vender';
import Admin from './pages/Admin';
import Detalle from './pages/Detalle';
import Login from './pages/Login';

function NavbarGlobal() {
  const [searchParams] = useSearchParams();
  const categoriaActual = searchParams.get('categoria');

  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get('busqueda') || '');
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navigate = useNavigate();

  const manejarBusqueda = (e) => {
    if (e.key === 'Enter') {
      let url = '/?';
      if (textoBusqueda.trim() !== '') {
        url += `busqueda=${textoBusqueda}&`;
      }
      if (categoriaActual) {
        url += `categoria=${categoriaActual}`;
      }
      navigate(url);
      setMenuAbierto(false);
    }
  };

  const irACategorias = (e) => {
    e.preventDefault();
    setMenuAbierto(false);
    if (window.location.pathname === '/') {
      document.getElementById('seccion-categorias')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/?scroll=categorias');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" onClick={() => setMenuAbierto(false)}>
              <img src="/logo-galponcito.png" alt="El Galponcito" className="h-25 w-auto" />
            </Link>
          </div>

          {/* MENÚ DE ESCRITORIO */}
          <div className="hidden md:flex flex-1 items-center justify-center px-10">
            <div className="flex space-x-8 mr-8 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-emerald-700 transition">Inicio</Link>
              <button onClick={irACategorias} className="hover:text-emerald-700 transition font-medium">Categorías</button>
              <Link to="/vender" className="hover:text-emerald-700 transition font-bold text-emerald-800">Vender</Link>
            </div>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                onKeyDown={manejarBusqueda}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                placeholder="Buscar articulos..."
              />
            </div>
          </div>

          {/* ICONOS DERECHA */}
          <div className="flex items-center space-x-4 md:space-x-6 text-gray-500">
            <button className="hidden md:flex items-center hover:text-emerald-700 transition">
              <MapPin className="h-5 w-5" />
              <span className="ml-2 text-sm">Paraná, ER</span>
            </button>
            <button className="hover:text-emerald-700 transition"><ShoppingCart className="h-5 w-5" /></button>
            <button className="hover:text-emerald-700 transition bg-gray-100 p-2 rounded-full"><User className="h-5 w-5" /></button>

            {/* BOTÓN HAMBURGUESA */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-4 shadow-lg absolute w-full">

          {/* Buscador Móvil */}
          <div className="relative w-full pt-2">
            <div className="absolute inset-y-0 mt-2 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              onKeyDown={manejarBusqueda}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="Buscar articulos..."
            />
          </div>

          {/* Links Móviles */}
          <div className="flex flex-col space-y-3 pt-2">
            <Link
              to="/"
              onClick={() => setMenuAbierto(false)}
              className="px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              Inicio
            </Link>
            <button
              onClick={irACategorias}
              className="text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              Categorías
            </button>
            <Link
              to="/vender"
              onClick={() => setMenuAbierto(false)}
              className="px-3 py-2 rounded-md text-base font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            >
              Vender un artículo
            </Link>
          </div>

          {/* Ubicación Móvil */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center px-3 text-gray-500">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Paraná, Entre Ríos</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-gray-900">
        <NavbarGlobal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vender" element={<Vender />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/articulo/:id" element={<Detalle />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;