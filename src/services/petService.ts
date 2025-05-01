
import { supabase } from '@/integrations/supabase/client';
import { Pet } from '@/types';
import { mapDbPetToPet } from './types/mappers';
import { handleError } from './utils/errorHandler';
import { toast } from '@/hooks/use-toast';

export async function fetchPets() {
  try {
    const { data, error } = await supabase
      .from('pets')
      .select(`
        *,
        clientes(nome)
      `)
      .order('nome');

    if (error) throw error;
    return data.map(mapDbPetToPet);
  } catch (error: any) {
    handleError(error, 'buscar pets');
    return [];
  }
}

export async function addPet(pet: Omit<Pet, 'id' | 'clienteNome'>) {
  try {
    // Convert from frontend model to database model
    const dbPet = {
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      data_nascimento: pet.dataNascimento,
      peso: pet.peso,
      sexo: pet.sexo,
      cliente_id: pet.clienteId
    };

    const { data, error } = await supabase
      .from('pets')
      .insert(dbPet)
      .select('*, clientes(nome)')
      .single();

    if (error) throw error;
    return mapDbPetToPet(data);
  } catch (error: any) {
    handleError(error, 'adicionar pet');
    return null;
  }
}

export async function updatePet(id: string, pet: Partial<Pet>) {
  try {
    const updateData: any = {};
    
    if (pet.nome) updateData.nome = pet.nome;
    if (pet.especie) updateData.especie = pet.especie;
    if (pet.raca) updateData.raca = pet.raca;
    if (pet.dataNascimento) updateData.data_nascimento = pet.dataNascimento;
    if (pet.peso) updateData.peso = pet.peso;
    if (pet.sexo) updateData.sexo = pet.sexo;
    if (pet.clienteId) updateData.cliente_id = pet.clienteId;
    
    const { data, error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('id', id)
      .select('*, clientes(nome)')
      .single();

    if (error) throw error;
    return mapDbPetToPet(data);
  } catch (error: any) {
    handleError(error, 'atualizar pet');
    return null;
  }
}

export async function deletePet(id: string) {
  try {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    toast({ title: "Pet removido com sucesso!" });
    return true;
  } catch (error: any) {
    handleError(error, 'excluir pet');
    return false;
  }
}
