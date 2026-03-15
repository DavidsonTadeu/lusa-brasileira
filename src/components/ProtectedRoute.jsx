import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

// Este componente envolve as páginas que queremos proteger
export default function ProtectedRoute({ children, roleRequired }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // 1. Enquanto verifica se o utilizador está logado, mostra um loading
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  // 2. Se não estiver logado -> Manda para a Home (ou abre login)
  if (!user) {
    // Redireciona para a Home, mas guarda a tentativa para (opcionalmente) voltar depois
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. Se a rota exige ser ADMIN, mas o utilizador NÃO é admin -> Manda para Home
  if (roleRequired === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 4. Se passou por tudo, liberta o acesso à página
  return children;
}