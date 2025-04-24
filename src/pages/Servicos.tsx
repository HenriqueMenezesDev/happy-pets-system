import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Servico } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Calendar } from 'lucide-react';

interface FormValues {
  nome: string;
  descricao: string;
  duracao: number;
  preco: number;
}

const Servicos = () => {
  const { servicos, adicionarServico, atualizarServico, removerServico } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentServico, setCurrentServico] = useState<Servico | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const columns: Column<Servico>[] = [
    { header: 'Nome', accessor: 'nome' as keyof Servico },
    { 
      header: 'Descrição', 
      accessor: (servico: Servico) => (
        <div className="max-w-xs truncate" title={servico.descricao}>
          {servico.descricao}
        </div>
      )
    },
    { 
      header: 'Duração', 
      accessor: (servico: Servico) => `${servico.duracao} min` 
    },
    { 
      header: 'Preço', 
      accessor: (servico: Servico) => `R$ ${servico.preco.toFixed(2)}` 
    },
  ];

  const handleAddNew = () => {
    setCurrentServico(null);
    reset({
      nome: '',
      descricao: '',
      duracao: 30,
      preco: 0,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (servico: Servico) => {
    setCurrentServico(servico);
    reset({
      nome: servico.nome,
      descricao: servico.descricao,
      duracao: servico.duracao,
      preco: servico.preco,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (servico: Servico) => {
    setCurrentServico(servico);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentServico) {
      removerServico(currentServico.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    if (currentServico) {
      atualizarServico(currentServico.id, data);
    } else {
      adicionarServico(data);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <PageHeader 
        title="Serviços" 
        description="Gerencie os serviços oferecidos pelo pet shop." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Serviço"
      />

      <DataTable 
        columns={columns}
        data={servicos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(servico) => servico.id}
        emptyStateProps={{
          title: "Nenhum serviço cadastrado",
          description: "Cadastre seu primeiro serviço para começar",
          actionLabel: "Cadastrar Serviço",
          onAction: handleAddNew
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentServico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            <DialogDescription>
              {currentServico
                ? 'Edite as informações do serviço abaixo.'
                : 'Preencha as informações para cadastrar um novo serviço.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome do serviço" 
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  placeholder="Descrição do serviço" 
                  {...register("descricao", { required: "Descrição é obrigatória" })}
                />
                {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Input 
                  id="duracao" 
                  type="number" 
                  {...register("duracao", { 
                    required: "Duração é obrigatória",
                    valueAsNumber: true,
                    min: { value: 1, message: "Duração deve ser maior que 0" }
                  })}
                />
                {errors.duracao && <p className="text-red-500 text-sm">{errors.duracao.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input 
                  id="preco" 
                  type="number" 
                  step="0.01" 
                  {...register("preco", { 
                    required: "Preço é obrigatório",
                    valueAsNumber: true,
                    min: { value: 0.01, message: "Preço deve ser maior que 0" }
                  })}
                />
                {errors.preco && <p className="text-red-500 text-sm">{errors.preco.message}</p>}
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
        title="Excluir Serviço"
        description={`Tem certeza que deseja excluir o serviço ${currentServico?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Servicos;
