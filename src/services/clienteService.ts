
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types';
import { mapDbClienteToCliente } from './types/mappers';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';

export async function fetchClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbClienteToCliente);
  } catch (error: any) {
    handleError(error, 'buscar clientes');
    return [];
  }
}

export async function addCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbClienteToCliente(data);
  } catch (error: any) {
    handleError(error, 'adicionar cliente');
    return null;
  }
}

export async function updateCliente(id: string, cliente: Partial<Cliente>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbClienteToCliente(data);
  } catch (error: any) {
    handleError(error, 'atualizar cliente');
    return null;
  }
}

export async function deleteCliente(id: string) {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Cliente removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'excluir cliente');
    return false;
  }
}
