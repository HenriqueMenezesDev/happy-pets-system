
import { supabase } from '@/integrations/supabase/client';
import { handleError } from './utils/errorHandler';
import { LembreteEmail } from '@/types';
import { mapDbLembreteEmailToLembreteEmail } from './types/mappers';
import { toast } from '@/hooks/use-toast';

// Buscar lembretes de email pendentes
export async function fetchLembretesEmailPendentes() {
  try {
    const { data, error } = await supabase
      .from('lembretes_email')
      .select(`
        *,
        agendamentos(
          id,
          data,
          hora,
          observacoes,
          clientes(id, nome, email),
          pets(id, nome),
          funcionarios(id, nome),
          servicos(id, nome, duracao, preco)
        )
      `)
      .eq('status', 'pendente')
      .is('enviado_em', null);

    if (error) throw error;
    return data.map(mapDbLembreteEmailToLembreteEmail);
  } catch (error: any) {
    handleError(error, 'buscar lembretes de email pendentes');
    return [];
  }
}

// Marcar lembrete como enviado
export async function marcarLembreteEnviado(id: string) {
  try {
    const { data, error } = await supabase
      .from('lembretes_email')
      .update({ 
        status: 'enviado',
        enviado_em: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    toast({ 
      title: "Email marcado como enviado",
      description: "O lembrete foi marcado como enviado com sucesso."
    });
    return mapDbLembreteEmailToLembreteEmail(data);
  } catch (error: any) {
    handleError(error, 'marcar lembrete como enviado');
    return null;
  }
}

// Simular envio de email (em um ambiente real, isso seria feito por uma edge function)
export async function enviarLembreteEmail(lembrete: LembreteEmail) {
  try {
    if (!lembrete.agendamento || !lembrete.agendamento.cliente) {
      throw new Error("Dados de agendamento incompletos");
    }

    console.log(`[SIMULAÇÃO DE EMAIL] 
      Tipo: ${lembrete.tipo}
      Para: ${lembrete.agendamento.cliente.email}
      Assunto: ${lembrete.tipo === 'confirmacao' ? 'Confirmação de Agendamento' : 'Lembrete de Consulta'}
      Mensagem: ${getEmailMessage(lembrete)}
    `);

    toast({
      title: `Email ${lembrete.tipo === 'confirmacao' ? 'de confirmação' : 'de lembrete'} enviado`,
      description: `Email enviado para ${lembrete.agendamento.cliente.email}`
    });

    // Marcar como enviado no banco de dados
    return await marcarLembreteEnviado(lembrete.id);
  } catch (error: any) {
    handleError(error, 'enviar lembrete por email');
    return null;
  }
}

// Função para gerar o conteúdo do email com base no tipo de lembrete
function getEmailMessage(lembrete: LembreteEmail): string {
  if (!lembrete.agendamento) return '';
  
  const agendamento = lembrete.agendamento;
  const data = new Date(agendamento.data).toLocaleDateString();
  const cliente = agendamento.cliente?.nome || '';
  const pet = agendamento.pet?.nome || '';
  const servico = agendamento.servico?.nome || '';
  
  if (lembrete.tipo === 'confirmacao') {
    return `
      Olá ${cliente},
      
      Seu agendamento para ${servico} com o pet ${pet} foi confirmado para o dia ${data} às ${agendamento.hora}.
      
      Caso precise cancelar ou reagendar, entre em contato conosco.
      
      Atenciosamente,
      Equipe Pet Shop
    `;
  } else {
    // Lembrete
    return `
      Olá ${cliente},
      
      Lembramos que você tem um agendamento amanhã (${data}) às ${agendamento.hora} para ${servico} com o pet ${pet}.
      
      Estamos aguardando você!
      
      Atenciosamente,
      Equipe Pet Shop
    `;
  }
}

// Processar lembretes pendentes
export async function processarLembretesPendentes() {
  try {
    const lembretes = await fetchLembretesEmailPendentes();
    let enviados = 0;
    
    for (const lembrete of lembretes) {
      // Para lembretes de confirmação, enviar imediatamente
      if (lembrete.tipo === 'confirmacao') {
        await enviarLembreteEmail(lembrete);
        enviados++;
      }
      // Para lembretes de consulta, verificar se o agendamento é amanhã
      else if (lembrete.tipo === 'lembrete' && lembrete.agendamento) {
        const dataAgendamento = new Date(lembrete.agendamento.data);
        const hoje = new Date();
        const amanha = new Date();
        amanha.setDate(hoje.getDate() + 1);
        
        // Se o agendamento for amanhã, enviar o lembrete
        if (
          dataAgendamento.getFullYear() === amanha.getFullYear() &&
          dataAgendamento.getMonth() === amanha.getMonth() &&
          dataAgendamento.getDate() === amanha.getDate()
        ) {
          await enviarLembreteEmail(lembrete);
          enviados++;
        }
      }
    }
    
    if (enviados > 0) {
      toast({
        title: "Processamento de lembretes concluído",
        description: `${enviados} lembretes foram processados e enviados.`
      });
    }
    
    return enviados;
  } catch (error: any) {
    handleError(error, 'processar lembretes pendentes');
    return 0;
  }
}
