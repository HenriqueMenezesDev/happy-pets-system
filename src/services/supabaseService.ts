
import { supabase } from '@/integrations/supabase/client';
import { Cliente, Pet, Funcionario, Servico, Produto, Atendimento, ItemAtendimento } from '@/types';
import { toast } from '@/hooks/use-toast';

// Cliente services
export async function fetchClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data as Cliente[];
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error.message);
    toast({
      title: 'Erro ao buscar clientes',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}

export async function addCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ 
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        cpf: cliente.cpf
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data as Cliente;
  } catch (error: any) {
    console.error('Erro ao adicionar cliente:', error.message);
    toast({
      title: 'Erro ao adicionar cliente',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateCliente(id: string, cliente: Partial<Cliente>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as Cliente;
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error.message);
    toast({
      title: 'Erro ao atualizar cliente',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function deleteCliente(id: string) {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir cliente:', error.message);
    toast({
      title: 'Erro ao excluir cliente',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

// Pet services
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
    
    // Format pets with cliente nome
    const petsWithClienteNome = data.map(pet => ({
      ...pet,
      clienteNome: pet.clientes?.nome
    }));
    
    return petsWithClienteNome as Pet[];
  } catch (error: any) {
    console.error('Erro ao buscar pets:', error.message);
    toast({
      title: 'Erro ao buscar pets',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}

export async function addPet(pet: Omit<Pet, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('pets')
      .insert([{
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        data_nascimento: pet.dataNascimento,
        peso: pet.peso,
        sexo: pet.sexo,
        cliente_id: pet.clienteId
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data as Pet;
  } catch (error: any) {
    console.error('Erro ao adicionar pet:', error.message);
    toast({
      title: 'Erro ao adicionar pet',
      description: error.message,
      variant: 'destructive'
    });
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
      .select('*')
      .single();

    if (error) throw error;
    return data as Pet;
  } catch (error: any) {
    console.error('Erro ao atualizar pet:', error.message);
    toast({
      title: 'Erro ao atualizar pet',
      description: error.message,
      variant: 'destructive'
    });
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
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir pet:', error.message);
    toast({
      title: 'Erro ao excluir pet',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

// Implement other entity services following the same pattern
// For brevity, I'm focusing on the essential services first

export async function fetchFuncionarios() {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data as Funcionario[];
  } catch (error: any) {
    console.error('Erro ao buscar funcionários:', error.message);
    toast({
      title: 'Erro ao buscar funcionários',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}

export async function fetchServicos() {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data as Servico[];
  } catch (error: any) {
    console.error('Erro ao buscar serviços:', error.message);
    toast({
      title: 'Erro ao buscar serviços',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}

export async function fetchProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data as Produto[];
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error.message);
    toast({
      title: 'Erro ao buscar produtos',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}
