
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'gerente';
}

export const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user, isAdmin, isGerente } = useAuth();
  const location = useLocation();

  // Se estiver carregando, mostra um spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
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
