"use client"

import { useEffect, useState } from 'react';
import instancia from '@/service/api';
import Menu from '@/components/Menu';
import AlertMessage from '@/components/AlertMessage';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface Solicitacao {
    id: number;
    tipoRota: string;
    dataHoraAgendada: string;
    processada: boolean;
    cancelada: boolean;
    empresa: {
        nome: string;
    };
    funcionario: {
        nome: string;
        cpf: string;
    };
    corrida: {
        id: number;
    } | null;
}

export default function ListaSolicitacoes() {
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    const fetchSolicitacoes = async () => {
        try {
            setLoading(true);
            const { data } = await instancia.get('/solicitacoes');
            // Filtra para exibir apenas o que não foi cancelado
            const ativas = Array.isArray(data) ? data.filter((s: Solicitacao) => !s.cancelada) : [];
            setSolicitacoes(ativas);
        } catch (err) {
            setError("Erro ao carregar a lista de solicitações.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = (id: number, nome: string) => {
        Swal.fire({
            title: "Cancelar Agendamento?",
            text: `Informe o motivo para cancelar a solicitação de ${nome}:`,
            input: "text",
            inputPlaceholder: "Digite o motivo aqui...",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirmar Cancelamento",
            cancelButtonText: "Desistir",
            confirmButtonColor: "#f44336",
            cancelButtonColor: "#7078c9ff",
            showLoaderOnConfirm: true,
            preConfirm: async (motivo) => {
                if (!motivo || motivo.trim() === "") {
                    Swal.showValidationMessage("O motivo é obrigatório!");
                    return false;
                }
                try {
                    // Chamada para a rota PATCH que você criou no backend
                    await instancia.patch(`/solicitacoes/${id}/cancelar`, { motivo });
                    return true;
                } catch (err: any) {
                    Swal.showValidationMessage(
                        `Erro: ${err.response?.data?.message || "Não foi possível cancelar."}`
                    );
                    return false;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                // 1. Remove da lista visual
                setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
                
                // 2. Dispara o componente AlertMessage
                setSuccess(`O agendamento foi removido com sucesso.`);
                
                // Limpa o estado de sucesso após 3 segundos
                setTimeout(() => setSuccess(null), 3000);
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-black">
            <Menu />

            <div className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Solicitações de Transporte</h1>
                        <p className="text-sm text-gray-500">Agendamentos Ativos - 2026</p>
                    </div>
                    <Link 
                        href="/solicitacoes/create" 
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-bold text-sm shadow-md transition-all"
                    >
                        + Novo Agendamento em Lote
                    </Link>
                </div>

                {/* Componentes de Alerta com SweetAlert2 integrado */}
                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Funcionário</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Empresa</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Rota</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-400 animate-pulse font-bold uppercase text-xs">
                                        Sincronizando dados...
                                    </td>
                                </tr>
                            ) : solicitacoes.length > 0 ? (
                                solicitacoes.map((s) => (
                                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-mono text-gray-400">#{s.id}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">{s.funcionario.nome}</span>
                                                <span className="text-[10px] text-gray-400 uppercase">CPF: {s.funcionario.cpf}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium">
                                            {s.empresa.nome}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                s.tipoRota === 'IDA' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {s.tipoRota}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {s.processada ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    ✓ Em Corrida #{s.corrida?.id}
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-400 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    Aguardando
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleCancelar(s.id, s.funcionario.nome)}
                                                disabled={s.processada}
                                                className={`transition-all p-2 rounded-full ${
                                                    s.processada 
                                                    ? 'text-gray-200 cursor-not-allowed' 
                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                }`}
                                                title={s.processada ? "Não é possível cancelar uma corrida ativa" : "Cancelar agendamento"}
                                            >
                                                <svg xmlns="www.w3.org" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-400 italic text-sm">
                                        Nenhuma solicitação ativa encontrada para 2026.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}