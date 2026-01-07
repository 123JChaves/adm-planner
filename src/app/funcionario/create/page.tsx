"use client";

import AlertMessage from "@/components/AlertMessage";
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AutocompleteInput from "@/components/AutocompleteInput";
import { useEffect, useState } from "react";

export default function CreateFuncionario() { 
    const searchParams = useSearchParams();
    
    // ESTADOS DE CONTROLE
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // ESTADOS DOS CAMPOS
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");

    // ID DA EMPRESA (CAPTURADO DA URL)
    const [idEmpresa, setIdEmpresa] = useState<number | null>(null);

    // ENDEREÇO
    const [textoLogradouro, setTextoLogradouro] = useState("");
    const [idLogradouro, setIdLogradouro] = useState<number | null>(null);
    const [numero, setNumero] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [textoPais, setTextoPais] = useState("");
    const [idPais, setIdPais] = useState<number | null>(null);
    const [textoEstado, setTextoEstado] = useState("");
    const [idEstado, setIdEstado] = useState<number | null>(null);
    const [textoCidade, setTextoCidade] = useState("");
    const [idCidade, setIdCidade] = useState<number | null>(null);
    const [textoBairro, setTextoBairro] = useState("");
    const [idBairro, setIdBairro] = useState<number | null>(null);

    const [dbPaises, setDbPaises] = useState([]);
    const [dbEstados, setDbEstados] = useState([]);
    const [dbCidades, setDbCidades] = useState([]);
    const [dbBairros, setDbBairros] = useState([]);
    const [dbLogradouros, setDbLogradouros] = useState([]);

    // 1. SINCRONIZAR ID DA EMPRESA DA URL
    useEffect(() => {
        const queryId = searchParams.get("empresaId");
        if (queryId) {
            setIdEmpresa(Number(queryId));
        }
    }, [searchParams]);

    // 2. CARGA INICIAL DE DADOS 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resP, resE, resC, resB, resL] = await Promise.all([
                    instancia.get("/pais"),
                    instancia.get("/estado"),
                    instancia.get("/cidade"),
                    instancia.get("/bairro"),
                    instancia.get("/logradouro"),
                ]);
                setDbPaises(resP.data);
                setDbEstados(resE.data);
                setDbCidades(resC.data);
                setDbBairros(resB.data);
                setDbLogradouros(resL.data);
            } catch (error) {
                setError("Erro ao sincronizar listas de endereços");
            }
        };
        fetchData();
    }, []);
     // 2. FUNÇÕES AUXILIARES (FILTRO E INPUT)
    const filtrar = (lista: any[], busca: string) => {
        if (busca.length < 1) return [];
        return lista.filter((item) =>
        item.nome.toLowerCase().includes(busca.toLowerCase())
        );
    };

    const handleInput = (texto: string, lista: any[], setTexto: any, setId: any, nivel?: string) => {
        setTexto(texto);
        const match = lista.find((i) => i.nome.toLowerCase() === texto.toLowerCase());
        const novoId = match ? match.id : null;
        setId(novoId);

        // Reset em cascata se o nível superior mudar
        if (nivel === "pais") { setTextoEstado(""); setIdEstado(null); }
        if (nivel === "estado") { setTextoCidade(""); setIdCidade(null); }
        if (nivel === "cidade") { setTextoBairro(""); setIdBairro(null); }
        if (nivel === "bairro") { setTextoLogradouro(""); setIdLogradouro(null); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErros({});
        setError(null);
        setSuccess(null);

        if (!idEmpresa) {
            setError("ID da empresa não identificado.");
            return;
        }

        const novosErros: Record<string, string> = {};
        if (!nome?.trim()) novosErros.nome = "Nome é obrigatório";
        if (!cpf?.trim()) novosErros.cpf = "CPF é obrigatório";
        if (!textoLogradouro?.trim()) novosErros.logradouro = "Logradouro é obrigatório";
        if (!numero?.trim()) novosErros.numero = "Número é obrigatório";

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            if(!error) {
            setError("Preencha os campos obrigatórios.");
            }
             window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        const payload = {
            nome: nome.trim(),
            cpf: cpf.trim(),
            logradouro: {
                id: idLogradouro,
                nome: textoLogradouro,
                numero: Number(numero),
                latitude: latitude,
                longitude: longitude,
                bairro: {
                    id: idBairro,
                    nome: textoBairro,
                    cidade: {
                        id: idCidade,
                        nome: textoCidade,
                        estado: {
                            id: idEstado,
                            nome: textoEstado,
                            pais: { id: idPais, nome: textoPais }
                        }
                    }
                }
            }
        };

        try {
            await instancia.post(`/empresa/${idEmpresa}/funcionario`, payload);
            setSuccess("Funcionário cadastrado com sucesso!");
            
            // Resetar estados
            setNome("");
            setCpf("");
            setNumero("");
            setTextoLogradouro("");
            setTextoBairro("");
            setTextoCidade("");
            setTextoEstado("");
            setTextoPais("");
            setLatitude("");
            setLongitude("");

        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao cadastrar funcionário.");
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">
            <Menu />
            <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
                {/* Cabeçalho com Botão Voltar Dinâmico */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Cadastrar Funcionário</h1>
                    <Link 
                        href={idEmpresa ? `/empresa/${idEmpresa}` : "/empresa"} 
                        className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors shadow-sm font-bold text-sm"
                    >
                        Empresa
                    </Link>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                <div className="md:col-span-2 pb-2 mb-2">
                    <h2 className="text-lg font-semibold text-blue-700">Dados do Funcionário</h2>
                </div>
                    
                    {/* NOME DO FUNCIONÁRIO */}
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Nome do Funcionário:</label>
                        <input 
                            type="text"
                            autoComplete="off" 
                            value={nome} 
                            onChange={(e) => {
                                setNome(e.target.value);
                                if (erros.nome) setErros(prev => ({ ...prev, nome: "" }));
                            }} 
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.nome
                                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-blue-300'
                            }`}
                            placeholder="Nome completo"
                        />
                        {erros.nome && <span className="text-red-500 text-xs font-bold mt-1">{erros.nome}</span>}
                    </div>

                    {/* CPF */}
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">CPF:</label>
                        <input
                            type="text"
                            autoComplete="off"
                            value={cpf}
                            onChange={(e) => {
                                setCpf(e.target.value);
                                if (erros.cpf) setErros(prev => ({ ...prev, cpf: "" }));
                            }}
                            placeholder="000.000.000-00"
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.cpf
                                ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-300'
                            }`}
                        />
                        {erros.cpf && <span className="text-red-500 text-xs font-bold mt-1">{erros.cpf}</span>}
                    </div>

                    {/* --- AQUI VOCÊ ADICIONA OS CAMPOS DE ENDEREÇO SEGUINDO O MESMO PADRÃO --- */}

                <div className="md:col-span-2 pb-2 mt-4 mb-2">
                    <h2 className="text-lg font-semibold text-blue-700">Endereço</h2>
                </div>

                    <AutocompleteInput
                        label="País"
                        value={textoPais}
                        error={erros.pais}
                        onChange={(v) => handleInput(v, dbPaises, setTextoPais, setIdPais, "pais")}
                        sugestoes={filtrar(dbPaises, textoPais)}
                        onSelect={(i) => {
                            setTextoPais(i.nome);
                            setIdPais(i.id);
                            setTextoEstado("");
                            setIdEstado(null);
                            setErros(prev => ({ ...prev, pais: ""}));
                        }}
                        isNovo={!idPais && textoPais.length > 0}
                        placeholder="Digite o nome do país"
                    />

                    <AutocompleteInput 
                        label="Estado" 
                        value={textoEstado} 
                        error={erros.estado}
                        onChange={(v) => handleInput(v, dbEstados, setTextoEstado, setIdEstado, "estado")}
                        // Referência ao banco: Filtra estados pelo ID do país selecionado
                        sugestoes={filtrar(dbEstados.filter((e: any) => e.pais?.id === idPais), textoEstado)}
                        onSelect={(i: any) => { 
                            setTextoEstado(i.nome); 
                            setIdEstado(i.id); 
                            setTextoCidade(""); 
                            setIdCidade(null);
                            setErros(prev => ({ ...prev, estado: "" }));
                        }}
                        isNovo={!idEstado && textoEstado.length > 0}
                        placeholder="Digite o nome do estado"
                    />

                    <AutocompleteInput 
                        label="Cidade" 
                        value={textoCidade} 
                        error={erros.cidade}
                        onChange={(v) => handleInput(v, dbCidades, setTextoCidade, setIdCidade, "cidade")}
                        // Referência ao banco: Filtra cidades pelo ID do estado
                        sugestoes={filtrar(dbCidades.filter((c: any) => c.estado?.id === idEstado), textoCidade)}
                        onSelect={(i: any) => { 
                            setTextoCidade(i.nome); 
                            setIdCidade(i.id); 
                            setTextoBairro(""); 
                            setIdBairro(null);
                            setErros(prev => ({ ...prev, cidade: "" }));
                        }}
                        isNovo={!idCidade && textoCidade.length > 0}
                        placeholder="Digite o nome da cidade"
                    />

                    <AutocompleteInput
                        label="Bairro" 
                        value={textoBairro} 
                        error={erros.bairro}
                        onChange={(v) => handleInput(v, dbBairros, setTextoBairro, setIdBairro, "bairro")}
                        // Referência ao banco: Filtra bairros pelo ID da cidade
                        sugestoes={filtrar(dbBairros.filter((b: any) => b.cidade?.id === idCidade), textoBairro)}
                        onSelect={(i: any) => { 
                            setTextoBairro(i.nome); 
                            setIdBairro(i.id); 
                            setTextoLogradouro(""); 
                            setIdLogradouro(null);
                            setErros(prev => ({ ...prev, bairro: "" }));
                        }}
                        isNovo={!idBairro && textoBairro.length > 0}
                        placeholder="Digite o nome do bairro"
                    />

                    <AutocompleteInput 
                        label="Rua (Logradouro)" 
                        value={textoLogradouro} 
                        error={erros.logradouro}
                        onChange={(v) => handleInput(v, dbLogradouros, setTextoLogradouro, setIdLogradouro)}
                        // Referência ao banco: Filtra logradouros pelo ID do bairro
                        sugestoes={filtrar(dbLogradouros.filter((r: any) => r.bairro?.id === idBairro), textoLogradouro)}
                        onSelect={(i: any) => { 
                            setTextoLogradouro(i.nome); 
                            setIdLogradouro(i.id); 
                            setErros(prev => ({ ...prev, logradouro: "" }));
                        }}
                        isNovo={!idLogradouro && textoLogradouro.length > 0}  
                        placeholder="Digite o nome da rua"

                    />

                    <div className="flex flex-col">
                    <label className="font-bold text-sm mb-1">Número:</label>
                    <input
                        type="text"
                        autoComplete="off"
                        value={numero}
                        onChange={(e) => {
                            setNumero(e.target.value);
                            if (erros.numero) setErros(prev => ({ ...prev, numero: "" }));
                        }}
                        className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                            erros.numero 
                            ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-300 focus:ring-blue-300'
                        }`}
                    />
                        {erros.numero && <span className="text-red-500 text-xs font-bold mt-1">{erros.numero}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Latitude:</label>
                        <input
                            type="text"
                            autoComplete="off"
                            value={latitude}
                            onChange={(e) => {
                                setLatitude(e.target.value);
                                if (erros.latitude) setErros(prev => ({ ...prev, latitude: "" }));
                            }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.latitude
                                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-blue-300 bg-blue-50/30'
                            }`}
                        />
                        {erros.latitude && <span className="text-red-500 text-xs font-bold mt-1">{erros.latitude}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Longitude:</label>
                        <input
                            type="text"
                            autoComplete="off"
                            value={longitude}
                            onChange={(e) => {
                                setLongitude(e.target.value);
                                if (erros.longitude) setErros(prev => ({ ...prev, longitude: "" }));
                            }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.longitude
                                ? 'border-red-500 bg-red-50 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-blue-300 bg-blue-50/30'
                            }`}
                        />
                    {erros.longitude && <span className="text-red-500 text-xs font-bold mt-1">{erros.longitude}</span>}
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded font-bold text-white transition-all ${
                                loading
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 shadow-md'
                            }`}
                        >
                            {loading ? "PROCESSANDO..." : "SALVAR FUNCIONÁRIO"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}