"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import Link from "next/link";
import AlertMessage from "@/components/AlertMessage";
import Swal from "sweetalert2";

export default function CreateCarro() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const motoristaId = searchParams.get("motoristaId");

    const [motoristaNome, setMotoristaNome] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estados dos campos
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [ano, setAno] = useState("");
    const [placa, setPlaca] = useState("");
    const [cor, setCor] = useState("");

    // Estados de controle
    const [isExistingCar, setIsExistingCar] = useState(false);
    const [jaVinculado, setJaVinculado] = useState(false);

    // Busca o nome do motorista caso o ID esteja presente na URL
    useEffect(() => {
        if (motoristaId) {
            const fetchMotorista = async () => {
                try {
                    const response = await instancia.get(`/motorista/${motoristaId}`);
                    setMotoristaNome(response.data.pessoa?.nome);
                } catch (err) {
                    console.error("Erro ao buscar nome do motorista");
                }
            };
            fetchMotorista();
        }
    }, [motoristaId]);

    const verificarPlaca = async (placaDigitada: string) => {
        const placaLimpa = placaDigitada.trim().toUpperCase();
        if (placaLimpa.length < 7) return;

        try {
            const response = await instancia.get(`/carro/verificar/${placaLimpa}`);
            
            if (response.data.existe) {
                const c = response.data.carro;

                // --- LÓGICA DE ALERTA IMEDIATO (CASO SEM MOTORISTA) ---
                if (!motoristaId) {
                    Swal.fire({
                        title: 'Veículo já Cadastrado',
                        text: `O veículo de placa ${placaLimpa} já consta no sistema. Você será redirecionado para a listagem de veículos.`,
                        icon: 'warning',
                        confirmButtonText: 'Ver na Lista de Carros',
                        confirmButtonColor: '#2563eb',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            router.push("/carro/list");
                        }
                    });
                    return; // Interrompe o preenchimento dos campos
                }
                // -----------------------------------------------------

                // CASO COM MOTORISTA: Preenche os campos para permitir o vínculo
                setMarca(c.marca);
                setModelo(c.modelo);
                setAno(c.ano);
                setCor(c.cor);
                setIsExistingCar(true);

                // Verifica se o motorista atual já possui este carro na frota
                const vinculado = c.motoristas?.some((m: any) => m.id === Number(motoristaId));
                setJaVinculado(vinculado);

                if (vinculado) {
                    setError(`Este veículo já está vinculado ao motorista ${motoristaNome}!`);
                } else {
                    setSuccess("Veículo identificado! Pronto para vínculo.");
                    setError(null);
                }
            } else {
                // Se a placa não existe, permite preenchimento de novo cadastro
                if (isExistingCar) {
                    setMarca(""); setModelo(""); setAno(""); setCor("");
                }
                setIsExistingCar(false);
                setJaVinculado(false);
                setSuccess(null);
                setError(null);
            }
        } catch (err) {
            console.error("Erro ao verificar placa");
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErros({});
        setError(null);
        setSuccess(null);

        // Validação de campos obrigatórios
        const novosErros: Record<string, string> = {};
        if (!marca?.trim()) novosErros.marca = "Preencha a marca";
        if (!modelo?.trim()) novosErros.modelo = "Preencha o modelo";
        if (!ano?.trim()) novosErros.ano = "Preencha o ano";
        if (!placa?.trim()) novosErros.placa = "Preencha a placa";
        if (!cor?.trim()) novosErros.cor = "Preencha a cor";

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            setError("Todos os campos são obrigatórios!");
            return;
        }

        if (isExistingCar) {
            if (motoristaId) {
                if (jaVinculado) {
                    Swal.fire({
                        title: 'Vínculo Existente',
                        text: `Este veículo (${placa}) já está vinculado ao Motorista ${motoristaNome}.`,
                        icon: 'warning',
                        confirmButtonColor: '#2563eb'
                    });
                    return;
                }
                // Confirmação para vincular carro existente ao motorista
                Swal.fire({
                    title: 'Confirmar Vínculo',
                    text: `Deseja vincular o veículo ${placa} ao Motorista ${motoristaNome}?`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#2563eb',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Sim, Vincular',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) processarEnvio();
                });
            } else {
                // Segurança extra: Se por algum motivo o onBlur falhou, o submit bloqueia aqui
                router.push("/carro/list");
            }
            return;
        }

        // Fluxo de Cadastro de Carro Novo
        processarEnvio();
    };

    const processarEnvio = async () => {
        setLoading(true);
        try {
            await instancia.post("/carro", {
                marca, modelo, ano, placa, cor,
                motoristaId: motoristaId ? Number(motoristaId) : null
            });

            setSuccess(isExistingCar ? "Vínculo realizado!" : "Veículo cadastrado e vinculado!");

            setTimeout(() => {
                router.push(motoristaId ? `/motorista/${motoristaId}` : "/carro/list");
            }, 2000);

        } catch (error: any) {
            setError(error.response?.data?.message || "Erro ao processar veículo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-black">
            <Menu />
            
            <div className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Cadastrar Veículo</h1>
                        {motoristaId && (
                            <p className="text-xs text-gray-500 font-bold uppercase">
                                Vinculando ao Motorista: {motoristaNome || "Carregando..."}
                            </p>
                        )}
                    </div>
                    <Link 
                        href={motoristaId ? `/motorista/${motoristaId}` : "/carro/list"} 
                        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 font-bold text-sm"
                    >
                        Voltar
                    </Link>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex flex-col md:col-span-2">
                        <label className="font-bold text-sm mb-1">Placa (Verificação automática):</label>
                        <input 
                            type="text"
                            value={placa}
                            maxLength={7}
                            onBlur={(e) => verificarPlaca(e.target.value)}
                            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                            placeholder="ABC1D23"
                            className={`border p-2 rounded outline-none font-mono ${erros.placa ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Marca:</label>
                        <input 
                            type="text"
                            value={marca}
                            readOnly={isExistingCar}
                            onChange={(e) => setMarca(e.target.value)}
                            className={`border p-2 rounded outline-none ${isExistingCar ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'border-gray-300'}`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Modelo:</label>
                        <input 
                            type="text"
                            value={modelo}
                            readOnly={isExistingCar}
                            onChange={(e) => setModelo(e.target.value)}
                            className={`border p-2 rounded outline-none ${isExistingCar ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'border-gray-300'}`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Ano:</label>
                        <input 
                            type="text"
                            value={ano}
                            readOnly={isExistingCar}
                            onChange={(e) => setAno(e.target.value)}
                            className={`border p-2 rounded outline-none ${isExistingCar ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'border-gray-300'}`}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Cor:</label>
                        <input 
                            type="text"
                            value={cor}
                            readOnly={isExistingCar}
                            onChange={(e) => setCor(e.target.value)}
                            className={`border p-2 rounded outline-none ${isExistingCar ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'border-gray-300'}`}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded font-bold text-white transition-all mt-4 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 
                            isExistingCar ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loading ? "PROCESSANDO..." : isExistingCar ? "CONFIRMAR VÍNCULO" : "CADASTRAR VEÍCULO"}
                    </button>
                </form>
            </div>
        </div>
    );
}