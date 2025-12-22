import Menu from "@/components/Menu";
import Link from "next/link";

export default function Home() {
  return (
     <div className="flex flex-col h-screen bg-gray-100 text-black">

      <Menu /><br />

      Bem-vindo, Juliano!<br />
      <Link href="/users/list/">Usuários</Link>
    </div>
  );
}