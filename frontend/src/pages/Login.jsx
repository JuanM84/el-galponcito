import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const manejarLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const datos = await response.json();

            if (response.ok) {
                // 1. GUARDAMOS EL TOKEN EN EL NAVEGADOR
                localStorage.setItem('token_galponcito', datos.token);
                // 2. NOS VAMOS AL ADMIN
                navigate('/admin');
            } else {
                setError(datos.error || 'Credenciales incorrectas');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-8 w-8 text-emerald-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Acceso Administrador</h1>
                    <p className="text-gray-500 text-sm mt-2">Ingresa tus credenciales maestras</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={manejarLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="admin@elgalponcito.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl transition-colors">
                        Entrar al Panel
                    </button>
                </form>
            </div>
        </main>
    );
}