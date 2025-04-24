
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { useData } from '@/context/DataContext';
import { PawPrint, Users, Calendar, Package } from 'lucide-react';

const Dashboard = () => {
  const { clientes, pets, atendimentos, funcionarios, produtos } = useData();
  
  // Calcular atendimentos recentes (últimos 30 dias)
  const hoje = new Date();
  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  
  const atendimentosRecentes = atendimentos.filter(
    atendimento => new Date(atendimento.data) > trintaDiasAtras
  );

  const valorTotalAtendimentos = atendimentos.reduce(
    (total, atendimento) => total + atendimento.valorTotal, 0
  );

  const valorMedioAtendimentos = atendimentos.length > 0 
    ? valorTotalAtendimentos / atendimentos.length 
    : 0;

  const produtosBaixoEstoque = produtos.filter(produto => produto.estoque < 10);

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Visão geral do sistema de administração do pet shop." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Recentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atendimentosRecentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funcionarios.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Financeiras</CardTitle>
            <CardDescription>Resumo financeiro dos atendimentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total de Vendas</span>
              <span className="font-medium">R$ {valorTotalAtendimentos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Valor Médio</span>
              <span className="font-medium">R$ {valorMedioAtendimentos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total de Atendimentos</span>
              <span className="font-medium">{atendimentos.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
            <CardDescription>Produtos que precisam de reposição</CardDescription>
          </CardHeader>
          <CardContent>
            {produtosBaixoEstoque.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos os produtos estão com estoque adequado.</p>
            ) : (
              <div className="space-y-2">
                {produtosBaixoEstoque.map(produto => (
                  <div key={produto.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{produto.nome}</span>
                    </div>
                    <span className={`text-sm font-medium ${produto.estoque < 5 ? 'text-destructive' : 'text-amber-500'}`}>
                      {produto.estoque} unidades
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
