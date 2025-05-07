
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Funcionario } from '@/types';
import { 
  loginFuncionario, 
  logoutFuncionario, 
  getCurrentUser, 
  AuthCredentials, 
  AuthState 
} from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: AuthCredentials) => Promise<Funcionario | null>;
  logout: () => void;
  isAdmin: boolean;
  isGerente: boolean;
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
      try {
        const currentUser = getCurrentUser();
        
        if (currentUser) {
          // Se houver um usuário no localStorage, verificar se ainda é válido
          // Em um sistema real você verificaria a validade do token JWT
          setAuthState({
            isAuthenticated: true,
            user: currentUser,
            isLoading: false
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Em caso de erro, limpar o estado de autenticação
        logoutFuncionario();
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: AuthCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = await loginFuncionario(credentials);
      
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false
        });
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${user.nome}!`,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
      
      return user;
    } catch (error) {
      console.error("Erro durante o login:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
      return null;
    }
  };

  const logout = () => {
    logoutFuncionario();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
    
    toast({
      title: "Logout realizado com sucesso!",
    });
  };

  // Verificar perfis de usuário
  const isAdmin = authState.user?.perfil === 'admin';
  const isGerente = authState.user?.perfil === 'gerente' || isAdmin;

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isAdmin,
      isGerente
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
