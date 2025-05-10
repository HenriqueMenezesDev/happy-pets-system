
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Funcionario } from '@/types';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';

interface FormValues {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  emailLogin: string;
  perfil: string;
  ativo: boolean; // Added the missing ativo property
}

const Funcionarios = () => {
  const { funcionarios, adicionarFuncionario, atualizarFuncionario, removerFuncionario } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFuncionario, setCurrentFuncionario] = useState<Funcionario | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const columns: Column<Funcionario>[] = [
    { header: 'Nome', accessor: 'nome' as keyof Funcionario },
    { header: 'Cargo', accessor: 'cargo' as keyof Funcionario },
    { header: 'Email', accessor: 'email' as keyof Funcionario },
    { header: 'Telefone', accessor: 'telefone' as keyof Funcionario },
    { 
      header: 'Data de Cadastro', 
      accessor: (funcionario: Funcionario) => new Date(funcionario.dataCadastro).toLocaleDateString() 
    },
    {
      header: 'Status',
      accessor: (funcionario: Funcionario) => funcionario.ativo ? 'Ativo' : 'Inativo'
    },
  ];

  const handleAddNew = () => {
    setCurrentFuncionario(null);
    reset({
      nome: '',
      cargo: '',
      email: '',
      telefone: '',
      emailLogin: '',
      perfil: 'funcionario',
      ativo: true, // Default value for new employees
    });
    setIsFormOpen(true);
  };

  const handleEdit = (funcionario: Funcionario) => {
    setCurrentFuncionario(funcionario);
    reset({
      nome: funcionario.nome,
      cargo: funcionario.cargo,
      email: funcionario.email,
      telefone: funcionario.telefone,
      emailLogin: funcionario.emailLogin,
      perfil: funcionario.perfil,
      ativo: funcionario.ativo,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (funcionario: Funcionario) => {
    setCurrentFuncionario(funcionario);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentFuncionario) {
      removerFuncionario(currentFuncionario.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    if (currentFuncionario) {
      atualizarFuncionario(currentFuncionario.id, data);
    } else {
      // Set emailLogin to email if not provided
      if (!data.emailLogin) {
        data.emailLogin = data.email;
      }
      
      // Set a default perfil if not provided
      if (!data.perfil) {
        data.perfil = 'funcionario';
      }
      
      adicionarFuncionario(data);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <PageHeader 
        title="Funcionários" 
        description="Gerencie os funcionários do pet shop." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Funcionário"
      />

      <DataTable 
        columns={columns}
        data={funcionarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(funcionario) => funcionario.id}
        emptyStateProps={{
          title: "Nenhum funcionário cadastrado",
          description: "Cadastre seu primeiro funcionário para começar",
          actionLabel: "Cadastrar Funcionário",
          onAction: handleAddNew
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
            <DialogDescription>
              {currentFuncionario
                ? 'Edite as informações do funcionário abaixo.'
                : 'Preencha as informações para cadastrar um novo funcionário.'}
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
                <Label htmlFor="cargo">Cargo</Label>
                <Input 
                  id="cargo" 
                  placeholder="Cargo" 
                  {...register("cargo", { required: "Cargo é obrigatório" })}
                />
                {errors.cargo && <p className="text-red-500 text-sm">{errors.cargo.message}</p>}
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
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    {...register("ativo")} 
                    defaultChecked={currentFuncionario ? currentFuncionario.ativo : true}
                  />
                  <Label htmlFor="ativo">
                    {currentFuncionario && currentFuncionario.ativo ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
              </div>

              <input type="hidden" {...register("emailLogin")} />
              <input type="hidden" {...register("perfil")} value="funcionario" />
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
        title="Excluir Funcionário"
        description={`Tem certeza que deseja excluir o funcionário ${currentFuncionario?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Funcionarios;
