'use client'

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import instancia from "@/service/api";

import Link from "next/link";

import Menu from "@/components/Menu";

interface User {
    id: number;
    nome: string;
    email: string;
    createDate: string;
    updateDate: string;
}

export default function UserDetails() {

    const {id} = useParams();

    const [user, setUser] = useState<User | null>(null);

    const [error, setError] = useState<string | null>(null);

    const fetchUserDetail = async (id: string) => {
        try {
            
            const response = await instancia.get(`/users/${id}`);
        
            // console.log(response.data.user);
        
            setUser(response.data.user);

        } catch (error: any) {
            setError("Erro ao carregar o usuário")
        }
    }

    useEffect(() => {

        const userId = Array.isArray(id) ? id[0] : id;

        if (userId) {
            fetchUserDetail(userId);
        }
    }, [id])
    
    return (

        <div className="flex flex-col h-screen bg-gray-100 text-black">
            <Menu /><br />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Detalhes do Usuários</h1>
                    <Link href={'/users/list'} className="bg-cyan-500
                    text-white px-4 py-2 rounded-md hover:bg-cyan-600">Listar</Link>
                </div>
                
                {/* Erro ao exibir o usuário */}
                { error && <p className="text-red-500 mt-4">{error}</p>}

                { user && !error && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Informações do Usuário</h2>
                        <div className="text-gray-700">
                            <div className="mb-1"><span className="font-bold">ID: </span>{user.id}</div>
                            <div className="mb-1"><span className="font-bold">Nome: </span>{user.nome}</div>
                            <div className="mb-1"><span className="font-bold">Email: </span>{user.email}</div>
                            <div className="mb-1"><span className="font-bold">Cadastado em: </span>{new Date(user.createDate).toLocaleString()}</div>
                            <div className="mb-1"><span className="font-bold">Editado em: </span>{new Date(user.updateDate).toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>

    )

}