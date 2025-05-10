// Interfaces para os modelos de dados

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf: string;
  dataCadastro: string;
}

export interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  dataNascimento: string;
  peso: number;
  sexo: 'M' | 'F';
  clienteId: string;
  clienteNome?: string; // Campo para exibição
}

export interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  dataCadastro: string;
  emailLogin: string; // Campo para autenticação
  perfil: string; // Perfil de acesso: admin, atendente, etc.
  senha?: string; // Campo para cadastro e atualização de senha
  ativo: boolean; // Status do funcionário
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracao: number; // em minutos
  preco: number;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
}

export interface ItemAtendimento {
  id: string;
  tipo: 'produto' | 'servico';
  itemId: string;
  quantidade: number;
  valorUnitario: number;
  nome: string;
}

export interface Atendimento {
  id: string;
  data: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  clienteId: string;
  clienteNome?: string; // Campo para exibição
  petId: string;
  petNome?: string; // Campo para exibição
  funcionarioId: string;
  funcionarioNome?: string; // Campo para exibição
  observacoes: string;
  itens: ItemAtendimento[];
  valorTotal: number;
}

// Novas interfaces para agendamento online

export interface HorarioDisponivel {
  id: string;
  data: string; // Formato ISO: 'YYYY-MM-DD'
  hora: string; // Formato: 'HH:MM'
  funcionarioId: string;
  funcionarioNome?: string; // Campo para exibição
  disponivel: boolean;
}

export interface Agendamento {
  id: string;
  data: string; // Formato ISO: 'YYYY-MM-DD'
  hora: string; // Formato: 'HH:MM'
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  clienteId: string;
  clienteNome?: string; // Campo para exibição
  petId: string;
  petNome?: string; // Campo para exibição
  funcionarioId: string;
  funcionarioNome?: string; // Campo para exibição
  servicoId: string;
  servicoNome?: string; // Campo para exibição
  valorServico?: number; // Preço do serviço
  observacoes: string;
}

export interface LembreteEmail {
  id: string;
  agendamentoId: string;
  agendamento?: Agendamento & {
    cliente?: Cliente;
    pet?: Pet;
    funcionario?: Funcionario;
    servico?: Servico;
  };
  tipo: 'confirmacao' | 'lembrete';
  status: 'pendente' | 'enviado' | 'erro';
  enviadoEm?: string;
}
