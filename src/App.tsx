
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Pets from "./pages/Pets";
import Funcionarios from "./pages/Funcionarios";
import Servicos from "./pages/Servicos";
import Produtos from "./pages/Produtos";
import Atendimentos from "./pages/Atendimentos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Setup from "./pages/Setup";
import Agendamento from "./pages/Agendamento";
import HorariosDisponiveis from "./pages/admin/HorariosDisponiveis";
import AdminAgendamentos from "./pages/admin/Agendamentos";
import EmailLembretes from "./pages/admin/EmailLembretes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rota de configuração inicial */}
              <Route path="/setup" element={<Setup />} />
              
              {/* Rotas públicas */}
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } />
              <Route path="/register" element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              } />

              {/* Redirecionar para login se não estiver autenticado */}
              <Route path="/" element={
                <PrivateRoute>
                  <MainLayout>
                    <Outlet />
                  </MainLayout>
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/pets" element={<Pets />} />
                
                {/* Rotas para todos os funcionários autenticados */}
                <Route path="/agendamento" element={<Agendamento />} />
                <Route path="/atendimentos" element={<Atendimentos />} />
                
                {/* Rotas apenas para gerentes e admin */}
                <Route path="/funcionarios" element={
                  <PrivateRoute requiredRole="gerente">
                    <Funcionarios />
                  </PrivateRoute>
                } />
                <Route path="/servicos" element={
                  <PrivateRoute requiredRole="gerente">
                    <Servicos />
                  </PrivateRoute>
                } />
                <Route path="/produtos" element={
                  <PrivateRoute requiredRole="gerente">
                    <Produtos />
                  </PrivateRoute>
                } />
                
                {/* Rotas apenas para admin */}
                <Route path="/admin">
                  <Route path="horarios" element={
                    <PrivateRoute requiredRole="admin">
                      <HorariosDisponiveis />
                    </PrivateRoute>
                  } />
                  <Route path="agendamentos" element={
                    <PrivateRoute requiredRole="admin">
                      <AdminAgendamentos />
                    </PrivateRoute>
                  } />
                  <Route path="lembretes-email" element={
                    <PrivateRoute requiredRole="admin">
                      <EmailLembretes />
                    </PrivateRoute>
                  } />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
