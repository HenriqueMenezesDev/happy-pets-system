
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const PublicOnlyRoute = ({ 
  children, 
  redirectPath = '/' 
}: PublicOnlyRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Se estiver carregando, mostra um spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // Se usuário está autenticado, redireciona para o caminho especificado
  if (isAuthenticated) {
    return <Navigate to={redirectPath} />;
  }

  // Se não estiver autenticado, renderiza os filhos (página pública)
  return <>{children}</>;
};
