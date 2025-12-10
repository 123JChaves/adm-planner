'use client'
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";

export default function EditUser() {

    const {id} = useParams();

    const [nome, setNome] = useState<string>("");

    const [email, setEmail] = useState<string>("");

    const [error, setError] = useState<string | null>(null);

    const [success, setSuccess] = useState<string | null>(null);

    const fetchUserDetail = async() => {
        try {
            
            const response = await instancia.get(`/users/${id}`);
        
            // console.log(response.data.user);

            setNome(response.data.user.nome);

            setEmail(response.data.user.email);
        
            

        } catch (error: any) {
            setError(error.response?.data?.message || "Erro ao carregar o usuário");
        }
    }

    const handleSubmit = async(event: React.FormEvent) => {
        
        event.preventDefault();

        setError(null);

        setSuccess(null);

        try {

            const response = await instancia.put(`/users/${id}`, {
                nome: nome,
                email: email,
            });

            console.log(response.data);

            setSuccess(response.data.message);
            
        } catch (error: any) {
            console.log(error.response.data);

            setError(error.response?.data?.message  || "Erro ao atualizar o usuário");
        }
        
    }

        useEffect(() => {
    
            if (id) {
                fetchUserDetail();
            }
        }, [id]);

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-black">

            <Menu /><br />

            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Editar Usuário</h1>
                    <span>
                    <Link href={'/users/list'} className="bg-cyan-500
                    text-white px-4 py-2 me-1 rounded-md hover:bg-cyan-600">Listar</Link>
                    <Link href={`/users/${id}`} className="bg-blue-500
                    text-white px-4 py-2 me-1 rounded-md hover:bg-blue-600">Visualizar</Link>
                    </span>
                </div>
            
            {/* Erro ao editar o usuário */}
            <AlertMessage type="error" message={error} />

            {/* Sucesso ao editar o usuário */}
            <AlertMessage type="success" message={success} />

            <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md
            round-lg p-6">
                <div className="mb-4">
                    <label htmlFor="nome" className="block text-sm font-semibold">Nome: </label>
                    <input
                        type="text"
                        id="nome"
                        value={nome}
                        placeholder="Nome completo do usuário"
                        onChange={(e) => setNome(e.target.value)}
                        className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm
                        focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none">
                    </input>
                </div><br />
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-semibold">Email: </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        placeholder="Digite o melhor email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm
                        focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none">
                    </input>
                </div><br />
                <button type="submit" className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Salvar</button>
            </form>

            </div>
        </div>
    )

}