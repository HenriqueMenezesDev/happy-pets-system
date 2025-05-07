
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
      .maybeSingle(); // Use maybeSingle instead of single to avoid the error

    if (error) throw error;
    if (!data) {
      toast({
        title: 'Erro de autenticação',
        description: 'Email ou senha inválidos',
        variant: 'destructive',
      });
      return null;
    }

    // IMPORTANTE: Em um ambiente de produção real, usaríamos bcrypt para verificar a senha
    // Este é apenas um exemplo simplificado para demonstração
    // Em um sistema real, usaríamos autenticação do Supabase ou outra solução segura
    if (data.senha_hash !== credentials.senha) {
      toast({
        title: 'Erro de autenticação',
        description: 'Email ou senha inválidos',
        variant: 'destructive',
      });
      return null;
    }

    // Armazenar o funcionário no localStorage (em produção, use cookies ou JWT)
    localStorage.setItem('authUser', JSON.stringify(data));
    
    toast({
      title: 'Login realizado com sucesso!',
      description: `Bem-vindo(a) ${data.nome}`,
    });

    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
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
  return user.perfil === role;
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
