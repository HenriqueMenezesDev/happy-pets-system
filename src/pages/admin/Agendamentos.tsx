
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO, isToday, isThisWeek, isThisMonth, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { 
  fetchAgendamentos,
  updateAgendamento,
  deleteAgendamento 
} from '@/services/agendamentoService';
import { processarLembretesPendentes } from '@/services/emailService';
import { Agendamento } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Edit, Trash2, Mail } from 'lucide-react';

const AdminAgendamentos = () => {
  const { toast } = useToast();
  const { clientes, funcionarios, servicos } = useData();
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("futuros");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [clienteFiltro, setClienteFiltro] = useState<string>("");
  const [funcionarioFiltro, setFuncionarioFiltro] = useState<string>("");
  const [servicoFiltro, setServicoFiltro] = useState<string>("");
  const [isProcessingEmails, setIsProcessingEmails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAgendamento, setCurrentAgendamento] = useState<Agendamento | null>(null);
  
  // Carregar agendamentos
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      try {
        const agendamentosData = await fetchAgendamentos();
        setAgendamentos(agendamentosData);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        toast({
          title: 'Erro ao carregar agendamentos',
          description: 'Não foi possível carregar os agendamentos.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [toast]);
  
  // Filtrar agendamentos com base nos filtros selecionados
  useEffect(() => {
    let filtered = [...agendamentos];
    
    // Filtro por período
    filtered = filtered.filter(agendamento => {
      const dataObj = parseISO(agendamento.data);
      
      switch (periodoFiltro) {
        case "hoje":
          return isToday(dataObj);
        case "semana":
          return isThisWeek(dataObj);
        case "mes":
          return isThisMonth(dataObj);
        case "futuros":
          return isFuture(dataObj);
        case "todos":
        default:
          return true;
      }
    });
    
    // Filtro por status
    if (statusFiltro !== "todos") {
      filtered = filtered.filter(a => a.status === statusFiltro);
    }
    
    // Filtro por cliente
    if (clienteFiltro) {
      filtered = filtered.filter(a => a.clienteId === clienteFiltro);
    }
    
    // Filtro por funcionário
    if (funcionarioFiltro) {
      filtered = filtered.filter(a => a.funcionarioId === funcionarioFiltro);
    }
    
    // Filtro por serviço
    if (servicoFiltro) {
      filtered = filtered.filter(a => a.servicoId === servicoFiltro);
    }
    
    setFilteredAgendamentos(filtered);
  }, [agendamentos, periodoFiltro, statusFiltro, clienteFiltro, funcionarioFiltro, servicoFiltro]);
  
  const handleEnviarLembretes = async () => {
    setIsProcessingEmails(true);
    try {
      const emailsEnviados = await processarLembretesPendentes();
      
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
      setIsProcessingEmails(false);
    }
  };
  
  const handleDeleteAgendamento = (agendamento: Agendamento) => {
    setCurrentAgendamento(agendamento);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!currentAgendamento) return;
    
    const success = await deleteAgendamento(currentAgendamento.id);
    
    if (success) {
      setAgendamentos(prev => prev.filter(a => a.id !== currentAgendamento.id));
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleUpdateStatus = async (agendamento: Agendamento, novoStatus: Agendamento['status']) => {
    const agendamentoAtualizado = await updateAgendamento(agendamento.id, { status: novoStatus });
    
    if (agendamentoAtualizado) {
      setAgendamentos(prev => prev.map(a => 
        a.id === agendamentoAtualizado.id ? agendamentoAtualizado : a
      ));
      
      toast({
        title: 'Status atualizado',
        description: `O agendamento foi atualizado para "${getStatusLabel(novoStatus)}".`,
      });
    }
  };
  
  const getStatusLabel = (status: Agendamento['status']): string => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };
  
  const StatusBadge = ({ status }: { status: Agendamento['status'] }) => {
    const statusConfig = {
      agendado: { label: 'Agendado', className: 'bg-blue-500' },
      em_andamento: { label: 'Em Andamento', className: 'bg-amber-500' },
      concluido: { label: 'Concluído', className: 'bg-green-500' },
      cancelado: { label: 'Cancelado', className: 'bg-red-500' },
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };
  
  const sortAgendamentos = (a: Agendamento, b: Agendamento) => {
    // Ordenar primeiramente por data
    const dateCompare = new Date(a.data).getTime() - new Date(b.data).getTime();
    if (dateCompare !== 0) return dateCompare;
    
    // Se for a mesma data, ordenar por hora
    return a.hora.localeCompare(b.hora);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gerenciamento de Agendamentos" 
        description="Visualize, atualize e gerencie todos os agendamentos." 
      />

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="periodoFiltro" className="mb-1 block">Período</Label>
              <Select 
                value={periodoFiltro} 
                onValueChange={setPeriodoFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="futuros">Futuros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="statusFiltro" className="mb-1 block">Status</Label>
              <Select 
                value={statusFiltro} 
                onValueChange={setStatusFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendado">Agendados</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluídos</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="clienteFiltro" className="mb-1 block">Cliente</Label>
              <Select 
                value={clienteFiltro} 
                onValueChange={setClienteFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os clientes</SelectItem>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="funcionarioFiltro" className="mb-1 block">Profissional</Label>
              <Select 
                value={funcionarioFiltro} 
                onValueChange={setFuncionarioFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os profissionais</SelectItem>
                  {funcionarios.map(funcionario => (
                    <SelectItem key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="servicoFiltro" className="mb-1 block">Serviço</Label>
              <Select 
                value={servicoFiltro} 
                onValueChange={setServicoFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os serviços</SelectItem>
                  {servicos.map(servico => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button 
            variant="outline"
            onClick={() => {
              setPeriodoFiltro("futuros");
              setStatusFiltro("todos");
              setClienteFiltro("");
              setFuncionarioFiltro("");
              setServicoFiltro("");
            }}
          >
            Limpar Filtros
          </Button>
          
          <Button 
            onClick={handleEnviarLembretes}
            disabled={isProcessingEmails}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isProcessingEmails ? 'Processando...' : 'Enviar Lembretes'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>
                {filteredAgendamentos.length} agendamentos encontrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando agendamentos...</div>
          ) : filteredAgendamentos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente / Pet</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendamentos
                  .sort(sortAgendamentos)
                  .map(agendamento => (
                    <TableRow key={agendamento.id}>
                      <TableCell>
                        {format(parseISO(agendamento.data), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{agendamento.hora}</TableCell>
                      <TableCell>
                        <div className="font-medium">{agendamento.clienteNome}</div>
                        <div className="text-xs text-muted-foreground">{agendamento.petNome}</div>
                      </TableCell>
                      <TableCell>{agendamento.funcionarioNome}</TableCell>
                      <TableCell>{agendamento.servicoNome}</TableCell>
                      <TableCell>
                        <StatusBadge status={agendamento.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-1">
                          <Select 
                            value={agendamento.status} 
                            onValueChange={(value) => handleUpdateStatus(agendamento, value as Agendamento['status'])}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder="Alterar Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agendado">Agendado</SelectItem>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAgendamento(agendamento)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum agendamento encontrado para os filtros selecionados.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setPeriodoFiltro("futuros");
                  setStatusFiltro("todos");
                  setClienteFiltro("");
                  setFuncionarioFiltro("");
                  setServicoFiltro("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Agendamento"
        description={`Tem certeza que deseja excluir o agendamento de ${currentAgendamento?.clienteNome || 'cliente'} agendado para ${currentAgendamento ? format(parseISO(currentAgendamento.data), 'dd/MM/yyyy') : ''} às ${currentAgendamento?.hora || ''}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default AdminAgendamentos;
