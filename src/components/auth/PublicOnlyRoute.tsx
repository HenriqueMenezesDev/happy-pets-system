
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Mostrar um componente de carregamento se necessário
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (isAuthenticated) {
    // Redirecionar para a página inicial se já estiver autenticado
    return <Navigate to="/" replace />;
  }

  // Renderizar o componente público
  return <>{children}</>;
};
