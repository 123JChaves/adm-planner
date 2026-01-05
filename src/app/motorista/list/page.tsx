"use client";

import { useEffect, useState } from "react";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";
import DeleteButton from "@/components/DeleteButton";

// Reutilizando as interfaces conforme o padrão tratado
interface Carro {
    id: number;
    modelo: string;
    placa: string;
    cor: string;
}

interface Motorista {
    id: number;
    nome: string;
    cpf: string;
    carroAtual?: Carro; // Carro em uso
    carros?: Carro[];   // Lista de todos os carros vinculados
}

export default function Motorista() {
    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchMotoristas();
    }, []);

    const fetchMotoristas = async () => {
        try {
            setLoading(true);
            const response = await instancia.get("/motorista");
            
            const dados = Array.isArray(response.data) ? response.data : response.data.motoristas || [];
            setMotoristas(dados);
        } catch (err: any) {
            setError("Erro ao carregar a lista de motoristas.");
        } finally {
            setLoading(false);
        }
    };

    
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black mx-auto">
            <Menu /><br />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Lista de Motoristas</h1>
                    <Link href={'/motorista/create'} className="bg-green-500 
                    text-white px-2 py-1 rounded-md hover:bg-green-600 font-bold text-sm transition-all">
                        Cadastrar
                    </Link>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <div className="mt-6 bg-white shadow-md rounded-lg p-6 overflow-x-auto">
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
                                <th className="border border-gray-300 p-3 text-left">Motorista: </th>
                                <th className="border border-gray-300 p-3 text-left">CPF: </th>
                                <th className="border border-gray-300 p-3 text-left">Carro Atual: </th>
                                <th className="border border-gray-300 p-3 text-left">Frota: </th>
                                <th className="border border-gray-300 p-3 text-center">Ações: </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center animate-pulse italic">Carregando motoristas...</td></tr>
                            ) : motoristas.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-500">Nenhum motorista cadastrado.</td></tr>
                            ) : (
                                motoristas.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-100 transition-colors">
                                        <td className="border border-gray-300 p-3">{m.id}</td>
                                        <td className="border border-gray-300 p-3 font-bold uppercase">{m.nome}</td>
                                        <td className="border border-gray-300 p-3">{m.cpf}</td>
                                        <td className="border border-gray-300 p-3">
                                            {m.carroAtual ? (
                                                <span className="text-blue-600 font-bold text-xs uppercase">
                                                    {m.carroAtual.modelo} ({m.carroAtual.cor})
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Nenhum</span>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 p-3">
                                            <div className="flex flex-wrap gap-1">
                                                {m.carros?.map(carro => (
                                                    <small key={carro.id} className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[10px] border">
                                                        {carro.placa}
                                                    </small>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="border border-gray-300 p-3">
                                            <div className="flex justify-center items-center gap-2">
                                                <Link 
                                                    href={`/motorista/${m.id}`} 
                                                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 text-sm font-bold flex items-center justify-center whitespace-nowrap transition-colors"
                                                >
                                                    Visualizar
                                                </Link>
                                                
                                                <Link 
                                                    href={`/motorista/${m.id}/edit`} 
                                                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 text-sm font-bold flex items-center justify-center whitespace-nowrap transition-colors"
                                                >
                                                    Editar
                                                </Link>
                                                
                                                {/* Passando a classe de tamanho para o componente */}
                                                <DeleteButton
                                                    id={String(m.id)}
                                                    route="/motorista"
                                                    onSuccess={fetchMotoristas}
                                                    setError={setError}
                                                    setSuccess={setSuccess}
                                                    className="px-2 py-1 text-sm" 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        </div>
    );
}