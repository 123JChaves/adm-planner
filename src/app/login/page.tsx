"use client"; // Indica que este é um Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const response = await fetch('http://localhost:8081/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao autenticar');
            }

            // 1. Salva o Token nos Cookies (expira em 8h como no seu backend)
            Cookie.set('token', data.token, { expires: 1/3 }); // 1/3 de dia = 8 horas
            
            // 2. Salva dados básicos do usuário se desejar
            localStorage.setItem('users', JSON.stringify(data.user));

            // 3. Redireciona para o dashboard ou home
            router.push('/home');
            
        } catch (err: any) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="flex flex-col justify-center items-center h-screen bg-gray-200 text-black">
            <form 
                onSubmit={handleLogin} 
                className="flex flex-col gap-4 w-full max-w-sm bg-white p-8 shadow-md rounded-lg"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Entrar no Sistema</h2>
                
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">E-mail:</label>
                    <input
                        type="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                        className="border p-2 rounded-md border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 outline-none"
                    />
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">Senha:</label>
                    <input
                        type="password"
                        placeholder="Sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)} 
                        required
                        className="border p-2 rounded-md border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 outline-none"
                    />
                </div>

                {erro && <span className="text-red-500 text-sm font-medium">{erro}</span>}

                <button 
                    type="submit" 
                    disabled={carregando} 
                    className="mt-4 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold disabled:bg-blue-300 transition-colors"
                >
                    {carregando ? 'Autenticando...' : 'Entrar'}
                </button>
            </form>
        </main>
    );
}
