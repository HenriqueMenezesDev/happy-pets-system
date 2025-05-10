
import { supabase } from '@/integrations/supabase/client';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Funcionario } from '@/types';
import { mapDbFuncionarioToFuncionario } from './types/mappers';

export interface AuthCredentials {
  email: string;
  senha: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Funcionario | null;
  isLoading: boolean;
}

// Login do funcionário
export async function loginFuncionario(credentials: AuthCredentials) {
  try {
    // Buscar o funcionário pelo email
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('email_login', credentials.email)
      .eq('ativo', true)  // Verifica se o funcionário está ativo
      .maybeSingle(); // Usa maybeSingle em vez de single para evitar erro

    if (error) {
      console.error("Erro na consulta:", error);
      throw error;
    }
    
    if (!data) {
      console.log("Funcionário não encontrado ou inativo");
      toast({
        title: 'Erro de autenticação',
        description: 'Email ou senha inválidos',
        variant: 'destructive',
      });
      return null;
    }

    // Verificação da senha
    if (data.senha_hash !== credentials.senha) {
      console.log("Senha incorreta");
      toast({
        title: 'Erro de autenticação',
        description: 'Email ou senha inválidos',
        variant: 'destructive',
      });
      return null;
    }

    // Armazenar o funcionário no localStorage
    localStorage.setItem('authUser', JSON.stringify(data));
    console.log("Funcionário autenticado:", data.nome);
    
    toast({
      title: 'Login realizado com sucesso!',
      description: `Bem-vindo(a) ${data.nome}`,
    });

    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    console.error("Erro no processo de login:", error);
    handleError(error, 'fazer login');
    return null;
  }
}

// Verificar se existe um usuário logado
export function getCurrentUser(): Funcionario | null {
  try {
    const storedUser = localStorage.getItem('authUser');
    if (!storedUser) return null;
    
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Erro ao recuperar usuário atual:", error);
    return null;
  }
}

// Logout do funcionário
export function logoutFuncionario() {
  localStorage.removeItem('authUser');
  toast({
    title: 'Logout realizado com sucesso!',
  });
  return true;
}

// Verificar se o usuário tem um determinado perfil
export function hasRole(user: Funcionario | null, role: string): boolean {
  if (!user) return false;
  
  if (role === 'admin') {
    return user.perfil === 'admin';
  }
  
  if (role === 'gerente') {
    return user.perfil === 'gerente' || user.perfil === 'admin';
  }
  
  return true; // Qualquer usuário autenticado tem acesso a funções básicas
}

// Atualizar a senha do funcionário
export async function atualizarSenha(funcionarioId: string, novaSenha: string) {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .update({ senha_hash: novaSenha })
      .eq('id', funcionarioId)
      .select('*')
      .single();

    if (error) throw error;
    toast({ title: "Senha atualizada com sucesso!" });
    
    // Atualizar usuário no localStorage
    if (getCurrentUser()?.id === funcionarioId) {
      localStorage.setItem('authUser', JSON.stringify(data));
    }
    
    return true;
  } catch (error: any) {
    handleError(error, 'atualizar senha');
    return false;
  }
}
