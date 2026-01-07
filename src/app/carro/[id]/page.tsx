"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";
import Swal from "sweetalert2";

interface Categoria {
    id: number;
    categoria: string;
}

interface Carro {
    id: number;
    marca: string;
    modelo: string;
    cor: string;
    placa: string;
    categorias: Categoria[];
    motoristas: Motorista[];
    createDate: string;
    updateDate: string;
}

interface Motorista {
    id: number;
    pessoa: {
    nome: string;
    cpf: string;
    }
}

export default function CarroDetails() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();

    const [carro, setCarro] = useState<Carro | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchCarro = async () => {
            try {
                setLoading(true);
                const response = await instancia.get(`/carro/${id}`);
                setCarro(response.data.carro || response.data);
            } catch (error: any){
                setError("Erro ao carregar os dados do carro")
            } finally {
                setLoading(false);
            }
        }
        if(id) fetchCarro();
    }, [id]);

    const handleDesvincular = async (motoristaId: number) => {
        const result = await Swal.fire({
            title: 'Remover Vínculo?',
            text: "O motorista deixará de estar associado a este veículo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, desvincular',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Rota DELETE para destruir a relação na tabela intermediária
                await instancia.delete(`/motorista/${motoristaId}/desvincular-frota/${carro?.id}`);
                
                setSuccess("Motorista desvinculado com sucesso!");
                
                // Atualiza o estado local removendo o motorista da lista
                if (carro) {
                    setCarro({
                        ...carro,
                        motoristas: carro.motoristas.filter(m => m.id !== motoristaId)
                    });
                }
            } catch (err: any) {
                setError("Erro ao desvincular motorista.");
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">
            <Menu />
            <div className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
                
                {/* CABEÇALHO DE AÇÕES */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Detalhes do Veículo</h1>
                    <div className="flex gap-2 items-center">
                        <Link 
                            href={`/carro/${id}/edit`} 
                            className="flex items-center justify-center bg-amber-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-amber-600 transition-colors h-10 shadow-sm"
                        >
                            Editar Veículo
                        </Link>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-blue-600 transition-all h-10 shadow-sm"
                        >
                            Voltar
                        </button>
                    </div>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Carregando informações...</span>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1 border-t-4 border-blue-500">
                        <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 border-b pb-2">Dados do Carro</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase">Marca / Modelo</label>
                                <p className="text-lg font-bold text-gray-800">{carro?.marca} {carro?.modelo}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Cor</label>
                                    <p className="text-sm font-medium">{carro?.cor}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Placa</label>
                                    <p className="text-sm font-mono font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200 inline-block">
                                        {carro?.placa}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <p className="text-[11px] text-gray-500">
                                    <strong>ID do Registro:</strong> {carro?.id}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    <strong>Criado em:</strong> {carro?.createDate ? new Date(carro.createDate).toLocaleString('pt-BR') : '---'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    <strong>Última Atualização:</strong> {carro?.updateDate ? new Date(carro.updateDate).toLocaleString('pt-BR') : '---'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 border-t-4 border-green-500">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-sm font-bold text-gray-400 uppercase">Motoristas Vinculados</h2>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                {carro?.motoristas?.length || 0} Vinculado(s)
                            </span>
                        </div>

                        {carro?.motoristas && carro.motoristas.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {carro.motoristas.map((mot) => (
                                    <div key={mot.id} className="group border border-gray-100 p-3 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                {/* CORREÇÃO AQUI: Proteção com Optional Chaining e Fallback */}
                                                {(mot.pessoa?.nome || mot.pessoa.nome || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <Link 
                                                    href={`/motorista/${mot.id}`} 
                                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors block"
                                                >
                                                    {/* CORREÇÃO AQUI: Exibição segura do nome */}
                                                    {mot.pessoa?.nome || mot.pessoa.nome || `Motorista #${mot.id}`}
                                                </Link>
                                                {/* CORREÇÃO AQUI: CPF pode estar em pessoa ou na raiz */}
                                                <p className="text-[10px] text-gray-500 font-mono tracking-tighter">
                                                    CPF: {mot.pessoa?.cpf || mot.pessoa.cpf || "---"}
                                                </p>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleDesvincular(mot.id)}
                                            className="flex items-center justify-center bg-gray-100 text-red-500 hover:text-white hover:bg-red-500 border border-gray-200 rounded-md w-8 h-8 transition-all"
                                            title="Remover motorista deste veículo"
                                        >
                                            <svg xmlns="www.w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (

                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <svg xmlns="www.w3.org" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="italic text-sm">Este veículo não possui motoristas vinculados no momento.</p>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}