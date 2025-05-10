import { Cliente, Pet, Funcionario, Servico, Produto, Atendimento, ItemAtendimento, HorarioDisponivel, Agendamento, LembreteEmail } from '@/types';

export const mapDbClienteToCliente = (dbCliente: any): Cliente => {
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

export const mapDbPetToPet = (dbPet: any): Pet => {
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

export const mapDbFuncionarioToFuncionario = (dbFuncionario: any): Funcionario => {
  return {
    id: dbFuncionario.id,
    nome: dbFuncionario.nome,
    cargo: dbFuncionario.cargo,
    email: dbFuncionario.email,
    telefone: dbFuncionario.telefone,
    dataCadastro: dbFuncionario.data_cadastro,
    emailLogin: dbFuncionario.email_login,
    perfil: dbFuncionario.perfil,
    senha: dbFuncionario.senha_hash,
    ativo: dbFuncionario.ativo
  };
};

export const mapDbServicoToServico = (dbServico: any): Servico => {
  return {
    id: dbServico.id,
    nome: dbServico.nome,
    descricao: dbServico.descricao,
    duracao: dbServico.duracao,
    preco: dbServico.preco
  };
};

export const mapDbProdutoToProduto = (dbProduto: any): Produto => {
  return {
    id: dbProduto.id,
    nome: dbProduto.nome,
    descricao: dbProduto.descricao,
    preco: dbProduto.preco,
    estoque: dbProduto.estoque,
    categoria: dbProduto.categoria
  };
};

export const mapDbAtendimentoToAtendimento = (dbAtendimento: any): Atendimento => {
  return {
    id: dbAtendimento.id,
    data: dbAtendimento.data,
    status: dbAtendimento.status,
    clienteId: dbAtendimento.cliente_id,
    clienteNome: dbAtendimento.clientes?.nome,
    petId: dbAtendimento.pet_id,
    petNome: dbAtendimento.pets?.nome,
    funcionarioId: dbAtendimento.funcionario_id,
    funcionarioNome: dbAtendimento.funcionarios?.nome,
    observacoes: dbAtendimento.observacoes || '',
    itens: [], // Será preenchido após buscar os itens
    valorTotal: dbAtendimento.valor_total
  };
};

export const mapDbItemAtendimentoToItemAtendimento = (dbItem: any): ItemAtendimento => {
  return {
    id: dbItem.id,
    tipo: dbItem.tipo,
    itemId: dbItem.item_id,
    quantidade: dbItem.quantidade,
    valorUnitario: dbItem.valor_unitario,
    nome: dbItem.nome || '' // O nome é preenchido depois
  };
};

// Novos mappers para as novas entidades

export const mapDbHorarioDisponivelToHorarioDisponivel = (dbHorario: any): HorarioDisponivel => {
  return {
    id: dbHorario.id,
    data: dbHorario.data,
    hora: dbHorario.hora,
    funcionarioId: dbHorario.funcionario_id,
    funcionarioNome: dbHorario.funcionarios?.nome,
    disponivel: dbHorario.disponivel
  };
};

export const mapDbAgendamentoToAgendamento = (dbAgendamento: any): Agendamento => {
  return {
    id: dbAgendamento.id,
    data: dbAgendamento.data,
    hora: dbAgendamento.hora,
    status: dbAgendamento.status,
    clienteId: dbAgendamento.cliente_id,
    clienteNome: dbAgendamento.clientes?.nome,
    petId: dbAgendamento.pet_id,
    petNome: dbAgendamento.pets?.nome,
    funcionarioId: dbAgendamento.funcionario_id,
    funcionarioNome: dbAgendamento.funcionarios?.nome,
    servicoId: dbAgendamento.servico_id,
    servicoNome: dbAgendamento.servicos?.nome,
    valorServico: dbAgendamento.servicos?.preco,
    observacoes: dbAgendamento.observacoes || ''
  };
};

export const mapDbLembreteEmailToLembreteEmail = (dbLembrete: any): LembreteEmail => {
  // Mapear o agendamento aninhado se estiver presente
  let agendamento;
  if (dbLembrete.agendamentos) {
    agendamento = {
      id: dbLembrete.agendamentos.id,
      data: dbLembrete.agendamentos.data,
      hora: dbLembrete.agendamentos.hora,
      status: dbLembrete.agendamentos.status,
      clienteId: dbLembrete.agendamentos.cliente_id,
      petId: dbLembrete.agendamentos.pet_id,
      funcionarioId: dbLembrete.agendamentos.funcionario_id,
      servicoId: dbLembrete.agendamentos.servico_id,
      observacoes: dbLembrete.agendamentos.observacoes || '',
    };
    
    // Adicionar dados relacionados se estiverem presentes
    if (dbLembrete.agendamentos.clientes) {
      agendamento.cliente = mapDbClienteToCliente(dbLembrete.agendamentos.clientes);
      agendamento.clienteNome = agendamento.cliente.nome;
    }
    
    if (dbLembrete.agendamentos.pets) {
      agendamento.pet = mapDbPetToPet({
        ...dbLembrete.agendamentos.pets,
        cliente_id: dbLembrete.agendamentos.cliente_id
      });
      agendamento.petNome = agendamento.pet.nome;
    }
    
    if (dbLembrete.agendamentos.funcionarios) {
      agendamento.funcionario = mapDbFuncionarioToFuncionario(dbLembrete.agendamentos.funcionarios);
      agendamento.funcionarioNome = agendamento.funcionario.nome;
    }
    
    if (dbLembrete.agendamentos.servicos) {
      agendamento.servico = mapDbServicoToServico(dbLembrete.agendamentos.servicos);
      agendamento.servicoNome = agendamento.servico.nome;
      agendamento.valorServico = agendamento.servico.preco;
    }
  }

  return {
    id: dbLembrete.id,
    agendamentoId: dbLembrete.agendamento_id,
    agendamento,
    tipo: dbLembrete.tipo,
    status: dbLembrete.status,
    enviadoEm: dbLembrete.enviado_em
  };
};
