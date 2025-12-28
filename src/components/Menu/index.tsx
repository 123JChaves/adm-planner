'use client'
import { useState } from "react";
import Link from "next/link";

const Menu = () => {
    // Estados independentes para cada dropdown
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isEmpresaOpen, setIsEmpresaOpen] = useState(false);

    return (
        <div className="bg-blue-700 text-white p-4 w-full relative z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center">
                <h2 className="text-xl font-bold">
                    <Link href="/">Planner</Link>
                </h2>
                
                <ul className="flex space-x-8 ml-10 items-center">
                    
                    {/* Menu Cascata: Usuários */}
                    <li 
                        className="relative"
                        onMouseEnter={() => setIsUserOpen(true)}
                        onMouseLeave={() => setIsUserOpen(false)}
                    >
                        <button className="flex items-center hover:text-gray-300 focus:outline-none transition-colors py-2">
                            Usuários
                            <svg className={`ml-1 w-4 h-4 transition-transform ${isUserOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isUserOpen && (
                            <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                <Link href="/users/list" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    Listar Usuários
                                </Link>
                                <Link href="/users/create" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    Cadastrar Usuário
                                </Link>
                            </div>
                        )}
                    </li>

                    {/* Menu Cascata: Empresas */}
                    <li 
                        className="relative"
                        onMouseEnter={() => setIsEmpresaOpen(true)}
                        onMouseLeave={() => setIsEmpresaOpen(false)}
                    >
                        <button className="flex items-center hover:text-gray-300 focus:outline-none transition-colors py-2">
                            Empresas
                            <svg className={`ml-1 w-4 h-4 transition-transform ${isEmpresaOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isEmpresaOpen && (
                            <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                <Link href="/empresa/list" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    Listar Empresas
                                </Link>
                                <Link href="/empresa/create" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    Cadastrar Empresa
                                </Link>
                            </div>
                        )}
                    </li>

                    <li>
                        <Link href="#" className="hover:text-red-300 transition-colors text-red-200">Sair</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Menu;
