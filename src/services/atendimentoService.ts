
import { supabase } from '@/integrations/supabase/client';
import { Atendimento, ItemAtendimento } from '@/types';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';

export async function fetchAtendimentos() {
  try {
    const { data, error } = await supabase
      .from('atendimentos')
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome)
      `)
      .order('data', { ascending: false });

    if (error) throw error;
    
    return data.map(item => {
      return {
        id: item.id,
        data: item.data,
        status: item.status as 'agendado' | 'em_andamento' | 'concluido' | 'cancelado',
        clienteId: item.cliente_id,
        clienteNome: item.clientes?.nome,
        petId: item.pet_id,
        petNome: item.pets?.nome,
        funcionarioId: item.funcionario_id,
        funcionarioNome: item.funcionarios?.nome,
        observacoes: item.observacoes || '',
        valorTotal: item.valor_total,
        itens: []
      };
    });
  } catch (error: any) {
    handleError(error, 'buscar atendimentos');
    return [];
  }
}

export async function fetchItensAtendimento(atendimentoId: string) {
  try {
    const { data, error } = await supabase
      .from('itens_atendimento')
      .select('*')
      .eq('atendimento_id', atendimentoId);

    if (error) throw error;
    
    return data.map(item => {
      return {
        id: item.id,
        tipo: item.tipo as 'produto' | 'servico',
        itemId: item.item_id,
        quantidade: item.quantidade,
        valorUnitario: item.valor_unitario,
        nome: ''
      };
    });
  } catch (error: any) {
    handleError(error, 'buscar itens do atendimento');
    return [];
  }
}

export async function addAtendimento(atendimento: Omit<Atendimento, 'id' | 'valorTotal' | 'itens'>) {
  try {
    // Convert from frontend model to database model
    const dbAtendimento = {
      data: atendimento.data,
      cliente_id: atendimento.clienteId,
      pet_id: atendimento.petId,
      funcionario_id: atendimento.funcionarioId,
      status: atendimento.status,
      observacoes: atendimento.observacoes
    };

    const { data, error } = await supabase
      .from('atendimentos')
      .insert(dbAtendimento)
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome)
      `)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      data: data.data,
      status: data.status as 'agendado' | 'em_andamento' | 'concluido' | 'cancelado',
      clienteId: data.cliente_id,
      clienteNome: data.clientes?.nome,
      petId: data.pet_id,
      petNome: data.pets?.nome,
      funcionarioId: data.funcionario_id,
      funcionarioNome: data.funcionarios?.nome,
      observacoes: data.observacoes || '',
      valorTotal: data.valor_total,
      itens: []
    };
  } catch (error: any) {
    handleError(error, 'adicionar atendimento');
    return null;
  }
}

export async function updateAtendimento(id: string, atendimento: Partial<Atendimento>) {
  try {
    const updateData: any = {};
    
    if (atendimento.data) updateData.data = atendimento.data;
    if (atendimento.status) updateData.status = atendimento.status;
    if (atendimento.clienteId) updateData.cliente_id = atendimento.clienteId;
    if (atendimento.petId) updateData.pet_id = atendimento.petId;
    if (atendimento.funcionarioId) updateData.funcionario_id = atendimento.funcionarioId;
    if (atendimento.observacoes !== undefined) updateData.observacoes = atendimento.observacoes;
    
    const { data, error } = await supabase
      .from('atendimentos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome)
      `)
      .single();

    if (error) throw error;
    
    const itens = await fetchItensAtendimento(id);
    
    return {
      id: data.id,
      data: data.data,
      status: data.status as 'agendado' | 'em_andamento' | 'concluido' | 'cancelado',
      clienteId: data.cliente_id,
      clienteNome: data.clientes?.nome,
      petId: data.pet_id,
      petNome: data.pets?.nome,
      funcionarioId: data.funcionario_id,
      funcionarioNome: data.funcionarios?.nome,
      observacoes: data.observacoes || '',
      valorTotal: data.valor_total,
      itens
    };
  } catch (error: any) {
    handleError(error, 'atualizar atendimento');
    return null;
  }
}

export async function deleteAtendimento(id: string) {
  try {
    const { error } = await supabase
      .from('atendimentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Atendimento removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'excluir atendimento');
    return false;
  }
}

export async function addItemAtendimento(atendimentoId: string, item: Omit<ItemAtendimento, 'id' | 'nome'>) {
  try {
    let nome = '';
    
    if (item.tipo === 'produto') {
      const { data } = await supabase
        .from('produtos')
        .select('nome')
        .eq('id', item.itemId)
        .single();
      
      if (data) nome = data.nome;
    } else {
      const { data } = await supabase
        .from('servicos')
        .select('nome')
        .eq('id', item.itemId)
        .single();
      
      if (data) nome = data.nome;
    }

    const dbItem = {
      atendimento_id: atendimentoId,
      tipo: item.tipo,
      item_id: item.itemId,
      quantidade: item.quantidade,
      valor_unitario: item.valorUnitario
    };

    const { data, error } = await supabase
      .from('itens_atendimento')
      .insert(dbItem)
      .select('*')
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      tipo: data.tipo as 'produto' | 'servico',
      itemId: data.item_id,
      quantidade: data.quantidade,
      valorUnitario: data.valor_unitario,
      nome
    };
  } catch (error: any) {
    handleError(error, 'adicionar item ao atendimento');
    return null;
  }
}

export async function removeItemAtendimento(atendimentoId: string, itemId: string) {
  try {
    const { error } = await supabase
      .from('itens_atendimento')
      .delete()
      .eq('id', itemId)
      .eq('atendimento_id', atendimentoId);

    if (error) throw error;
    toast({ title: "Item removido do atendimento!" });
    return true;
  } catch (error: any) {
    handleError(error, 'remover item do atendimento');
    return false;
  }
}
