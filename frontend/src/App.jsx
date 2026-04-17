import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, ShoppingCart, User } from 'lucide-react';
import Home from './pages/Home';
import Vender from './pages/Vender';
import Admin from './pages/Admin';
import Detalle from './pages/Detalle';
import Login from './pages/login';

function NavbarGlobal() {
  const [searchParams] = useSearchParams();
  const categoriaActual = searchParams.get('categoria'); // Vemos si hay categoría

  // Si el usuario recarga la página con una búsqueda previa, la mostramos en el input
  const [textoBusqueda, setTextoBusqueda] = useState(searchParams.get('busqueda') || '');
  const navigate = useNavigate();

  const manejarBusqueda = (e) => {
    if (e.key === 'Enter') {
      let url = '/?';
      // Mantenemos la búsqueda
      if (textoBusqueda.trim() !== '') {
        url += `busqueda=${textoBusqueda}&`;
      }
      // ¡Y MANTENEMOS LA CATEGORÍA SI EXISTE!
      if (categoriaActual) {
        url += `categoria=${categoriaActual}`;
      }
      navigate(url);
    }
  };
  const irACategorias = (e) => {
    e.preventDefault();
    // Si estamos en la Home, bajamos suavemente
    if (window.location.pathname === '/') {
      document.getElementById('seccion-categorias')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Si estamos en otra página, volvemos a la home con un aviso en la URL
      navigate('/?scroll=categorias');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/">
              <img src="/logo-galponcito.png" alt="El Galponcito" className="h-25 w-auto" />
            </Link>
          </div>

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

          <div className="flex items-center space-x-6 text-gray-500">
            <button className="flex items-center hover:text-emerald-700 transition">
              <MapPin className="h-5 w-5" />
              <span className="hidden lg:block ml-2 text-sm">Paraná, ER</span>
            </button>
            <button className="hover:text-emerald-700 transition"><ShoppingCart className="h-5 w-5" /></button>
            <button className="hover:text-emerald-700 transition bg-gray-100 p-2 rounded-full"><User className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900">
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