import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Atendimento, ItemAtendimento } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useForm, Controller } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  deleteAtendimento, 
  addAtendimento, 
  updateAtendimento, 
  addItemAtendimento, 
  removeItemAtendimento 
} from '@/services/atendimentoService';

interface FormValues {
  data: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  clienteId: string;
  petId: string;
  funcionarioId: string;
  observacoes: string;
}

interface ItemFormValues {
  tipo: 'produto' | 'servico';
  itemId: string;
  quantidade: number;
}

const Atendimentos = () => {
  const { 
    atendimentos, 
    clientes, 
    funcionarios, 
    pets, 
    servicos, 
    produtos,
    adicionarAtendimento, 
    atualizarAtendimento, 
    removerAtendimento, 
    getPetsByClienteId,
    getServicoById,
    getProdutoById,
    adicionarItemAtendimento,
    removerItemAtendimento,
    refreshData
  } = useData();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [currentAtendimento, setCurrentAtendimento] = useState<Atendimento | null>(null);
  
  const [clientePets, setClientePets] = useState<typeof pets>([]);
  
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = 
    useForm<FormValues>();
  
  const { register: registerItem, handleSubmit: handleSubmitItem, control: controlItem, reset: resetItem, watch: watchItem } = 
    useForm<ItemFormValues>({
      defaultValues: {
        tipo: 'servico',
        quantidade: 1
      }
    });
    
  const selectedClienteId = watch('clienteId');
  const selectedItemTipo = watchItem('tipo');

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const columns: Column<Atendimento>[] = [
    { 
      header: 'Data', 
      accessor: (atendimento: Atendimento) => {
        const date = new Date(atendimento.data);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      }
    },
    { header: 'Cliente', accessor: 'clienteNome' },
    { header: 'Pet', accessor: 'petNome' },
    { header: 'Funcionário', accessor: 'funcionarioNome' },
    { 
      header: 'Status', 
      accessor: (atendimento: Atendimento) => (
        <StatusBadge status={atendimento.status} />
      )
    },
    { 
      header: 'Valor Total', 
      accessor: (atendimento: Atendimento) => `R$ ${atendimento.valorTotal.toFixed(2)}` 
    },
  ];

  const StatusBadge = ({ status }: { status: Atendimento['status'] }) => {
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

  const handleAddNew = () => {
    setCurrentAtendimento(null);
    reset({
      data: new Date().toISOString().slice(0, 16),
      status: 'agendado',
      clienteId: clientes.length > 0 ? clientes[0].id : '',
      petId: '',
      funcionarioId: funcionarios.length > 0 ? funcionarios[0].id : '',
      observacoes: '',
    });
    setIsFormOpen(true);

    if (clientes.length > 0) {
      const clientePets = getPetsByClienteId(clientes[0].id);
      setClientePets(clientePets);
    }
  };

  const handleEdit = (atendimento: Atendimento) => {
    setCurrentAtendimento(atendimento);
    reset({
      data: new Date(atendimento.data).toISOString().slice(0, 16),
      status: atendimento.status,
      clienteId: atendimento.clienteId,
      petId: atendimento.petId,
      funcionarioId: atendimento.funcionarioId,
      observacoes: atendimento.observacoes,
    });
    
    const clientePets = getPetsByClienteId(atendimento.clienteId);
    setClientePets(clientePets);
    
    setIsFormOpen(true);
  };

  const handleDelete = (atendimento: Atendimento) => {
    setCurrentAtendimento(atendimento);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (currentAtendimento) {
      await deleteAtendimento(currentAtendimento.id);
      refreshData();
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (currentAtendimento) {
      await updateAtendimento(currentAtendimento.id, {
        ...data,
        data: new Date(data.data).toISOString(),
      });
    } else {
      await addAtendimento({
        ...data,
        data: new Date(data.data).toISOString(),
      });
    }
    refreshData();
    setIsFormOpen(false);
  };

  const handleClienteChange = (clienteId: string) => {
    const clientePets = getPetsByClienteId(clienteId);
    setClientePets(clientePets);
  };

  const handleAddItem = () => {
    if (!currentAtendimento) return;
    
    resetItem({
      tipo: 'servico',
      itemId: servicos.length > 0 ? servicos[0].id : '',
      quantidade: 1
    });
    
    setIsItemDialogOpen(true);
  };

  const handleSubmitItemForm = async (data: ItemFormValues) => {
    if (!currentAtendimento) return;

    const { tipo, itemId, quantidade } = data;
    
    let valorUnitario = 0;
    
    if (tipo === 'servico') {
      const servico = getServicoById(itemId);
      if (servico) {
        valorUnitario = servico.preco;
      }
    } else {
      const produto = getProdutoById(itemId);
      if (produto) {
        valorUnitario = produto.preco;
      }
    }

    await addItemAtendimento(currentAtendimento.id, {
      tipo,
      itemId,
      quantidade,
      valorUnitario
    });
    
    refreshData();
    setIsItemDialogOpen(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!currentAtendimento) return;
    await removeItemAtendimento(currentAtendimento.id, itemId);
    refreshData();
  };

  return (
    <div>
      <PageHeader 
        title="Atendimentos" 
        description="Gerencie os atendimentos realizados no pet shop." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Atendimento"
      />

      <DataTable 
        columns={columns}
        data={atendimentos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(atendimento) => atendimento.id}
        emptyStateProps={{
          title: "Nenhum atendimento registrado",
          description: "Cadastre seu primeiro atendimento para começar",
          actionLabel: "Cadastrar Atendimento",
          onAction: handleAddNew
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentAtendimento ? 'Editar Atendimento' : 'Novo Atendimento'}</DialogTitle>
            <DialogDescription>
              {currentAtendimento
                ? 'Edite as informações do atendimento abaixo.'
                : 'Preencha as informações para registrar um novo atendimento.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="itens" disabled={!currentAtendimento}>
                Itens do Atendimento
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <form id="atendimento-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="data">Data e Hora</Label>
                      <Input 
                        id="data" 
                        type="datetime-local" 
                        {...register("data", { required: "Data e hora são obrigatórias" })}
                      />
                      {errors.data && <p className="text-red-500 text-sm">{errors.data.message}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Controller
                        name="status"
                        control={control}
                        rules={{ required: "Status é obrigatório" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agendado">Agendado</SelectItem>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="clienteId">Cliente</Label>
                      <Controller
                        name="clienteId"
                        control={control}
                        rules={{ required: "Cliente é obrigatório" }}
                        render={({ field }) => (
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleClienteChange(value);
                            }} 
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
                      {errors.clienteId && <p className="text-red-500 text-sm">{errors.clienteId.message}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="petId">Pet</Label>
                      <Controller
                        name="petId"
                        control={control}
                        rules={{ required: "Pet é obrigatório" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder={clientePets.length ? "Selecione o pet" : "Selecione um cliente primeiro"} />
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
                      {errors.petId && <p className="text-red-500 text-sm">{errors.petId.message}</p>}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="funcionarioId">Funcionário Responsável</Label>
                    <Controller
                      name="funcionarioId"
                      control={control}
                      rules={{ required: "Funcionário é obrigatório" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o funcionário" />
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
                    {errors.funcionarioId && <p className="text-red-500 text-sm">{errors.funcionarioId.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea 
                      id="observacoes" 
                      placeholder="Observações sobre o atendimento" 
                      {...register("observacoes")}
                    />
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="itens">
              {currentAtendimento && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Itens do Atendimento</h3>
                    <Button size="sm" onClick={handleAddItem}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Item
                    </Button>
                  </div>

                  {currentAtendimento.itens.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Nenhum item adicionado a este atendimento.</p>
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Qtd</TableHead>
                            <TableHead>Valor Unit.</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead className="w-[50px]">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentAtendimento.itens.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Badge variant="outline">
                                  {item.tipo === 'servico' ? 'Serviço' : 'Produto'}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.nome}</TableCell>
                              <TableCell>{item.quantidade}</TableCell>
                              <TableCell>R$ {item.valorUnitario.toFixed(2)}</TableCell>
                              <TableCell>R$ {(item.quantidade * item.valorUnitario).toFixed(2)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-medium">
                              Valor Total:
                            </TableCell>
                            <TableCell colSpan={2} className="font-bold">
                              R$ {currentAtendimento.valorTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="atendimento-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Atendimento</DialogTitle>
            <DialogDescription>
              Escolha o tipo de item e preencha as informações.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitItem(handleSubmitItemForm)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo de Item</Label>
                <Controller
                  name="tipo"
                  control={controlItem}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="produto">Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="itemId">{selectedItemTipo === 'servico' ? 'Serviço' : 'Produto'}</Label>
                <Controller
                  name="itemId"
                  control={controlItem}
                  rules={{ required: "Item é obrigatório" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecione o ${selectedItemTipo === 'servico' ? 'serviço' : 'produto'}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedItemTipo === 'servico' 
                          ? servicos.map(servico => (
                              <SelectItem key={servico.id} value={servico.id}>
                                {servico.nome} - R$ {servico.preco.toFixed(2)}
                              </SelectItem>
                            ))
                          : produtos.map(produto => (
                              <SelectItem key={produto.id} value={produto.id} disabled={produto.estoque <= 0}>
                                {produto.nome} - R$ {produto.preco.toFixed(2)} {produto.estoque > 0 
                                  ? `(Estoque: ${produto.estoque})` 
                                  : '(Sem estoque)'}
                              </SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input 
                  id="quantidade" 
                  type="number" 
                  min="1" 
                  {...registerItem("quantidade", { 
                    required: "Quantidade é obrigatória",
                    valueAsNumber: true,
                    min: { value: 1, message: "Quantidade deve ser maior que 0" }
                  })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Atendimento"
        description={`Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Atendimentos;
