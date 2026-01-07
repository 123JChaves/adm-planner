"use client";

import { useEffect, useState, useCallback } from "react";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import AlertMessage from "@/components/AlertMessage";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

interface EscalaListagem {
    id: number;
    data: string;
    tipoRota: "IDA" | "VOLTA";
    motoristasOrdem: {
        ordem: number;
        motorista: {
            pessoa: { nome: string };
            carroAtual: { placa: string } | null;
        };
    }[];
}

export default function ListarEscalas() {
    const [escalas, setEscalas] = useState<EscalaListagem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchEscalas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await instancia.get("/escalas");
            setEscalas(Array.isArray(response.data) ? response.data : []);
        } catch (err: any) {
            setError("Erro ao carregar escalas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEscalas();
    }, [fetchEscalas]);

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Menu />
            
            <div className="container mx-auto p-6 max-w-7xl">
                {error && <AlertMessage type="error" message={error} />}
                {success && <AlertMessage type="success" message={success} />}

                {loading && (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3">Carregando dados...</span>
                        </div>
                    )}

                <header className="flex flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Escalas Planejadas</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Histórico de motoristas para 2026.</p>
                    </div>

                    <Link 
                        href="/escala/create" 
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95 transition-all whitespace-nowrap"
                    >
                        Nova Escala
                    </Link>
                </header>

                {loading && (
                    <p className="text-center py-10 text-gray-500 animate-pulse">
                        Carregando planejamentos...
                    </p>
                )}

                {!loading && escalas.length === 0 && (
                    <div className="bg-white p-10 rounded-xl text-center shadow border">
                        <p className="text-gray-400">Nenhuma escala cadastrada para os próximos dias.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {escalas.map((escala) => (
                        <div key={escala.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className={`p-4 text-white font-bold flex justify-between items-center ${
                                escala.tipoRota === 'IDA' ? 'bg-blue-600' : 'bg-orange-500'
                            }`}>
                                <span>{new Date(escala.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded uppercase tracking-wider">
                                    {escala.tipoRota}
                                </span>
                            </div>

                            <div className="p-5 flex-1">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 font-mono">Fila de Saída</h3>
                                <ul className="space-y-3">
                                    {escala.motoristasOrdem
                                        ?.sort((a, b) => a.ordem - b.ordem)
                                        .map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm border-b border-gray-50 pb-2 last:border-0">
                                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full font-bold text-gray-600 text-[10px]">
                                                    {item.ordem + 1}º
                                                </span>
                                                <div className="flex-1">
                                                    {/* Uso de Optional Chaining (?.) para garantir a renderização do nome */}
                                                    <p className="font-semibold text-gray-800">
                                                        {item.motorista?.pessoa.nome || "Motorista não vinculado"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                                                        Placa: {item.motorista?.carroAtual?.placa || 'N/A'}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                                <DeleteButton 
                                    id={escala.id.toString()} 
                                    route="/escala" 
                                    setError={setError}
                                    setSuccess={setSuccess}
                                    onSuccess={fetchEscalas}
                                    className="px-4 py-2 text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}