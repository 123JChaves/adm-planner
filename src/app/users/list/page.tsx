'use client'
import DeleteButton from "@/components/DeleteButton";
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import AlertMessage from "@/components/AlertMessage";

interface User {
    id: number,
    nome: string,
    email: string,
}

export default function Users() {

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
    
        try {
            setLoading(true)
            const response = await instancia.get('/users');
            setUsers(response.data);

        } catch (error) {
            setError("Erro ao carregar os usuários!");
        } finally {
            setLoading(false);
        }
    }

    const handleSuccess = () => {
        fetchUsers()
    }

    useEffect(() => {

        const message = sessionStorage.getItem("successMessage");

        if(message) {
            setSuccess(message);

            sessionStorage.removeItem("successMessage")
        }

    fetchUsers()
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-200 text-black h-full mx-auto">
            <Menu /><br />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Listar Usuários</h1>
                <Link href={'/users/create'} className="bg-green-500 
                text-white px-2 py-1 rounded-md hover:bg-green-600">Cadastrar</Link>
            </div>
            {/* Erro ao exibir o usuário */}
            <AlertMessage type="error" message={error} />

            {/* Sucesso ao listar o usuário */}
            <AlertMessage type="success" message={success} />

            <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Carregando dados...</span>
                    </div>
                ) : (
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

                                <td className="border border-gray-300 p-3 text-center space-x-1
                                flex justify-center items-center">
                                <Link href={`/users/${user.id}`} className="bg-blue-500
                                text-white px-2 py-1 rounded-md hover:bg-blue-600">Visualizar</Link>
                                <Link href={`/users/${user.id}/edit`} className="bg-yellow-500
                                text-white px-2 py-1 rounded-md hover:bg-yellow-600">Editar</Link>
                                <DeleteButton
                                    id={String(user.id)}
                                    route="users"
                                    onSuccess={handleSuccess}
                                    setError={setError}
                                    setSuccess={setSuccess} />
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
            )}
            </div>
            </div>
        </div>
    )
}