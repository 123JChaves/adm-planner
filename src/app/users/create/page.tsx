'use client'
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import React, { useState } from "react"

export default function createUser() {

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

            <h2>Cadastrar Usuário</h2><br />

            <Link href={'/users/list'}>Listar</Link>

            {/* Sucesso ao cadastrar o usuário */}    
            {success && <p style={{ color: '#086' }}>{success}</p>}

            {/* Erro ao cadastrar o usuário */}    
            {error && <p style={{ color: '#f00' }}>{error}</p>}<br /><br />

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nome">Nome: </label>
                    <input
                        type="text"
                        id="nome"
                        value={nome}
                        placeholder="Nome completo do usuário"
                        onChange={(e) => setNome(e.target.value)}
                        className="border rounded-md">
                    </input>
                </div><br />
                <div>
                    <label htmlFor="email">Email: </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        placeholder="Digitre o melhor email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded-md">
                    </input>
                </div><br />
                <button type="submit">Cadastrar</button>
            </form>

        </div>
    )

}