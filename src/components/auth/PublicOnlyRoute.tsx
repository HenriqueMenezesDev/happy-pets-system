import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const PublicOnlyRoute = ({ 
  children, 
  redirectPath = '/' 
}: PublicOnlyRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // If authentication is loading, show nothing or a loading indicator
  if (isLoading) {
    return null; // You could replace this with a loading spinner
  }

  // If user is authenticated, redirect to specified path
  if (isAuthenticated) {
    return <Navigate to={redirectPath} />;
  }

  // Otherwise, render children
  return <>{children}</>;
};
