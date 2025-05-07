
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "gerente" | "atendente";
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Mostrar spinner de carregamento
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirecionar para a página de login se não estiver autenticado
    // Salvar o local atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se o usuário tem a função requerida
  if (requiredRole && user?.perfil) {
    // Para admin, pode acessar qualquer coisa
    if (user.perfil === "admin") {
      return <>{children}</>;
    }
    
    // Para gerente, pode acessar páginas de gerente e atendente
    if (user.perfil === "gerente" && (requiredRole === "gerente" || requiredRole === "atendente")) {
      return <>{children}</>;
    }
    
    // Para atendente, só pode acessar páginas de atendente
    if (user.perfil === "atendente" && requiredRole === "atendente") {
      return <>{children}</>;
    }
    
    // Se não tem permissão, redirecione para o Dashboard
    return <Navigate to="/" replace />;
  }

  // Renderizar o componente protegido
  return <>{children}</>;
};
