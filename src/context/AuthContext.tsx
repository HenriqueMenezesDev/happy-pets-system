
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Funcionario } from '@/types';
import { 
  loginFuncionario, 
  logoutFuncionario, 
  getCurrentUser, 
  AuthCredentials, 
  AuthState 
} from '@/services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<Funcionario | null>;
  logout: () => void;
  isAdmin: boolean;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor de contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    // Verificar se existe um usuário logado no localStorage
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      setAuthState({
        isAuthenticated: !!currentUser,
        user: currentUser,
        isLoading: false
      });
    };

    checkAuth();
  }, []);

  const login = async (credentials: AuthCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const user = await loginFuncionario(credentials);
    
    setAuthState({
      isAuthenticated: !!user,
      user,
      isLoading: false
    });
    
    return user;
  };

  const logout = () => {
    logoutFuncionario();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  // Verificar se o usuário é admin
  const isAdmin = authState.user?.perfil === 'admin';

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
