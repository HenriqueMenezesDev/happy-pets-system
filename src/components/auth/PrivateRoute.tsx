
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'gerente';
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user, isAdmin, isGerente } = useAuth();
  const location = useLocation();

  // Se estiver carregando, mostra nada (ou um spinner)
  if (isLoading) {
    return null;
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated) {
    // Salva o local atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Verificação de perfil, se necessário
  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/" />;
    }
    if (requiredRole === 'gerente' && !isGerente) {
      return <Navigate to="/" />;
    }
  }

  // Se passou pelas verificações, renderiza o conteúdo protegido
  return <>{children}</>;
};
