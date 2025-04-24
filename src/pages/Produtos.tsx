import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Produto } from '@/types';
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
import { Package } from 'lucide-react';

interface FormValues {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
}

const Produtos = () => {
  const { produtos, adicionarProduto, atualizarProduto, removerProduto } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduto, setCurrentProduto] = useState<Produto | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const columns: Column<Produto>[] = [
    { header: 'Nome', accessor: 'nome' as keyof Produto },
    { 
      header: 'Descrição', 
      accessor: (produto: Produto) => (
        <div className="max-w-xs truncate" title={produto.descricao}>
          {produto.descricao}
        </div>
      )
    },
    { 
      header: 'Preço', 
      accessor: (produto: Produto) => `R$ ${produto.preco.toFixed(2)}` 
    },
    { header: 'Estoque', accessor: 'estoque' as keyof Produto },
    { header: 'Categoria', accessor: 'categoria' as keyof Produto },
  ];

  const handleAddNew = () => {
    setCurrentProduto(null);
    reset({
      nome: '',
      descricao: '',
      preco: 0,
      estoque: 0,
      categoria: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    setCurrentProduto(produto);
    reset({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: produto.categoria,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (produto: Produto) => {
    setCurrentProduto(produto);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentProduto) {
      removerProduto(currentProduto.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    if (currentProduto) {
      atualizarProduto(currentProduto.id, data);
    } else {
      adicionarProduto(data);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <PageHeader 
        title="Produtos" 
        description="Gerencie os produtos comercializados no pet shop." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Produto"
      />

      <DataTable 
        columns={columns}
        data={produtos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(produto) => produto.id}
        emptyStateProps={{
          title: "Nenhum produto cadastrado",
          description: "Cadastre seu primeiro produto para começar",
          actionLabel: "Cadastrar Produto",
          onAction: handleAddNew
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              {currentProduto
                ? 'Edite as informações do produto abaixo.'
                : 'Preencha as informações para cadastrar um novo produto.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome do produto" 
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  placeholder="Descrição do produto" 
                  {...register("descricao", { required: "Descrição é obrigatória" })}
                />
                {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input 
                  id="categoria" 
                  placeholder="Categoria do produto" 
                  {...register("categoria", { required: "Categoria é obrigatória" })}
                />
                {errors.categoria && <p className="text-red-500 text-sm">{errors.categoria.message}</p>}
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

              <div className="grid gap-2">
                <Label htmlFor="estoque">Estoque</Label>
                <Input 
                  id="estoque" 
                  type="number" 
                  {...register("estoque", { 
                    required: "Estoque é obrigatório",
                    valueAsNumber: true,
                    min: { value: 0, message: "Estoque não pode ser negativo" }
                  })}
                />
                {errors.estoque && <p className="text-red-500 text-sm">{errors.estoque.message}</p>}
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
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto ${currentProduto?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Produtos;
