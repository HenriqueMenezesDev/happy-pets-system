
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const PrivateRoute = ({ children, adminOnly = false }: PrivateRouteProps) => {
  const { isAuthenticated, user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Mostrar um componente de carregamento se necessário
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    // Redirecionar para a página de login se não estiver autenticado
    // Salvar o local atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirecionar para a página inicial se não for admin
    return <Navigate to="/" replace />;
  }

  // Renderizar o componente protegido
  return <>{children}</>;
};
