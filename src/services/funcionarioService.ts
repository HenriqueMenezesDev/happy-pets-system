
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
    // Verificar se já existe um funcionário com o mesmo email
    const { data: existingUser, error: checkError } = await supabase
      .from('funcionarios')
      .select('id')
      .eq('email_login', funcionario.email_login)
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
      .insert(funcionario)
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
    // Se estiver atualizando o email, verificar se já existe outro funcionário com este email
    if (funcionario.email_login) {
      const { data: existingUser, error: checkError } = await supabase
        .from('funcionarios')
        .select('id')
        .eq('email_login', funcionario.email_login)
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
      .update(funcionario)
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
