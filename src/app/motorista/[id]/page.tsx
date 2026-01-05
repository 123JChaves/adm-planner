
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";
import DeleteButton from "@/components/DeleteButton";
import Swal from "sweetalert2";

// Interfaces de tipagem
interface Categoria {
    id: number;
    categoria: string;
}

interface Carro {
    id: number;
    modelo: string;
    placa: string;
    categorias: Categoria[];
}

interface Motorista {
    id: number;
    nome: string;
    cpf: string;
    carroAtual?: Carro;
    carros?: Carro[];
    createDate: string;
}

export default function MotoristaDetails() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();

    const [motorista, setMotorista] = useState<Motorista | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchMotorista();
    }, [id]);

    const fetchMotorista = async () => {
        try {
            setLoading(true);
            const response = await instancia.get(`/motorista/${id}`);
            setMotorista(response.data.motorista || response.data);
        } catch (err: any) {
            setError("Erro ao carregar dados do motorista.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetCarroAtual = async (carroId: number) => {
        try {
            setError(null);
            await instancia.patch(`/motorista/${id}/definir-carro`, { carroId });
            
            const novoCarroAtu = motorista?.carros?.find(c => c.id === carroId);
            
            if (motorista && novoCarroAtu) {
                setMotorista({
                    ...motorista,
                    carroAtual: novoCarroAtu
                });

                // --- IMPLEMENTAÇÃO DO SWEETALERT ---
                Swal.fire({
                    title: "Veículo Principal Atualizado!",
                    html: `O motorista ${motorista.nome} agora está utilizando o veículo:
                    <br><b>${novoCarroAtu.modelo} (${novoCarroAtu.placa})</b>`,
                    icon: "success",
                    confirmButtonColor: "#06b6d4", // Cor Cyan-500
                    timer: 8000,
                    timerProgressBar: true
                });
            }
        } catch (err) {
            Swal.fire({
                title: "Erro!",
                text: "Não foi possível alterar o veículo atual.",
                icon: "error",
                confirmButtonColor: "#ef4444"
            });
        }
    };

    const handleCarroDeleted = (carroId: number) => {
        if (motorista) {
            setMotorista({
                ...motorista,
                carros: motorista.carros?.filter(c => c.id !== carroId),
                carroAtual: motorista.carroAtual?.id === carroId ? undefined : motorista.carroAtual
            });
        }
    };

    const handleDesvincular = async (carroId: number) => {
        const result = await Swal.fire({
            title: 'Remover da Frota?',
            text: "O carro continuará no sistema, mas não pertencerá mais a este motorista.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d64330ff',
            cancelButtonColor: '#437b9bff',
            confirmButtonText: 'Sim, desvincular',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Chamada para a rota que você criou no backend
                await instancia.delete(`/motorista/${motorista!.id}/desvincular-frota/${carroId}`);
                
                // Reaproveita sua função existente para atualizar a tela
                handleCarroDeleted(carroId);
                
                setSuccess("Veículo desvinculado com sucesso!");
            } catch (err: any) {
                setError(err.response?.data?.message || "Erro ao desvincular veículo.");
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-black">
            <Menu /><div className="flex-1 p-10 text-center font-bold italic text-gray-500">Buscando informações...</div>
        </div>
    );

    if (!motorista) return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-black">
            <Menu /><div className="flex-1 p-10 text-center text-red-500 font-bold">Motorista não encontrado.</div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">
            <Menu />
            
            <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
                {/* CABEÇALHO (SEM LINK NO NOME) */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold uppercase">
                        {motorista.nome}
                    </h1>
                    
                    <div className="flex gap-2">
                        <Link href="/motorista/list" className="bg-cyan-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-cyan-600 transition-colors">
                            Listar Motoristas
                        </Link>
                        <Link href={`/motorista/${id}/edit`} className="bg-amber-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-amber-600 transition-colors">
                            Editar
                        </Link>
                        <button 
                            onClick={() => router.back()} 
                            className="bg-blue-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-blue-600 transition-all"
                        >
                            Voltar
                        </button>
                    </div>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {/* DADOS PESSOAIS */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                        <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 border-b pb-2">Dados Pessoais</h2>
                        <div className="space-y-3">
                            <p className="text-sm"><strong>ID:</strong> {motorista.id}</p>
                            <p className="text-sm"><strong>CPF:</strong> {motorista.cpf}</p>
                            <p className="text-sm"><strong>Cadastro:</strong> {new Date(motorista.createDate).toLocaleDateString('pt-BR')}</p>
                        </div>

                        <h2 className="text-sm font-bold text-gray-400 uppercase mt-8 mb-4 border-b pb-2">Status Operacional</h2>
                        <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
                            <label className="block text-[10px] font-bold text-blue-500 uppercase">Em uso agora:</label>
                            <span className="text-sm font-bold text-blue-700">
                                {motorista.carroAtual ? (
                                    <Link href={`/carro/${motorista.carroAtual.id}`} className="hover:underline">
                                        {motorista.carroAtual.modelo} ({motorista.carroAtual.placa}) 
                                        {motorista.carroAtual.categorias && motorista.carroAtual.categorias.length > 0 && (
                                            ` (${motorista.carroAtual.categorias.map(c => c.categoria).join(", ")})`
                                        )}
                                    </Link>
                                ) : "Nenhum veículo"}
                            </span>
                        </div>
                    </div>

                    {/* GESTÃO DA FROTA */}
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-sm font-bold text-gray-400 uppercase">Veículos Vinculados</h2>
                            <Link 
                                href={`/carro/create?motoristaId=${motorista.id}`}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition-all"
                            >
                                + Novo Veículo
                            </Link>
                        </div>

                        {motorista.carros && motorista.carros.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {motorista.carros.map((carro) => (
                                    <div key={carro.id} className="border p-3 rounded-md flex justify-between items-center hover:bg-gray-50 transition-all shadow-sm">
                                        <div>
                                            {/* LINK PARA DETALHES DO CARRO */}
                                            <Link href={`/carro/${carro.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                {carro.modelo}
                                            </Link>
                                            <p className="text-xs text-gray-500 font-mono">{carro.placa}</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {carro.categorias?.map((cat, idx) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                        {cat.categoria}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 items-center">
                                            <button 
                                                onClick={() => handleSetCarroAtual(carro.id)}
                                                disabled={motorista.carroAtual?.id === carro.id}
                                                className={`px-3 py-1 rounded-md font-bold text-sm h-[32px] transition-all ${
                                                    motorista.carroAtual?.id === carro.id 
                                                    ? "bg-green-100 text-green-700 border border-green-200 cursor-default" 
                                                    : "bg-gray-200 text-black hover:bg-gray-300 shadow-sm"
                                                }`}
                                            >
                                                {motorista.carroAtual?.id === carro.id ? "Em uso" : "Usar"}
                                            </button>

                                            {/* BOTÃO DESVINCULAR */}
                                            <button 
                                                onClick={() => handleDesvincular(carro.id)}
                                                title="Remover vínculo deste motorista"
                                                className="flex items-center justify-center bg-gray-100 text-red-500 hover:text-white hover:bg-red-500 border border-gray-200 rounded-md w-[32px] h-[32px] transition-all shadow-sm"
                                            >
                                                <svg 
                                                    xmlns="www.w3.org" 
                                                    className="h-5 w-5" 
                                                    fill="none" 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 italic text-sm">Sem frota vinculada.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}