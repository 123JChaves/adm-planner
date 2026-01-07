"use client";

import { useEffect, useState } from "react";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import AlertMessage from "@/components/AlertMessage";
import Link from "next/link";

interface Carro {
    id: number;
    marca: string;
    modelo: string;
    placa: string;
    ano: string;
    cor: string;
}

interface Motorista {
    id: number;
    nome: string;
    cpf: string;
    carroAtual: Carro;
}

export default function Escala() {
    const [dataBr, setDataBr] = useState<string>(new Date().toLocaleDateString('pt-BR'));
    const [tipoRota, setTipoRota] = useState<'IDA' | 'VOLTA'>('IDA');
    const [motoristas, setMotoristas] = useState<Motorista[]>([]);
    const [filaEscala, setFilaEscala] = useState<Motorista[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchMotoristas = async () => {
            try {
                setLoading(true);
                const response = await instancia.get("/motorista");
                setMotoristas(Array.isArray(response.data) ? response.data : []);
            } catch (err: any) {
                setError("Erro ao carregar a lista de motoristas.");
            } finally {
                setLoading(false);
            }
        };
        fetchMotoristas();
    }, []);

    const adicionarAFila = (m: Motorista) => {
        if (!filaEscala.find(item => item.id === m.id)) {
            setFilaEscala([...filaEscala, m]);
        }
    };

    const removerDaFila = (id: number) => {
        setFilaEscala(filaEscala.filter(m => m.id !== id));
    };

    const moverNaFila = (index: number, direcao: 'sobe' | 'desce') => {
        const novaFila = [...filaEscala];
        const novoIndex = direcao === 'sobe' ? index - 1 : index + 1;
        if (novoIndex < 0 || novoIndex >= filaEscala.length) return;
        [novaFila[index], novaFila[novoIndex]] = [novaFila[novoIndex], novaFila[index]];
        setFilaEscala(novaFila);
    };

    const gerenciarSelecaoTodos = () => {
        // Se a fila já tiver gente, nós limpamos tudo
        if (filaEscala.length > 0) {
            setFilaEscala([]);
        } else {
            // Se estiver vazia, adicionamos todos os motoristas disponíveis
            setFilaEscala([...motoristas]);
        }
    };

    // FUNÇÃO CORRIGIDA: Reposto o FormEvent para evitar o refresh da página
    const salvarEscalaNoBanco = async (e: React.FormEvent) => {
        e.preventDefault(); // ESSENCIAL para o alerta não sumir
        
        setError(null);
        setSuccess(null);

        if (filaEscala.length === 0) {
            setError("Selecione ao menos um motorista para definir a ordem da escala.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                dataBr,
                motoristaIds: filaEscala.map(m => m.id),
                tipoRota
            };

            await instancia.post("/escalas/gerar-dia", payload);

            setSuccess(`Escala de ${tipoRota} para o dia ${dataBr} salva com sucesso!`);

            window.scrollTo({ top: 0, behavior: 'smooth' });

            setFilaEscala([]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro interno ao processar a escala.");

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Menu />
            
            {error && <AlertMessage type="error" message={error} />}
            {success && <AlertMessage type="success" message={success} />}

            <div className="container mx-auto p-6 max-w-7xl">
                {/* Cabeçalho da Página */}
                <header className="flex flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestão de Escalas 2026</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Organize a ordem de saída para o dia selecionado.</p>
                    </div>
                    <Link 
                        href="/escala/list" 
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95 transition-all whitespace-nowrap"
                    >
                        Lista de Escalas
                    </Link>
                </header>

                <form onSubmit={salvarEscalaNoBanco}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* COLUNA 1: CONFIGURAÇÃO E MOTORISTAS DISPONÍVEIS */}
                        <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-blue-600">1. Configuração</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex flex-col justify-end">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data da Escala</label>
                                    <input 
                                        type="date" 
                                        value={dataBr} 
                                        onChange={(e) => setDataBr(e.target.value)}
                                        className="w-full h-12 border border-gray-300 rounded-lg px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none box-border"
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Rota</label>
                                    <select 
                                        value={tipoRota} 
                                        onChange={(e) => setTipoRota(e.target.value as 'IDA' | 'VOLTA')}
                                        className="w-full h-12 border border-gray-300 rounded-lg px-3 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer box-border"
                                    >
                                        <option value="IDA">IDA (Entrada)</option>
                                        <option value="VOLTA">VOLTA (Saída)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Título com botão Selecionar e Excluir Todos da selação à direita */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">2. Motoristas Disponíveis</h2>                                
                                <button
                                    type="button"
                                    onClick={gerenciarSelecaoTodos}
                                    disabled={motoristas.length === 0}
                                    className="px-4 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed group"
                                    style={{
                                        // Definimos as cores dinamicamente via variáveis de CSS
                                        // Se fila > 0 usa Vermelho, senão usa Azul
                                        '--bg-normal': filaEscala.length > 0 ? '#fee2e2' : '#dbeafe',
                                        '--txt-normal': filaEscala.length > 0 ? '#dc2626' : '#2563eb',
                                        '--bg-hover': filaEscala.length > 0 ? '#dc2626' : '#2563eb',
                                        backgroundColor: 'var(--bg-normal)',
                                        color: 'var(--txt-normal)',
                                    } as React.CSSProperties}
                                    // O CSS puro lida com o hover instantaneamente
                                    onMouseOver={(e) => {
                                        if (motoristas.length > 0) {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (motoristas.length > 0) {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-normal)';
                                            e.currentTarget.style.color = 'var(--txt-normal)';
                                        }
                                    }}
                                >
                                    {filaEscala.length > 0 ? "Limpar Seleção" : `Selecionar Todos (${motoristas.length})`}
                                </button>
                            </div>

                            <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading && motoristas.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 animate-pulse">Buscando motoristas...</div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {motoristas.map(m => {
                                        const naFila = filaEscala.some(f => f.id === m.id);
                                        return (
                                            <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all hover:shadow-sm hover:border-blue-200 h-fit">
                                                <div className="flex-1 min-w-0 mr-2">
                                                    <p className="font-bold text-gray-900 truncate" title={m.nome || m.nome}>
                                                        {m.nome || m.nome || "Sem Nome"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 font-medium truncate">
                                                        {m.carroAtual ? `${m.carroAtual.modelo} • ${m.carroAtual.placa}` : "Sem veículo"}
                                                    </p>
                                                </div>
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={() => adicionarAFila(m)}
                                                    disabled={naFila}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                                                        naFila 
                                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer active:scale-95"
                                                    }`}
                                                >
                                                    {naFila ? "Adicionado" : "Selecionar"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* COLUNA 2: FILA ORDENADA */}
                        <section className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-blue-600 flex flex-col">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">3. Ordem da Fila</h2>
                            <p className="text-xs text-gray-400 mb-6 italic">Defina a prioridade de saída movendo os itens.</p>
                            
                            <div className="space-y-3 flex-1 min-h-[350px]">
                                {filaEscala.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
                                        <p>Nenhum motorista na fila para {tipoRota}.</p>
                                    </div>
                                )}
                                
                                {filaEscala.map((m, index) => (
                                    <div key={m.id} className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm transition-all">
                                        <div className="flex flex-col items-center justify-center bg-white h-12 w-12 rounded-full border-2 border-blue-600 mr-4 shadow-inner shrink-0">
                                            <span className="text-xl font-black text-blue-600">{index + 1}º</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{m.nome || m.nome}</p>
                                            <p className="text-xs text-blue-500 font-bold bg-blue-100 px-2 py-0.5 rounded inline-block">
                                                {m.carroAtual?.placa || "N/A"}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button 
                                                type="button" 
                                                onClick={() => moverNaFila(index, 'sobe')} 
                                                disabled={index === 0}
                                                className="w-8 h-8 flex items-center justify-center bg-blue-20 text-blue-700 hover:bg-blue-600 hover:text-white rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-sm font-black">▲</span>
                                            </button>
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => moverNaFila(index, 'desce')} 
                                                disabled={index === filaEscala.length - 1}
                                                className="w-8 h-8 flex items-center justify-center bg-blue-20 text-blue-700 hover:bg-blue-600 hover:text-white rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-sm font-black">▼</span>
                                            </button>

                                            <button 
                                                type="button" 
                                                onClick={() => removerDaFila(m.id)} 
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgb(220, 38, 38)';
                                                    const span = e.currentTarget.querySelector('span');
                                                    if (span) span.style.color = 'white';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgb(239, 246, 255)';
                                                    const span = e.currentTarget.querySelector('span');
                                                    if (span) span.style.color = 'rgb(220, 38, 38)';
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-md ml-2 transition-all duration-200 active:scale-90 cursor-pointer"
                                                style={{ backgroundColor: 'rgb(239, 246, 255)' }}
                                            >
                                                <span className="text-sm font-black pointer-events-none" style={{ color: 'rgb(220, 38, 38)' }}>X</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || filaEscala.length === 0}
                                className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? "SALVANDO..." : "CONFIRMAR ESCALA"}
                            </button>
                        </section>
                    </div>
                </form>
            </div>
        </main>
    );
}