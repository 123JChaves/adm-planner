'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/service/api";
import Link from "next/link";
import Menu from "@/components/Menu";
import DeleteButton from "@/components/DeleteButton";
import AlertMessage from "@/components/AlertMessage";

interface User {
    id: number;
    nome: string;
    email: string;
    createDate: string;
    updateDate: string;
}

export default function UserDetails() {

    const {id} = useParams();

    const router = useRouter();

    const [success, setSuccess] = useState<string | null>(null);

    const [user, setUser] = useState<User | null>(null);

    const [error, setError] = useState<string | null>(null);

    const fetchUserDetail = async (id: string) => {
        try {
            
            const response = await instancia.get(`/users/${id}`);
        
            // console.log(response.data.user);
        
            setUser(response.data.user);

        } catch (error: any) {
            setError(error.response?.data?.message || "Erro ao carregar o usuário");
        }
    }

    const handleSuccess = () => {

        sessionStorage.setItem("successMessage", "Registro apagado com sucesso");

        router.push("/users/list")
    }
    useEffect(() => {

        if(id) {

        const userId = Array.isArray(id) ? id[0] : id;


        fetchUserDetail(userId);
        }

    }, [id]);
    
    return (

        <div className="flex flex-col h-screen bg-gray-100 text-black">
            <Menu /><br />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Detalhes do Usuários</h1>
                    <span className="flex space-x-1">
                    <Link href={'/users/list'} className="bg-cyan-500
                    text-white px-2 py-1 me-1 rounded-md hover:bg-cyan-600">Listar</Link>
                    <Link href={`/users/${id}/edit`} className="bg-yellow-500
                    text-white px-2 py-1 me-1 rounded-md hover:bg-yellow-600">Editar</Link>
                    { user && !error && (
                    <DeleteButton
                        id={String(user.id)}
                        route="users"
                        onSuccess={handleSuccess}
                        setError={setError}
                        setSuccess={setSuccess}
                    />)}
                    </span>
                </div>
                
                {/* Erro ao exibir o usuário */}
                <AlertMessage type="error" message={error} />


                { user && !error && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Informações do Usuário</h2>
                        <div className="text-gray-700">
                            <div className="mb-1"><span className="font-bold">
                                ID: </span>{user.id}</div>
                            <div className="mb-1"><span className="font-bold">
                                Nome: </span>{user.nome}</div>
                            <div className="mb-1"><span className="font-bold">
                                Email: </span>{user.email}</div>
                            <div className="mb-1"><span className="font-bold">
                                Cadastado em: </span>{new Date(user.createDate).toLocaleString()}</div>
                            <div className="mb-1"><span className="font-bold">
                                Editado em: </span>{new Date(user.updateDate).toLocaleString()}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>

    )

}