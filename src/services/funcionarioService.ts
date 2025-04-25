
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
    const { data, error } = await supabase
      .from('funcionarios')
      .insert(funcionario)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    handleError(error, 'adicionar funcionário');
    return null;
  }
}

export async function updateFuncionario(id: string, funcionario: Partial<Funcionario>) {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(funcionario)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
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
