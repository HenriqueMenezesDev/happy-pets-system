import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { 
  Cliente, 
  Pet, 
  Funcionario, 
  Servico, 
  Produto, 
  Atendimento,
  ItemAtendimento 
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchClientes, 
  addCliente, 
  updateCliente, 
  deleteCliente 
} from '@/services/clienteService';
import { 
  fetchPets, 
  addPet, 
  updatePet, 
  deletePet 
} from '@/services/petService';
import { 
  fetchFuncionarios, 
  addFuncionario, 
  updateFuncionario, 
  deleteFuncionario 
} from '@/services/funcionarioService';
import { 
  fetchServicos, 
  addServico, 
  updateServico, 
  deleteServico 
} from '@/services/servicoService';
import { 
  fetchProdutos, 
  addProduto, 
  updateProduto, 
  deleteProduto 
} from '@/services/produtoService';
import { 
  fetchAtendimentos, 
  fetchItensAtendimento, 
  addAtendimento, 
  updateAtendimento, 
  deleteAtendimento, 
  addItemAtendimento, 
  removeItemAtendimento 
} from '@/services/atendimentoService';

interface DataContextType {
  // Dados
  clientes: Cliente[];
  pets: Pet[];
  funcionarios: Funcionario[];
  servicos: Servico[];
  produtos: Produto[];
  atendimentos: Atendimento[];

  // Operações CRUD para Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => Promise<Cliente | null>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<Cliente | null>;
  removerCliente: (id: string) => Promise<boolean>;
  getClienteById: (id: string) => Cliente | undefined;

  // Operações CRUD para Pets
  adicionarPet: (pet: Omit<Pet, 'id' | 'clienteNome'>) => Promise<Pet | null>;
  atualizarPet: (id: string, pet: Partial<Pet>) => Promise<Pet | null>;
  removerPet: (id: string) => Promise<boolean>;
  getPetById: (id: string) => Pet | undefined;
  getPetsByClienteId: (clienteId: string) => Pet[];

  // Operações CRUD para Funcionários
  adicionarFuncionario: (funcionario: Omit<Funcionario, 'id' | 'dataCadastro'>) => Promise<Funcionario | null>;
  atualizarFuncionario: (id: string, funcionario: Partial<Funcionario>) => Promise<Funcionario | null>;
  removerFuncionario: (id: string) => Promise<boolean>;
  getFuncionarioById: (id: string) => Funcionario | undefined;

  // Operações CRUD para Serviços
  adicionarServico: (servico: Omit<Servico, 'id'>) => Promise<Servico | null>;
  atualizarServico: (id: string, servico: Partial<Servico>) => Promise<Servico | null>;
  removerServico: (id: string) => Promise<boolean>;
  getServicoById: (id: string) => Servico | undefined;

  // Operações CRUD para Produtos
  adicionarProduto: (produto: Omit<Produto, 'id'>) => Promise<Produto | null>;
  atualizarProduto: (id: string, produto: Partial<Produto>) => Promise<Produto | null>;
  removerProduto: (id: string) => Promise<boolean>;
  getProdutoById: (id: string) => Produto | undefined;

  // Operações CRUD para Atendimentos
  adicionarAtendimento: (atendimento: Omit<Atendimento, 'id' | 'valorTotal' | 'itens'>) => Promise<Atendimento | null>;
  atualizarAtendimento: (id: string, atendimento: Partial<Atendimento>) => Promise<Atendimento | null>;
  removerAtendimento: (id: string) => Promise<boolean>;
  getAtendimentoById: (id: string) => Atendimento | undefined;

  // Operações para itens de atendimento
  adicionarItemAtendimento: (atendimentoId: string, item: Omit<ItemAtendimento, 'id' | 'nome'>) => Promise<ItemAtendimento | null>;
  removerItemAtendimento: (atendimentoId: string, itemId: string) => Promise<boolean>;
  
  // Utilitários
  calcularValorTotalAtendimento: (itens: ItemAtendimento[]) => number;
  
  // Estado da interface
  loading: boolean;
  refreshData: () => Promise<void>;
}

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
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        clientesData, 
        petsData, 
        funcionariosData, 
        servicosData, 
        produtosData,
        atendimentosData
      ] = await Promise.all([
        fetchClientes(),
        fetchPets(),
        fetchFuncionarios(),
        fetchServicos(),
        fetchProdutos(),
        fetchAtendimentos()
      ]);
      
      setClientes(clientesData);
      setPets(petsData);
      setFuncionarios(funcionariosData);
      setServicos(servicosData);
      setProdutos(produtosData);
      
      // Para cada atendimento, buscar os itens
      const atendimentosComItens = await Promise.all(
        atendimentosData.map(async (atendimento) => {
          const itens = await fetchItensAtendimento(atendimento.id);
          
          // Adicionar nome a cada item
          const itensComNome = itens.map(item => {
            let nome = '';
            if (item.tipo === 'produto') {
              const produto = produtosData.find(p => p.id === item.itemId);
              nome = produto?.nome || '';
            } else {
              const servico = servicosData.find(s => s.id === item.itemId);
              nome = servico?.nome || '';
            }
            return { ...item, nome };
          });
          
          return { ...atendimento, itens: itensComNome };
        })
      );
      
      setAtendimentos(atendimentosComItens);
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
  }, [toast]);
  
  // Carregar dados ao iniciar
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Função utilitária para calcular o valor total
  const calcularValorTotalAtendimento = (itens: ItemAtendimento[]): number => {
    return itens.reduce((total, item) => total + (item.valorUnitario * item.quantidade), 0);
  };

  // CRUD para Clientes
  const adicionarCliente = async (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente = await addCliente(clienteData);
    
    if (novoCliente) {
      setClientes(prevClientes => [...prevClientes, novoCliente]);
      toast({
        title: "Cliente adicionado",
        description: `${novoCliente.nome} foi adicionado com sucesso!`
      });
    }
    return novoCliente;
  };

  const atualizarCliente = async (id: string, clienteData: Partial<Cliente>) => {
    const clienteAtualizado = await updateCliente(id, clienteData);
    
    if (clienteAtualizado) {
      setClientes(prevClientes =>
        prevClientes.map(cliente =>
          cliente.id === id ? clienteAtualizado : cliente
        )
      );
      toast({ title: "Cliente atualizado com sucesso!" });
    }
    return clienteAtualizado;
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
      return false;
    }

    // Verificar se o cliente tem atendimentos
    const clienteAtendimentos = atendimentos.filter(a => a.clienteId === id);
    if (clienteAtendimentos.length > 0) {
      toast({
        title: "Erro ao remover cliente",
        description: "Este cliente possui atendimentos registrados.",
        variant: "destructive"
      });
      return false;
    }

    const success = await deleteCliente(id);
    
    if (success) {
      setClientes(prevClientes => prevClientes.filter(cliente => cliente.id !== id));
      toast({ title: "Cliente removido com sucesso!" });
    }
    return success;
  };

  const getClienteById = (id: string) => {
    return clientes.find(cliente => cliente.id === id);
  };

  // CRUD para Pets
  const adicionarPet = async (petData: Omit<Pet, 'id' | 'clienteNome'>) => {
    const cliente = getClienteById(petData.clienteId);
    if (!cliente) {
      toast({
        title: "Erro ao adicionar pet",
        description: "Cliente não encontrado.",
        variant: "destructive"
      });
      return null;
    }

    const novoPet = await addPet(petData);
    
    if (novoPet) {
      // Adicionar nome do cliente ao novo pet para exibição
      const petComNomeCliente = {
        ...novoPet,
        clienteNome: cliente.nome
      };
      
      setPets(prevPets => [...prevPets, petComNomeCliente]);
      toast({ title: "Pet adicionado com sucesso!" });
      return petComNomeCliente;
    }
    return null;
  };

  const atualizarPet = async (id: string, petData: Partial<Pet>) => {
    const petAtualizado = await updatePet(id, petData);
    
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
      return petComNomeCliente;
    }
    return null;
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
      return false;
    }

    const success = await deletePet(id);
    
    if (success) {
      setPets(prevPets => prevPets.filter(pet => pet.id !== id));
      toast({ title: "Pet removido com sucesso!" });
    }
    return success;
  };

  const getPetById = (id: string) => {
    return pets.find(pet => pet.id === id);
  };

  const getPetsByClienteId = (clienteId: string) => {
    return pets.filter(pet => pet.clienteId === clienteId);
  };

  // CRUD para Funcionários
  const adicionarFuncionario = async (funcionarioData: Omit<Funcionario, 'id' | 'dataCadastro'>) => {
    const novoFuncionario = await addFuncionario(funcionarioData);
    
    if (novoFuncionario) {
      setFuncionarios(prevFuncionarios => [...prevFuncionarios, novoFuncionario]);
      toast({ title: "Funcionário adicionado com sucesso!" });
    }
    return novoFuncionario;
  };

  const atualizarFuncionario = async (id: string, funcionarioData: Partial<Funcionario>) => {
    const funcionarioAtualizado = await updateFuncionario(id, funcionarioData);
    
    if (funcionarioAtualizado) {
      setFuncionarios(prevFuncionarios =>
        prevFuncionarios.map(funcionario =>
          funcionario.id === id ? funcionarioAtualizado : funcionario
        )
      );
      toast({ title: "Funcionário atualizado com sucesso!" });
    }
    return funcionarioAtualizado;
  };

  const removerFuncionario = async (id: string) => {
    // Verificar se o funcionário tem atendimentos
    const funcionarioAtendimentos = atendimentos.filter(a => a.funcionarioId === id);
    if (funcionarioAtendimentos.length > 0) {
      toast({
        title: "Erro ao remover funcionário",
        description: "Este funcionário possui atendimentos registrados.",
        variant: "destructive"
      });
      return false;
    }
    
    const success = await deleteFuncionario(id);
    
    if (success) {
      setFuncionarios(prevFuncionarios => prevFuncionarios.filter(funcionario => funcionario.id !== id));
      toast({ title: "Funcionário removido com sucesso!" });
    }
    return success;
  };

  const getFuncionarioById = (id: string) => {
    return funcionarios.find(funcionario => funcionario.id === id);
  };

  // CRUD para Serviços
  const adicionarServico = async (servicoData: Omit<Servico, 'id'>) => {
    const novoServico = await addServico(servicoData);
    
    if (novoServico) {
      setServicos(prevServicos => [...prevServicos, novoServico]);
      toast({ title: "Serviço adicionado com sucesso!" });
    }
    return novoServico;
  };

  const atualizarServico = async (id: string, servicoData: Partial<Servico>) => {
    const servicoAtualizado = await updateServico(id, servicoData);
    
    if (servicoAtualizado) {
      setServicos(prevServicos =>
        prevServicos.map(servico =>
          servico.id === id ? servicoAtualizado : servico
        )
      );
      toast({ title: "Serviço atualizado com sucesso!" });
    }
    return servicoAtualizado;
  };

  const removerServico = async (id: string) => {
    // Verificar se o serviço está associado a algum atendimento
    const servicoEmUso = atendimentos.some(atendimento =>
      atendimento.itens.some(item => item.tipo === 'servico' && item.itemId === id)
    );
    
    if (servicoEmUso) {
      toast({
        title: "Erro ao remover serviço",
        description: "Este serviço está associado a um ou mais atendimentos.",
        variant: "destructive"
      });
      return false;
    }
    
    const success = await deleteServico(id);
    
    if (success) {
      setServicos(prevServicos => prevServicos.filter(servico => servico.id !== id));
      toast({ title: "Serviço removido com sucesso!" });
    }
    return success;
  };

  const getServicoById = (id: string) => {
    return servicos.find(servico => servico.id === id);
  };

  // CRUD para Produtos
  const adicionarProduto = async (produtoData: Omit<Produto, 'id'>) => {
    const novoProduto = await addProduto(produtoData);
    
    if (novoProduto) {
      setProdutos(prevProdutos => [...prevProdutos, novoProduto]);
      toast({ title: "Produto adicionado com sucesso!" });
    }
    return novoProduto;
  };

  const atualizarProduto = async (id: string, produtoData: Partial<Produto>) => {
    const produtoAtualizado = await updateProduto(id, produtoData);
    
    if (produtoAtualizado) {
      setProdutos(prevProdutos =>
        prevProdutos.map(produto =>
          produto.id === id ? produtoAtualizado : produto
        )
      );
      toast({ title: "Produto atualizado com sucesso!" });
    }
    return produtoAtualizado;
  };

  const removerProduto = async (id: string) => {
    // Verificar se o produto está associado a algum atendimento
    const produtoEmUso = atendimentos.some(atendimento =>
      atendimento.itens.some(item => item.tipo === 'produto' && item.itemId === id)
    );
    
    if (produtoEmUso) {
      toast({
        title: "Erro ao remover produto",
        description: "Este produto está associado a um ou mais atendimentos.",
        variant: "destructive"
      });
      return false;
    }
    
    const success = await deleteProduto(id);
    
    if (success) {
      setProdutos(prevProdutos => prevProdutos.filter(produto => produto.id !== id));
      toast({ title: "Produto removido com sucesso!" });
    }
    return success;
  };

  const getProdutoById = (id: string) => {
    return produtos.find(produto => produto.id === id);
  };

  // CRUD para Atendimentos
  const adicionarAtendimento = async (atendimentoData: Omit<Atendimento, 'id' | 'valorTotal' | 'itens'>) => {
    const novoAtendimento = await addAtendimento(atendimentoData);
    
    if (novoAtendimento) {
      // Adicionar nomes para exibição
      const clienteNome = getClienteById(atendimentoData.clienteId)?.nome || '';
      const petNome = getPetById(atendimentoData.petId)?.nome || '';
      const funcionarioNome = getFuncionarioById(atendimentoData.funcionarioId)?.nome || '';
      
      const atendimentoCompleto = {
        ...novoAtendimento,
        clienteNome,
        petNome,
        funcionarioNome,
        itens: []
      };
      
      setAtendimentos(prev => [atendimentoCompleto, ...prev]);
      toast({ title: "Atendimento registrado com sucesso!" });
      return atendimentoCompleto;
    }
    return null;
  };

  const atualizarAtendimento = async (id: string, atendimentoData: Partial<Atendimento>) => {
    const atendimentoAtualizado = await updateAtendimento(id, atendimentoData);
    
    if (atendimentoAtualizado) {
      setAtendimentos(prev =>
        prev.map(atendimento =>
          atendimento.id === id ? atendimentoAtualizado : atendimento
        )
      );
      toast({ title: "Atendimento atualizado com sucesso!" });
      return atendimentoAtualizado;
    }
    return null;
  };

  const removerAtendimento = async (id: string) => {
    const success = await deleteAtendimento(id);
    
    if (success) {
      setAtendimentos(prev => prev.filter(atendimento => atendimento.id !== id));
      toast({ title: "Atendimento removido com sucesso!" });
    }
    return success;
  };

  const getAtendimentoById = (id: string) => {
    return atendimentos.find(atendimento => atendimento.id === id);
  };

  // Operações para itens de atendimento
  const adicionarItemAtendimento = async (atendimentoId: string, itemData: Omit<ItemAtendimento, 'id' | 'nome'>) => {
    const novoItem = await addItemAtendimento(atendimentoId, itemData);
    
    if (novoItem) {
      // Atualizar o atendimento com o novo item
      await fetchAllData(); // Recarregar todos os dados para garantir consistência
      toast({ title: "Item adicionado ao atendimento!" });
      return novoItem;
    }
    return null;
  };

  const removerItemAtendimento = async (atendimentoId: string, itemId: string) => {
    const success = await removeItemAtendimento(atendimentoId, itemId);
    
    if (success) {
      await fetchAllData(); // Recarregar todos os dados para garantir consistência
      toast({ title: "Item removido do atendimento!" });
    }
    return success;
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
    refreshData: fetchAllData
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
