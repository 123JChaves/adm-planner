'use client'
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import React, { useState } from "react"

export default function CreateUser() {

    const [nome, setNome] = useState<string>("");

    const [email, setEmail] = useState<string>("");

    const [error, setError] = useState<string | null>(null);

    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async(event: React.FormEvent) => {
        
        event.preventDefault();

        setError(null);

        setSuccess(null);

        try {

            const response = await instancia.post("/users", {
                nome: nome,
                email: email,
            });

            // console.log(response.data);

            setSuccess(response.data.message);

            setNome("");
            setEmail("");
            
        } catch (error: any) {
            // console.log(error.response.data);

            setError(error.response.data.message);
        }
        
    }

    return (
         <div className="flex flex-col h-screen bg-gray-100 text-black">

            <Menu /><br />

            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Cadastrar Usuários</h1>
                    <Link href={'/users/list'} className="bg-blue-500
                    text-white px-4 py-2 rounded-md hover:bg-blue-600">Listar</Link>
                </div>
            
            {/* Erro ao exibir o usuário */}
            {error && <p className="text-red-500 mt-4">{error}</p>}

            {/* Sucesso ao cadastrar o usuário */}
            {success && <p className="text-green-500 mt-4">{success}</p>}

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
                <button type="submit" className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600">Cadastrar</button>
            </form>

            </div>
        </div>
    )

}