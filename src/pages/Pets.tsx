
import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Pet } from '@/types';
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
import { useForm, Controller } from 'react-hook-form';
import { PawPrint } from 'lucide-react';

interface FormValues {
  nome: string;
  especie: string;
  raca: string;
  dataNascimento: string;
  peso: number;
  sexo: 'M' | 'F';
  clienteId: string;
}

const Pets = () => {
  const { pets, clientes, adicionarPet, atualizarPet, removerPet } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>();

  const columns = [
    { header: 'Nome', accessor: 'nome' },
    { header: 'Espécie', accessor: 'especie' },
    { header: 'Raça', accessor: 'raca' },
    { 
      header: 'Dono', 
      accessor: 'clienteNome',
    },
    { 
      header: 'Sexo', 
      accessor: (pet: Pet) => pet.sexo === 'M' ? 'Macho' : 'Fêmea' 
    },
  ];

  const handleAddNew = () => {
    setCurrentPet(null);
    reset({
      nome: '',
      especie: '',
      raca: '',
      dataNascimento: '',
      peso: 0,
      sexo: 'M',
      clienteId: clientes.length > 0 ? clientes[0].id : '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (pet: Pet) => {
    setCurrentPet(pet);
    reset({
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      dataNascimento: pet.dataNascimento,
      peso: pet.peso,
      sexo: pet.sexo,
      clienteId: pet.clienteId,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (pet: Pet) => {
    setCurrentPet(pet);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentPet) {
      removerPet(currentPet.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    if (currentPet) {
      atualizarPet(currentPet.id, data);
    } else {
      adicionarPet(data);
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <PageHeader 
        title="Pets" 
        description="Gerencie os animais de estimação dos clientes." 
        onAddNew={handleAddNew}
        addNewLabel="Novo Pet"
      />

      <DataTable 
        columns={columns}
        data={pets}
        onEdit={handleEdit}
        onDelete={handleDelete}
        keyExtractor={(pet) => pet.id}
        emptyStateProps={{
          title: "Nenhum pet cadastrado",
          description: "Cadastre seu primeiro pet para começar",
          actionLabel: "Cadastrar Pet",
          onAction: handleAddNew
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentPet ? 'Editar Pet' : 'Novo Pet'}</DialogTitle>
            <DialogDescription>
              {currentPet 
                ? 'Edite as informações do pet abaixo.' 
                : 'Preencha as informações para cadastrar um novo pet.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  placeholder="Nome do pet" 
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="especie">Espécie</Label>
                <Input 
                  id="especie" 
                  placeholder="Cachorro, Gato, etc." 
                  {...register("especie", { required: "Espécie é obrigatória" })}
                />
                {errors.especie && <p className="text-red-500 text-sm">{errors.especie.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="raca">Raça</Label>
                <Input 
                  id="raca" 
                  placeholder="Raça do pet" 
                  {...register("raca", { required: "Raça é obrigatória" })}
                />
                {errors.raca && <p className="text-red-500 text-sm">{errors.raca.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input 
                  id="dataNascimento" 
                  type="date" 
                  {...register("dataNascimento", { required: "Data de nascimento é obrigatória" })}
                />
                {errors.dataNascimento && <p className="text-red-500 text-sm">{errors.dataNascimento.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input 
                  id="peso" 
                  type="number" 
                  step="0.1" 
                  {...register("peso", { 
                    required: "Peso é obrigatório",
                    valueAsNumber: true,
                    min: { value: 0.1, message: "Peso deve ser maior que 0" }
                  })}
                />
                {errors.peso && <p className="text-red-500 text-sm">{errors.peso.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Controller
                  name="sexo"
                  control={control}
                  rules={{ required: "Sexo é obrigatório" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Macho</SelectItem>
                        <SelectItem value="F">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sexo && <p className="text-red-500 text-sm">{errors.sexo.message}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="clienteId">Dono</Label>
                <Controller
                  name="clienteId"
                  control={control}
                  rules={{ required: "Dono é obrigatório" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dono" />
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
        title="Excluir Pet"
        description={`Tem certeza que deseja excluir o pet ${currentPet?.nome}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default Pets;
