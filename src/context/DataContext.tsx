
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Cliente, 
  Pet, 
  Funcionario, 
  Servico, 
  Produto, 
  Atendimento,
  ItemAtendimento 
} from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface DataContextType {
  // Dados
  clientes: Cliente[];
  pets: Pet[];
  funcionarios: Funcionario[];
  servicos: Servico[];
  produtos: Produto[];
  atendimentos: Atendimento[];

  // Operações CRUD para Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => void;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;
  getClienteById: (id: string) => Cliente | undefined;

  // Operações CRUD para Pets
  adicionarPet: (pet: Omit<Pet, 'id'>) => void;
  atualizarPet: (id: string, pet: Partial<Pet>) => void;
  removerPet: (id: string) => void;
  getPetById: (id: string) => Pet | undefined;
  getPetsByClienteId: (clienteId: string) => Pet[];

  // Operações CRUD para Funcionários
  adicionarFuncionario: (funcionario: Omit<Funcionario, 'id' | 'dataCadastro'>) => void;
  atualizarFuncionario: (id: string, funcionario: Partial<Funcionario>) => void;
  removerFuncionario: (id: string) => void;
  getFuncionarioById: (id: string) => Funcionario | undefined;

  // Operações CRUD para Serviços
  adicionarServico: (servico: Omit<Servico, 'id'>) => void;
  atualizarServico: (id: string, servico: Partial<Servico>) => void;
  removerServico: (id: string) => void;
  getServicoById: (id: string) => Servico | undefined;

  // Operações CRUD para Produtos
  adicionarProduto: (produto: Omit<Produto, 'id'>) => void;
  atualizarProduto: (id: string, produto: Partial<Produto>) => void;
  removerProduto: (id: string) => void;
  getProdutoById: (id: string) => Produto | undefined;

  // Operações CRUD para Atendimentos
  adicionarAtendimento: (atendimento: Omit<Atendimento, 'id' | 'valorTotal'>) => void;
  atualizarAtendimento: (id: string, atendimento: Partial<Atendimento>) => void;
  removerAtendimento: (id: string) => void;
  getAtendimentoById: (id: string) => Atendimento | undefined;

  // Operações para itens de atendimento
  adicionarItemAtendimento: (atendimentoId: string, item: Omit<ItemAtendimento, 'id'>) => void;
  removerItemAtendimento: (atendimentoId: string, itemId: string) => void;
  
  // Utilitários
  calcularValorTotalAtendimento: (itens: ItemAtendimento[]) => number;
}

// Função para gerar IDs únicos
const generateId = () => Math.random().toString(36).substring(2, 9);

// Criar o contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data inicial
const mockClientes: Cliente[] = [
  { 
    id: 'c1', 
    nome: 'Maria Silva', 
    email: 'maria@email.com', 
    telefone: '(11) 99999-8888', 
    endereco: 'Av. Paulista, 1000', 
    cpf: '123.456.789-00', 
    dataCadastro: new Date().toISOString() 
  },
  { 
    id: 'c2', 
    nome: 'João Oliveira', 
    email: 'joao@email.com', 
    telefone: '(11) 98888-7777', 
    endereco: 'Rua Augusta, 500', 
    cpf: '987.654.321-00', 
    dataCadastro: new Date().toISOString() 
  }
];

const mockPets: Pet[] = [
  { 
    id: 'p1', 
    nome: 'Rex', 
    especie: 'Cachorro', 
    raca: 'Labrador', 
    dataNascimento: '2020-05-15', 
    peso: 25.5, 
    sexo: 'M', 
    clienteId: 'c1',
    clienteNome: 'Maria Silva' 
  },
  { 
    id: 'p2', 
    nome: 'Felix', 
    especie: 'Gato', 
    raca: 'Siamês', 
    dataNascimento: '2021-08-20', 
    peso: 4.2, 
    sexo: 'M', 
    clienteId: 'c2',
    clienteNome: 'João Oliveira' 
  }
];

const mockFuncionarios: Funcionario[] = [
  { 
    id: 'f1', 
    nome: 'Dr. Carlos Santos', 
    cargo: 'Veterinário', 
    email: 'carlos@vetclinic.com', 
    telefone: '(11) 97777-6666', 
    dataCadastro: new Date().toISOString() 
  },
  { 
    id: 'f2', 
    nome: 'Ana Lima', 
    cargo: 'Tosadora', 
    email: 'ana@vetclinic.com', 
    telefone: '(11) 96666-5555', 
    dataCadastro: new Date().toISOString() 
  }
];

const mockServicos: Servico[] = [
  { 
    id: 's1', 
    nome: 'Banho', 
    descricao: 'Banho completo com shampoo especial', 
    duracao: 60, 
    preco: 70.00 
  },
  { 
    id: 's2', 
    nome: 'Tosa', 
    descricao: 'Tosa higiênica ou completa', 
    duracao: 90, 
    preco: 90.00 
  },
  { 
    id: 's3', 
    nome: 'Consulta Veterinária', 
    descricao: 'Avaliação geral do animal', 
    duracao: 30, 
    preco: 150.00 
  }
];

const mockProdutos: Produto[] = [
  { 
    id: 'prod1', 
    nome: 'Ração Premium', 
    descricao: 'Ração de alta qualidade para cães adultos', 
    preco: 120.00, 
    estoque: 50, 
    categoria: 'Alimentação' 
  },
  { 
    id: 'prod2', 
    nome: 'Brinquedo Mordedor', 
    descricao: 'Brinquedo resistente para cães', 
    preco: 45.00, 
    estoque: 30, 
    categoria: 'Brinquedos' 
  }
];

const mockItens: ItemAtendimento[] = [
  { 
    id: 'i1', 
    tipo: 'servico', 
    itemId: 's1', 
    quantidade: 1, 
    valorUnitario: 70.00, 
    nome: 'Banho' 
  },
  { 
    id: 'i2', 
    tipo: 'produto', 
    itemId: 'prod1', 
    quantidade: 1, 
    valorUnitario: 120.00, 
    nome: 'Ração Premium' 
  }
];

const mockAtendimentos: Atendimento[] = [
  { 
    id: 'a1', 
    data: '2023-05-10T14:30:00Z', 
    status: 'concluido', 
    clienteId: 'c1', 
    clienteNome: 'Maria Silva',
    petId: 'p1', 
    petNome: 'Rex',
    funcionarioId: 'f1', 
    funcionarioNome: 'Dr. Carlos Santos',
    observacoes: 'Animal estava com pulgas', 
    itens: mockItens, 
    valorTotal: 190.00 
  }
];

// Provedor de contexto
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);

  useEffect(() => {
    // No mundo real, carregaríamos os dados de uma API aqui
    setClientes(mockClientes);
    setPets(mockPets);
    setFuncionarios(mockFuncionarios);
    setServicos(mockServicos);
    setProdutos(mockProdutos);
    setAtendimentos(mockAtendimentos);
  }, []);

  // Função utilitária para calcular o valor total
  const calcularValorTotalAtendimento = (itens: ItemAtendimento[]): number => {
    return itens.reduce((total, item) => total + (item.valorUnitario * item.quantidade), 0);
  };

  // CRUD para Clientes
  const adicionarCliente = (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente: Cliente = {
      ...clienteData,
      id: generateId(),
      dataCadastro: new Date().toISOString()
    };
    setClientes([...clientes, novoCliente]);
    toast({
      title: "Cliente adicionado",
      description: `${novoCliente.nome} foi adicionado com sucesso!`
    });
  };

  const atualizarCliente = (id: string, clienteData: Partial<Cliente>) => {
    setClientes(clientesAnterior =>
      clientesAnterior.map(cliente =>
        cliente.id === id ? { ...cliente, ...clienteData } : cliente
      )
    );
    toast({ title: "Cliente atualizado com sucesso!" });
  };

  const removerCliente = (id: string) => {
    // Verificar se o cliente tem pets
    const clientePets = pets.filter(pet => pet.clienteId === id);
    if (clientePets.length > 0) {
      toast({
        title: "Erro ao remover cliente",
        description: "Este cliente possui pets cadastrados. Remova os pets primeiro.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o cliente tem atendimentos
    const clienteAtendimentos = atendimentos.filter(a => a.clienteId === id);
    if (clienteAtendimentos.length > 0) {
      toast({
        title: "Erro ao remover cliente",
        description: "Este cliente possui atendimentos registrados.",
        variant: "destructive"
      });
      return;
    }

    setClientes(clientesAnterior => clientesAnterior.filter(cliente => cliente.id !== id));
    toast({ title: "Cliente removido com sucesso!" });
  };

  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  // CRUD para Pets
  const adicionarPet = (petData: Omit<Pet, 'id'>) => {
    const cliente = getClienteById(petData.clienteId);
    if (!cliente) {
      toast({
        title: "Erro ao adicionar pet",
        description: "Cliente não encontrado.",
        variant: "destructive"
      });
      return;
    }

    const novoPet: Pet = {
      ...petData,
      id: generateId(),
      clienteNome: cliente.nome
    };
    setPets([...pets, novoPet]);
    toast({ title: "Pet adicionado com sucesso!" });
  };

  const atualizarPet = (id: string, petData: Partial<Pet>) => {
    let petAtualizado = { ...pets.find(pet => pet.id === id), ...petData } as Pet;
    
    // Se o cliente foi alterado, atualizar o nome do cliente
    if (petData.clienteId) {
      const novoCliente = getClienteById(petData.clienteId);
      if (novoCliente) {
        petAtualizado.clienteNome = novoCliente.nome;
      }
    }
    
    setPets(petsAnteriores =>
      petsAnteriores.map(pet =>
        pet.id === id ? petAtualizado : pet
      )
    );
    toast({ title: "Pet atualizado com sucesso!" });
  };

  const removerPet = (id: string) => {
    // Verificar se o pet tem atendimentos
    const petAtendimentos = atendimentos.filter(a => a.petId === id);
    if (petAtendimentos.length > 0) {
      toast({
        title: "Erro ao remover pet",
        description: "Este pet possui atendimentos registrados.",
        variant: "destructive"
      });
      return;
    }

    setPets(petsAnteriores => petsAnteriores.filter(pet => pet.id !== id));
    toast({ title: "Pet removido com sucesso!" });
  };

  const getPetById = (id: string) => {
    return pets.find(pet => pet.id === id);
  };

  const getPetsByClienteId = (clienteId: string) => {
    return pets.filter(pet => pet.clienteId === clienteId);
  };

  // CRUD para Funcionários
  const adicionarFuncionario = (funcionarioData: Omit<Funcionario, 'id' | 'dataCadastro'>) => {
    const novoFuncionario: Funcionario = {
      ...funcionarioData,
      id: generateId(),
      dataCadastro: new Date().toISOString()
    };
    setFuncionarios([...funcionarios, novoFuncionario]);
    toast({ title: "Funcionário adicionado com sucesso!" });
  };

  const atualizarFuncionario = (id: string, funcionarioData: Partial<Funcionario>) => {
    setFuncionarios(funcionariosAnteriores =>
      funcionariosAnteriores.map(funcionario =>
        funcionario.id === id ? { ...funcionario, ...funcionarioData } : funcionario
      )
    );
    toast({ title: "Funcionário atualizado com sucesso!" });
  };

  const removerFuncionario = (id: string) => {
    // Verificar se o funcionário tem atendimentos
    const funcionarioAtendimentos = atendimentos.filter(a => a.funcionarioId === id);
    if (funcionarioAtendimentos.length > 0) {
      toast({
        title: "Erro ao remover funcionário",
        description: "Este funcionário possui atendimentos registrados.",
        variant: "destructive"
      });
      return;
    }

    setFuncionarios(funcionariosAnteriores => funcionariosAnteriores.filter(funcionario => funcionario.id !== id));
    toast({ title: "Funcionário removido com sucesso!" });
  };

  const getFuncionarioById = (id: string) => {
    return funcionarios.find(funcionario => funcionario.id === id);
  };

  // CRUD para Serviços
  const adicionarServico = (servicoData: Omit<Servico, 'id'>) => {
    const novoServico: Servico = {
      ...servicoData,
      id: generateId()
    };
    setServicos([...servicos, novoServico]);
    toast({ title: "Serviço adicionado com sucesso!" });
  };

  const atualizarServico = (id: string, servicoData: Partial<Servico>) => {
    setServicos(servicosAnteriores =>
      servicosAnteriores.map(servico =>
        servico.id === id ? { ...servico, ...servicoData } : servico
      )
    );
    toast({ title: "Serviço atualizado com sucesso!" });
  };

  const removerServico = (id: string) => {
    // Verificar se o serviço está sendo usado em algum atendimento
    const servicoEmUso = atendimentos.some(a => 
      a.itens.some(item => item.tipo === 'servico' && item.itemId === id)
    );
    
    if (servicoEmUso) {
      toast({
        title: "Erro ao remover serviço",
        description: "Este serviço está sendo usado em atendimentos.",
        variant: "destructive"
      });
      return;
    }

    setServicos(servicosAnteriores => servicosAnteriores.filter(servico => servico.id !== id));
    toast({ title: "Serviço removido com sucesso!" });
  };

  const getServicoById = (id: string) => {
    return servicos.find(servico => servico.id === id);
  };

  // CRUD para Produtos
  const adicionarProduto = (produtoData: Omit<Produto, 'id'>) => {
    const novoProduto: Produto = {
      ...produtoData,
      id: generateId()
    };
    setProdutos([...produtos, novoProduto]);
    toast({ title: "Produto adicionado com sucesso!" });
  };

  const atualizarProduto = (id: string, produtoData: Partial<Produto>) => {
    setProdutos(produtosAnteriores =>
      produtosAnteriores.map(produto =>
        produto.id === id ? { ...produto, ...produtoData } : produto
      )
    );
    toast({ title: "Produto atualizado com sucesso!" });
  };

  const removerProduto = (id: string) => {
    // Verificar se o produto está sendo usado em algum atendimento
    const produtoEmUso = atendimentos.some(a => 
      a.itens.some(item => item.tipo === 'produto' && item.itemId === id)
    );
    
    if (produtoEmUso) {
      toast({
        title: "Erro ao remover produto",
        description: "Este produto está sendo usado em atendimentos.",
        variant: "destructive"
      });
      return;
    }

    setProdutos(produtosAnteriores => produtosAnteriores.filter(produto => produto.id !== id));
    toast({ title: "Produto removido com sucesso!" });
  };

  const getProdutoById = (id: string) => {
    return produtos.find(produto => produto.id === id);
  };

  // CRUD para Atendimentos
  const adicionarAtendimento = (atendimentoData: Omit<Atendimento, 'id' | 'valorTotal'>) => {
    const cliente = getClienteById(atendimentoData.clienteId);
    const pet = getPetById(atendimentoData.petId);
    const funcionario = getFuncionarioById(atendimentoData.funcionarioId);

    if (!cliente || !pet || !funcionario) {
      toast({
        title: "Erro ao adicionar atendimento",
        description: "Cliente, pet ou funcionário não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Calcular o valor total
    const valorTotal = calcularValorTotalAtendimento(atendimentoData.itens);

    const novoAtendimento: Atendimento = {
      ...atendimentoData,
      id: generateId(),
      valorTotal,
      clienteNome: cliente.nome,
      petNome: pet.nome,
      funcionarioNome: funcionario.nome
    };
    
    setAtendimentos([...atendimentos, novoAtendimento]);
    toast({ title: "Atendimento registrado com sucesso!" });
  };

  const atualizarAtendimento = (id: string, atendimentoData: Partial<Atendimento>) => {
    let atendimentoAtualizado = { ...atendimentos.find(a => a.id === id), ...atendimentoData } as Atendimento;
    
    // Atualizar nomes e recalcular valor total se necessário
    if (atendimentoData.clienteId) {
      const cliente = getClienteById(atendimentoData.clienteId);
      if (cliente) atendimentoAtualizado.clienteNome = cliente.nome;
    }
    
    if (atendimentoData.petId) {
      const pet = getPetById(atendimentoData.petId);
      if (pet) atendimentoAtualizado.petNome = pet.nome;
    }
    
    if (atendimentoData.funcionarioId) {
      const funcionario = getFuncionarioById(atendimentoData.funcionarioId);
      if (funcionario) atendimentoAtualizado.funcionarioNome = funcionario.nome;
    }
    
    if (atendimentoData.itens) {
      atendimentoAtualizado.valorTotal = calcularValorTotalAtendimento(atendimentoData.itens);
    }

    setAtendimentos(atendimentosAnteriores =>
      atendimentosAnteriores.map(atendimento =>
        atendimento.id === id ? atendimentoAtualizado : atendimento
      )
    );
    toast({ title: "Atendimento atualizado com sucesso!" });
  };

  const removerAtendimento = (id: string) => {
    setAtendimentos(atendimentosAnteriores => atendimentosAnteriores.filter(atendimento => atendimento.id !== id));
    toast({ title: "Atendimento removido com sucesso!" });
  };

  const getAtendimentoById = (id: string) => {
    return atendimentos.find(atendimento => atendimento.id === id);
  };

  // Operações para itens de atendimento
  const adicionarItemAtendimento = (atendimentoId: string, itemData: Omit<ItemAtendimento, 'id'>) => {
    const atendimento = getAtendimentoById(atendimentoId);
    if (!atendimento) {
      toast({
        title: "Erro ao adicionar item",
        description: "Atendimento não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Verificar disponibilidade se for produto
    if (itemData.tipo === 'produto') {
      const produto = getProdutoById(itemData.itemId);
      if (!produto) {
        toast({
          title: "Erro ao adicionar item",
          description: "Produto não encontrado.",
          variant: "destructive"
        });
        return;
      }

      if (produto.estoque < itemData.quantidade) {
        toast({
          title: "Erro ao adicionar item",
          description: "Estoque insuficiente.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estoque
      atualizarProduto(produto.id, { 
        estoque: produto.estoque - itemData.quantidade 
      });
    }

    const novoItem: ItemAtendimento = {
      ...itemData,
      id: generateId()
    };

    const novosItens = [...atendimento.itens, novoItem];
    const novoValorTotal = calcularValorTotalAtendimento(novosItens);

    atualizarAtendimento(atendimentoId, { 
      itens: novosItens,
      valorTotal: novoValorTotal
    });
    
    toast({ title: "Item adicionado ao atendimento!" });
  };

  const removerItemAtendimento = (atendimentoId: string, itemId: string) => {
    const atendimento = getAtendimentoById(atendimentoId);
    if (!atendimento) {
      toast({
        title: "Erro ao remover item",
        description: "Atendimento não encontrado.",
        variant: "destructive"
      });
      return;
    }

    const item = atendimento.itens.find(i => i.id === itemId);
    if (!item) {
      toast({
        title: "Erro ao remover item",
        description: "Item não encontrado.",
        variant: "destructive"
      });
      return;
    }

    // Se for produto, devolver ao estoque
    if (item.tipo === 'produto') {
      const produto = getProdutoById(item.itemId);
      if (produto) {
        atualizarProduto(produto.id, { 
          estoque: produto.estoque + item.quantidade 
        });
      }
    }

    const novosItens = atendimento.itens.filter(i => i.id !== itemId);
    const novoValorTotal = calcularValorTotalAtendimento(novosItens);

    atualizarAtendimento(atendimentoId, { 
      itens: novosItens,
      valorTotal: novoValorTotal
    });
    
    toast({ title: "Item removido do atendimento!" });
  };

  const value = {
    // Dados
    clientes,
    pets,
    funcionarios,
    servicos,
    produtos,
    atendimentos,

    // Operações CRUD para Clientes
    adicionarCliente,
    atualizarCliente,
    removerCliente,
    getClienteById,

    // Operações CRUD para Pets
    adicionarPet,
    atualizarPet,
    removerPet,
    getPetById,
    getPetsByClienteId,

    // Operações CRUD para Funcionários
    adicionarFuncionario,
    atualizarFuncionario,
    removerFuncionario,
    getFuncionarioById,

    // Operações CRUD para Serviços
    adicionarServico,
    atualizarServico,
    removerServico,
    getServicoById,

    // Operações CRUD para Produtos
    adicionarProduto,
    atualizarProduto,
    removerProduto,
    getProdutoById,

    // Operações CRUD para Atendimentos
    adicionarAtendimento,
    atualizarAtendimento,
    removerAtendimento,
    getAtendimentoById,

    // Operações para itens de atendimento
    adicionarItemAtendimento,
    removerItemAtendimento,
    
    // Utilitários
    calcularValorTotalAtendimento
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};
