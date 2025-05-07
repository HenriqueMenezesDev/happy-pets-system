
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useForm, Controller } from 'react-hook-form';
import { format, parse, addMonths, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import { 
  fetchAgendamentos,
  addAgendamento,
  updateAgendamento,
  deleteAgendamento 
} from '@/services/agendamentoService';
import { fetchHorariosDisponiveis } from '@/services/horarioService';
import { Badge } from '@/components/ui/badge';
import { Agendamento, Cliente, Pet, HorarioDisponivel, Funcionario, Servico } from '@/types';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FormValues {
  clienteId: string;
  petId: string;
  servicoId: string;
  data: Date;
  horarioId: string;
  observacoes: string;
}

const AgendamentoPage = () => {
  const { toast } = useToast();
  const { 
    clientes,
    pets,
    servicos,
    funcionarios,
    getClienteById,
    getPetsByClienteId,
    getServicoById
  } = useData();
  
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [clientePets, setClientePets] = useState<Pet[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAgendamento, setCurrentAgendamento] = useState<Agendamento | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agendamentosPorDia, setAgendamentosPorDia] = useState<{[key: string]: Agendamento[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"calendario" | "lista">("calendario");
  
  const { register, handleSubmit, watch, control, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      observacoes: '',
      data: new Date()
    }
  });
  
  const clienteId = watch('clienteId');
  const selectedDay = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const agendamentosDoDia = agendamentosPorDia[selectedDay] || [];
  
  // Carregar agendamentos
  useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      try {
        const agendamentosData = await fetchAgendamentos();
        setAgendamentos(agendamentosData);
        
        // Agrupar agendamentos por dia
        const porDia = agendamentosData.reduce<{[key: string]: Agendamento[]}>((acc, agendamento) => {
          const data = agendamento.data.split('T')[0];
          if (!acc[data]) {
            acc[data] = [];
          }
          acc[data].push(agendamento);
          return acc;
        }, {});
        
        setAgendamentosPorDia(porDia);
        
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
  
  // Atualizar horários disponíveis quando a data for selecionada
  useEffect(() => {
    if (isFormOpen && watch('data')) {
      const carregarHorarios = async () => {
        const dataFormatada = format(watch('data'), 'yyyy-MM-dd');
        const horariosData = await fetchHorariosDisponiveis(dataFormatada);
        
        // Se estiver editando, adicionar o horário atual mesmo que não esteja disponível
        if (currentAgendamento) {
          const horarioAtual = {
            id: 'atual',
            data: currentAgendamento.data,
            hora: currentAgendamento.hora,
            funcionarioId: currentAgendamento.funcionarioId,
            funcionarioNome: currentAgendamento.funcionarioNome,
            disponivel: true
          };
          
          // Verificar se a data do agendamento é a mesma selecionada
          const mesmaData = dataFormatada === currentAgendamento.data;
          const horarioJaExiste = horariosData.some(h => 
            h.hora === currentAgendamento.hora && 
            h.funcionarioId === currentAgendamento.funcionarioId
          );
          
          if (mesmaData && !horarioJaExiste) {
            horariosData.push(horarioAtual);
          }
        }
        
        setHorarios(horariosData);
      };
      
      carregarHorarios();
    }
  }, [isFormOpen, watch('data'), currentAgendamento]);
  
  // Atualizar pets quando o cliente for selecionado
  useEffect(() => {
    if (clienteId) {
      const filteredPets = getPetsByClienteId(clienteId);
      setClientePets(filteredPets);
      
      if (filteredPets.length === 1) {
        setValue('petId', filteredPets[0].id);
      } else {
        setValue('petId', '');
      }
    } else {
      setClientePets([]);
      setValue('petId', '');
    }
  }, [clienteId, getPetsByClienteId, setValue]);
  
  const handleAddNew = () => {
    setCurrentAgendamento(null);
    reset({
      clienteId: clientes.length > 0 ? clientes[0].id : '',
      petId: '',
      servicoId: servicos.length > 0 ? servicos[0].id : '',
      data: new Date(),
      horarioId: '',
      observacoes: '',
    });
    setIsFormOpen(true);
  };
  
  const handleEdit = (agendamento: Agendamento) => {
    setCurrentAgendamento(agendamento);
    
    // Converter string de data para objeto Date
    const dataObj = parse(agendamento.data, 'yyyy-MM-dd', new Date());
    
    reset({
      clienteId: agendamento.clienteId,
      petId: agendamento.petId,
      servicoId: agendamento.servicoId,
      data: dataObj,
      horarioId: 'atual', // horário especial para edição
      observacoes: agendamento.observacoes,
    });
    
    const clientePetsTemp = getPetsByClienteId(agendamento.clienteId);
    setClientePets(clientePetsTemp);
    
    setIsFormOpen(true);
  };
  
  const handleDelete = (agendamento: Agendamento) => {
    setCurrentAgendamento(agendamento);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!currentAgendamento) return;
    
    const success = await deleteAgendamento(currentAgendamento.id);
    
    if (success) {
      setAgendamentos(prev => prev.filter(a => a.id !== currentAgendamento.id));
      
      // Atualizar agendamentos por dia
      const novoAgendamentosPorDia = { ...agendamentosPorDia };
      const dataAgendamento = currentAgendamento.data.split('T')[0];
      
      if (novoAgendamentosPorDia[dataAgendamento]) {
        novoAgendamentosPorDia[dataAgendamento] = novoAgendamentosPorDia[dataAgendamento]
          .filter(a => a.id !== currentAgendamento.id);
          
        if (novoAgendamentosPorDia[dataAgendamento].length === 0) {
          delete novoAgendamentosPorDia[dataAgendamento];
        }
      }
      
      setAgendamentosPorDia(novoAgendamentosPorDia);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!data.data || !data.horarioId || data.horarioId === '') {
      toast({
        title: "Erro",
        description: "Selecione uma data e um horário disponível",
        variant: "destructive"
      });
      return;
    }
    
    const horarioSelecionado = horarios.find(h => h.id === data.horarioId);
    if (!horarioSelecionado && data.horarioId !== 'atual') {
      toast({
        title: "Erro",
        description: "O horário selecionado não está mais disponível",
        variant: "destructive"
      });
      return;
    }
    
    const dataFormatada = format(data.data, 'yyyy-MM-dd');
    
    try {
      if (currentAgendamento) {
        // Edição de agendamento
        const agendamentoData = {
          clienteId: data.clienteId,
          petId: data.petId,
          servicoId: data.servicoId,
          observacoes: data.observacoes,
        };
        
        // Se o horário foi alterado, atualizar também
        if (data.horarioId !== 'atual') {
          Object.assign(agendamentoData, {
            data: dataFormatada,
            hora: horarioSelecionado!.hora,
            funcionarioId: horarioSelecionado!.funcionarioId,
          });
        }
        
        const agendamentoAtualizado = await updateAgendamento(
          currentAgendamento.id,
          agendamentoData
        );
        
        if (agendamentoAtualizado) {
          // Atualizar a lista local
          setAgendamentos(prev => prev.map(a => 
            a.id === agendamentoAtualizado.id ? agendamentoAtualizado : a
          ));
          
          // Atualizar agendamentos por dia
          const novoAgendamentosPorDia = { ...agendamentosPorDia };
          
          // Remover do dia anterior
          const dataAnterior = currentAgendamento.data.split('T')[0];
          if (novoAgendamentosPorDia[dataAnterior]) {
            novoAgendamentosPorDia[dataAnterior] = novoAgendamentosPorDia[dataAnterior]
              .filter(a => a.id !== agendamentoAtualizado.id);
              
            if (novoAgendamentosPorDia[dataAnterior].length === 0) {
              delete novoAgendamentosPorDia[dataAnterior];
            }
          }
          
          // Adicionar ao novo dia
          const dataNova = agendamentoAtualizado.data.split('T')[0];
          if (!novoAgendamentosPorDia[dataNova]) {
            novoAgendamentosPorDia[dataNova] = [];
          }
          novoAgendamentosPorDia[dataNova].push(agendamentoAtualizado);
          
          setAgendamentosPorDia(novoAgendamentosPorDia);
        }
      } else {
        // Novo agendamento
        const novoAgendamento = {
          clienteId: data.clienteId,
          petId: data.petId,
          servicoId: data.servicoId,
          funcionarioId: horarioSelecionado!.funcionarioId,
          data: dataFormatada,
          hora: horarioSelecionado!.hora,
          status: 'agendado' as const,
          observacoes: data.observacoes
        };
        
        const agendamentoCriado = await addAgendamento(novoAgendamento);
        
        if (agendamentoCriado) {
          // Atualizar a lista local
          setAgendamentos(prev => [...prev, agendamentoCriado]);
          
          // Atualizar agendamentos por dia
          const novoAgendamentosPorDia = { ...agendamentosPorDia };
          const dataAgendamento = agendamentoCriado.data.split('T')[0];
          
          if (!novoAgendamentosPorDia[dataAgendamento]) {
            novoAgendamentosPorDia[dataAgendamento] = [];
          }
          
          novoAgendamentosPorDia[dataAgendamento].push(agendamentoCriado);
          setAgendamentosPorDia(novoAgendamentosPorDia);
        }
      }
      
      setIsFormOpen(false);
      
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: 'Erro ao salvar agendamento',
        description: 'Ocorreu um erro ao salvar o agendamento.',
        variant: 'destructive'
      });
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

  return (
    <div>
      <PageHeader 
        title="Agendamentos" 
        description="Gerencie os agendamentos do pet shop." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Agendamento"
      />

      <div className="mb-4">
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "calendario" | "lista")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {selectedView === "calendario" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Calendário</CardTitle>
                <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="pointer-events-auto"
                  modifiers={{
                    booked: (date) => {
                      const dateString = format(date, 'yyyy-MM-dd');
                      return !!agendamentosPorDia[dateString];
                    }
                  }}
                  modifiersStyles={{
                    booked: { fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                  }}
                  locale={ptBR}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center text-lg">
                  <div>
                    Agendamentos - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddNew}>
                    + Novo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando agendamentos...</div>
                ) : agendamentosDoDia.length > 0 ? (
                  <div className="space-y-4">
                    {agendamentosDoDia
                      .sort((a, b) => a.hora.localeCompare(b.hora))
                      .map(agendamento => (
                        <div 
                          key={agendamento.id} 
                          className="p-4 border rounded-md hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{agendamento.hora}</span>
                              <StatusBadge status={agendamento.status} />
                            </div>
                            <div className="space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(agendamento)}
                              >
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(agendamento)}
                                className="text-red-500"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div className="flex space-x-1">
                              <span className="text-muted-foreground">Cliente:</span>
                              <span className="font-medium">{agendamento.clienteNome}</span>
                            </div>
                            
                            <div className="flex space-x-1">
                              <span className="text-muted-foreground">Pet:</span>
                              <span className="font-medium">{agendamento.petNome}</span>
                            </div>
                            
                            <div className="flex space-x-1">
                              <span className="text-muted-foreground">Serviço:</span>
                              <span className="font-medium">{agendamento.servicoNome}</span>
                            </div>
                            
                            <div className="flex space-x-1">
                              <span className="text-muted-foreground">Profissional:</span>
                              <span className="font-medium">{agendamento.funcionarioNome}</span>
                            </div>
                            
                            {agendamento.observacoes && (
                              <div className="col-span-2 mt-1 flex space-x-1">
                                <span className="text-muted-foreground">Obs:</span>
                                <span className="font-medium">{agendamento.observacoes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Não há agendamentos para esta data.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={handleAddNew}
                    >
                      Criar um novo agendamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Carregando agendamentos...</div>
            ) : agendamentos.length > 0 ? (
              agendamentos
                .sort((a, b) => {
                  // Ordenar por data (mais recente primeiro) e hora
                  const dataA = `${a.data} ${a.hora}`;
                  const dataB = `${b.data} ${b.hora}`;
                  return dataA.localeCompare(dataB);
                })
                .map(agendamento => (
                  <Card key={agendamento.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{agendamento.servicoNome}</CardTitle>
                          <CardDescription>
                            {format(parse(agendamento.data, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')} às {agendamento.hora}
                          </CardDescription>
                        </div>
                        <StatusBadge status={agendamento.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cliente:</span>
                          <span className="ml-1 font-medium">{agendamento.clienteNome}</span>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Pet:</span>
                          <span className="ml-1 font-medium">{agendamento.petNome}</span>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Profissional:</span>
                          <span className="ml-1 font-medium">{agendamento.funcionarioNome}</span>
                        </div>
                        
                        {agendamento.valorServico && (
                          <div>
                            <span className="text-muted-foreground">Valor:</span>
                            <span className="ml-1 font-medium">R$ {agendamento.valorServico.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {agendamento.observacoes && (
                          <div className="col-span-2 mt-1">
                            <span className="text-muted-foreground">Observações:</span>
                            <p className="mt-1">{agendamento.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(agendamento)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(agendamento)}
                        className="text-red-500"
                      >
                        Cancelar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="text-center py-12 border rounded-md">
                <p className="text-muted-foreground">Não há agendamentos registrados.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleAddNew}
                >
                  Criar um novo agendamento
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{currentAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogDescription>
              {currentAgendamento
                ? 'Altere as informações do agendamento abaixo.'
                : 'Preencha as informações para registrar um novo agendamento.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente</Label>
                  <Controller
                    name="clienteId"
                    control={control}
                    rules={{ required: "Cliente é obrigatório" }}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.clienteId && <p className="text-sm text-red-500">{errors.clienteId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="petId">Pet</Label>
                  <Controller
                    name="petId"
                    control={control}
                    rules={{ required: "Pet é obrigatório" }}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!clienteId || clientePets.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !clienteId 
                              ? "Selecione um cliente primeiro" 
                              : clientePets.length === 0
                              ? "Cliente sem pets cadastrados"
                              : "Selecione o pet"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {clientePets.map((pet) => (
                            <SelectItem key={pet.id} value={pet.id}>
                              {pet.nome} ({pet.especie})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.petId && <p className="text-sm text-red-500">{errors.petId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servicoId">Serviço</Label>
                  <Controller
                    name="servicoId"
                    control={control}
                    rules={{ required: "Serviço é obrigatório" }}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicos.map((servico) => (
                            <SelectItem key={servico.id} value={servico.id}>
                              {servico.nome} - R$ {servico.preco.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.servicoId && <p className="text-sm text-red-500">{errors.servicoId.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Data</Label>
                  <div className="grid h-10">
                    <Controller
                      control={control}
                      name="data"
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                // Desabilitar datas passadas
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                const isPast = date < today;
                                const isTooFar = date > addMonths(today, 3); // Limitar a 3 meses no futuro
                                
                                return isPast || isTooFar;
                              }}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                  {errors.data && <p className="text-sm text-red-500">{errors.data.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Horário</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {horarios.length > 0 ? (
                    horarios.map(horario => (
                      <div key={horario.id} className="text-center">
                        <input
                          type="radio"
                          id={horario.id}
                          value={horario.id}
                          {...register("horarioId", { required: "Horário é obrigatório" })}
                          className="sr-only"
                        />
                        <label
                          htmlFor={horario.id}
                          className={`
                            flex flex-col items-center justify-center py-2 px-4 border rounded-md cursor-pointer
                            transition-colors
                            ${watch('horarioId') === horario.id ? 
                              'border-primary bg-primary/10 text-primary' : 
                              'hover:border-primary/50'}
                          `}
                        >
                          <span className="font-medium">{horario.hora}</span>
                          <span className="text-xs text-muted-foreground">{horario.funcionarioNome}</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-4 flex items-center justify-center gap-2 border rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      <span>Não há horários disponíveis para esta data</span>
                    </div>
                  )}
                </div>
                {errors.horarioId && <p className="text-sm text-red-500">{errors.horarioId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea 
                  id="observacoes" 
                  placeholder="Observações sobre o agendamento" 
                  {...register("observacoes")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Cancelar Agendamento"
        description={`Tem certeza que deseja cancelar o agendamento de ${currentAgendamento?.clienteNome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default AgendamentoPage;
