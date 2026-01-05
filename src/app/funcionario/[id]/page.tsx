'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";


interface Funcionario {
    id: number;
    nome: string;
    cpf: string;
    createDate: string;
    updateDate: string;
    empresa: {
        id: number;
        nome: string;
        cnpj: string;
    };
    logradouro: {
        id: number;
        nome: string;
        numero: number;
        latitude: string;
        longitude: string;
        bairro: {
            nome: string;
            cidade: {
                nome: string;
                estado: {
                    nome: string;
                    pais: { nome: string }
                }
            }
        }
    };
}

export default function FuncionarioDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchFuncionario = async () => {
                try {
                    const response = await instancia.get(`/funcionario/${id}`);
                    setFuncionario(response.data);
                } catch (err: any) {
                    setError(err.response?.data?.message || "Erro ao buscar detalhes do funcionário.");
                }
            };
            fetchFuncionario();
        }
    }, [id]);

    if (error) return (
        <div className="min-h-screen bg-gray-100">
            <Menu /><br />
            <div className="max-w-4xl mx-auto p-4"><AlertMessage type="error" message={error} /></div>
        </div>
    );

    if (!funcionario) return <div className="text-center py-20">Carregando dados...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">
            <Menu /><br />

            <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
                {/* Cabeçalho de Ações */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dados do Funcionário</h1>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => router.back()} 
                            className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-all"
                        >
                            Voltar
                        </button>
                        <Link
                            href={`/empresa/${funcionario.empresa.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
                        >
                            Ver Empresa
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Coluna 1: Dados Pessoais e Empresa */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-purple-600">
                            <h2 className="text-lg font-bold mb-4 text-purple-700 uppercase border-b pb-2">Identificação</h2>
                            <div className="space-y-3">
                                <div><label className="text-xs text-gray-500 block">ID do Registro</label><span className="font-mono">{funcionario.id}</span></div>
                                <div><label className="text-xs text-gray-500 block">Nome Completo</label><span className="font-bold">{funcionario.nome}</span></div>
                                <div><label className="text-xs text-gray-500 block">CPF</label><span>{funcionario.cpf}</span></div>
                            </div>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500">
                            <h2 className="text-lg font-bold mb-4 text-blue-700 uppercase border-b pb-2">Vínculo</h2>
                            <div className="space-y-3">
                                <div><label className="text-xs text-gray-500 block">Empresa</label><span className="font-semibold">{funcionario.empresa.nome}</span></div>
                                <div><label className="text-xs text-gray-500 block">CNPJ</label><span className="text-sm">{funcionario.empresa.cnpj}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 2: Endereço e Metadados */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-green-600">
                            <h2 className="text-lg font-bold mb-4 text-green-700 uppercase border-b pb-2">Endereço Residencial</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500 block">Logradouro</label>
                                    <span className="text-lg">{funcionario.logradouro.nome}, Nº {funcionario.logradouro.numero}</span>
                                </div>
                                <div><label className="text-xs text-gray-500 block">Bairro</label><span>{funcionario.logradouro.bairro.nome}</span></div>
                                <div><label className="text-xs text-gray-500 block">Cidade/UF</label><span>{funcionario.logradouro.bairro.cidade.nome} / {funcionario.logradouro.bairro.cidade.estado.nome}</span></div>
                                <div><label className="text-xs text-gray-500 block">País</label><span>{funcionario.logradouro.bairro.cidade.estado.pais.nome}</span></div>
                                <div className="md:col-span-2 flex gap-6 mt-2 pt-2 border-t border-gray-50 text-xs font-mono text-black-400">
                                    <span>LAT: {funcionario.logradouro.latitude}</span>
                                    <span>LONG: {funcionario.logradouro.longitude}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-orange-400">
                            <h2 className="text-lg font-bold mb-4 text-orange-700 uppercase border-b pb-2">Histórico do Registro</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 block">Data de Registro</label>
                                    <span>{new Date(funcionario.createDate).toLocaleString('pt-BR')}</span>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block">Última Atualização</label>
                                    <span>{new Date(funcionario.updateDate).toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
