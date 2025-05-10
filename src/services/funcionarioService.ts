
import { supabase } from '@/integrations/supabase/client';
import { Funcionario } from '@/types';
import { mapDbFuncionarioToFuncionario } from './types/mappers';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';

export async function fetchFuncionarios() {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbFuncionarioToFuncionario);
  } catch (error: any) {
    handleError(error, 'buscar funcionários');
    return [];
  }
}

export async function addFuncionario(funcionario: Omit<Funcionario, 'id' | 'dataCadastro'>) {
  try {
    // Create the payload that matches the database schema
    const dbFuncionario = {
      nome: funcionario.nome,
      email: funcionario.email,
      email_login: funcionario.emailLogin,
      senha_hash: funcionario.senha, // In production, this should be encrypted
      cargo: funcionario.cargo,
      perfil: funcionario.perfil,
      telefone: funcionario.telefone || 'Não informado',
      ativo: funcionario.ativo !== undefined ? funcionario.ativo : true
    };

    // Verificar se já existe um funcionário com o mesmo email
    const { data: existingUser, error: checkError } = await supabase
      .from('funcionarios')
      .select('id')
      .eq('email_login', funcionario.emailLogin)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) {
      toast({
        title: "Email já cadastrado",
        description: "Já existe um funcionário com este email.",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from('funcionarios')
      .insert(dbFuncionario)
      .select('*')
      .single();

    if (error) throw error;
    
    toast({ 
      title: "Funcionário cadastrado com sucesso!", 
      description: `${funcionario.nome} foi adicionado(a) ao sistema.` 
    });
    
    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    handleError(error, 'adicionar funcionário');
    return null;
  }
}

export async function updateFuncionario(id: string, funcionario: Partial<Funcionario>) {
  try {
    // Create a database-compatible object using type assertion
    const dbFuncionario: Record<string, any> = {};
    
    // Map fields from Funcionario model to database fields
    if (funcionario.nome) dbFuncionario.nome = funcionario.nome;
    if (funcionario.email) dbFuncionario.email = funcionario.email;
    if (funcionario.emailLogin) dbFuncionario.email_login = funcionario.emailLogin;
    if (funcionario.cargo) dbFuncionario.cargo = funcionario.cargo;
    if (funcionario.perfil) dbFuncionario.perfil = funcionario.perfil;
    if (funcionario.telefone) dbFuncionario.telefone = funcionario.telefone;
    if (funcionario.senha) dbFuncionario.senha_hash = funcionario.senha;
    if (funcionario.ativo !== undefined) dbFuncionario.ativo = funcionario.ativo;
    
    // Se estiver atualizando o email, verificar se já existe outro funcionário com este email
    if (funcionario.emailLogin) {
      const { data: existingUser, error: checkError } = await supabase
        .from('funcionarios')
        .select('id')
        .eq('email_login', funcionario.emailLogin)
        .neq('id', id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        toast({
          title: "Email já cadastrado",
          description: "Já existe outro funcionário com este email.",
          variant: "destructive"
        });
        return null;
      }
    }

    const { data, error } = await supabase
      .from('funcionarios')
      .update(dbFuncionario)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    toast({ 
      title: "Funcionário atualizado com sucesso!" 
    });
    
    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    handleError(error, 'atualizar funcionário');
    return null;
  }
}

export async function deleteFuncionario(id: string) {
  try {
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Funcionário removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'excluir funcionário');
    return false;
  }
}

export async function toggleFuncionarioStatus(id: string, ativo: boolean) {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .update({ ativo })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    toast({ 
      title: ativo 
        ? "Funcionário ativado com sucesso!" 
        : "Funcionário desativado com sucesso!"
    });
    
    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    handleError(error, ativo ? 'ativar funcionário' : 'desativar funcionário');
    return null;
  }
}
