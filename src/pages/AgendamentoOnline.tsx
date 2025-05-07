
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, parse, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchClientes,
  addCliente 
} from '@/services/clienteService';
import { 
  fetchPets,
  addPet 
} from '@/services/petService';
import { fetchServicos } from '@/services/servicoService';
import { fetchHorariosDisponiveis } from '@/services/horarioService';
import { addAgendamento } from '@/services/agendamentoService';
import { Cliente, Pet, Servico, HorarioDisponivel } from '@/types';
import { ArrowLeft, Calendar as CalendarIcon, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipo para os formulários
interface ClienteFormValues {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
}

interface PetFormValues {
  nome: string;
  especie: string;
  raca: string;
  dataNascimento: string;
  peso: string;
  sexo: 'M' | 'F';
}

interface AgendamentoFormValues {
  clienteId: string;
  petId: string;
  servicoId: string;
  data: Date;
  horarioId: string;
  observacoes: string;
}

const AgendamentoOnline = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string | undefined>(undefined);
  const [isNovoCliente, setIsNovoCliente] = useState(false);
  const [isNovoPet, setIsNovoPet] = useState(false);
  const [clientePets, setClientePets] = useState<Pet[]>([]);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [agendamento, setAgendamento] = useState<any>(null);

  // Formulários para diferentes etapas
  const { register: registerCliente, handleSubmit: handleSubmitCliente, formState: { errors: errosCliente } } = 
    useForm<ClienteFormValues>();
  
  const { register: registerPet, handleSubmit: handleSubmitPet, formState: { errors: errosPet } } = 
    useForm<PetFormValues>();
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AgendamentoFormValues>({
    defaultValues: {
      observacoes: '',
    }
  });
  
  const clienteId = watch('clienteId');
  const servicoId = watch('servicoId');
  
  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      const [clientesData, servicosData] = await Promise.all([
        fetchClientes(),
        fetchServicos()
      ]);
      
      setClientes(clientesData);
      setServicos(servicosData);
    };
    
    carregarDados();
  }, []);

  // Atualizar pets quando o cliente for selecionado
  useEffect(() => {
    const carregarPets = async () => {
      if (clienteId) {
        const petsData = await fetchPets();
        const petsFiltrados = petsData.filter(pet => pet.clienteId === clienteId);
        setClientePets(petsFiltrados);
        
        // Se tiver apenas um pet, seleciona automaticamente
        if (petsFiltrados.length === 1) {
          setValue('petId', petsFiltrados[0].id);
        } else {
          // Limpa a seleção quando mudar de cliente
          setValue('petId', '');
        }
      } else {
        setClientePets([]);
        setValue('petId', '');
      }
    };
    
    carregarPets();
  }, [clienteId, setValue]);

  // Carregar horários disponíveis quando a data for selecionada
  useEffect(() => {
    const carregarHorarios = async () => {
      if (selectedDate) {
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        const horariosData = await fetchHorariosDisponiveis(dataFormatada, selectedFuncionarioId);
        setHorarios(horariosData);
        // Limpar seleção de horário quando mudar a data
        setValue('horarioId', '');
      }
    };
    
    carregarHorarios();
  }, [selectedDate, selectedFuncionarioId, setValue]);

  // Manipuladores para cada passo do formulário
  const handleNovoCliente = async (data: ClienteFormValues) => {
    const novoCliente = await addCliente({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      endereco: data.endereco
    });
    
    if (novoCliente) {
      setClientes(prev => [...prev, novoCliente]);
      setValue('clienteId', novoCliente.id);
      setIsNovoCliente(false);
      toast({ 
        title: "Cliente cadastrado com sucesso!",
        description: "Agora você pode continuar seu agendamento."
      });
    }
  };

  const handleNovoPet = async (data: PetFormValues) => {
    if (!clienteId) {
      toast({
        title: "Erro",
        description: "Selecione um cliente primeiro",
        variant: "destructive"
      });
      return;
    }
    
    const novoPet = await addPet({
      nome: data.nome,
      especie: data.especie,
      raca: data.raca,
      dataNascimento: data.dataNascimento,
      peso: parseFloat(data.peso),
      sexo: data.sexo,
      clienteId: clienteId
    });
    
    if (novoPet) {
      setPets(prev => [...prev, novoPet]);
      setClientePets(prev => [...prev, novoPet]);
      setValue('petId', novoPet.id);
      setIsNovoPet(false);
      toast({ 
        title: "Pet cadastrado com sucesso!",
        description: "Agora você pode continuar seu agendamento."
      });
    }
  };

  const onSubmit = async (data: AgendamentoFormValues) => {
    if (!selectedDate || !data.horarioId) {
      toast({
        title: "Erro",
        description: "Selecione uma data e horário para o agendamento",
        variant: "destructive"
      });
      return;
    }
    
    const horarioSelecionado = horarios.find(h => h.id === data.horarioId);
    if (!horarioSelecionado) return;
    
    const novoAgendamento = {
      clienteId: data.clienteId,
      petId: data.petId,
      servicoId: data.servicoId,
      funcionarioId: horarioSelecionado.funcionarioId,
      data: format(selectedDate, 'yyyy-MM-dd'),
      hora: horarioSelecionado.hora,
      status: 'agendado' as const,
      observacoes: data.observacoes
    };
    
    // Guardar os dados completos para a confirmação
    const cliente = clientes.find(c => c.id === data.clienteId);
    const pet = clientePets.find(p => p.id === data.petId);
    const servico = servicos.find(s => s.id === data.servicoId);
    
    setAgendamento({
      ...novoAgendamento,
      clienteNome: cliente?.nome,
      petNome: pet?.nome,
      servicoNome: servico?.nome,
      valorServico: servico?.preco,
      dataFormatada: format(selectedDate, 'dd/MM/yyyy'),
      funcionarioNome: horarioSelecionado.funcionarioNome
    });
    
    setShowConfirmacao(true);
  };

  const confirmarAgendamento = async () => {
    if (!agendamento) return;
    
    const resultado = await addAgendamento(agendamento);
    
    if (resultado) {
      setShowConfirmacao(false);
      toast({
        title: "Agendamento realizado com sucesso!",
        description: `Seu agendamento foi confirmado para ${agendamento.dataFormatada} às ${agendamento.hora}`
      });
      
      // Reiniciar o formulário
      setStep(1);
      setValue('clienteId', '');
      setValue('petId', '');
      setValue('servicoId', '');
      setValue('observacoes', '');
      setSelectedDate(undefined);
      setSelectedFuncionarioId(undefined);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">Agendamento Online</h1>
            <p className="text-muted-foreground">
              Agende seu horário de forma rápida e fácil
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agendar Serviço</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para agendar seu serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Indicador de etapas */}
              <div className="flex justify-between mb-8">
                <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                    1
                  </div>
                  <span className="text-xs mt-1">Cliente</span>
                </div>
                <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                    2
                  </div>
                  <span className="text-xs mt-1">Serviço</span>
                </div>
                <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                    3
                  </div>
                  <span className="text-xs mt-1">Data</span>
                </div>
                <div className={`flex flex-col items-center ${step >= 4 ? 'text-primary' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 4 ? 'border-primary bg-primary/10' : 'border-gray-300'}`}>
                    4
                  </div>
                  <span className="text-xs mt-1">Confirmação</span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Etapa 1: Selecionar Cliente e Pet */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Dados do Cliente</h2>
                      
                      {!isNovoCliente ? (
                        <div>
                          <Label htmlFor="clienteId">Selecione seu cadastro</Label>
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
                                  <SelectValue placeholder="Selecione seu cadastro" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clientes.map((cliente) => (
                                    <SelectItem key={cliente.id} value={cliente.id}>
                                      {cliente.nome} - {cliente.telefone}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.clienteId && <p className="text-sm text-red-500">{errors.clienteId.message}</p>}
                          
                          <div className="mt-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsNovoCliente(true)}
                            >
                              Não tenho cadastro
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 border p-4 rounded-md">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">Novo Cliente</h3>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setIsNovoCliente(false)}
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                            </Button>
                          </div>
                          
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="nome">Nome Completo</Label>
                              <Input 
                                id="nome" 
                                {...registerCliente("nome", { required: "Nome é obrigatório" })}
                              />
                              {errosCliente.nome && <p className="text-sm text-red-500">{errosCliente.nome.message}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                {...registerCliente("email", { 
                                  required: "Email é obrigatório",
                                  pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "Email inválido"
                                  }
                                })}
                              />
                              {errosCliente.email && <p className="text-sm text-red-500">{errosCliente.email.message}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="telefone">Telefone</Label>
                              <Input 
                                id="telefone" 
                                {...registerCliente("telefone", { required: "Telefone é obrigatório" })}
                              />
                              {errosCliente.telefone && <p className="text-sm text-red-500">{errosCliente.telefone.message}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="cpf">CPF</Label>
                              <Input 
                                id="cpf" 
                                {...registerCliente("cpf", { required: "CPF é obrigatório" })}
                              />
                              {errosCliente.cpf && <p className="text-sm text-red-500">{errosCliente.cpf.message}</p>}
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="endereco">Endereço</Label>
                              <Input 
                                id="endereco" 
                                {...registerCliente("endereco", { required: "Endereço é obrigatório" })}
                              />
                              {errosCliente.endereco && <p className="text-sm text-red-500">{errosCliente.endereco.message}</p>}
                            </div>
                          </div>
                          
                          <Button 
                            type="button" 
                            onClick={handleSubmitCliente(handleNovoCliente)}
                            className="w-full"
                          >
                            Cadastrar Cliente
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {clienteId && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Dados do Pet</h2>
                        
                        {!isNovoPet ? (
                          <div>
                            <Label htmlFor="petId">Selecione seu pet</Label>
                            <Controller
                              name="petId"
                              control={control}
                              rules={{ required: "Pet é obrigatório" }}
                              render={({ field }) => (
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                  disabled={!clienteId}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={clientePets.length ? "Selecione seu pet" : "Nenhum pet cadastrado"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {clientePets.map((pet) => (
                                      <SelectItem key={pet.id} value={pet.id}>
                                        {pet.nome} ({pet.especie} - {pet.raca})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.petId && <p className="text-sm text-red-500">{errors.petId.message}</p>}
                            
                            <div className="mt-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsNovoPet(true)}
                                disabled={!clienteId}
                              >
                                Cadastrar novo pet
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 border p-4 rounded-md">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Novo Pet</h3>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setIsNovoPet(false)}
                              >
                                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                              </Button>
                            </div>
                            
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="nomePet">Nome</Label>
                                <Input 
                                  id="nomePet" 
                                  {...registerPet("nome", { required: "Nome é obrigatório" })}
                                />
                                {errosPet.nome && <p className="text-sm text-red-500">{errosPet.nome.message}</p>}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="especie">Espécie</Label>
                                  <Controller
                                    name="especie"
                                    control={registerPet("especie", { required: "Espécie é obrigatória" }).control}
                                    render={({ field }) => (
                                      <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Cachorro">Cachorro</SelectItem>
                                          <SelectItem value="Gato">Gato</SelectItem>
                                          <SelectItem value="Pássaro">Pássaro</SelectItem>
                                          <SelectItem value="Roedor">Roedor</SelectItem>
                                          <SelectItem value="Outro">Outro</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                  {errosPet.especie && <p className="text-sm text-red-500">{errosPet.especie.message}</p>}
                                </div>
                                
                                <div className="grid gap-2">
                                  <Label htmlFor="raca">Raça</Label>
                                  <Input 
                                    id="raca" 
                                    {...registerPet("raca", { required: "Raça é obrigatória" })}
                                  />
                                  {errosPet.raca && <p className="text-sm text-red-500">{errosPet.raca.message}</p>}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                  <Input 
                                    id="dataNascimento"
                                    type="date"
                                    {...registerPet("dataNascimento", { required: "Data de nascimento é obrigatória" })}
                                  />
                                  {errosPet.dataNascimento && <p className="text-sm text-red-500">{errosPet.dataNascimento.message}</p>}
                                </div>
                                
                                <div className="grid gap-2">
                                  <Label htmlFor="peso">Peso (kg)</Label>
                                  <Input 
                                    id="peso"
                                    type="number"
                                    step="0.1"
                                    {...registerPet("peso", { required: "Peso é obrigatório" })}
                                  />
                                  {errosPet.peso && <p className="text-sm text-red-500">{errosPet.peso.message}</p>}
                                </div>
                              </div>
                              
                              <div className="grid gap-2">
                                <Label>Sexo</Label>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="sexo-m"
                                      value="M"
                                      {...registerPet("sexo", { required: "Sexo é obrigatório" })}
                                    />
                                    <Label htmlFor="sexo-m" className="cursor-pointer">Macho</Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="sexo-f"
                                      value="F"
                                      {...registerPet("sexo", { required: "Sexo é obrigatório" })}
                                    />
                                    <Label htmlFor="sexo-f" className="cursor-pointer">Fêmea</Label>
                                  </div>
                                </div>
                                {errosPet.sexo && <p className="text-sm text-red-500">{errosPet.sexo.message}</p>}
                              </div>
                            </div>
                            
                            <Button 
                              type="button" 
                              onClick={handleSubmitPet(handleNovoPet)}
                              className="w-full"
                            >
                              Cadastrar Pet
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Etapa 2: Selecionar Serviço */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Escolha do Serviço</h2>
                    
                    <div className="grid gap-4">
                      <Label htmlFor="servicoId">Selecione o serviço desejado</Label>
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
                              <SelectValue placeholder="Selecione um serviço" />
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
                    
                    {servicoId && (
                      <div className="space-y-4">
                        <Label htmlFor="observacoes">Observações (opcional)</Label>
                        <Textarea 
                          id="observacoes" 
                          placeholder="Alguma informação adicional que queira nos informar?" 
                          {...register("observacoes")}
                        />
                        
                        {/* Exibir detalhes do serviço selecionado */}
                        {servicoId && (
                          <div className="bg-muted/50 p-4 rounded-md">
                            <h3 className="font-medium mb-2">Detalhes do Serviço</h3>
                            {(() => {
                              const servico = servicos.find(s => s.id === servicoId);
                              if (!servico) return null;
                              
                              return (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Serviço:</span>
                                    <span className="font-medium">{servico.nome}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duração:</span>
                                    <span>{servico.duracao} minutos</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Preço:</span>
                                    <span className="font-medium">R$ {servico.preco.toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span>Descrição:</span>
                                    <p className="mt-1">{servico.descricao}</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Etapa 3: Selecionar Data e Horário */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Escolha da Data e Horário</h2>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <Label className="mb-2 block">Selecione a data</Label>
                        <div className="p-1 border rounded-md">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => {
                              // Desabilitar datas passadas e finais de semana
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                              const isPast = date < today;
                              const isTooFar = date > addDays(today, 30); // Limitar a 30 dias no futuro
                              
                              return isPast || isWeekend || isTooFar;
                            }}
                            locale={ptBR}
                            className="pointer-events-auto"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">
                          {selectedDate ? (
                            <>Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</>
                          ) : (
                            <>Selecione uma data para ver os horários</>
                          )}
                        </Label>
                        
                        {selectedDate && (
                          <div className="space-y-3">
                            {horarios.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                Não há horários disponíveis para esta data.
                                <div className="mt-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedDate(undefined)}
                                  >
                                    Escolher outra data
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {horarios.map(horario => (
                                  <div key={horario.id} className="text-center">
                                    <input
                                      type="radio"
                                      id={horario.id}
                                      value={horario.id}
                                      {...register("horarioId", { required: "Horário é obrigatório" })}
                                      className="sr-only"
                                      onChange={() => setSelectedFuncionarioId(horario.funcionarioId)}
                                    />
                                    <label
                                      htmlFor={horario.id}
                                      className={`
                                        flex items-center justify-center py-2 px-4 border rounded-md cursor-pointer
                                        transition-colors
                                        ${watch('horarioId') === horario.id ? 
                                          'border-primary bg-primary/10 text-primary' : 
                                          'hover:border-primary/50'}
                                      `}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      <div>
                                        <div>{horario.hora}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {horario.funcionarioNome}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {errors.horarioId && <p className="text-sm text-red-500 mt-2">{errors.horarioId.message}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Etapa 4: Confirmação */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Confirme seus dados</h2>
                    
                    <div className="space-y-4 border rounded-md p-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h3>
                        <p className="font-medium">{clientes.find(c => c.id === clienteId)?.nome}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Pet</h3>
                        <p className="font-medium">{clientePets.find(p => p.id === watch('petId'))?.nome}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Serviço</h3>
                        <p className="font-medium">{servicos.find(s => s.id === servicoId)?.nome}</p>
                        <p className="text-sm">
                          R$ {servicos.find(s => s.id === servicoId)?.preco.toFixed(2)}
                        </p>
                      </div>
                      
                      {selectedDate && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Data e Horário</h3>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{format(selectedDate, "dd/MM/yyyy")}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                              {horarios.find(h => h.id === watch('horarioId'))?.hora || ''}
                              {' '}com {horarios.find(h => h.id === watch('horarioId'))?.funcionarioNome || ''}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {watch('observacoes') && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Observações</h3>
                          <p className="text-sm">{watch('observacoes')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-primary/10 p-4 rounded-md">
                      <div className="flex items-start">
                        <div className="mr-2 mt-1">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Ao confirmar este agendamento:</p>
                          <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                            <li>Você receberá um email de confirmação</li>
                            <li>Um lembrete será enviado no dia anterior à sua consulta</li>
                            <li>Em caso de cancelamento, faça contato com pelo menos 24h de antecedência</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              {step > 1 && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(prev => prev - 1)}
                >
                  Voltar
                </Button>
              )}
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => {
                    // Validações por etapa
                    if (step === 1) {
                      if (!clienteId || !watch('petId')) {
                        toast({
                          title: "Campos obrigatórios",
                          description: "Selecione um cliente e um pet para continuar.",
                          variant: "destructive"
                        });
                        return;
                      }
                    } else if (step === 2) {
                      if (!servicoId) {
                        toast({
                          title: "Campo obrigatório",
                          description: "Selecione um serviço para continuar.",
                          variant: "destructive"
                        });
                        return;
                      }
                    } else if (step === 3) {
                      if (!selectedDate || !watch('horarioId')) {
                        toast({
                          title: "Campos obrigatórios",
                          description: "Selecione uma data e um horário para continuar.",
                          variant: "destructive"
                        });
                        return;
                      }
                    }
                    
                    setStep(prev => prev + 1);
                  }}
                >
                  Continuar
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit(onSubmit)}>
                  Finalizar Agendamento
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => window.location.href = '/'}>
              Voltar para a página inicial
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      <Dialog open={showConfirmacao} onOpenChange={setShowConfirmacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Confira os dados do seu agendamento abaixo.
            </DialogDescription>
          </DialogHeader>
          
          {agendamento && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{agendamento.clienteNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet:</span>
                  <span className="font-medium">{agendamento.petNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">{agendamento.servicoNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-medium">R$ {agendamento.valorServico?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{agendamento.dataFormatada}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{agendamento.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profissional:</span>
                  <span className="font-medium">{agendamento.funcionarioNome}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmacao(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAgendamento}>
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendamentoOnline;
