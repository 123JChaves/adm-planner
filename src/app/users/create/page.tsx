'use client'
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import React, { useState } from "react";
import AlertMessage from "@/components/AlertMessage";

export default function CreateUser() {

    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [confirmarSenha, setConfirmarSenha] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const handleSubmit = async(event: React.FormEvent) => {
        
        event.preventDefault();
        setError(null);
        setSuccess(null);

        // 1. Validação de Complexidade (Mínimo 6 caracteres, 1 letra, 1 número, 1 símbolo)
        const regexSenha = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        
        if (!regexSenha.test(senha)) {
            setError("A senha deve ter no mínimo 6 caracteres, incluindo pelo menos uma letra, um número e um caractere especial (@$!%*#?&).");
            return;
        }

        // 2. Validação de Igualdade das senhas
        if (senha !== confirmarSenha) {
            setError("As senhas não coincidem!");
            return;
        }


        try {

            const response = await instancia.post("/users", {
                nome: nome,
                email: email,
                senha: senha
            });

            // console.log(response.data);

            setSuccess(response.data.message);

            setNome("");
            setEmail("");
            setSenha("");
            setConfirmarSenha("");
            
        } catch (error: any) {
            // console.log(error.response.data);

            setError(error.response?.data?.message  || "Erro ao cadastrar o usuário");
        }
        
    }

    return (
        <div className="flex flex-col h-screen bg-gray-200 text-black">
            <Menu />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Cadastrar Usuários</h1>
                    <Link href={'/users/list'} className="bg-cyan-500 text-white px-2 py-1 rounded-md hover:bg-cyan-600">Listar</Link>
                </div>
            
                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-6">
                    <div className="mb-4">
                        <label htmlFor="nome" className="block text-sm font-semibold">Nome: </label>
                        <input
                            type="text"
                            id="nome"
                            value={nome}
                            placeholder="Nome completo do usuário"
                            onChange={(e) => setNome(e.target.value)}
                            className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-semibold">Email: </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            placeholder="Digite o melhor email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="senha" className="block text-sm font-semibold">Senha: </label>
                        <input
                            type="password"
                            id="senha"
                            value={senha}
                            autoComplete="new-password"
                            placeholder="Mínimo 6 caracteres, letra, número e símbolo"
                            onChange={(e) => {
                                setSenha(e.target.value);
                                if(error) setError(null); // Limpa erro ao digitar
                            }}
                            className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="confirmarSenha" className="block text-sm font-semibold">Confirmar Senha:</label>
                        <input
                            type="password"
                            id="confirmarSenha"
                            value={confirmarSenha}
                            autoComplete="new-password"
                            placeholder="Repita sua senha"
                            onChange={(e) => {
                                setConfirmarSenha(e.target.value);
                                if(error) setError(null); // Limpa erro ao digitar
                            }}
                            className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                            required
                        />
                    </div>

                    <button type="submit" className="w-full md:w-auto px-3 p-1 bg-green-500 text-white rounded-md hover:bg-green-600 font-bold transition-colors">
                        Cadastrar Usuário
                    </button>
                </form>
            </div>
        </div>
    );
}

