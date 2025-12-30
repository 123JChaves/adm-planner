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
     <div className="flex flex-col h-screen bg-gray-200 text-black">
      <Menu />
      <div className="p-8">
        <h1 className="text-2xl font-bold">Bem-vindo, {userName || "Carregando..."}!</h1>
        <p className="mt-2 text-gray-600">Você está no painel de controle</p>
        
        <div className="mt-6">
          <Link href="/users/list" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Gerenciar Usuários
          </Link>
        </div>
      </div>
    </div>
  );
}