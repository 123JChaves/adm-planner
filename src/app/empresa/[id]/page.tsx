'use client'
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/service/api";
import Link from "next/link";
import Menu from "@/components/Menu";
import DeleteButton from "@/components/DeleteButton";
import AlertMessage from "@/components/AlertMessage";

interface Funcionario {
    id: number;
    nome: string;
    cpf: string;
}

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
    funcionarios?: Funcionario[];
    createDate: string;
    updateDate: string;
}

export default function EmpresaDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchEmpresaDetail = async (empresaId: string) => {
        try {
            const response = await instancia.get(`/empresa/${empresaId}`);
            setEmpresa(response.data.empresa || response.data);
        } catch (error: any) {
            setError(error.response?.data?.message || "Erro ao carregar os dados da empresa.");
        }
    };

    const fetchFuncionarios = async (empresaId: string) => {
    try {
        const response = await instancia.get(`/empresa/${empresaId}/funcionario`);
        setFuncionarios(response.data.funcionarios || response.data);
    } catch (err) {
        console.error("Erro ao buscar funcionários", err);
    }
};

    const handleSuccess = () => {
        sessionStorage.setItem("successMessage", "Empresa excluída com sucesso");
        router.push("/empresa/list");
    };

    useEffect(() => {
    if (id) {
        const empresaId = Array.isArray(id) ? id[0] : id;
        fetchEmpresaDetail(empresaId);
        fetchFuncionarios(empresaId); // Busca os funcionários da empresa
        }
    }, [id]);

    return (
    <div className="flex flex-col min-h-screen bg-gray-200 text-black">
        <Menu /><br />
        <div className="flex-1 px-4 py-6 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Detalhes da Empresa</h1>
                <span className="flex space-x-2">
                    <Link href={'/empresa/list'} className="bg-cyan-500 text-white px-3 py-1 rounded-md hover:bg-cyan-600 transition-colors">
                        Listar
                    </Link>
                    <Link href={`/empresa/${id}/edit`} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors">
                        Editar
                    </Link>
                    {empresa && !error && (
                        <DeleteButton
                            id={String(empresa.id)}
                            route="empresa"
                            onSuccess={handleSuccess}
                            setError={setError}
                            setSuccess={setSuccess}
                        />
                    )}
                </span>
            </div>

            <AlertMessage type="error" message={error} />

            {empresa && !error && (
                <div className="flex flex-col gap-6">
                    {/* Grid Superior: Dados e Localização */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bloco 1: Dados Institucionais */}
                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-600">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b">
                                Dados Institucionais
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <div><span className="font-bold text-blue-700">ID:</span> {empresa.id}</div>
                                <div><span className="font-bold text-blue-700">Nome Fantasia:</span> {empresa.nome}</div>
                                <div><span className="font-bold text-blue-700">CNPJ:</span> {empresa.cnpj}</div>
                                <div><span className="font-bold text-blue-700">Cadastrada em:</span> {new Date(empresa.createDate).toLocaleString('pt-BR')}</div>
                                <div><span className="font-bold text-blue-700">Última Atualização:</span> {new Date(empresa.updateDate).toLocaleString('pt-BR')}</div>
                            </div>
                        </div>

                        {/* Bloco 2: Localização Completa */}
                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-green-600">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b">
                                Localização e Endereço
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <div><span className="font-bold text-green-700">País:</span> {empresa.logradouro.bairro.cidade.estado.pais.nome}</div>
                                <div><span className="font-bold text-green-700">Estado:</span> {empresa.logradouro.bairro.cidade.estado.nome}</div>
                                <div><span className="font-bold text-green-700">Cidade:</span> {empresa.logradouro.bairro.cidade.nome}</div>
                                <div><span className="font-bold text-green-700">Bairro:</span> {empresa.logradouro.bairro.nome}</div>
                                <div><span className="font-bold text-green-700">Rua/Logradouro:</span> {empresa.logradouro.nome}, Nº {empresa.logradouro.numero}</div>
                                <div className="pt-2 mt-2 border-t border-gray-100 flex gap-4 text-sm">
                                    <div><span className="font-bold text-gray-900">Lat:</span> {empresa.logradouro.latitude}</div>
                                    <div><span className="font-bold text-gray-900">Long:</span> {empresa.logradouro.longitude}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bloco 3: Tabela de Funcionários */}
                    <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-purple-600">
                    <div className="grid grid-cols-4 items-center mb-4 pb-2 border-b">
                        <h2 className="col-span-3 text-xl font-semibold text-gray-800">
                            Funcionários da Empresa
                        </h2>
                        <div className="flex justify-center">
                        <Link 
                            href={`/funcionario/create?empresaId=${id}`} 
                            className="bg-cyan-600 text-white px-3 rounded text-[10px] font-bold hover:bg-cyan-700 
                            transition-all flex items-center justify-center shadow-sm uppercase tracking-wider gap-2 h-7">
                            <span className="text-base font-bold leading-none" style={{ marginBottom: '2px' }}></span>
                            <span className="leading-none">Cadastrar</span>
                        </Link>
                        </div>
                    </div>
                    {funcionarios && funcionarios.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="bg-gray-50 text-purple-700 border-b">
                                        <th className="w-1/2 p-3 font-bold text-sm uppercase">Nome</th>
                                        <th className="w-1/4 p-3 font-bold text-sm uppercase">CPF</th>
                                        <th className="w-1/4 p-3 font-bold text-sm uppercase text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {funcionarios.map((func) => (
                                        <tr key={func.id} className="border-b hover:bg-gray-50 transition-all">
                                            <td className="p-3 truncate font-medium">{func.nome.split(' ').slice(0, 2).join(' ')}</td>
                                            <td className="p-3 font-mono text-sm text-gray-600">{func.cpf}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center space-x-1">
                                                    <Link href={`/funcionario/${func.id}`} className="bg-purple-500 text-white px-2 py-1 rounded text-[10px] 
                                                    font-bold hover:bg-purple-600 uppercase">Visualizar</Link>
                                                    <Link href={`/funcionario/${func.id}/edit`} className="bg-yellow-500 text-white px-2 py-1 rounded text-[10px] 
                                                    font-bold hover:bg-yellow-600 uppercase">Editar</Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 italic">Nenhum funcionário encontrado.</div>
                    )};
                    </div>
                </div>
            )}
        </div>
    </div>
    );
}