"use client";

import { useEffect, useState } from "react";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Save, Loader2 } from "lucide-react";

export default function MotoristaEdit() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");

    useEffect(() => {
        const fetchDataMotorista = async () => {
            try {
                const res = await instancia.get(`/motorista/${id}`);
                // Certifique-se de acessar o campo correto conforme seu backend
                const data = res.data.motorista || res.data;
                setNome(data.nome);
                setCpf(data.cpf);
            } catch (err: any) {
                setError("Erro ao sincronizar os dados do motorista.");
            }
        };
        if (id) fetchDataMotorista();
    }, [id]);

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
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            await instancia.put(`/motorista/${id}`, { nome, cpf });
            setSuccess("Motorista atualizado com sucesso!");
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao atualizar motorista.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black mx-auto">
            <Menu /><br />
            <div className="flex-1 px-2 py-6 max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Editar Motorista</h1>
                    <div className="flex gap-2">
                        <Link 
                            href="/motorista/list" 
                            title="Voltar"
                            className="text-black hover:text-cyan-800 transition-colors p-1"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <Link 
                            href={`/motorista/${id}`} 
                            title="Visualizar"
                            className="text-black hover:text-cyan-800 transition-colors p-1"
                        >
                            <Eye size={24} />
                        </Link>
                    </div>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Nome do Motorista:</label>
                        <input 
                            type="text"
                            value={nome}
                            onChange={(e) => {
                                setNome(e.target.value);
                                if (erros.nome) setErros(prev => ({ ...prev, nome: "" }));
                            }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.nome ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                        />
                        {erros.nome && <span className="text-red-500 text-xs font-bold mt-1">{erros.nome}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">CPF:</label>
                        <input 
                            type="text"
                            value={cpf}
                            onChange={(e) => {
                                setCpf(e.target.value);
                                if (erros.cpf) setErros(prev => ({ ...prev, cpf: "" }));
                            }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.cpf ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                        />
                        {erros.cpf && <span className="text-red-500 text-xs font-bold mt-1">{erros.cpf}</span>}
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                            loading 
                            ? 'bg-gray-100 border-gray-100 text-gray-400' 
                            : 'bg-white border-black text-black hover:bg-black hover:text-white'
                        }`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Save size={20} />
                                <span>ATUALIZAR MOTORISTA</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}