'use client'
import Swal from "sweetalert2";
import instancia from "@/service/api";

interface DeleteButtonProps {
    id: string;
    route: string;
    onSuccess?: () => void;
    setError: (message: string | null) => void;
    setSuccess: (message: string | null) => void;
    className?: string; // 1. Adicionado aqui na Interface
}

// 2. Adicionado 'className' aqui na desestruturação
const DeleteButton = ({ id, route, onSuccess, setError, setSuccess, className }: DeleteButtonProps) => {

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Tem certeza?",
            text: "Esta ação não pode ser desfeita!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

        setError(null);
        setSuccess(null);
        
        try {
            const response = await instancia.delete(`${route}/${id}`);
            setSuccess(response.data.message || "Registro apagado com sucesso!");
            if(onSuccess) {
                onSuccess()
            }
        } catch (error:any) {
            setError(error.response?.data?.message || "Erro ao apagar o registro!");
        }
    }

    return (
        <button 
            onClick={handleDelete}
            // 3. Agora o código abaixo funcionará pois 'className' existe
            className={`bg-red-500 text-white rounded-md hover:bg-red-600 font-bold flex items-center justify-center ${className}`}
        >
            Excluir
        </button>
    );
}


export default DeleteButton;