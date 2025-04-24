
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
import * as supabaseService from '@/services/supabaseService';

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
  
  // Estado da interface
  loading: boolean;
  refreshData: () => void;
}

// Função para gerar IDs únicos
const generateId = () => Math.random().toString(36).substring(2, 9);

// Criar o contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provedor de contexto
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar todos os dados
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        clientesData, 
        petsData, 
        funcionariosData, 
        servicosData, 
        produtosData
      ] = await Promise.all([
        supabaseService.fetchClientes(),
        supabaseService.fetchPets(),
        supabaseService.fetchFuncionarios(),
        supabaseService.fetchServicos(),
        supabaseService.fetchProdutos()
      ]);
      
      setClientes(clientesData);
      setPets(petsData);
      setFuncionarios(funcionariosData);
      setServicos(servicosData);
      setProdutos(produtosData);
      // Atendimentos serão implementados mais tarde
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados ao iniciar
  useEffect(() => {
    fetchAllData();
  }, []);

  // Função utilitária para calcular o valor total
  const calcularValorTotalAtendimento = (itens: ItemAtendimento[]): number => {
    return itens.reduce((total, item) => total + (item.valorUnitario * item.quantidade), 0);
  };

  // CRUD para Clientes
  const adicionarCliente = async (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente = await supabaseService.addCliente(clienteData);
    
    if (novoCliente) {
      setClientes(prevClientes => [...prevClientes, novoCliente]);
      toast({
        title: "Cliente adicionado",
        description: `${novoCliente.nome} foi adicionado com sucesso!`
      });
    }
  };

  const atualizarCliente = async (id: string, clienteData: Partial<Cliente>) => {
    const clienteAtualizado = await supabaseService.updateCliente(id, clienteData);
    
    if (clienteAtualizado) {
      setClientes(prevClientes =>
        prevClientes.map(cliente =>
          cliente.id === id ? clienteAtualizado : cliente
        )
      );
      toast({ title: "Cliente atualizado com sucesso!" });
    }
  };

  const removerCliente = async (id: string) => {
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

    const success = await supabaseService.deleteCliente(id);
    
    if (success) {
      setClientes(prevClientes => prevClientes.filter(cliente => cliente.id !== id));
      toast({ title: "Cliente removido com sucesso!" });
    }
  };

  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  // CRUD para Pets
  const adicionarPet = async (petData: Omit<Pet, 'id'>) => {
    const cliente = getClienteById(petData.clienteId);
    if (!cliente) {
      toast({
        title: "Erro ao adicionar pet",
        description: "Cliente não encontrado.",
        variant: "destructive"
      });
      return;
    }

    const novoPet = await supabaseService.addPet(petData);
    
    if (novoPet) {
      // Adicionar nome do cliente ao novo pet para exibição
      const petComNomeCliente = {
        ...novoPet,
        clienteNome: cliente.nome
      };
      
      setPets(prevPets => [...prevPets, petComNomeCliente]);
      toast({ title: "Pet adicionado com sucesso!" });
    }
  };

  const atualizarPet = async (id: string, petData: Partial<Pet>) => {
    const petAtualizado = await supabaseService.updatePet(id, petData);
    
    if (petAtualizado) {
      // Se o cliente foi alterado, atualizar o nome do cliente
      let petComNomeCliente = { ...petAtualizado };
      
      if (petData.clienteId) {
        const novoCliente = getClienteById(petData.clienteId);
        if (novoCliente) {
          petComNomeCliente.clienteNome = novoCliente.nome;
        }
      }
      
      setPets(prevPets =>
        prevPets.map(pet =>
          pet.id === id ? petComNomeCliente : pet
        )
      );
      toast({ title: "Pet atualizado com sucesso!" });
    }
  };

  const removerPet = async (id: string) => {
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

    const success = await supabaseService.deletePet(id);
    
    if (success) {
      setPets(prevPets => prevPets.filter(pet => pet.id !== id));
      toast({ title: "Pet removido com sucesso!" });
    }
  };

  const getPetById = (id: string) => {
    return pets.find(pet => pet.id === id);
  };

  const getPetsByClienteId = (clienteId: string) => {
    return pets.filter(pet => pet.clienteId === clienteId);
  };

  // Para não deixar o arquivo muito grande, vamos implementar as funções restantes de modo simplificado
  // Quando você precisar implementar completamente outras entidades, podemos expandir estas funções
  
  // CRUD para Funcionários (simplificado por ora)
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
    setFuncionarios(funcionariosAnteriores => funcionariosAnteriores.filter(funcionario => funcionario.id !== id));
    toast({ title: "Funcionário removido com sucesso!" });
  };

  const getFuncionarioById = (id: string) => {
    return funcionarios.find(funcionario => funcionario.id === id);
  };

  // As outras funções CRUD seguem o mesmo padrão (implementação simplificada)
  
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
    setProdutos(produtosAnteriores => produtosAnteriores.filter(produto => produto.id !== id));
    toast({ title: "Produto removido com sucesso!" });
  };

  const getProdutoById = (id: string) => {
    return produtos.find(produto => produto.id === id);
  };

  // CRUD para Atendimentos (simplificado)
  const adicionarAtendimento = (atendimentoData: Omit<Atendimento, 'id' | 'valorTotal'>) => {
    const valorTotal = calcularValorTotalAtendimento(atendimentoData.itens);
    
    const novoAtendimento: Atendimento = {
      ...atendimentoData,
      id: generateId(),
      valorTotal
    };
    
    setAtendimentos([...atendimentos, novoAtendimento]);
    toast({ title: "Atendimento registrado com sucesso!" });
  };

  const atualizarAtendimento = (id: string, atendimentoData: Partial<Atendimento>) => {
    let atendimentoAtualizado = { ...atendimentos.find(a => a.id === id), ...atendimentoData } as Atendimento;
    
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

    const novosItens = atendimento.itens.filter(i => i.id !== itemId);
    const novoValorTotal = calcularValorTotalAtendimento(novosItens);

    atualizarAtendimento(atendimentoId, { 
      itens: novosItens,
      valorTotal: novoValorTotal
    });
    
    toast({ title: "Item removido do atendimento!" });
  };

  const refreshData = () => {
    fetchAllData();
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
    calcularValorTotalAtendimento,
    
    // Estado da interface
    loading,
    refreshData
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
