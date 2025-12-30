"use client";

import React, { useState, useEffect } from "react";
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import AlertMessage from "@/components/AlertMessage";
import AutocompleteInput from "@/components/AutocompleteInput";
import Link from "next/link";

export default function CreateEmpresa() {
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null);

    // --- ESTADOS: INFORMAÇÕES DA EMPRESA ---
    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");

    // --- ESTADOS: LOGRADOURO (RUA E NÚMERO) ---
    const [textoLogradouro, setTextoLogradouro] = useState("");
    const [idLogradouro, setIdLogradouro] = useState<number | null>(null);
    const [numero, setNumero] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // --- ESTADOS: HIERARQUIA DE ENDEREÇO (TEXTO E ID) ---
    const [textoPais, setTextoPais] = useState("");
    const [idPais, setIdPais] = useState<number | null>(null);

    const [textoEstado, setTextoEstado] = useState("");
    const [idEstado, setIdEstado] = useState<number | null>(null);

    const [textoCidade, setTextoCidade] = useState("");
    const [idCidade, setIdCidade] = useState<number | null>(null);

    const [textoBairro, setTextoBairro] = useState("");
    const [idBairro, setIdBairro] = useState<number | null>(null);

    // --- ESTADOS: LISTAS DO BANCO ---
    const [dbPaises, setDbPaises] = useState([]);
    const [dbEstados, setDbEstados] = useState([]);
    const [dbCidades, setDbCidades] = useState([]);
    const [dbBairros, setDbBairros] = useState([]);
    const [dbLogradouros, setDbLogradouros] = useState([]);

    // 1. CARGA INICIAL DE DADOS
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
            } catch (err) {
            setError("Erro ao sincronizar listas de endereços.");
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

    // 3. SUBMISSÃO DO FORMULÁRIO
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros({});   // Limpa erros específicos (labels)
    setError(null); // Limpa alerta geral (topo)
    setSuccess(null);

    const novosErros: Record<string, string> = {};

    // 1. Validação detalhada
    if (!nome?.trim()) novosErros.nome = "Preencha o nome fantasia";
    if (!cnpj?.trim()) novosErros.cnpj = "Preencha o CNPJ";
    if (!textoPais?.trim()) novosErros.pais = "Selecione o país";
    if (!textoEstado?.trim()) novosErros.estado = "Selecione o estado";
    if (!textoCidade?.trim()) novosErros.cidade = "Selecione a cidade";
    if (!textoBairro?.trim()) novosErros.bairro = "Selecione o bairro";
    if (!textoLogradouro?.trim()) novosErros.logradouro = "Selecione a rua";
    if (!numero?.trim()) novosErros.numero = "Preencha o número";
    if (!latitude) novosErros.latitude = "Latitude necessária";
    if (!longitude?.trim()) novosErros.longitude = "Longitude necessária";

    if (Object.keys(novosErros).length > 0) {
        setErros(novosErros); // Exibe as labels vermelhas

        // Exibe o AlertMessage
        if (!error) {
            setError("Preencha todos os campos.");
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setLoading(true);

        const payload = {
        nome,
        cnpj,
        logradouro: {
            id: idLogradouro,
            nome: textoLogradouro,
            numero: Number(numero),
            latitude,
            longitude,
            bairro: {
                id: idBairro,
                nome: textoBairro,
                cidade: {
                    id: idCidade,
                    nome: textoCidade,
                    estado: {
                        id: idEstado,
                        nome: textoEstado,
                        pais: { 
                            id: idPais, nome: textoPais 
                        }
                    }
                }
            }
        }
        };

        try {
        await instancia.post("/empresa", payload);
        setSuccess("Empresa cadastrada com sucesso!");
        
        // Resetar campos principais
        setNome("");
        setCnpj("");

        // --- LIMPEZA DA HIERARQUIA DE ENDEREÇO (TEXTO) ---
        setTextoPais("");
        setTextoEstado("");
        setTextoCidade("");
        setTextoBairro("");
        setTextoLogradouro("");

        // --- LIMPEZA DOS IDs (IMPORTANTE PARA O AUTOCOMPLETE) ---
        setIdPais(null);
        setIdEstado(null);
        setIdCidade(null);
        setIdBairro(null);
        setIdLogradouro(null);

        // --- LIMPEZA DOS CAMPOS MANUAIS ---
        setNumero("");
        setLatitude("");
        setLongitude("");

        } catch (error: any) {
        setError(error.response?.data?.message || "Erro ao cadastrar empresa.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">
        <Menu />
            <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cadastrar Empresa</h1>
                <Link href="/empresa/list" className="bg-cyan-500 text-white px-2 py-1 rounded-md hover:bg-cyan-600">Listar</Link>
            </div>

            <AlertMessage type="error" message={error} />
            <AlertMessage type="success" message={success} />

            <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
                <div className="md:col-span-2 pb-2 mb-2">
                    <h2 className="text-lg font-semibold text-blue-700">Dados Institucionais</h2>
                </div>

            <div className="flex flex-col">
                <label className="font-bold text-sm mb-1">Nome Fantasia:</label>
                    <input 
                        type="text"
                        autoComplete="off" 
                        value={nome} 
                        onChange={(e) => {
                            setNome(e.target.value);
                            if (erros.nome) setErros(prev => ({ ...prev, nome: "" })); // Limpa o erro ao digitar
                        }} 
                        className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                            erros.nome
                            ? 'border-red-500 bg-red-50 focus:ring-red-200'
                            : 'border-gray-300 focus:ring-blue-300'
                        }`}
                    />
                    {erros.nome && <span className="text-red-500 text-xs font-bold mt-1">{erros.nome}</span>}
            </div>
            <div className="flex flex-col">
                <label className="font-bold text-sm mb-1">CNPJ:</label>
                    <input
                        type="text"
                        autoComplete="off"
                        value={cnpj}
                        onChange={(e) => {
                            setCnpj(e.target.value);
                            if (erros.cnpj) setErros(prev => ({ ...prev, cnpj: "" })); // Limpa o erro ao digitar
                        }}
                        placeholder="00.000.000/0000-00"
                        className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                            erros.cnpj
                            ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                            : 'border-gray-300 focus:ring-blue-300'
                        }`}
                />
                {erros.cnpj && <span className="text-red-500 text-xs font-bold mt-1">{erros.cnpj}</span>}
            </div>

            <div className="md:col-span-2 pb-2 mt-4 mb-2">
                <h2 className="text-lg font-semibold text-blue-700">Localização</h2>
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
                        setTextoEstado(""); // Limpa o texto do próximo
                        setIdEstado(null);  // Limpa o ID do próximo para a cascata funcionar
                        setErros(prev => ({ ...prev, pais: "" })); // Limpa o erro ao selecionar
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
                    disabled={!idPais} // Bloqueia se não tiver país
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
                    disabled={!idEstado}
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
                    disabled={!idCidade}
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
                    disabled={!idBairro}
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
                    <button type="submit" disabled={loading}
                            className="w-full md:w-auto px-3 p-1 bg-green-500 text-white rounded-md hover:bg-green-600 font-bold transition-colors">
                    {loading ? "Processando..." : "Cadastrar Empresa"}
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
}