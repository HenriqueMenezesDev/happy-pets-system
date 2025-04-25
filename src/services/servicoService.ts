
import { supabase } from '@/integrations/supabase/client';
import { Servico } from '@/types';
import { mapDbServicoToServico } from './types/mappers';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';

export async function fetchServicos() {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbServicoToServico);
  } catch (error: any) {
    handleError(error, 'buscar serviços');
    return [];
  }
}

export async function addServico(servico: Omit<Servico, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .insert(servico)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbServicoToServico(data);
  } catch (error: any) {
    handleError(error, 'adicionar serviço');
    return null;
  }
}

export async function updateServico(id: string, servico: Partial<Servico>) {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .update(servico)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbServicoToServico(data);
  } catch (error: any) {
    handleError(error, 'atualizar serviço');
    return null;
  }
}

export async function deleteServico(id: string) {
  try {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Serviço removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'excluir serviço');
    return false;
  }
}
