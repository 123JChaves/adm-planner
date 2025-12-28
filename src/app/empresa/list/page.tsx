"use client";

import AlertMessage from "@/components/AlertMessage";
import DeleteButton from "@/components/DeleteButton";
import Menu from "@/components/Menu";
import instancia from "@/service/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  logradouro: {
    nome: string;
    numero: number;
    bairro: {
      nome: string;
      cidade: {
        nome: string;
        estado: {
          nome: string;
          pais: {
            nome: string;
          };
        };
      };
    };
  };
  funcionarios?: any[];
}

export default function Empresas() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEmpresas = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await instancia.get("/empresa");
      setEmpresas(response.data);
    } catch (error: any) {
      setError("Erro ao carregar empresas!");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchEmpresas();
  };

  useEffect(() => {
    const message = sessionStorage.getItem("successMessage");
    if (message) {
      setSuccess(message);
      sessionStorage.removeItem("successMessage");
    }
    fetchEmpresas();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      <Menu />
      <br />
      <div className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lista de Empresas</h1>
          <Link
            href={"/empresa/create"}
            className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors"
          >
            Cadastrar Empresa
          </Link>
        </div>

        <AlertMessage type="error" message={error} />
        <AlertMessage type="success" message={success} />

        <div className="mt-6 bg-white shadow-md rounded-lg overflow-x-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3">Carregando dados...</span>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-3 text-left">ID</th>
                  <th className="border border-gray-300 p-3 text-left">Nome</th>
                  <th className="border border-gray-300 p-3 text-left">CNPJ</th>
                  <th className="border border-gray-300 p-3 text-left">Endereço</th>
                  <th className="border border-gray-300 p-3 text-center">Funcionários</th>
                  <th className="border border-gray-300 p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-100 transition-colors">
                    <td className="border border-gray-300 p-3">{empresa.id}</td>
                    <td className="border border-gray-300 p-3 font-medium">{empresa.nome}</td>
                    <td className="border border-gray-300 p-3 font-medium whitespace-nowrap">
                      {empresa.cnpj}
                    </td>
                    <td className="border border-gray-300 p-3 text-sm">
                      {empresa.logradouro ? (
                        `${empresa.logradouro.nome}, ${empresa.logradouro.numero} - ${empresa.logradouro.bairro.nome}, ${empresa.logradouro.bairro.cidade.nome}`
                      ) : (
                        <span className="text-red-500">Sem endereço</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      {empresa.funcionarios?.length || 0}
                    </td>
                    <td className="border border-gray-300 p-3">
                      <div className="flex justify-center items-center space-x-1">
                        <Link
                          href={`/empresa/${empresa.id}`}
                          className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                        >
                          Visualizar
                        </Link>
                        <Link
                          href={`/empresa/${empresa.id}/edit`}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                        >
                          Editar
                        </Link>
                        <DeleteButton
                          id={String(empresa.id)}
                          route="empresa"
                          onSuccess={handleSuccess}
                          setError={setError}
                          setSuccess={setSuccess}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {empresas.length === 0 && (
                   <tr>
                    <td colSpan={6} className="text-center p-4 text-gray-500">Nenhuma empresa encontrada.</td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}