"use client"

import React, { useEffect, useState } from 'react';
import instancia from '@/service/api';
import Link from "next/link";
import Menu from '@/components/Menu';
import AlertMessage from '@/components/AlertMessage';

interface Empresa {
    id: number;
    nome: string;
    cnpj: string;
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
                    pais: {
                        nome: string;
                    }
                }
            }
        }
    };
    createDate: string;
    updateDate: string;
}

interface Funcionario {
    id: number;
    pessoa: {
        nome: string;
        cpf: string;
        createDate: string;
        updateDate: string;
    },
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
                        pais: {
                            nome: string;
                        }
                    }
                }
            }
        };
    empresa: Empresa[];
}

export default function GerenciadorLoteSolicitacoes() {
    // Estados de Dados
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    
    // Estados de Controle
    const [filtroNome, setFiltroNome] = useState('');
    const [loading, setLoading] = useState({ empresas: false, funcionarios: false, enviando: false });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Estados do Formulário
    const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
    const [dataAgendada, setDataAgendada] = useState('');
    const [horaSelecionada, setHoraSelecionada] = useState('02:00');
    const [selectedFuncIds, setSelectedFuncIds] = useState<number[]>([]);
    const [tipoRota, setTipoRota] = useState('IDA');

    // 1. Recuperar Empresas
    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoading(p => ({ ...p, empresas: true }));
            try {
                const { data } = await instancia.get('/empresa');
                setEmpresas(data);
                if (data.length > 0) {
                    setSelectedEmpresaId(data[0].id.toString());
                }
            } catch (err) {
                setError("Falha ao carregar lista de empresas.");
            } finally {
                setLoading(p => ({ ...p, empresas: false }));
            }
        };
        fetchEmpresas();
    }, []);

    // 2. Recuperar Funcionários por Empresa
    useEffect(() => {
        if (!selectedEmpresaId) {
            setFuncionarios([]);
            return;
        }

        const fetchFuncionarios = async () => {
            setLoading(p => ({ ...p, funcionarios: true }));
            try {
                const { data } = await instancia.get(`/funcionario/empresa/${selectedEmpresaId}`);
                setFuncionarios(data);
                setSelectedFuncIds([]);
            } catch (err) {
                setError("Erro ao buscar colaboradores da empresa selecionada.");
            } finally {
                setLoading(p => ({ ...p, funcionarios: false }));
            }
        };
        fetchFuncionarios();
    }, [selectedEmpresaId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!dataAgendada) return setError("Selecione a data para o agendamento.");
        if (selectedFuncIds.length === 0) return setError("Selecione ao menos um funcionário para o lote.");

        setLoading(p => ({ ...p, enviando: true }));

        const payload = {
            empresaId: Number(selectedEmpresaId),
            funcionarioIds: selectedFuncIds,
            tipoRota,
            dataHoraAgendada: `${dataAgendada}T${horaSelecionada}:00`
        };

        try {
            await instancia.post('/solicitacoes/gerar-lote', payload);

            // Lógica para plural ou singular
            const total = selectedFuncIds.length;
            const mensagem = total === 1 
                ? `1 Solicitação agendada com sucesso!` 
                : `${total} Solicitações agendadas com sucesso!`;

            setSuccess(mensagem);
            setSelectedFuncIds([]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao processar o lote de solicitações.");
        } finally {
            setLoading(p => ({ ...p, enviando: false }));
        }
};

    const funcionariosFiltrados = funcionarios.filter(f => 
        f.pessoa?.nome.toLowerCase().includes(filtroNome.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedFuncIds.length === funcionariosFiltrados.length) {
            setSelectedFuncIds([]);
        } else {
            setSelectedFuncIds(funcionariosFiltrados.map(f => f.id));
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-black">
            <Menu />
            
            <div className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
                {/* Header Superior */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Agendamento de Solicitações</h1>
                    <Link 
                        href="/solicitacoes/list" 
                        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 font-bold text-sm"
                    >
                        Ver Agendamentos
                    </Link>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* COLUNA DE CONFIGURAÇÃO DO LOTE */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                            <h2 className="text-sm font-bold text-gray-400 uppercase border-b pb-2">Configuração</h2>
                            
                            <div className="flex flex-col">
                                <label className="font-bold text-sm mb-1">Empresa:</label>
                                <select 
                                    className="border p-2 rounded outline-none focus:ring-2 border-gray-300 focus:ring-blue-300"
                                    value={selectedEmpresaId}
                                    onChange={(e) => setSelectedEmpresaId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {empresas.map(e => (
                                        <option key={e.id} value={e.id}>{e.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="font-bold text-sm mb-1">Data da Viagem:</label>
                                <input 
                                    type="date"
                                    value={dataAgendada}
                                    onChange={(e) => setDataAgendada(e.target.value)}
                                    className="border p-2 rounded outline-none border-gray-300 focus:ring-2 focus:ring-blue-300"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="font-bold text-sm mb-1">Janela de Horário:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['02:00', '03:00', '14:00', '22:00'].map(hora => (
                                        <button
                                            key={hora}
                                            type="button"
                                            onClick={() => setHoraSelecionada(hora)}
                                            className={`py-2 rounded font-bold text-xs border transition-all ${
                                                horaSelecionada === hora 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {hora}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="font-bold text-sm mb-1">Tipo de Rota:</label>
                                <div className="flex bg-gray-100 p-1 rounded">
                                    {['IDA', 'VOLTA'].map((r) => (
                                        <button 
                                            key={r}
                                            type="button"
                                            onClick={() => setTipoRota(r)}
                                            className={`flex-1 py-2 rounded font-bold text-xs transition-all ${tipoRota === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading.enviando || selectedFuncIds.length === 0}
                                className={`w-full py-3 rounded font-bold text-white transition-all mt-4 ${
                                    loading.enviando || selectedFuncIds.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'
                                }`}
                            >
                                {loading.enviando ? "SALVANDO..." : `SALVAR LOTE (${selectedFuncIds.length})`}
                            </button>
                        </form>
                    </div>

                    {/* COLUNA DE SELEÇÃO DE FUNCIONÁRIOS */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md flex flex-col overflow-hidden border-t-4 border-blue-500">
                        <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <input 
                                type="text"
                                placeholder="Filtrar colaboradores..."
                                value={filtroNome}
                                onChange={(e) => setFiltroNome(e.target.value)}
                                className="w-full md:w-64 border p-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button 
                                onClick={handleSelectAll}
                                className="text-xs font-bold text-blue-600 hover:underline px-2"
                                type="button"
                            >
                                {selectedFuncIds.length === funcionariosFiltrados.length ? "Desmarcar Todos" : "Selecionar todos os filtrados"}
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                            {loading.funcionarios ? (
                                <div className="col-span-full py-10 text-center text-gray-400 animate-pulse font-bold uppercase text-xs">
                                    Sincronizando funcionários...
                                </div>
                            ) : funcionariosFiltrados.length > 0 ? (
                                funcionariosFiltrados.map(f => {
                                    const isSelected = selectedFuncIds.includes(f.id);
                                    const hasCoords = f.logradouro?.latitude && f.logradouro?.longitude;

                                    return (
                                        <div 
                                            key={f.id}
                                            onClick={() => isSelected 
                                                ? setSelectedFuncIds(p => p.filter(id => id !== f.id)) 
                                                : setSelectedFuncIds(p => [...p, f.id])
                                            }
                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                    {f.pessoa?.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                                        {f.pessoa?.nome}
                                                    </span>
                                                    <span className={`text-[10px] font-bold ${hasCoords ? 'text-green-600' : 'text-red-500'}`}>
                                                        {hasCoords ? '● Localização OK' : '○ Sem coordenadas'}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="4">
                                                        <path d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-300 italic text-sm">
                                    {selectedEmpresaId ? "Nenhum funcionário encontrado para o filtro." : "Selecione uma empresa para listar os colaboradores."}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}