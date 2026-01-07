"use client"

import AlertMessage from "@/components/AlertMessage";
import DeleteButton from "@/components/DeleteButton";
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Categoria {
    id: number,
    categoria: string
}

interface Carro {
    id: number;
    marca: string;
    modelo: string;
    ano: number;
    cor: string;
    placa: string;
    categorias: Categoria[];
    motoristas: Motoristas[];
}

interface Motoristas {
    id: number;
    pessoa: {
    nome: string;
    cpf: string;
    },
    carroAtual?: Carro;
    carros?: Carro[];
    createDate: string;
}

export default function Carro() {
    const [carros, setCarros] = useState<Carro[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchCarros();
    }, []);

        const fetchCarros = async () => {
            try {
                setLoading(true);
                const response = await instancia.get("/carro/motoristas");

                const dados = Array.isArray(response.data) ? response.data : response.data.carros || [];
                setCarros(dados);
            } catch (error: any) {
                setError("Erro ao listar os carros");
            } finally {
                setLoading(false);
            }
        }

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black mx-auto">
            <Menu />
            <div className="flex-1 px-2 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Listar Carros</h1>
                    <Link href={'/carro/create'} className="bg-green-500 
                    text-white px-4 py-2 rounded-md hover:bg-green-600 font-bold text-sm transition-all">
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
                                <th className="border border-gray-300 p-3 text-left">Marca: </th>
                                <th className="border border-gray-300 p-3 text-left">Modelo: </th>
                                <th className="border border-gray-300 p-3 text-left">Cor: </th>
                                <th className="border border-gray-300 p-3 text-left">Placa: </th>
                                <th className="border border-gray-300 p-3 text-left">Ano: </th>
                                <th className="border border-gray-300 p-3 text-left">Categorias: </th>
                                <th className="border border-gray-300 p-3 text-left">Motoristas: </th>
                                <th className="border border-gray-300 p-3 text-left">Ações: </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="p-10 text-center animate-pulse italic">Carregando carros...</td></tr>
                            ) : carros.length === 0 ? (
                                <tr><td colSpan={9} className="p-10 text-center text-gray-500">Nenhum carro cadastrado.</td></tr>
                            ) : (
                                carros.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-100 transition-colors">
                                        <td className="border border-gray-300 p-3">{c.id}</td>
                                        <td className="border border-gray-300 p-3 font-bold uppercase">{c.marca}</td>
                                        <td className="border border-gray-300 p-3">{c.modelo}</td>
                                        <td className="border border-gray-300 p-3">{c.cor}</td>
                                        <td className="border border-gray-300 p-3">
                                            <div className="flex flex-wrap gap-1">
                                                {c.placa ? (
                                                    <small className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[10px] border uppercase font-mono">
                                                        {c.placa}
                                                    </small>
                                                ) : (
                                                    <span className="text-gray-400 italic text-[10px]">Sem placa</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-3">{c.ano}</td>
                                        <td className="border border-gray-300 p-3">
                                            {Array.isArray(c.categorias)
                                            ? c.categorias.map(ca => ca.categoria).join(", ")
                                            : (c.categorias as any).categorias}</td>
                                        <td className="border border-gray-300 p-3">
                                        <div className="flex flex-col gap-1">
                                            {Array.isArray(c.motoristas) && c.motoristas.length > 0 ? (
                                                c.motoristas.map((mot) => (
                                                    <Link
                                                        key={mot.id}
                                                        href={`/motorista/${mot.id}`}
                                                        className="block text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100 
                                                                text-blue-700 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                                                    >
                                                        {/* Acesso seguro: busca em mot.pessoa.nome ou mot.nome dependendo do seu backend */}
                                                        {mot.pessoa?.nome || mot.pessoa.nome || `Motorista #${mot.id}`}
                                                    </Link>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Nenhum vinculado</span>
                                            )}
                                        </div>
                                    </td>
                                        <td className="border border-gray-300 p-3">
                                            <div className="flex justify-center items-center gap-2">
                                                <Link 
                                                    href={`/carro/${c.id}`} 
                                                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 text-sm font-bold flex items-center justify-center whitespace-nowrap transition-colors"
                                                >
                                                    Visualizar
                                                </Link>
                                                
                                                <Link 
                                                    href={`/carro/${c.id}/edit`} 
                                                    className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600 text-sm font-bold flex items-center justify-center whitespace-nowrap transition-colors"
                                                >
                                                    Editar
                                                </Link>
                                                
                                                {/* Passando a classe de tamanho para o componente */}
                                                <DeleteButton
                                                    id={String(c.id)}
                                                    route="/carro"
                                                    onSuccess={fetchCarros}
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