"use client"

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import instancia from "@/service/api";
import Menu from "@/components/Menu";
import AlertMessage from "@/components/AlertMessage";
import AutocompleteInput from "@/components/AutocompleteInput";
import Link from "next/link";

export default function EditFuncionario() {

    const {id} = useParams();
    const [loading, setLoading] = useState(false);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");

    const [textoPais, setTextoPais] = useState("");
    const [idPais, setIdPais] = useState<number | null>(null);
    const [textoEstado, setTextoEstado] = useState("");
    const [idEstado, setIdEstado] = useState<number | null>(null);
    const [textoCidade, setTextoCidade] = useState("");
    const [idCidade, setIdCidade] = useState<number | null>(null);
    const [textoBairro, setTextoBairro] = useState("");
    const [idBairro, setIdBairro] = useState<number | null>(null);
    const [textoLogradouro, setTextoLogradouro] = useState("");
    const [idLogradouro, setIdLogradouro] = useState<number | null>(null);

    const [numero, setNumero] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [idEmpresa, setIdEmpresa] = useState<number | null>(null);

    const [dbPaises, setDbPaises] = useState([]);
    const [dbEstados, setDbEstados] = useState([]);
    const [dbCidades, setDbCidades] = useState([]);
    const [dbBairros, setDbBairros] = useState([]);
    const [dbLogradouros, setDbLogradouros] = useState([]);

    // 1. CARGA INICIAL (LISTAS + DADOS DO REGISTRO)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resP, resE, resC, resB, resL, resFun] = await Promise.all([
                    instancia.get("/pais"),
                    instancia.get("/estado"),
                    instancia.get("/cidade"),
                    instancia.get("/bairro"),
                    instancia.get("/logradouro"),
                    instancia.get(`/funcionario/${id}`)
                ]);

                setDbPaises(resP.data);
                setDbEstados(resE.data);
                setDbCidades(resC.data);
                setDbBairros(resB.data);
                setDbLogradouros(resL.data);

                const fun = resFun.data.funcionario || resFun.data;
                setNome(fun.pessoa.nome || "");
                setCpf(fun.pessoa.cpf || "");

                if (fun.empresa) {
                setIdEmpresa(fun.empresa.id);
                }

                const log = fun.logradouro;
                if(log) {
                    setNumero(log.numero?.toString() || "");
                    setLatitude(log.latitude || "");
                    setLongitude(log.longitude || "");
                    setTextoLogradouro(log.nome || "");
                    setIdLogradouro(log.id || null);
                    
                    if (log.bairro) {
                        setTextoBairro(log.bairro.nome || "");
                        setIdBairro(log.bairro.id || null);
                        if (log.bairro.cidade) {
                            setTextoCidade(log.bairro.cidade.nome || "");
                            setIdCidade(log.bairro.cidade.id || null);
                            if (log.bairro.cidade.estado) {
                                setTextoEstado(log.bairro.cidade.estado.nome || "");
                                setIdEstado(log.bairro.cidade.estado.id || null);
                                if (log.bairro.cidade.estado.pais) {
                                    setTextoPais(log.bairro.cidade.estado.pais.nome || "");
                                    setIdPais(log.bairro.cidade.estado.pais.id || null);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                setError("Erro ao sincronizar os dados do funcionário.")
            }
        };
        if(id) fetchData();
    }, [id]);
    
    // 2. FUNÇÕES DE FILTRO
    const filtrar = (lista: any[], busca: string) => {
        if(!busca || busca.length < 1) return[];
        return lista.filter((item) => item.nome.toLowerCase().includes(busca.toLowerCase()));
    };

    const handleInput = (texto: string, lista: any[], setTexto: any, setId: any, campo: string) => {
    setTexto(texto);

    //Se o usuário apagar o campo do nó que é o mais alto na hierarquia da árvore, os nós inferiores
    //também serão esvaziados
    if (!texto.trim()) {
        setId(null);

        // Limpeza em cascata de texto e IDs para evitar dados órfãos e travamentos
        if (campo === "pais") { 
            setTextoEstado(""); setIdEstado(null); 
            setTextoCidade(""); setIdCidade(null);
            setTextoBairro(""); setIdBairro(null);
            setTextoLogradouro(""); setIdLogradouro(null);
        }
        if (campo === "estado") { 
            setTextoCidade(""); setIdCidade(null);
            setTextoBairro(""); setIdBairro(null);
            setTextoLogradouro(""); setIdLogradouro(null);
        }
        if (campo === "cidade") { 
            setTextoBairro(""); setIdBairro(null);
            setTextoLogradouro(""); setIdLogradouro(null);
        }
        if (campo === "bairro") { 
            setTextoLogradouro(""); setIdLogradouro(null); 
        }
    
        return;

        }

        if (erros[campo]) setErros(prev => ({ ...prev, [campo]: "" }));
    
        const match = lista.find((i) => i.nome.toLowerCase() === texto.toLowerCase());
        const novoId = match ? match.id : null;
        setId(novoId);

        // Se o ID mudou ou ficou null, reseta apenas o nível imediatamente abaixo
        if (campo === "pais") { setTextoEstado(""); setIdEstado(null); }
        if (campo === "estado") { setTextoCidade(""); setIdCidade(null); }
        if (campo === "cidade") { setTextoBairro(""); setIdBairro(null); }
        if (campo === "bairro") { setTextoLogradouro(""); setIdLogradouro(null); }
    };

    // 3. SUBMISSÃO COM VALIDAÇÃO COMPLETA
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErros({});
        setError(null);
        setSuccess(null);

        const novosErros: Record<string, string> = {};
        if (!nome?.trim()) novosErros.nome = "Preencha o nome fantasia";
        if (!cpf?.trim()) novosErros.cpf = "Preencha o CNPJ";
        if (!textoPais?.trim()) novosErros.pais = "Selecione o país";
        if (!textoEstado?.trim()) novosErros.estado = "Selecione o estado";
        if (!textoCidade?.trim()) novosErros.cidade = "Selecione a cidade";
        if (!textoBairro?.trim()) novosErros.bairro = "Selecione o bairro";
        if (!textoLogradouro?.trim()) novosErros.logradouro = "Selecione a rua";
        if (!numero?.trim()) novosErros.numero = "Preencha o número";
        if (!latitude?.trim()) novosErros.latitude = "Latitude necessária";
        if (!longitude?.trim()) novosErros.longitude = "Longitude necessária";

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);

            if(!error) {
            setError("Todos campos de edição são obrigatórios.");
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            await instancia.put(`/funcionario/${id}`, {
                pessoa: {
                nome, 
                cpf,
                }, logradouro: {
                        id: idLogradouro,
                        nome: textoLogradouro,
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
                                        id: idPais,
                                        nome: textoPais
                                    }
                                }
                            }
                        }
                    }
                }
            );
            setSuccess("Funcionario atualizado com sucesso!")
        } catch(error: any) {
            setError(error.response?.data?.message || "Erro ao atualizar funcionario");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">

            <Menu /> <br />
            
            <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Editar Funcionario</h1>
                    <span>
                    <Link 
                        href={idEmpresa ? `/empresa/${idEmpresa}` : "#"} 
                        className={`bg-blue-500 text-white px-4 py-2 me-2 rounded-md hover:bg-blue-600 ${!idEmpresa ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Empresa
                    </Link>
                    <Link
                        href={`/funcionario/${id}`} 
                        className={`bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 ${!id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Visualizar
                    </Link>
                    </span>
                </div>

                <AlertMessage type="error" message={error} />
                <AlertMessage type="success" message={success} />

                <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2 pb-2 mb-2">
                        <h2 className="text-lg font-semibold text-blue-700">Dados do Funcionário</h2>
                    </div>

                    {/* Campo Nome */}
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Nome do Funcionário:</label>
                        <input
                            type="text" 
                            value={nome} // Corrigido: usa a variável 'nome' declarada no useState
                            onChange={(e) => {
                                const value = e.target.value;
                                setNome(value); 
                                
                                // Corrigido: acessa erros.nome conforme seu handleSubmit
                                if (erros.nome) {
                                    setErros(prev => ({
                                        ...prev,
                                        nome: ""
                                    }));
                                }
                            }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${
                                erros.nome ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'
                            }`}
                        />
                        {erros.nome && <span className="text-red-500 text-xs font-bold mt-1">{erros.nome}</span>}
                    </div>

                    {/* Campo CPF */}
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">CPF:</label>
                        <input 
                            type="text" 
                            value={cpf} // Corrigido: usa a variável 'cpf' declarada no useState
                            readOnly 
                            className={`border p-2 rounded outline-none bg-gray-100 cursor-not-allowed ${
                                erros.cpf ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {erros.cpf && <span className="text-red-500 text-xs font-bold mt-1">{erros.cpf}</span>}
                    </div>

                    <div className="md:col-span-2 mt-4 pb-2 mb-2">
                        <h2 className="text-lg font-semibold text-blue-700">Localização</h2>
                    </div>

                    {/* Autocompletes com Hierarquia Restaurada */}
                    <AutocompleteInput 
                        label="País" value={textoPais} error={erros.pais}
                        onChange={(v) => handleInput(v, dbPaises, setTextoPais, setIdPais, "pais")}
                        sugestoes={filtrar(dbPaises, textoPais)}
                        onSelect={(i) => { setTextoPais(i.nome); setIdPais(i.id); setTextoEstado(""); setIdEstado(null); }}
                    />

                    <AutocompleteInput 
                        label="Estado" value={textoEstado} error={erros.estado} disabled={!idPais}
                        onChange={(v) => handleInput(v, dbEstados, setTextoEstado, setIdEstado, "estado")}
                        sugestoes={filtrar(dbEstados.filter((e: any) => e.pais?.id === idPais), textoEstado)}
                        onSelect={(i) => { setTextoEstado(i.nome); setIdEstado(i.id); setTextoCidade(""); setIdCidade(null); }}
                    />

                    <AutocompleteInput 
                        label="Cidade" value={textoCidade} error={erros.cidade} disabled={!idEstado}
                        onChange={(v) => handleInput(v, dbCidades, setTextoCidade, setIdCidade, "cidade")}
                        sugestoes={filtrar(dbCidades.filter((c: any) => c.estado?.id === idEstado), textoCidade)}
                        onSelect={(i) => { setTextoCidade(i.nome); setIdCidade(i.id); setTextoBairro(""); setIdBairro(null); }}
                    />

                    <AutocompleteInput 
                        label="Bairro" value={textoBairro} error={erros.bairro} disabled={!idCidade}
                        onChange={(v) => handleInput(v, dbBairros, setTextoBairro, setIdBairro, "bairro")}
                        sugestoes={filtrar(dbBairros.filter((b: any) => b.cidade?.id === idCidade), textoBairro)}
                        onSelect={(i) => { setTextoBairro(i.nome); setIdBairro(i.id); setTextoLogradouro(""); setIdLogradouro(null); }}
                    />

                    <AutocompleteInput 
                        label="Rua (Logradouro)" value={textoLogradouro} error={erros.logradouro} disabled={!idBairro}
                        onChange={(v) => handleInput(v, dbLogradouros, setTextoLogradouro, setIdLogradouro, "logradouro")}
                        sugestoes={filtrar(dbLogradouros.filter((r: any) => r.bairro?.id === idBairro), textoLogradouro)}
                        onSelect={(i) => { setTextoLogradouro(i.nome); setIdLogradouro(i.id); }}
                    />

                    {/* Número, Latitude e Longitude com Estilo de Erro idêntico ao Create */}
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Número:</label>
                        <input 
                            type="text" value={numero} 
                            onChange={(e) => { setNumero(e.target.value); if (erros.numero) setErros(prev => ({...prev, numero: ""})); }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${erros.numero ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300'}`}
                        />
                        {erros.numero && <span className="text-red-500 text-xs font-bold mt-1">{erros.numero}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Latitude:</label>
                        <input
                            type="text" value={latitude}
                            onChange={(e) => { setLatitude(e.target.value); if (erros.latitude) setErros(prev => ({ ...prev, latitude: "" })); }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${erros.latitude ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300 bg-blue-50/30'}`}
                        />
                        {erros.latitude && <span className="text-red-500 text-xs font-bold mt-1">{erros.latitude}</span>}
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1">Longitude:</label>
                        <input
                            type="text" value={longitude}
                            onChange={(e) => { setLongitude(e.target.value); if (erros.longitude) setErros(prev => ({ ...prev, longitude: "" })); }}
                            className={`border p-2 rounded outline-none transition-all focus:ring-2 ${erros.longitude ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-300 bg-blue-50/30'}`}
                        />
                        {erros.longitude && <span className="text-red-500 text-xs font-bold mt-1">{erros.longitude}</span>}
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="md:col-span-2 bg-green-500 text-white font-bold py-3 rounded-md hover:bg-green-600 transition-colors mt-4"
                    >
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </div>
    )
}