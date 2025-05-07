
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, addDays, setHours, setMinutes, addMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchHorariosDisponiveis, 
  addHorarioDisponivel, 
  addMultiplosHorarios, 
  deleteHorario 
} from '@/services/horarioService';
import { HorarioDisponivel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';

interface FormValues {
  funcionarioId: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  intervalo: string;
}

const HorariosDisponiveis = () => {
  const { toast } = useToast();
  const { funcionarios } = useData();
  const { user, isAdmin } = useAuth();
  
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      data: new Date(),
      horaInicio: '09:00',
      horaFim: '18:00',
      intervalo: '30',
    }
  });
  
  // Se o usuário logado for funcionário e não admin, pré-selecionar ele
  useEffect(() => {
    if (user && !isAdmin) {
      setValue('funcionarioId', user.id);
    } else if (funcionarios.length > 0) {
      setValue('funcionarioId', funcionarios[0].id);
    }
  }, [user, isAdmin, funcionarios, setValue]);
  
  // Carregar horários quando a data selecionada mudar
  useEffect(() => {
    const carregarHorarios = async () => {
      setIsLoading(true);
      try {
        const dataFormatada = format(selectedDate, 'yyyy-MM-dd');
        const horariosData = await fetchHorariosDisponiveis(dataFormatada);
        setHorarios(horariosData);
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        toast({
          title: 'Erro ao carregar horários',
          description: 'Não foi possível carregar os horários disponíveis.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarHorarios();
  }, [selectedDate, toast]);
  
  const handleNewSchedule = () => {
    reset({
      funcionarioId: user && !isAdmin ? user.id : funcionarios[0]?.id || '',
      data: new Date(),
      horaInicio: '09:00',
      horaFim: '18:00',
      intervalo: '30',
    });
    setIsFormOpen(true);
  };
  
  const handleDeleteHorario = async (id: string) => {
    const success = await deleteHorario(id);
    if (success) {
      setHorarios(prev => prev.filter(h => h.id !== id));
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      const dataFormatada = format(data.data, 'yyyy-MM-dd');
      
      // Gerar array de horários baseado nas entradas
      const horariosGerados: string[] = [];
      const horaInicioParts = data.horaInicio.split(':');
      const horaFimParts = data.horaFim.split(':');
      
      let horarioAtual = new Date();
      horarioAtual = setHours(horarioAtual, parseInt(horaInicioParts[0]));
      horarioAtual = setMinutes(horarioAtual, parseInt(horaInicioParts[1]));
      
      const horarioFim = new Date();
      horarioFim = setHours(horarioFim, parseInt(horaFimParts[0]));
      horarioFim = setMinutes(horarioFim, parseInt(horaFimParts[1]));
      
      const intervaloMinutos = parseInt(data.intervalo);
      
      while (horarioAtual < horarioFim) {
        horariosGerados.push(format(horarioAtual, 'HH:mm'));
        horarioAtual = addMinutes(horarioAtual, intervaloMinutos);
      }
      
      // Adicionar múltiplos horários
      const novoHorarios = await addMultiplosHorarios(
        data.funcionarioId,
        dataFormatada,
        horariosGerados,
        intervaloMinutos
      );
      
      if (novoHorarios && novoHorarios.length > 0) {
        setHorarios(prev => [...prev, ...novoHorarios]);
        setIsFormOpen(false);
        
        // Se a data adicionada for a mesma que está selecionada no calendário,
        // atualizar a visualização
        if (format(data.data, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
          setSelectedDate(new Date(data.data));
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar horários:', error);
      toast({
        title: 'Erro ao adicionar horários',
        description: 'Ocorreu um erro ao adicionar os horários disponíveis.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Horários Disponíveis" 
        description="Gerencie os horários disponíveis para agendamento." 
        onAddNew={handleNewSchedule}
        addNewLabel="Adicionar Horários"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver os horários disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="pointer-events-auto"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Horários - {format(selectedDate, "dd/MM/yyyy")}</CardTitle>
              <CardDescription>
                Horários disponíveis para agendamentos
              </CardDescription>
            </div>
            <Button onClick={handleNewSchedule}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando horários...</div>
            ) : horarios.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horário</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {horarios
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map(horario => (
                      <TableRow key={horario.id}>
                        <TableCell className="font-medium">{horario.hora}</TableCell>
                        <TableCell>{horario.funcionarioNome}</TableCell>
                        <TableCell>
                          {horario.disponivel ? (
                            <span className="text-green-500">Disponível</span>
                          ) : (
                            <span className="text-red-500">Reservado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHorario(horario.id)}
                            disabled={!horario.disponivel}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum horário disponível para esta data.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleNewSchedule}
                >
                  Adicionar horários
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulário para adicionar horários */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Horários</DialogTitle>
            <DialogDescription>
              Defina o intervalo de horários disponíveis para agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="funcionarioId">Profissional</Label>
                <Controller
                  name="funcionarioId"
                  control={control}
                  rules={{ required: "Profissional é obrigatório" }}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={user && !isAdmin}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {funcionarios.map((funcionario) => (
                          <SelectItem key={funcionario.id} value={funcionario.id}>
                            {funcionario.nome} ({funcionario.cargo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.funcionarioId && <p className="text-sm text-red-500">{errors.funcionarioId.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Controller
                  control={control}
                  name="data"
                  rules={{ required: "Data é obrigatória" }}
                  render={({ field }) => (
                    <div className="flex h-10 items-center rounded-md border border-input px-3">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      <Input
                        className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        type="date"
                        value={format(field.value, 'yyyy-MM-dd')}
                        onChange={e => field.onChange(new Date(e.target.value))}
                      />
                    </div>
                  )}
                />
                {errors.data && <p className="text-sm text-red-500">{errors.data.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Horário de Início</Label>
                  <Input 
                    id="horaInicio"
                    type="time"
                    {...register("horaInicio", { required: "Horário de início é obrigatório" })}
                  />
                  {errors.horaInicio && <p className="text-sm text-red-500">{errors.horaInicio.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horaFim">Horário de Término</Label>
                  <Input 
                    id="horaFim"
                    type="time"
                    {...register("horaFim", { required: "Horário de término é obrigatório" })}
                  />
                  {errors.horaFim && <p className="text-sm text-red-500">{errors.horaFim.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intervalo">Intervalo entre Horários (minutos)</Label>
                <Controller
                  name="intervalo"
                  control={control}
                  rules={{ required: "Intervalo é obrigatório" }}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o intervalo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.intervalo && <p className="text-sm text-red-500">{errors.intervalo.message}</p>}
              </div>
              
              {/* Preview dos horários */}
              <div className="border rounded-md p-4 space-y-2">
                <h3 className="font-medium">Prévia dos Horários</h3>
                <div className="text-sm max-h-40 overflow-y-auto">
                  {(() => {
                    // Gerar preview dos horários
                    const horariosPreview: string[] = [];
                    const horaInicio = watch('horaInicio');
                    const horaFim = watch('horaFim');
                    const intervalo = watch('intervalo');
                    
                    if (horaInicio && horaFim && intervalo) {
                      const horaInicioParts = horaInicio.split(':');
                      const horaFimParts = horaFim.split(':');
                      
                      let horarioAtual = new Date();
                      horarioAtual = setHours(horarioAtual, parseInt(horaInicioParts[0]));
                      horarioAtual = setMinutes(horarioAtual, parseInt(horaInicioParts[1]));
                      
                      const horarioFim = new Date();
                      horarioFim = setHours(horarioFim, parseInt(horaFimParts[0]));
                      horarioFim = setMinutes(horarioFim, parseInt(horaFimParts[1]));
                      
                      const intervaloMinutos = parseInt(intervalo);
                      
                      while (horarioAtual < horarioFim) {
                        horariosPreview.push(format(horarioAtual, 'HH:mm'));
                        horarioAtual = addMinutes(horarioAtual, intervaloMinutos);
                      }
                    }
                    
                    return (
                      <div className="grid grid-cols-4 gap-1">
                        {horariosPreview.map((horario, index) => (
                          <div key={index} className="p-1 text-center border rounded">
                            {horario}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Horários</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HorariosDisponiveis;
