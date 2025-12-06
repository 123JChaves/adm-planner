'use client'
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
    id: number,
    nome: string,
    email: string,
}

export default function Users() {

    const [error, setError] = useState<string | null>(null);

    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
    
        try {
        
            const response = await instancia.get('/users');
        
            console.log(response);
        
            setUsers(response.data);

        } catch (error) {
            setError("Erro ao carregar os usuários!");
        }
    }

    useEffect(() => {
    fetchUsers()
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-black h-full mx-auto">
            <Menu /><br />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Listar Usuários</h1>
                <Link href={'/users/create'} className="bg-green-500 
                text-white px-4 py-2 rounded-md hover:bg-green-600">Cadastrar</Link>
            </div>
            {/* Erro ao exibir o usuário */}    
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-3 text-left">ID: </th>
                        <th className="border border-gray-300 p-3 text-left">Nome: </th>
                        <th className="border border-gray-300 p-3 text-left">Email: </th>
                        <th className="border border-gray-300 p-3 text-center">Ações: </th>
                    </tr>
                </thead>
                <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-3">{user.id}</td>
                                <td className="border border-gray-300 p-3">{user.nome}</td>
                                <td className="border border-gray-300 p-3">{user.email}</td>
                                <td className="border border-gray-300 p-3">
                                <Link href={`/users/${user.id}`} className="bg-blue-500
                                text-white px-4 py-2 rounded-md hover:bg-blue-600">Visualizar</Link>
                                Editar Apagar</td>
                            </tr>
                        ))}
                </tbody>
            </table>
            </div>
            </div>
        </div>
    )
}