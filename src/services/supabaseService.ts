
import { supabase } from '@/integrations/supabase/client';
import { Cliente, Pet, Funcionario, Servico, Produto, Atendimento, ItemAtendimento } from '@/types';
import { toast } from '@/hooks/use-toast';

// Helper functions to map between database and frontend models
const mapDbClienteToCliente = (dbCliente: any): Cliente => {
  return {
    id: dbCliente.id,
    nome: dbCliente.nome,
    email: dbCliente.email,
    telefone: dbCliente.telefone,
    endereco: dbCliente.endereco,
    cpf: dbCliente.cpf,
    dataCadastro: dbCliente.data_cadastro
  };
};

const mapDbPetToPet = (dbPet: any): Pet => {
  return {
    id: dbPet.id,
    nome: dbPet.nome,
    especie: dbPet.especie,
    raca: dbPet.raca,
    dataNascimento: dbPet.data_nascimento,
    peso: dbPet.peso,
    sexo: dbPet.sexo as 'M' | 'F',
    clienteId: dbPet.cliente_id,
    clienteNome: dbPet.clientes?.nome
  };
};

const mapDbFuncionarioToFuncionario = (dbFuncionario: any): Funcionario => {
  return {
    id: dbFuncionario.id,
    nome: dbFuncionario.nome,
    cargo: dbFuncionario.cargo,
    email: dbFuncionario.email,
    telefone: dbFuncionario.telefone,
    dataCadastro: dbFuncionario.data_cadastro
  };
};

const mapDbServicoToServico = (dbServico: any): Servico => {
  return {
    id: dbServico.id,
    nome: dbServico.nome,
    descricao: dbServico.descricao,
    duracao: dbServico.duracao,
    preco: dbServico.preco
  };
};

const mapDbProdutoToProduto = (dbProduto: any): Produto => {
  return {
    id: dbProduto.id,
    nome: dbProduto.nome,
    descricao: dbProduto.descricao,
    preco: dbProduto.preco,
    estoque: dbProduto.estoque,
    categoria: dbProduto.categoria
  };
};

// Cliente services
export async function fetchClientes() {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbClienteToCliente);
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
    return mapDbClienteToCliente(data);
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
    return mapDbClienteToCliente(data);
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
    return data.map(mapDbPetToPet);
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

export async function addPet(pet: Omit<Pet, 'id' | 'clienteNome'>) {
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
      .select('*, clientes(nome)')
      .single();

    if (error) throw error;
    return mapDbPetToPet(data);
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
      .select('*, clientes(nome)')
      .single();

    if (error) throw error;
    return mapDbPetToPet(data);
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

// Funcionario services
export async function fetchFuncionarios() {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbFuncionarioToFuncionario);
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

export async function addFuncionario(funcionario: Omit<Funcionario, 'id' | 'dataCadastro'>) {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert([{
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        email: funcionario.email,
        telefone: funcionario.telefone
      }])
      .select('*')
      .single();

    if (error) throw error;
    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    console.error('Erro ao adicionar funcionário:', error.message);
    toast({
      title: 'Erro ao adicionar funcionário',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateFuncionario(id: string, funcionario: Partial<Funcionario>) {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(funcionario)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbFuncionarioToFuncionario(data);
  } catch (error: any) {
    console.error('Erro ao atualizar funcionário:', error.message);
    toast({
      title: 'Erro ao atualizar funcionário',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function deleteFuncionario(id: string) {
  try {
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir funcionário:', error.message);
    toast({
      title: 'Erro ao excluir funcionário',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

// Servico services
export async function fetchServicos() {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbServicoToServico);
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

export async function addServico(servico: Omit<Servico, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .insert([servico])
      .select('*')
      .single();

    if (error) throw error;
    return mapDbServicoToServico(data);
  } catch (error: any) {
    console.error('Erro ao adicionar serviço:', error.message);
    toast({
      title: 'Erro ao adicionar serviço',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateServico(id: string, servico: Partial<Servico>) {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .update(servico)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbServicoToServico(data);
  } catch (error: any) {
    console.error('Erro ao atualizar serviço:', error.message);
    toast({
      title: 'Erro ao atualizar serviço',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function deleteServico(id: string) {
  try {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir serviço:', error.message);
    toast({
      title: 'Erro ao excluir serviço',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

// Produto services
export async function fetchProdutos() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data.map(mapDbProdutoToProduto);
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

export async function addProduto(produto: Omit<Produto, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([produto])
      .select('*')
      .single();

    if (error) throw error;
    return mapDbProdutoToProduto(data);
  } catch (error: any) {
    console.error('Erro ao adicionar produto:', error.message);
    toast({
      title: 'Erro ao adicionar produto',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateProduto(id: string, produto: Partial<Produto>) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .update(produto)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapDbProdutoToProduto(data);
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error.message);
    toast({
      title: 'Erro ao atualizar produto',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function deleteProduto(id: string) {
  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir produto:', error.message);
    toast({
      title: 'Erro ao excluir produto',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

// Atendimento services
export async function fetchAtendimentos() {
  try {
    const { data, error } = await supabase
      .from('atendimentos')
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome)
      `)
      .order('data', { ascending: false });

    if (error) throw error;
    
    // Map data to frontend model
    return data.map(item => {
      return {
        id: item.id,
        data: item.data,
        status: item.status as 'agendado' | 'em_andamento' | 'concluido' | 'cancelado',
        clienteId: item.cliente_id,
        clienteNome: item.clientes?.nome,
        petId: item.pet_id,
        petNome: item.pets?.nome,
        funcionarioId: item.funcionario_id,
        funcionarioNome: item.funcionarios?.nome,
        observacoes: item.observacoes || '',
        valorTotal: item.valor_total,
        itens: [] // Itens serão carregados separadamente
      };
    }) as Atendimento[];
  } catch (error: any) {
    console.error('Erro ao buscar atendimentos:', error.message);
    toast({
      title: 'Erro ao buscar atendimentos',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}

export async function fetchItensAtendimento(atendimentoId: string) {
  try {
    const { data, error } = await supabase
      .from('itens_atendimento')
      .select('*')
      .eq('atendimento_id', atendimentoId);

    if (error) throw error;
    
    // Map data to frontend model
    return data.map(item => {
      return {
        id: item.id,
        tipo: item.tipo as 'produto' | 'servico',
        itemId: item.item_id,
        quantidade: item.quantidade,
        valorUnitario: item.valor_unitario,
        nome: '' // Nome será preenchido pelo frontend
      };
    }) as ItemAtendimento[];
  } catch (error: any) {
    console.error('Erro ao buscar itens do atendimento:', error.message);
    toast({
      title: 'Erro ao buscar itens do atendimento',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}

export async function addAtendimento(atendimento: Omit<Atendimento, 'id' | 'valorTotal' | 'itens'>) {
  try {
    const { data, error } = await supabase
      .from('atendimentos')
      .insert([{
        data: atendimento.data,
        status: atendimento.status,
        cliente_id: atendimento.clienteId,
        pet_id: atendimento.petId,
        funcionario_id: atendimento.funcionarioId,
        observacoes: atendimento.observacoes,
        valor_total: 0 // Será atualizado pelo trigger quando itens forem adicionados
      }])
      .select('*')
      .single();

    if (error) throw error;
    return {
      id: data.id,
      data: data.data,
      status: data.status as 'agendado' | 'em_andamento' | 'concluido' | 'cancelado',
      clienteId: data.cliente_id,
      petId: data.pet_id,
      funcionarioId: data.funcionario_id,
      observacoes: data.observacoes || '',
      valorTotal: data.valor_total,
      itens: []
    };
  } catch (error: any) {
    console.error('Erro ao adicionar atendimento:', error.message);
    toast({
      title: 'Erro ao adicionar atendimento',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function updateAtendimento(id: string, atendimento: Partial<Atendimento>) {
  try {
    const updateData: any = {};
    
    if (atendimento.data) updateData.data = atendimento.data;
    if (atendimento.status) updateData.status = atendimento.status;
    if (atendimento.clienteId) updateData.cliente_id = atendimento.clienteId;
    if (atendimento.petId) updateData.pet_id = atendimento.petId;
    if (atendimento.funcionarioId) updateData.funcionario_id = atendimento.funcionarioId;
    if (atendimento.observacoes !== undefined) updateData.observacoes = atendimento.observacoes;
    
    const { data, error } = await supabase
      .from('atendimentos')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clientes(nome),
        pets(nome),
        funcionarios(nome)
      `)
      .single();

    if (error) throw error;
    
    // Get items for the updated atendimento
    const itens = await fetchItensAtendimento(id);
    
    return {
      id: data.id,
      data: data.data,
      status: data.status as 'agendado' | 'em_andamento' | 'concluido' | 'cancelado',
      clienteId: data.cliente_id,
      clienteNome: data.clientes?.nome,
      petId: data.pet_id,
      petNome: data.pets?.nome,
      funcionarioId: data.funcionario_id,
      funcionarioNome: data.funcionarios?.nome,
      observacoes: data.observacoes || '',
      valorTotal: data.valor_total,
      itens
    };
  } catch (error: any) {
    console.error('Erro ao atualizar atendimento:', error.message);
    toast({
      title: 'Erro ao atualizar atendimento',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function deleteAtendimento(id: string) {
  try {
    const { error } = await supabase
      .from('atendimentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao excluir atendimento:', error.message);
    toast({
      title: 'Erro ao excluir atendimento',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

export async function addItemAtendimento(atendimentoId: string, item: Omit<ItemAtendimento, 'id' | 'nome'>) {
  try {
    // Primeiro verificamos se o item existe (produto ou serviço)
    let nome = '';
    
    if (item.tipo === 'produto') {
      const { data } = await supabase
        .from('produtos')
        .select('nome')
        .eq('id', item.itemId)
        .single();
      
      if (data) nome = data.nome;
    } else {
      const { data } = await supabase
        .from('servicos')
        .select('nome')
        .eq('id', item.itemId)
        .single();
      
      if (data) nome = data.nome;
    }

    const { data, error } = await supabase
      .from('itens_atendimento')
      .insert([{
        atendimento_id: atendimentoId,
        tipo: item.tipo,
        item_id: item.itemId,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario
      }])
      .select('*')
      .single();

    if (error) throw error;
    
    // Obter o atendimento atualizado para retornar o valor total
    const { data: atendimentoAtualizado } = await supabase
      .from('atendimentos')
      .select('valor_total')
      .eq('id', atendimentoId)
      .single();
    
    return {
      id: data.id,
      tipo: data.tipo as 'produto' | 'servico',
      itemId: data.item_id,
      quantidade: data.quantidade,
      valorUnitario: data.valor_unitario,
      nome
    };
  } catch (error: any) {
    console.error('Erro ao adicionar item ao atendimento:', error.message);
    toast({
      title: 'Erro ao adicionar item ao atendimento',
      description: error.message,
      variant: 'destructive'
    });
    return null;
  }
}

export async function removeItemAtendimento(atendimentoId: string, itemId: string) {
  try {
    const { error } = await supabase
      .from('itens_atendimento')
      .delete()
      .eq('id', itemId)
      .eq('atendimento_id', atendimentoId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Erro ao remover item do atendimento:', error.message);
    toast({
      title: 'Erro ao remover item do atendimento',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}
