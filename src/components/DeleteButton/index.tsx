'use client'
import Swal from "sweetalert2";
import instancia from "@/service/api";

interface DeleteButtonProps  {
    id: string;
    route: string;
    onSuccess?: () => void;
    setError: (message: string | null) => void;
    setSuccess: (message: string | null) => void;
}

const DeleteButton = ({id, route, onSuccess, setError, setSuccess}: DeleteButtonProps) => {

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

    return(
        <div>
            <button className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
            onClick={handleDelete}>
                Apagar
            </button>
        </div>
    )
}

export default DeleteButton;