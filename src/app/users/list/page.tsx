'use client'
import instancia from "@/service/api";
import { useEffect, useState } from "react"

interface User {
    id: number,
    nome: string,
    email: string,
}

export default function Users() {

    const [error, setError] = useState<string | null>(null);

    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
    
        try {
        
            const response = await instancia.get('/users');
        
            console.log(response);
        
            setUsers(response.data);

            setError("Erro ao carregar os usuários!");

        } catch (error) {
            setError("Erro ao carregar os usuários!");
        }
    }

    useEffect(() => {
    fetchUsers()
    }, []);

    return (
        <div>
            <h2>Listar Usuários</h2><br />

            {error && <p style={{ color: '#f00' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID: </th>
                        <th>Nome: </th>
                        <th>Email: </th>
                    </tr>
                </thead>
                <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.nome}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
}