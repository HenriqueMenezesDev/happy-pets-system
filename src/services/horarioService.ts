
import { supabase } from '@/integrations/supabase/client';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { HorarioDisponivel } from '@/types';
import { mapDbHorarioDisponivelToHorarioDisponivel } from './types/mappers';

// Buscar horários disponíveis
export async function fetchHorariosDisponiveis(data: string, funcionarioId?: string) {
  try {
    let query = supabase
      .from('horarios_disponiveis')
      .select('*, funcionarios(nome)')
      .eq('data', data)
      .eq('disponivel', true);
    
    if (funcionarioId) {
      query = query.eq('funcionario_id', funcionarioId);
    }
    
    const { data: horarios, error } = await query.order('hora');

    if (error) throw error;
    return horarios.map(mapDbHorarioDisponivelToHorarioDisponivel);
  } catch (error: any) {
    handleError(error, 'buscar horários disponíveis');
    return [];
  }
}

// Adicionar um novo horário disponível
export async function addHorarioDisponivel(horario: Omit<HorarioDisponivel, 'id' | 'funcionarioNome'>) {
  try {
    // Converter do modelo do frontend para o modelo do banco
    const dbHorario = {
      data: horario.data,
      hora: horario.hora,
      funcionario_id: horario.funcionarioId,
      disponivel: horario.disponivel
    };

    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .insert(dbHorario)
      .select('*, funcionarios(nome)')
      .single();

    if (error) throw error;
    return mapDbHorarioDisponivelToHorarioDisponivel(data);
  } catch (error: any) {
    handleError(error, 'adicionar horário disponível');
    return null;
  }
}

// Adicionar múltiplos horários de uma vez
export async function addMultiplosHorarios(
  funcionarioId: string, 
  data: string, 
  horasInicio: string[], 
  intervalo: number = 30
) {
  try {
    const horarios = horasInicio.map(hora => ({
      funcionario_id: funcionarioId,
      data,
      hora,
      disponivel: true
    }));

    const { data: resultado, error } = await supabase
      .from('horarios_disponiveis')
      .insert(horarios)
      .select('*, funcionarios(nome)');

    if (error) throw error;
    toast({ 
      title: "Horários adicionados com sucesso!",
      description: `${horarios.length} horários foram disponibilizados.`
    });
    return resultado.map(mapDbHorarioDisponivelToHorarioDisponivel);
  } catch (error: any) {
    handleError(error, 'adicionar múltiplos horários');
    return [];
  }
}

// Marcar horário como indisponível
export async function marcarHorarioIndisponivel(id: string) {
  try {
    const { data, error } = await supabase
      .from('horarios_disponiveis')
      .update({ disponivel: false })
      .eq('id', id)
      .select('*, funcionarios(nome)')
      .single();

    if (error) throw error;
    return mapDbHorarioDisponivelToHorarioDisponivel(data);
  } catch (error: any) {
    handleError(error, 'marcar horário como indisponível');
    return null;
  }
}

// Excluir um horário
export async function deleteHorario(id: string) {
  try {
    const { error } = await supabase
      .from('horarios_disponiveis')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Horário removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'remover horário');
    return false;
  }
}
