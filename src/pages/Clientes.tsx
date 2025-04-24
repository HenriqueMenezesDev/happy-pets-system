import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Cliente } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Users } from 'lucide-react';

interface FormValues {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
}

const Clientes = () => {
  const { clientes, adicionarCliente, atualizarCliente, removerCliente } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const columns: Column<Cliente>[] = [
    { header: 'Nome', accessor: 'nome' as keyof Cliente },
    { header: 'Email', accessor: 'email' as keyof Cliente },
    { header: 'Telefone', accessor: 'telefone' as keyof Cliente },
    { header: 'CPF', accessor: 'cpf' as keyof Cliente },
  ];

  const handleAddNew = () => {
    setCurrentCliente(null);
    reset({
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cpf: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente(cliente);
    reset({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      cpf: cliente.cpf,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (cliente: Cliente) => {
    setCurrentCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentCliente) {
      removerCliente(currentCliente.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    if (currentCliente) {
      atualizarCliente(currentCliente.id, data);
    } else {
      adicionarCliente(data);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <PageHeader 
        title="Clientes" 
        description="Gerencie os clientes do pet shop." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Cliente"
      />

      <DataTable 
        columns={columns}
        data={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(cliente) => cliente.id}
        emptyStateProps={{
          title: "Nenhum cliente cadastrado",
          description: "Cadastre seu primeiro cliente para começar",
          actionLabel: "Cadastrar Cliente",
          onAction: handleAddNew
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {currentCliente 
                ? 'Edite as informações do cliente abaixo.' 
                : 'Preencha as informações para cadastrar um novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome completo" 
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Email" 
                  {...register("email", { 
                    required: "Email é obrigatório",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email inválido"
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="Telefone" 
                  {...register("telefone", { required: "Telefone é obrigatório" })}
                />
                {errors.telefone && <p className="text-red-500 text-sm">{errors.telefone.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input 
                  id="cpf" 
                  placeholder="CPF" 
                  {...register("cpf", { required: "CPF é obrigatório" })}
                />
                {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input 
                  id="endereco" 
                  placeholder="Endereço completo" 
                  {...register("endereco", { required: "Endereço é obrigatório" })}
                />
                {errors.endereco && <p className="text-red-500 text-sm">{errors.endereco.message}</p>}
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
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente ${currentCliente?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Clientes;
