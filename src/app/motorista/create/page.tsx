"use client";

import { useState } from "react";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";
import { useRouter } from "next/navigation";

export default function CreateMotorista() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErros({});
        setError(null);
        setSuccess(null);

        const novosErros: Record<string, string> = {};
        if (!nome?.trim()) novosErros.nome = "Preencha o nome completo";
        if (!cpf?.trim()) novosErros.cpf = "Preencha o CPF";

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            setError("Preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);

        try {
            // Payload seguindo o padrão de envio direto na raiz para o backend processar
            await instancia.post("/motorista", { 
                nome: nome.trim(), 
                cpf: cpf.trim() 
            });
            
            setSuccess("Motorista cadastrado com sucesso!");
            
            setNome("");
            setCpf("");

            setTimeout(() => {
                router.push("/motorista/create");
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao cadastrar motorista.");
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black mx-auto">
            <Menu />
            
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Cadastrar Motorista</h1>
                    <Link 
                        href="/motorista/list" 
                        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 font-bold text-sm transition-all shadow-sm"
                    >
                        Voltar para Lista
                    </Link>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CAMPO NOME */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm mb-1">Nome Completo:</label>
                            <input 
                                type="text"
                                autoComplete="off"
                                value={nome}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    if (erros.nome) setErros(prev => ({ ...prev, nome: "" }));
                                }}
                                className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                    erros.nome ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                                }`}
                                placeholder="Nome do motorista"
                            />
                            {erros.nome && <span className="text-red-500 text-xs font-bold mt-1">{erros.nome}</span>}
                        </div>

                        {/* CAMPO CPF */}
                        <div className="flex flex-col">
                            <label className="font-bold text-sm mb-1">CPF:</label>
                            <input 
                                type="text"
                                autoComplete="off"
                                value={cpf}
                                onChange={(e) => {
                                    setCpf(e.target.value);
                                    if (erros.cpf) setErros(prev => ({ ...prev, cpf: "" }));
                                }}
                                placeholder="000.000.000-00"
                                className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                    erros.cpf ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                                }`}
                            />
                            {erros.cpf && <span className="text-red-500 text-xs font-bold mt-1">{erros.cpf}</span>}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded font-bold text-white transition-all mt-4 shadow-md ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loading ? "SALVANDO..." : "SALVAR MOTORISTA"}
                    </button>
                </form>
            </div>
        </div>
    );
}