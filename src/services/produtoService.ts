
import { supabase } from '@/integrations/supabase/client';
import { Produto } from '@/types';
import { mapDbProdutoToProduto } from './types/mappers';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';

export async function fetchProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbProdutoToProduto);
  } catch (error: any) {
    handleError(error, 'buscar produtos');
    return [];
  }
}

export async function addProduto(produto: Omit<Produto, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert(produto)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbProdutoToProduto(data);
  } catch (error: any) {
    handleError(error, 'adicionar produto');
    return null;
  }
}

export async function updateProduto(id: string, produto: Partial<Produto>) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .update(produto)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbProdutoToProduto(data);
  } catch (error: any) {
    handleError(error, 'atualizar produto');
    return null;
  }
}

export async function deleteProduto(id: string) {
  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Produto removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'excluir produto');
    return false;
  }
}
