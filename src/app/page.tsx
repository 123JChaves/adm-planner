'use client'

import Menu from "@/components/Menu";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() { // Nome alterado para HomePage para melhor semântica
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.nome);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      <Menu />
      <div className="p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold">Bem-vindo, {userName || "Carregando..."}!</h1>
        <p className="mt-2 text-gray-600 mb-8">Você está no painel de controle</p>

        {/* Grid de Botões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/users/list" className="bg-blue-600 text-white px-4 py-4 rounded shadow hover:bg-blue-700 text-center font-semibold transition-colors">
            Gerenciar Usuários
          </Link>
          <Link href="/motorista/list" className="bg-blue-600 text-white px-4 py-4 rounded shadow hover:bg-blue-700 text-center font-semibold transition-colors">
            Gerenciar Motoristas
          </Link>
          <Link href="/carro/list" className="bg-blue-600 text-white px-4 py-4 rounded shadow hover:bg-blue-700 text-center font-semibold transition-colors">
            Gerenciar Carros
          </Link>
          <Link href="/empresa/list" className="bg-blue-600 text-white px-4 py-4 rounded shadow hover:bg-blue-700 text-center font-semibold transition-colors">
            Gerenciar Empresas
          </Link>
          <Link href="/solicitacoes/list" className="bg-blue-600 text-white px-4 py-4 rounded shadow hover:bg-blue-700 text-center font-semibold transition-colors">
            Gerenciar Solicitações
          </Link>
          <Link href="/corridas/list" className="bg-blue-600 text-white px-4 py-4 rounded shadow hover:bg-blue-700 text-center font-semibold transition-colors">
            Gerenciar Corridas
          </Link>
        </div>
      </div>
    </div>
  );
}