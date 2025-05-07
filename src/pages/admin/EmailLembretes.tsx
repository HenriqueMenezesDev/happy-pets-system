
import React, { useState, useEffect } from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  fetchLembretesEmailPendentes,
  enviarLembreteEmail,
  processarLembretesPendentes,
  marcarLembreteEnviado
} from '@/services/emailService';
import { LembreteEmail } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Eye, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

const EmailLembretes = () => {
  const { toast } = useToast();
  const [lembretes, setLembretes] = useState<LembreteEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLembrete, setSelectedLembrete] = useState<LembreteEmail | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Carregar lembretes pendentes
  useEffect(() => {
    const carregarLembretes = async () => {
      setIsLoading(true);
      try {
        const lembretesData = await fetchLembretesEmailPendentes();
        setLembretes(lembretesData);
      } catch (error) {
        console.error('Erro ao carregar lembretes:', error);
        toast({
          title: 'Erro ao carregar lembretes',
          description: 'Não foi possível carregar os lembretes de email.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarLembretes();
  }, [toast]);
  
  const handleProcessarTodos = async () => {
    setIsProcessing(true);
    try {
      const emailsEnviados = await processarLembretesPendentes();
      
      // Atualizar a lista após processar
      const lembretesAtualizados = await fetchLembretesEmailPendentes();
      setLembretes(lembretesAtualizados);
      
      toast({
        title: 'Lembretes processados',
        description: `${emailsEnviados} lembretes de email foram enviados.`,
      });
    } catch (error) {
      console.error('Erro ao processar lembretes:', error);
      toast({
        title: 'Erro ao processar lembretes',
        description: 'Ocorreu um erro ao processar os lembretes de email.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleEnviarLembrete = async (lembrete: LembreteEmail) => {
    try {
      await enviarLembreteEmail(lembrete);
      
      // Atualizar a lista após enviar
      const lembretesAtualizados = await fetchLembretesEmailPendentes();
      setLembretes(lembretesAtualizados);
      
      toast({
        title: 'Email enviado',
        description: 'O lembrete foi enviado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      toast({
        title: 'Erro ao enviar lembrete',
        description: 'Ocorreu um erro ao enviar o lembrete de email.',
        variant: 'destructive'
      });
    }
  };
  
  const handleMarcarEnviado = async (lembrete: LembreteEmail) => {
    try {
      await marcarLembreteEnviado(lembrete.id);
      
      // Atualizar a lista após marcar
      const lembretesAtualizados = await fetchLembretesEmailPendentes();
      setLembretes(lembretesAtualizados);
      
      toast({
        title: 'Lembrete marcado como enviado',
        description: 'O lembrete foi marcado como enviado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao marcar lembrete como enviado:', error);
      toast({
        title: 'Erro ao marcar lembrete',
        description: 'Ocorreu um erro ao marcar o lembrete como enviado.',
        variant: 'destructive'
      });
    }
  };
  
  const handlePreview = (lembrete: LembreteEmail) => {
    setSelectedLembrete(lembrete);
    setIsPreviewOpen(true);
  };
  
  const getTipoLembreteLabel = (tipo: string): string => {
    return tipo === 'confirmacao' ? 'Confirmação' : 'Lembrete';
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Lembretes por Email" 
        description="Gerencie os lembretes de email enviados aos clientes." 
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lembretes Pendentes</CardTitle>
            <CardDescription>
              {lembretes.length} lembretes aguardando envio
            </CardDescription>
          </div>
          <Button 
            onClick={handleProcessarTodos}
            disabled={isProcessing || lembretes.length === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processando...' : 'Enviar Todos'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando lembretes...</div>
          ) : lembretes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lembretes.map(lembrete => (
                  <TableRow key={lembrete.id}>
                    <TableCell>
                      <Badge variant={lembrete.tipo === 'confirmacao' ? 'default' : 'secondary'}>
                        {getTipoLembreteLabel(lembrete.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lembrete.agendamento && (
                        <>
                          <div className="font-medium">
                            {lembrete.agendamento.servicoNome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lembrete.agendamento.petNome}
                          </div>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {lembrete.agendamento?.cliente?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {lembrete.agendamento && (
                        <>
                          <div>
                            {format(parseISO(lembrete.agendamento.data), 'dd/MM/yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lembrete.agendamento.hora}
                          </div>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lembrete.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePreview(lembrete)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEnviarLembrete(lembrete)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarcarEnviado(lembrete)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum lembrete pendente</h3>
              <p className="text-muted-foreground">
                Todos os lembretes de email foram enviados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Preview */}
      {selectedLembrete && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Prévia do Email</DialogTitle>
              <DialogDescription>
                {getTipoLembreteLabel(selectedLembrete.tipo)} - {selectedLembrete.agendamento?.cliente?.nome}
              </DialogDescription>
            </DialogHeader>
            
            <div className="border rounded-md p-5 space-y-4 bg-gray-50">
              <div className="space-y-2">
                <div className="font-medium">Destinatário</div>
                <div>{selectedLembrete.agendamento?.cliente?.email}</div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Assunto</div>
                <div>
                  {selectedLembrete.tipo === 'confirmacao' 
                    ? 'Confirmação de Agendamento - Pet Shop' 
                    : 'Lembrete de Agendamento - Pet Shop'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Mensagem</div>
                <div className="border bg-white rounded-md p-4 whitespace-pre-line">
                  {selectedLembrete.tipo === 'confirmacao' ? (
                    <>
                      <p>Olá {selectedLembrete.agendamento?.cliente?.nome},</p>
                      <p className="mt-4">
                        Seu agendamento para {selectedLembrete.agendamento?.servicoNome} com o pet {selectedLembrete.agendamento?.petNome} foi confirmado para o dia {selectedLembrete.agendamento ? format(parseISO(selectedLembrete.agendamento.data), 'dd/MM/yyyy', { locale: ptBR }) : ''} às {selectedLembrete.agendamento?.hora}.
                      </p>
                      <p className="mt-4">
                        Caso precise cancelar ou reagendar, entre em contato conosco.
                      </p>
                      <p className="mt-4">
                        Atenciosamente,<br />
                        Equipe Pet Shop
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Olá {selectedLembrete.agendamento?.cliente?.nome},</p>
                      <p className="mt-4">
                        Lembramos que você tem um agendamento amanhã ({selectedLembrete.agendamento ? format(parseISO(selectedLembrete.agendamento.data), 'dd/MM/yyyy', { locale: ptBR }) : ''}) às {selectedLembrete.agendamento?.hora} para {selectedLembrete.agendamento?.servicoNome} com o pet {selectedLembrete.agendamento?.petNome}.
                      </p>
                      <p className="mt-4">
                        Estamos aguardando você!
                      </p>
                      <p className="mt-4">
                        Atenciosamente,<br />
                        Equipe Pet Shop
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button 
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
              >
                Fechar
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    handleMarcarEnviado(selectedLembrete);
                    setIsPreviewOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Enviado
                </Button>
                <Button
                  onClick={() => {
                    handleEnviarLembrete(selectedLembrete);
                    setIsPreviewOpen(false);
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmailLembretes;
