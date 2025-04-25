
import { Cliente, Pet, Funcionario, Servico, Produto, Atendimento, ItemAtendimento } from '@/types';

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
    dataCadastro: dbFuncionario.data_cadastro
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
