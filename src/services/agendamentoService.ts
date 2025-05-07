
import { supabase } from '@/integrations/supabase/client';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { Agendamento } from '@/types';
import { mapDbAgendamentoToAgendamento } from './types/mappers';

// Buscar todos os agendamentos
export async function fetchAgendamentos() {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome),
        servicos(nome, duracao, preco)
      `)
      .order('data', { ascending: true })
      .order('hora', { ascending: true });

    if (error) throw error;
    return data.map(mapDbAgendamentoToAgendamento);
  } catch (error: any) {
    handleError(error, 'buscar agendamentos');
    return [];
  }
}

// Buscar agendamentos do cliente
export async function fetchAgendamentosCliente(clienteId: string) {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome),
        servicos(nome, duracao, preco)
      `)
      .eq('cliente_id', clienteId)
      .order('data', { ascending: false })
      .order('hora', { ascending: true });

    if (error) throw error;
    return data.map(mapDbAgendamentoToAgendamento);
  } catch (error: any) {
    handleError(error, 'buscar agendamentos do cliente');
    return [];
  }
}

// Adicionar um novo agendamento
export async function addAgendamento(agendamento: Omit<Agendamento, 'id' | 'valorServico' | 'clienteNome' | 'petNome' | 'funcionarioNome' | 'servicoNome'>) {
  try {
    // Converter do modelo do frontend para o modelo do banco
    const dbAgendamento = {
      cliente_id: agendamento.clienteId,
      pet_id: agendamento.petId,
      funcionario_id: agendamento.funcionarioId,
      servico_id: agendamento.servicoId,
      data: agendamento.data,
      hora: agendamento.hora,
      status: agendamento.status,
      observacoes: agendamento.observacoes
    };

    const { data, error } = await supabase
      .from('agendamentos')
      .insert(dbAgendamento)
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome),
        servicos(nome, duracao, preco)
      `)
      .single();

    if (error) throw error;
    toast({ 
      title: "Agendamento realizado com sucesso!",
      description: `Seu agendamento foi confirmado para ${new Date(agendamento.data).toLocaleDateString()} às ${agendamento.hora}`
    });
    return mapDbAgendamentoToAgendamento(data);
  } catch (error: any) {
    handleError(error, 'adicionar agendamento');
    return null;
  }
}

// Atualizar um agendamento existente
export async function updateAgendamento(id: string, agendamento: Partial<Agendamento>) {
  try {
    const updateData: any = {};
    
    if (agendamento.clienteId) updateData.cliente_id = agendamento.clienteId;
    if (agendamento.petId) updateData.pet_id = agendamento.petId;
    if (agendamento.funcionarioId) updateData.funcionario_id = agendamento.funcionarioId;
    if (agendamento.servicoId) updateData.servico_id = agendamento.servicoId;
    if (agendamento.data) updateData.data = agendamento.data;
    if (agendamento.hora) updateData.hora = agendamento.hora;
    if (agendamento.status) updateData.status = agendamento.status;
    if (agendamento.observacoes !== undefined) updateData.observacoes = agendamento.observacoes;

    const { data, error } = await supabase
      .from('agendamentos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome),
        servicos(nome, duracao, preco)
      `)
      .single();

    if (error) throw error;
    toast({ title: "Agendamento atualizado com sucesso!" });
    return mapDbAgendamentoToAgendamento(data);
  } catch (error: any) {
    handleError(error, 'atualizar agendamento');
    return null;
  }
}

// Excluir um agendamento
export async function deleteAgendamento(id: string) {
  try {
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Agendamento cancelado com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'cancelar agendamento');
    return false;
  }
}
